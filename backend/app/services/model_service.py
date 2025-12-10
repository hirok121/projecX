import os
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Base directory for ML models
BASE_MODEL_DIR = Path(__file__).parent.parent / "ml_models"


class ModelService:
    """Service for loading and managing ML models."""

    def __init__(self):
        self.loaded_models: Dict[int, Any] = {}  # classifier_id -> model object
        self.model_cache_time: Dict[int, datetime] = {}

        # Ensure model directory exists
        BASE_MODEL_DIR.mkdir(exist_ok=True)
        logger.info(f"✅ ModelService initialized. Model directory: {BASE_MODEL_DIR}")

    def get_model_path(self, classifier_id: int, model_file: str) -> Path:
        """Get the full path to a model file."""
        return BASE_MODEL_DIR / str(classifier_id) / model_file

    def load_model(
        self, classifier_id: int, model_file: str, force_reload: bool = False
    ) -> Any:
        """
        Load a pickle model file.

        Args:
            classifier_id: Database ID of the classifier
            model_file: Filename of the pickle file
            force_reload: Force reload even if cached

        Returns:
            Loaded model object

        Raises:
            FileNotFoundError: If model file doesn't exist
            Exception: If model loading fails
        """
        # Check cache
        if not force_reload and classifier_id in self.loaded_models:
            logger.info(f"✅ Using cached model for classifier {classifier_id}")
            return self.loaded_models[classifier_id]

        # Get model path
        model_path = self.get_model_path(classifier_id, model_file)

        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        try:
            # Load model
            logger.info(f"📥 Loading model from {model_path}")
            model = joblib.load(model_path)

            # Cache the model
            self.loaded_models[classifier_id] = model
            self.model_cache_time[classifier_id] = datetime.now()

            logger.info(f"✅ Successfully loaded model for classifier {classifier_id}")
            return model

        except Exception as e:
            logger.error(f"❌ Failed to load model from {model_path}: {str(e)}")
            raise Exception(f"Failed to load model: {str(e)}")

    def predict(
        self, classifier_id: int, model_file: str, input_data: np.ndarray
    ) -> Tuple[str, float, Dict[str, float]]:
        """
        Make a prediction using a loaded model.

        Args:
            classifier_id: Database ID of the classifier
            model_file: Filename of the pickle file
            input_data: Input features as numpy array

        Returns:
            Tuple of (prediction, confidence, probabilities_dict)
        """
        try:
            # Load model
            model = self.load_model(classifier_id, model_file)

            # Make prediction
            prediction = model.predict(input_data)

            # Get probabilities if available
            probabilities = {}
            confidence = 0.0

            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(input_data)[0]
                classes = (
                    model.classes_
                    if hasattr(model, "classes_")
                    else [f"Class_{i}" for i in range(len(proba))]
                )

                probabilities = {
                    str(cls): float(prob) for cls, prob in zip(classes, proba)
                }
                confidence = float(max(proba))
            else:
                # For models without probability estimates
                confidence = 1.0  # Assume 100% confidence for deterministic predictions
                probabilities = {str(prediction[0]): 1.0}

            result = str(prediction[0])

            logger.info(f"✅ Prediction: {result} with confidence {confidence:.2%}")
            return result, confidence, probabilities

        except Exception as e:
            logger.error(f"❌ Prediction failed: {str(e)}")
            raise Exception(f"Prediction failed: {str(e)}")

    def save_model(
        self, classifier_id: int, model_file: str, model_object: Any
    ) -> Path:
        """
        Save a model to disk.

        Args:
            classifier_id: Database ID of the classifier
            model_file: Filename for the pickle file
            model_object: Trained model object to save

        Returns:
            Path where model was saved
        """
        try:
            # Create classifier directory
            model_dir = BASE_MODEL_DIR / str(classifier_id)
            model_dir.mkdir(exist_ok=True, parents=True)

            # Save model
            model_path = model_dir / model_file
            joblib.dump(model_object, model_path)

            # Update cache
            self.loaded_models[classifier_id] = model_object
            self.model_cache_time[classifier_id] = datetime.now()

            logger.info(f"✅ Model saved to {model_path}")
            return model_path

        except Exception as e:
            logger.error(f"❌ Failed to save model: {str(e)}")
            raise Exception(f"Failed to save model: {str(e)}")

    def delete_model(self, classifier_id: int, model_file: str) -> bool:
        """
        Delete a model file from disk.

        Args:
            classifier_id: Database ID of the classifier
            model_file: Filename of the pickle file

        Returns:
            True if deleted successfully
        """
        try:
            model_path = self.get_model_path(classifier_id, model_file)

            if model_path.exists():
                model_path.unlink()
                logger.info(f"✅ Deleted model file: {model_path}")

            # Remove from cache
            if classifier_id in self.loaded_models:
                del self.loaded_models[classifier_id]
                del self.model_cache_time[classifier_id]

            return True

        except Exception as e:
            logger.error(f"❌ Failed to delete model: {str(e)}")
            return False

    def clear_cache(self, classifier_id: Optional[int] = None):
        """Clear model cache."""
        if classifier_id:
            if classifier_id in self.loaded_models:
                del self.loaded_models[classifier_id]
                del self.model_cache_time[classifier_id]
                logger.info(f"✅ Cleared cache for classifier {classifier_id}")
        else:
            self.loaded_models.clear()
            self.model_cache_time.clear()
            logger.info("✅ Cleared all model cache")


# Global instance
model_service = ModelService()
