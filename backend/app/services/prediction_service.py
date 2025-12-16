"""
Prediction Service - Business logic for making disease predictions
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from fastapi import HTTPException
from pathlib import Path
import time
import logging

from app.models.prediction import PredictionResult, PredictionStatus
from app.models.classifier import Classifier, ModalityType
from app.models.disease import Disease
from app.engines.gentabengine import load_model
from app.core.config import settings

logger = logging.getLogger(__name__)


class PredictionService:
    """Service for making predictions using classifiers."""

    @staticmethod
    def predict(
        db: Session,
        user_id: int,
        classifier_id: int,
        input_data: Dict[str, Any],
    ) -> PredictionResult:
        """
        Make a prediction using a classifier.

        Args:
            db: Database session
            user_id: ID of the user making the prediction
            classifier_id: ID of the classifier to use
            input_data: Dictionary with feature values

        Returns:
            PredictionResult: Created prediction record

        Raises:
            HTTPException: If classifier not found or unsupported modality
        """
        # Get classifier and verify it exists
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        if not classifier.is_active:
            raise HTTPException(status_code=400, detail="Classifier is not active")

        # Get disease
        disease = classifier.disease
        if not disease:
            raise HTTPException(status_code=404, detail="Associated disease not found")

        if not disease.is_active:
            raise HTTPException(status_code=400, detail="Disease is not active")

        # Create prediction record
        prediction = PredictionResult(
            user_id=user_id,
            disease_id=disease.id,
            classifier_id=classifier.id,
            modality=classifier.modality.value,
            input_data=input_data,
            status=PredictionStatus.PENDING,
        )

        try:
            db.add(prediction)
            db.flush()  # Get prediction ID

            # Make prediction based on modality
            if classifier.modality == ModalityType.TABULAR:
                result = PredictionService._predict_tabular(
                    disease.storage_path,
                    classifier.model_path,
                    classifier.name,
                    input_data,
                )
            else:
                # MRI, CT, X-Ray not yet implemented
                raise HTTPException(
                    status_code=501,
                    detail=f"{classifier.modality.value} predictions not yet supported. Only Tabular modality is currently available.",
                )

            # Update prediction with results
            prediction.prediction = result["prediction_class"]
            prediction.confidence = result["confidence"]
            prediction.probabilities = result["class_probability"]
            prediction.processing_time = result["processing_time"]
            prediction.status = PredictionStatus.COMPLETED
            prediction.completed_at = result["completed_at"]

            if result["error"]:
                prediction.error_message = result["error"]
                prediction.status = PredictionStatus.FAILED

            db.commit()
            db.refresh(prediction)

            logger.info(
                f"✅ Prediction completed: ID={prediction.id}, User={user_id}, "
                f"Classifier={classifier.name}, Result={prediction.prediction}"
            )

            return prediction

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            prediction.status = PredictionStatus.FAILED
            prediction.error_message = str(e)
            db.commit()

            logger.error(f"❌ Prediction failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    @staticmethod
    def _predict_tabular(
        disease_storage_path: str,
        classifier_model_path: str,
        classifier_name: str,
        input_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Make prediction using tabular data classifier.

        Args:
            disease_storage_path: Disease UUID storage path
            classifier_model_path: Classifier UUID model path
            classifier_name: Name of the classifier
            input_data: Feature values

        Returns:
            Dict with prediction results and metadata
        """
        start_time = time.time()

        try:
            # Construct full path to model directory
            model_dir = (
                Path(settings.ml_models_path)
                / disease_storage_path
                / classifier_model_path
            )

            if not model_dir.exists():
                raise FileNotFoundError(f"Model directory not found: {model_dir}")

            # Load model and predict
            predictor = load_model(str(model_dir), classifier_name)
            result = predictor.predict(input_data)

            # Add timing information
            processing_time = time.time() - start_time
            result["processing_time"] = processing_time

            # Add completion timestamp
            from datetime import datetime

            result["completed_at"] = datetime.utcnow()

            return result

        except Exception as e:
            logger.error(f"❌ Tabular prediction error: {str(e)}")
            return {
                "prediction_class": "Unknown",
                "confidence": 0.0,
                "class_probability": {},
                "error": str(e),
                "processing_time": time.time() - start_time,
                "completed_at": None,
            }

    @staticmethod
    def get_prediction(
        db: Session, prediction_id: int, user_id: Optional[int] = None
    ) -> PredictionResult:
        """
        Get a prediction by ID.

        Args:
            db: Database session
            prediction_id: Prediction ID
            user_id: Optional user ID to filter by (for user access control)

        Returns:
            PredictionResult: Prediction record

        Raises:
            HTTPException: If prediction not found
        """
        query = db.query(PredictionResult).filter(PredictionResult.id == prediction_id)

        if user_id is not None:
            query = query.filter(PredictionResult.user_id == user_id)

        prediction = query.first()
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")

        return prediction

    @staticmethod
    def get_user_predictions(
        db: Session,
        user_id: int,
        disease_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        """
        Get predictions for a user.

        Args:
            db: Database session
            user_id: User ID
            disease_id: Optional filter by disease
            status: Optional filter by status
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List[PredictionResult]: List of predictions
        """
        query = db.query(PredictionResult).filter(PredictionResult.user_id == user_id)

        if disease_id is not None:
            query = query.filter(PredictionResult.disease_id == disease_id)

        if status is not None:
            query = query.filter(PredictionResult.status == status)

        query = query.order_by(PredictionResult.created_at.desc())
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_all_predictions(
        db: Session,
        disease_id: Optional[int] = None,
        classifier_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        """
        Get all predictions (admin function).

        Args:
            db: Database session
            disease_id: Optional filter by disease
            classifier_id: Optional filter by classifier
            status: Optional filter by status
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List[PredictionResult]: List of predictions
        """
        query = db.query(PredictionResult)

        if disease_id is not None:
            query = query.filter(PredictionResult.disease_id == disease_id)

        if classifier_id is not None:
            query = query.filter(PredictionResult.classifier_id == classifier_id)

        if status is not None:
            query = query.filter(PredictionResult.status == status)

        query = query.order_by(PredictionResult.created_at.desc())
        return query.offset(skip).limit(limit).all()
