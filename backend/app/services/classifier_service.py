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
        Create a new classifier with storage directory - Step 1: Basic Info.

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
        # Set is_active=False initially - will be activated after files are uploaded
        classifier = Classifier(
            name=classifier_data.name,
            disease_id=classifier_data.disease_id,
            modality=modality_enum,
            title=classifier_data.title,
            description=classifier_data.description,
            authors=classifier_data.authors,
            blog_link=classifier_data.blog_link,
            paper_link=classifier_data.paper_link,
            model_type=classifier_data.model_type,
            version=classifier_data.version,
            is_active=False,  # Inactive until model files are uploaded
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
    ) -> Dict[str, Any]:
        """
        Upload and save model pickle files for a classifier.
        Automatically extracts and updates required_features from features.pkl.

        Args:
            db: Database session
            classifier_id: Classifier ID
            features_file: features.pkl file
            scaler_file: scaler.pkl file
            imputer_file: imputer.pkl file
            model_file: model.pkl file
            class_file: class.pkl file

        Returns:
            Dict with saved file paths and extracted features

        Raises:
            HTTPException: If classifier not found or file save fails
        """
        import pickle
        import io

        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        disease = classifier.disease
        if not disease:
            raise HTTPException(status_code=404, detail="Associated disease not found")

        try:
            # Read features from features_file before saving
            features_content = features_file.file.read()
            features_file.file.seek(0)  # Reset file pointer for saving
            
            # Extract features from the uploaded file
            try:
                features = pickle.loads(features_content)
                if not isinstance(features, list):
                    features = list(features) if hasattr(features, '__iter__') else []
                
                # Update classifier with extracted features
                classifier.required_features = features
                db.commit()
                db.refresh(classifier)
                
                logger.info(
                    f"✅ Extracted {len(features)} features from features.pkl"
                )
            except Exception as e:
                logger.warning(f"⚠️ Could not extract features: {str(e)}")
                features = []

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

            # Activate classifier after successful file upload
            classifier.is_active = True
            db.commit()
            db.refresh(classifier)

            logger.info(
                f"✅ Uploaded model files and activated classifier: {classifier.name} (ID: {classifier.id})"
            )
            
            return {
                "saved_files": saved_paths,
                "extracted_features": features,
                "feature_count": len(features)
            }

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

        # Add disease_name
        if classifier.disease:
            classifier.disease_name = classifier.disease.name

        return classifier

    @staticmethod
    def get_classifiers(
        db: Session,
        disease_id: Optional[int] = None,
        modality: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Classifier]:
        """
        Get list of classifiers with filters.
        
        Args:
            is_active: None = all classifiers, True = active only, False = inactive only
        """
        query = db.query(Classifier).join(Disease, Classifier.disease_id == Disease.id)

        if disease_id is not None:
            query = query.filter(Classifier.disease_id == disease_id)

        if modality is not None:
            query = query.filter(Classifier.modality == modality)

        if is_active is not None:
            query = query.filter(Classifier.is_active == is_active)

        classifiers = query.offset(skip).limit(limit).all()

        # Add disease_name to each classifier
        for classifier in classifiers:
            if classifier.disease:
                classifier.disease_name = classifier.disease.name

        return classifiers

    @staticmethod
    def extract_features_from_pkl(
        db: Session,
        classifier_id: int,
    ) -> List[str]:
        """
        Extract feature names from uploaded features.pkl file.

        Args:
            db: Database session
            classifier_id: Classifier ID

        Returns:
            List of feature names

        Raises:
            HTTPException: If classifier not found or file doesn't exist
        """
        import pickle
        import os

        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        disease = classifier.disease
        if not disease:
            raise HTTPException(status_code=404, detail="Associated disease not found")

        # Get features.pkl path
        features_path = StorageService.get_model_file_path(
            disease.storage_path, classifier.model_path, "features.pkl"
        )

        if not os.path.exists(features_path):
            raise HTTPException(
                status_code=404, detail="features.pkl file not found. Please upload model files first."
            )

        try:
            with open(features_path, 'rb') as f:
                features = pickle.load(f)
            
            # Ensure it's a list
            if not isinstance(features, list):
                features = list(features) if hasattr(features, '__iter__') else []
            
            # Update classifier with extracted features
            classifier.required_features = features
            db.commit()
            db.refresh(classifier)

            logger.info(
                f"✅ Extracted {len(features)} features from features.pkl for classifier: {classifier.name}"
            )
            return features

        except Exception as e:
            logger.error(f"❌ Failed to extract features: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to extract features: {str(e)}"
            )

    @staticmethod
    def update_classifier(
        db: Session,
        classifier_id: int,
        classifier_data: ClassifierUpdate,
    ) -> Classifier:
        """
        Update a classifier - Basic info only (same as create).
        
        Note: 
        - disease_id and modality cannot be updated for data integrity.
        - Use /tabular-metadata or /image-metadata endpoints to update metadata.
        """
        classifier = ClassifierService.get_classifier(db, classifier_id)

        # Update allowed fields (basic info only)
        if classifier_data.name is not None:
            classifier.name = classifier_data.name
        if classifier_data.title is not None:
            classifier.title = classifier_data.title
        if classifier_data.description is not None:
            classifier.description = classifier_data.description
        if classifier_data.authors is not None:
            classifier.authors = classifier_data.authors
        if classifier_data.blog_link is not None:
            classifier.blog_link = classifier_data.blog_link
        if classifier_data.paper_link is not None:
            classifier.paper_link = classifier_data.paper_link
        if classifier_data.model_type is not None:
            classifier.model_type = classifier_data.model_type
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
    def upload_image_model_file(
        db: Session,
        classifier_id: int,
        model_file: UploadFile,
    ) -> Dict[str, str]:
        """
        Upload single model file for image classifier - Step 2 (Image).

        Args:
            db: Database session
            classifier_id: Classifier ID
            model_file: Model file (.h5, .pt, .pth, .onnx, .keras)

        Returns:
            Dict with saved file path

        Raises:
            HTTPException: If classifier not found or file save fails
        """
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        # Validate modality
        if classifier.modality == ModalityType.TABULAR:
            raise HTTPException(
                status_code=400,
                detail="This endpoint is for image models only. Use /upload-model-files for tabular models."
            )

        disease = classifier.disease
        if not disease:
            raise HTTPException(status_code=404, detail="Associated disease not found")

        # Validate file extension
        valid_extensions = ['.h5', '.pt', '.pth', '.onnx', '.keras']
        file_ext = model_file.filename[model_file.filename.rfind('.'):].lower()
        if file_ext not in valid_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Must be one of: {', '.join(valid_extensions)}"
            )

        try:
            # Save single model file
            files = {f"model{file_ext}": model_file.file}
            saved_paths = StorageService.save_model_files(
                disease.storage_path, classifier.model_path, files
            )

            # Activate classifier after successful file upload
            classifier.is_active = True
            db.commit()
            db.refresh(classifier)

            logger.info(
                f"✅ Uploaded image model file and activated classifier: {classifier.name} (ID: {classifier.id})"
            )
            return saved_paths

        except Exception as e:
            logger.error(f"❌ Failed to upload image model file: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to upload image model file: {str(e)}"
            )

    @staticmethod
    def update_tabular_metadata(
        db: Session,
        classifier_id: int,
        metadata: "TabularMetadataUpdate",
    ) -> Classifier:
        """
        Update tabular classifier metadata - Step 3 (Tabular).

        Args:
            db: Database session
            classifier_id: Classifier ID
            metadata: TabularMetadataUpdate schema

        Returns:
            Updated classifier

        Raises:
            HTTPException: If classifier not found or wrong modality
        """
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        # Validate modality
        if classifier.modality != ModalityType.TABULAR:
            raise HTTPException(
                status_code=400,
                detail="This endpoint is for tabular models only."
            )

        try:
            # Update metadata fields
            if metadata.feature_metadata is not None:
                classifier.feature_metadata = metadata.feature_metadata
            if metadata.accuracy is not None:
                classifier.accuracy = metadata.accuracy
            if metadata.precision is not None:
                classifier.precision = metadata.precision
            if metadata.recall is not None:
                classifier.recall = metadata.recall
            if metadata.f1_score is not None:
                classifier.f1_score = metadata.f1_score
            if metadata.training_date is not None:
                classifier.training_date = metadata.training_date
            if metadata.training_samples is not None:
                classifier.training_samples = metadata.training_samples

            db.commit()
            db.refresh(classifier)

            logger.info(
                f"✅ Updated tabular metadata for classifier: {classifier.name} (ID: {classifier.id})"
            )
            return classifier

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to update tabular metadata: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update tabular metadata: {str(e)}"
            )

    @staticmethod
    def update_image_metadata(
        db: Session,
        classifier_id: int,
        metadata: "ImageMetadataUpdate",
    ) -> Classifier:
        """
        Update image classifier metadata - Step 3 (Image).

        Args:
            db: Database session
            classifier_id: Classifier ID
            metadata: ImageMetadataUpdate schema

        Returns:
            Updated classifier

        Raises:
            HTTPException: If classifier not found or wrong modality
        """
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        # Validate modality
        if classifier.modality == ModalityType.TABULAR:
            raise HTTPException(
                status_code=400,
                detail="This endpoint is for image models only."
            )

        try:
            # Update metadata fields
            if metadata.classifier_config is not None:
                classifier.classifier_config = metadata.classifier_config
            if metadata.accuracy is not None:
                classifier.accuracy = metadata.accuracy
            if metadata.auc_roc is not None:
                classifier.auc_roc = metadata.auc_roc
            if metadata.sensitivity is not None:
                classifier.sensitivity = metadata.sensitivity
            if metadata.specificity is not None:
                classifier.specificity = metadata.specificity
            if metadata.training_date is not None:
                classifier.training_date = metadata.training_date
            if metadata.training_samples is not None:
                classifier.training_samples = metadata.training_samples

            db.commit()
            db.refresh(classifier)

            logger.info(
                f"✅ Updated image metadata for classifier: {classifier.name} (ID: {classifier.id})"
            )
            return classifier

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to update image metadata: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update image metadata: {str(e)}"
            )

    @staticmethod
    def toggle_classifier_active(db: Session, classifier_id: int) -> Classifier:
        """
        Toggle classifier active status (activate/deactivate).

        Args:
            db: Database session
            classifier_id: ID of classifier to toggle

        Returns:
            Classifier: Updated classifier with toggled is_active status

        Raises:
            HTTPException: If classifier not found
        """
        classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
        if not classifier:
            raise HTTPException(status_code=404, detail="Classifier not found")

        try:
            # Toggle is_active status
            classifier.is_active = not classifier.is_active
            db.commit()
            db.refresh(classifier)

            status = "activated" if classifier.is_active else "deactivated"
            logger.info(
                f"✅ {status.capitalize()} classifier: {classifier.name} (ID: {classifier.id})"
            )
            return classifier

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to toggle classifier status: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to toggle classifier status: {str(e)}"
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
