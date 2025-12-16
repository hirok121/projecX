"""
Classifier Service - Business logic for classifier management
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, UploadFile

from app.models.classifier import Classifier, ModalityType
from app.models.disease import Disease
from app.schemas.classifier import ClassifierCreate, ClassifierUpdate
from app.services.storage_service import StorageService
import logging

logger = logging.getLogger(__name__)


class ClassifierService:
    """Service for managing classifiers."""

    @staticmethod
    def create_classifier(
        db: Session,
        classifier_data: ClassifierCreate,
    ) -> Classifier:
        """
        Create a new classifier with storage directory.

        Args:
            db: Database session
            classifier_data: ClassifierCreate schema with classifier data

        Returns:
            Classifier: Created classifier instance

        Raises:
            HTTPException: If validation fails
        """
        # Verify disease exists
        disease = (
            db.query(Disease).filter(Disease.id == classifier_data.disease_id).first()
        )
        if not disease:
            raise HTTPException(status_code=404, detail="Disease not found")

        # Validate modality
        try:
            modality_enum = ModalityType(classifier_data.modality)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid modality. Must be one of: {[m.value for m in ModalityType]}",
            )

        # Create classifier (model_path auto-generated via UUID)
        classifier = Classifier(
            name=classifier_data.name,
            disease_id=classifier_data.disease_id,
            modality=modality_enum,
            description=classifier_data.description,
            model_type=classifier_data.model_type,
            required_features=classifier_data.required_features,
            accuracy=classifier_data.accuracy,
            precision=classifier_data.precision,
            recall=classifier_data.recall,
            f1_score=classifier_data.f1_score,
            version=classifier_data.version,
        )

        try:
            # Add to database to generate model_path
            db.add(classifier)
            db.flush()  # Get the UUID without committing

            # Create storage directory
            StorageService.create_classifier_directory(
                disease.storage_path, classifier.model_path
            )

            db.commit()
            db.refresh(classifier)

            logger.info(
                f"✅ Created classifier: {classifier.name} (ID: {classifier.id})"
            )
            return classifier

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to create classifier: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to create classifier: {str(e)}"
            )

    @staticmethod
    def upload_model_files(
        db: Session,
        classifier_id: int,
        features_file: UploadFile,
        scaler_file: UploadFile,
        imputer_file: UploadFile,
        model_file: UploadFile,
        class_file: UploadFile,
    ) -> Dict[str, str]:
        """
        Upload and save model pickle files for a classifier.

        Args:
            db: Database session
            classifier_id: Classifier ID
            features_file: features.pkl file
            scaler_file: scaler.pkl file
            imputer_file: imputer.pkl file
            model_file: model.pkl file
            class_file: class.pkl file

        Returns:
            Dict with saved file paths

        Raises:
            HTTPException: If classifier not found or file save fails
        """
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        disease = classifier.disease
        if not disease:
            raise HTTPException(status_code=404, detail="Associated disease not found")

        try:
            # Prepare files dictionary
            files = {
                "features.pkl": features_file.file,
                "scaler.pkl": scaler_file.file,
                "imputer.pkl": imputer_file.file,
                "model.pkl": model_file.file,
                "class.pkl": class_file.file,
            }

            # Save files to storage
            saved_paths = StorageService.save_model_files(
                disease.storage_path, classifier.model_path, files
            )

            logger.info(
                f"✅ Uploaded model files for classifier: {classifier.name} (ID: {classifier.id})"
            )
            return saved_paths

        except Exception as e:
            logger.error(f"❌ Failed to upload model files: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to upload model files: {str(e)}"
            )

    @staticmethod
    def get_classifier(db: Session, classifier_id: int) -> Classifier:
        """Get a classifier by ID."""
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")
        return classifier

    @staticmethod
    def get_classifiers(
        db: Session,
        disease_id: Optional[int] = None,
        modality: Optional[str] = None,
        is_active: Optional[bool] = True,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Classifier]:
        """Get list of classifiers with filters."""
        query = db.query(Classifier)

        if disease_id is not None:
            query = query.filter(Classifier.disease_id == disease_id)

        if modality is not None:
            query = query.filter(Classifier.modality == modality)

        if is_active is not None:
            query = query.filter(Classifier.is_active == is_active)

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_classifier(
        db: Session,
        classifier_id: int,
        classifier_data: ClassifierUpdate,
    ) -> Classifier:
        """Update a classifier."""
        classifier = ClassifierService.get_classifier(db, classifier_id)

        if classifier_data.name is not None:
            classifier.name = classifier_data.name
        if classifier_data.description is not None:
            classifier.description = classifier_data.description
        if classifier_data.model_type is not None:
            classifier.model_type = classifier_data.model_type
        if classifier_data.required_features is not None:
            classifier.required_features = classifier_data.required_features
        if classifier_data.accuracy is not None:
            classifier.accuracy = classifier_data.accuracy
        if classifier_data.precision is not None:
            classifier.precision = classifier_data.precision
        if classifier_data.recall is not None:
            classifier.recall = classifier_data.recall
        if classifier_data.f1_score is not None:
            classifier.f1_score = classifier_data.f1_score
        if classifier_data.version is not None:
            classifier.version = classifier_data.version
        if classifier_data.is_active is not None:
            classifier.is_active = classifier_data.is_active

        try:
            db.commit()
            db.refresh(classifier)
            logger.info(
                f"✅ Updated classifier: {classifier.name} (ID: {classifier.id})"
            )
            return classifier
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to update classifier: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update classifier: {str(e)}"
            )

    @staticmethod
    def delete_classifier(db: Session, classifier_id: int) -> bool:
        """
        Delete a classifier and its storage directory.

        Args:
            db: Database session
            classifier_id: ID of classifier to delete

        Returns:
            bool: True if deleted successfully

        Raises:
            HTTPException: If classifier not found
        """
        classifier = ClassifierService.get_classifier(db, classifier_id)
        disease = classifier.disease

        if not disease:
            raise HTTPException(status_code=404, detail="Associated disease not found")

        try:
            # Delete storage directory
            StorageService.delete_classifier_directory(
                disease.storage_path, classifier.model_path
            )

            # Delete from database
            db.delete(classifier)
            db.commit()

            logger.info(
                f"✅ Deleted classifier: {classifier.name} (ID: {classifier.id})"
            )
            return True

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to delete classifier: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to delete classifier: {str(e)}"
            )
