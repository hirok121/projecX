"""
Diagnosis Service - Business logic for diagnosis requests with async processing
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path
import time
import logging

from app.models.diagnosis import Diagnosis, DiagnosisStatus
from app.models.classifier import Classifier, ModalityType
from app.models.notification import NotificationType
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService
from app.engines.gentabengine import load_model
from app.core.config import settings

logger = logging.getLogger(__name__)


class DiagnosisService:
    """Service for managing diagnosis requests."""

    @staticmethod
    def create_diagnosis(
        db: Session,
        user_id: int,
        classifier_id: int,
        name: Optional[str] = None,
        age: Optional[int] = None,
        sex: Optional[str] = None,
        input_data: Optional[Dict[str, Any]] = None,
        input_file: Optional[str] = None,
    ) -> Diagnosis:
        """
        Create a new diagnosis request.

        Args:
            db: Database session
            user_id: User ID
            classifier_id: Classifier ID to use
            name: Patient name
            age: Patient age
            sex: Patient sex
            input_data: Tabular feature data
            input_file: Path to uploaded image file

        Returns:
            Diagnosis: Created diagnosis record

        Raises:
            ValueError: If classifier not found or invalid
        """
        # Get classifier and verify it exists
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise ValueError("Classifier not found")

        if not classifier.is_active:
            raise ValueError("Classifier is not active")

        # Get disease
        disease = classifier.disease
        if not disease:
            raise ValueError("Associated disease not found")

        if not disease.is_active:
            raise ValueError("Disease is not active")

        # Create diagnosis record with PENDING status
        diagnosis = Diagnosis(
            user_id=user_id,
            disease_id=disease.id,
            classifier_id=classifier.id,
            modality=classifier.modality.value,
            name=name,
            age=age,
            sex=sex,
            input_data=input_data,
            input_file=input_file,
            status=DiagnosisStatus.PENDING,
        )

        db.add(diagnosis)
        db.commit()
        db.refresh(diagnosis)

        logger.info(
            f"✅ Created diagnosis request: ID={diagnosis.id}, User={user_id}, "
            f"Classifier={classifier.name}"
        )

        return diagnosis

    @staticmethod
    def process_diagnosis(db: Session, diagnosis_id: int):
        """
        Process a diagnosis request in the background.

        This method should be called as a background task.

        Args:
            db: Database session
            diagnosis_id: Diagnosis ID to process
        """
        logger.info(f"🔄 Starting diagnosis processing for ID={diagnosis_id}")

        diagnosis = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id).first()
        if not diagnosis:
            logger.error(f"❌ Diagnosis {diagnosis_id} not found")
            return

        try:
            # Update status to PROCESSING
            diagnosis.status = DiagnosisStatus.PROCESSING
            diagnosis.started_at = datetime.utcnow()
            db.commit()

            # Get related entities
            classifier = diagnosis.classifier
            disease = diagnosis.disease
            user = diagnosis.user

            # Process based on modality
            if diagnosis.modality == ModalityType.TABULAR.value:
                result = DiagnosisService._process_tabular(
                    disease.storage_path,
                    classifier.model_path,
                    classifier.name,
                    diagnosis.input_data,
                )
            else:
                raise NotImplementedError(
                    f"{diagnosis.modality} predictions not yet supported"
                )

            # Update diagnosis with results
            diagnosis.prediction = result["prediction_class"]
            diagnosis.confidence = result["confidence"]
            diagnosis.probabilities = result["class_probability"]
            diagnosis.processing_time = result["processing_time"]
            diagnosis.status = DiagnosisStatus.COMPLETED
            diagnosis.completed_at = datetime.utcnow()

            if result["error"]:
                diagnosis.error_message = result["error"]
                diagnosis.status = DiagnosisStatus.FAILED

            db.commit()

            # Send notifications
            if diagnosis.status == DiagnosisStatus.COMPLETED:
                DiagnosisService._send_completion_notifications(db, diagnosis)
                logger.info(f"✅ Diagnosis {diagnosis_id} completed successfully")
            else:
                DiagnosisService._send_failure_notifications(db, diagnosis)
                logger.error(f"❌ Diagnosis {diagnosis_id} failed: {result['error']}")

        except Exception as e:
            # Mark as failed
            diagnosis.status = DiagnosisStatus.FAILED
            diagnosis.error_message = str(e)
            diagnosis.completed_at = datetime.utcnow()
            db.commit()

            logger.error(f"❌ Diagnosis {diagnosis_id} processing error: {str(e)}")
            DiagnosisService._send_failure_notifications(db, diagnosis)

    @staticmethod
    def _process_tabular(
        disease_storage_path: str,
        classifier_model_path: str,
        classifier_name: str,
        input_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Process tabular data prediction.

        Args:
            disease_storage_path: Disease UUID storage path
            classifier_model_path: Classifier UUID model path
            classifier_name: Name of the classifier
            input_data: Feature values

        Returns:
            Dict with prediction results
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
            result["processing_time"] = time.time() - start_time

            return result

        except Exception as e:
            logger.error(f"❌ Tabular prediction error: {str(e)}")
            return {
                "prediction_class": "Unknown",
                "confidence": 0.0,
                "class_probability": {},
                "error": str(e),
                "processing_time": time.time() - start_time,
            }

    @staticmethod
    def _send_completion_notifications(db: Session, diagnosis: Diagnosis):
        """Send notifications when diagnosis is completed."""
        user = diagnosis.user
        disease = diagnosis.disease

        # Create result link
        result_link = f"{settings.frontend_url}/diagnosis/{diagnosis.id}"

        # Send email
        try:
            EmailService.send_diagnosis_complete_email(
                to_email=user.email,
                user_name=user.full_name or user.username,
                diagnosis_id=diagnosis.id,
                disease_name=disease.name,
                prediction=diagnosis.prediction,
                confidence=diagnosis.confidence,
                result_link=result_link,
            )
        except Exception as e:
            logger.error(f"Failed to send completion email: {str(e)}")

        # Create notification
        try:
            NotificationService.create_notification(
                db=db,
                user_id=user.id,
                notification_type=NotificationType.DIAGNOSIS_COMPLETED,
                title=f"{disease.name} Diagnosis Complete",
                message=f"Your diagnosis result is ready: {diagnosis.prediction} ({diagnosis.confidence:.2%} confidence)",
                link=result_link,
                diagnosis_id=diagnosis.id,
            )
        except Exception as e:
            logger.error(f"Failed to create completion notification: {str(e)}")

    @staticmethod
    def _send_failure_notifications(db: Session, diagnosis: Diagnosis):
        """Send notifications when diagnosis fails."""
        user = diagnosis.user
        disease = diagnosis.disease

        # Send email
        try:
            EmailService.send_diagnosis_failed_email(
                to_email=user.email,
                user_name=user.full_name or user.username,
                diagnosis_id=diagnosis.id,
                disease_name=disease.name,
                error_message=diagnosis.error_message or "Unknown error",
            )
        except Exception as e:
            logger.error(f"Failed to send failure email: {str(e)}")

        # Create notification
        try:
            NotificationService.create_notification(
                db=db,
                user_id=user.id,
                notification_type=NotificationType.DIAGNOSIS_FAILED,
                title=f"{disease.name} Diagnosis Failed",
                message=f"We encountered an issue processing your diagnosis. Error: {diagnosis.error_message or 'Unknown error'}",
                link=None,
                diagnosis_id=diagnosis.id,
            )
        except Exception as e:
            logger.error(f"Failed to create failure notification: {str(e)}")

    @staticmethod
    def get_diagnosis(
        db: Session, diagnosis_id: int, user_id: Optional[int] = None
    ) -> Diagnosis:
        """Get a diagnosis by ID."""
        query = db.query(Diagnosis).filter(Diagnosis.id == diagnosis_id)

        if user_id is not None:
            query = query.filter(Diagnosis.user_id == user_id)

        diagnosis = query.first()
        if not diagnosis:
            raise ValueError("Diagnosis not found")

        return diagnosis

    @staticmethod
    def get_user_diagnoses(
        db: Session,
        user_id: int,
        disease_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        """Get diagnoses for a user."""
        query = db.query(Diagnosis).filter(Diagnosis.user_id == user_id)

        if disease_id is not None:
            query = query.filter(Diagnosis.disease_id == disease_id)

        if status is not None:
            query = query.filter(Diagnosis.status == status)

        query = query.order_by(Diagnosis.created_at.desc())
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_all_diagnoses(
        db: Session,
        disease_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ):
        """Get all diagnoses (admin only)."""
        query = db.query(Diagnosis)

        if disease_id is not None:
            query = query.filter(Diagnosis.disease_id == disease_id)

        if status is not None:
            query = query.filter(Diagnosis.status == status)

        query = query.order_by(Diagnosis.created_at.desc())
        return query.offset(skip).limit(limit).all()
