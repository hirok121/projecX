"""
Storage Service - Handles file system operations for disease and classifier models
"""

import os
import shutil
from pathlib import Path
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """Service for managing disease and classifier storage directories."""

    # Base directory for all model storage (convert to absolute path)
    BASE_DIR = Path(settings.ml_models_path).resolve()

    @classmethod
    def create_disease_directory(cls, disease_storage_path: str) -> Path:
        """
        Create a directory for a disease.

        Args:
            disease_storage_path: UUID-based path for the disease

        Returns:
            Path: Full path to the created disease directory

        Raises:
            OSError: If directory creation fails
        """
        disease_dir = cls.BASE_DIR / disease_storage_path
        disease_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"✅ Created disease directory: {disease_dir}")
        return disease_dir

    @classmethod
    def create_classifier_directory(
        cls, disease_storage_path: str, classifier_model_path: str
    ) -> Path:
        """
        Create a directory for a classifier within a disease directory.

        Args:
            disease_storage_path: UUID-based path for the disease
            classifier_model_path: UUID-based path for the classifier

        Returns:
            Path: Full path to the created classifier directory

        Raises:
            OSError: If directory creation fails
        """
        classifier_dir = cls.BASE_DIR / disease_storage_path / classifier_model_path
        classifier_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"✅ Created classifier directory: {classifier_dir}")
        return classifier_dir

    @classmethod
    def get_disease_directory(cls, disease_storage_path: str) -> Path:
        """Get the full path to a disease directory."""
        return cls.BASE_DIR / disease_storage_path

    @classmethod
    def get_classifier_directory(
        cls, disease_storage_path: str, classifier_model_path: str
    ) -> Path:
        """Get the full path to a classifier directory."""
        return cls.BASE_DIR / disease_storage_path / classifier_model_path

    @classmethod
    def delete_disease_directory(cls, disease_storage_path: str) -> bool:
        """
        Delete a disease directory and all its contents.

        Args:
            disease_storage_path: UUID-based path for the disease

        Returns:
            bool: True if deleted successfully, False otherwise
        """
        disease_dir = cls.BASE_DIR / disease_storage_path
        if disease_dir.exists():
            try:
                shutil.rmtree(disease_dir)
                print(f"Deleted disease directory: {disease_dir}")
                return True
            except Exception as e:
                print(f"Error deleting disease directory {disease_dir}: {str(e)}")
                return False
        return False

    @classmethod
    def delete_classifier_directory(
        cls, disease_storage_path: str, classifier_model_path: str
    ) -> bool:
        """
        Delete a classifier directory and all its contents.

        Args:
            disease_storage_path: UUID-based path for the disease
            classifier_model_path: UUID-based path for the classifier

        Returns:
            bool: True if deleted successfully, False otherwise
        """
        classifier_dir = cls.BASE_DIR / disease_storage_path / classifier_model_path
        if classifier_dir.exists():
            try:
                shutil.rmtree(classifier_dir)
                print(f"Deleted classifier directory: {classifier_dir}")
                return True
            except Exception as e:
                print(f"Error deleting classifier directory {classifier_dir}: {str(e)}")
                return False
        return False

    @classmethod
    def save_model_files(
        cls, disease_storage_path: str, classifier_model_path: str, files: dict
    ) -> dict:
        """
        Save model pickle files to the classifier directory.

        Args:
            disease_storage_path: UUID-based path for the disease
            classifier_model_path: UUID-based path for the classifier
            files: Dictionary of {filename: file_content} to save

        Returns:
            dict: Dictionary of {filename: saved_path}

        Expected files:
            - features.pkl
            - scaler.pkl
            - imputer.pkl
            - model.pkl
            - class.pkl
        """
        classifier_dir = cls.get_classifier_directory(
            disease_storage_path, classifier_model_path
        )

        saved_paths = {}
        for filename, content in files.items():
            file_path = classifier_dir / filename

            # Write the file
            if hasattr(content, "read"):  # File-like object
                with open(file_path, "wb") as f:
                    f.write(content.read())
            else:  # Bytes content
                with open(file_path, "wb") as f:
                    f.write(content)

            saved_paths[filename] = str(file_path)
            logger.info(f"✅ Saved {filename} to {file_path}")

        return saved_paths

    @classmethod
    def get_full_storage_path(
        cls, disease_storage_path: str, classifier_model_path: Optional[str] = None
    ) -> str:
        """
        Get the full storage path as a string.

        Args:
            disease_storage_path: UUID-based path for the disease
            classifier_model_path: Optional UUID-based path for the classifier

        Returns:
            str: Full storage path
        """
        if classifier_model_path:
            return str(cls.BASE_DIR / disease_storage_path / classifier_model_path)
        return str(cls.BASE_DIR / disease_storage_path)
