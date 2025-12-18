"""
Disease Service - Business logic for disease management
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException

from app.models.disease import Disease
from app.schemas.disease import DiseaseCreate, DiseaseUpdate
from app.services.storage_service import StorageService
import logging

logger = logging.getLogger(__name__)


class DiseaseService:
    """Service for managing diseases."""

    @staticmethod
    def create_disease(
        db: Session,
        disease_data: DiseaseCreate,
    ) -> Disease:
        """
        Create a new disease with storage directory.

        Args:
            db: Database session
            disease_data: DiseaseCreate schema with disease data

        Returns:
            Disease: Created disease instance

        Raises:
            HTTPException: If disease already exists or validation fails
        """
        # Check if disease already exists
        existing = db.query(Disease).filter(Disease.name == disease_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Disease already exists")

        # Create disease instance (storage_path auto-generated via UUID)
        disease = Disease(
            name=disease_data.name,
            description=disease_data.description,
            category=disease_data.category,
            available_modalities=disease_data.available_modalities,
            blog_link=disease_data.blog_link,
        )

        try:
            # Add to database to generate storage_path
            db.add(disease)
            db.flush()  # Get the UUID without committing

            # Create storage directory
            StorageService.create_disease_directory(disease.storage_path)

            db.commit()
            db.refresh(disease)

            logger.info(f"✅ Created disease: {disease.name} (ID: {disease.id})")
            return disease

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to create disease: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to create disease: {str(e)}"
            )

    @staticmethod
    def get_disease(db: Session, disease_id: int) -> Disease:
        """Get a disease by ID."""
        disease = db.query(Disease).filter(Disease.id == disease_id).first()
        if not disease:
            raise HTTPException(status_code=404, detail="Disease not found")
        return disease

    @staticmethod
    def get_diseases(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        is_active: Optional[bool] = True,
    ) -> List[Disease]:
        """Get list of diseases with filters."""
        query = db.query(Disease)

        if is_active is not None:
            query = query.filter(Disease.is_active == is_active)

        if category:
            query = query.filter(Disease.category == category)

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_disease(
        db: Session,
        disease_id: int,
        disease_data: DiseaseUpdate,
    ) -> Disease:
        """Update a disease."""
        disease = DiseaseService.get_disease(db, disease_id)

        if disease_data.name is not None:
            # Check if new name conflicts
            existing = (
                db.query(Disease)
                .filter(Disease.name == disease_data.name, Disease.id != disease_id)
                .first()
            )
            if existing:
                raise HTTPException(
                    status_code=400, detail="Disease name already exists"
                )
            disease.name = disease_data.name

        if disease_data.description is not None:
            disease.description = disease_data.description

        if disease_data.category is not None:
            disease.category = disease_data.category

        if disease_data.available_modalities is not None:
            disease.available_modalities = disease_data.available_modalities

        if disease_data.blog_link is not None:
            disease.blog_link = disease_data.blog_link

        if disease_data.is_active is not None:
            disease.is_active = disease_data.is_active

        try:
            db.commit()
            db.refresh(disease)
            logger.info(f"✅ Updated disease: {disease.name} (ID: {disease.id})")
            return disease
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to update disease: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update disease: {str(e)}"
            )

    @staticmethod
    def delete_disease(db: Session, disease_id: int) -> bool:
        """
        Delete a disease and its storage directory.

        Args:
            db: Database session
            disease_id: ID of disease to delete

        Returns:
            bool: True if deleted successfully

        Raises:
            HTTPException: If disease not found or has classifiers
        """
        disease = DiseaseService.get_disease(db, disease_id)

        # Check if disease has classifiers
        if disease.classifiers:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete disease with existing classifiers. Delete classifiers first.",
            )

        try:
            # Delete storage directory
            StorageService.delete_disease_directory(disease.storage_path)

            # Delete from database
            db.delete(disease)
            db.commit()

            logger.info(f"✅ Deleted disease: {disease.name} (ID: {disease.id})")
            return True

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to delete disease: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to delete disease: {str(e)}"
            )
