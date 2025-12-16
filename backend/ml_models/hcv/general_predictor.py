"""
General Purpose ML Model Predictor for Tabular Data

This script provides a generalized approach to make predictions with any ML model
by providing paths to the required pickle files.

Required files:
- features.pkl: List of feature names
- encoder.pkl: Scaler/encoder for feature transformation
- imputer.pkl: Imputer for handling missing values
- model.pkl: Trained ML model
- class.pkl: Dictionary mapping class indices to class names
"""

import pandas as pd
import joblib
import os
from typing import Dict, Any, Optional


class GeneralPredictor:
    """
    A generalized predictor for tabular data that works with any ML model given the required pickle files.
    """

    def __init__(
        self,
        features_path: str,
        encoder_path: str,
        imputer_path: str,
        model_path: str,
        class_path: str,
        model_name: str = "Model",
    ):
        """
        Initialize the general predictor.

        Args:
            features_path: Path to features.pkl file
            encoder_path: Path to encoder.pkl (scaler) file
            imputer_path: Path to imputer.pkl file
            model_path: Path to model.pkl file
            class_path: Path to class.pkl (class mapping) file
            model_name: Name of the model for display purposes
        """
        self.model_name = model_name
        self.features = None
        self.encoder = None
        self.imputer = None
        self.model = None
        self.class_mapping = None

        self._load_all(
            features_path, encoder_path, imputer_path, model_path, class_path
        )

    def _load_all(
        self,
        features_path: str,
        encoder_path: str,
        imputer_path: str,
        model_path: str,
        class_path: str,
    ):
        """Load all required pickle files."""
        try:
            # Load features
            features_data = joblib.load(features_path)
            self.features = (
                features_data.tolist()
                if hasattr(features_data, "tolist")
                else list(features_data)
            )

            # Load encoder (scaler)
            self.encoder = joblib.load(encoder_path)

            # Load imputer
            self.imputer = joblib.load(imputer_path)

            # Load model
            self.model = joblib.load(model_path)

            # Load class mapping
            self.class_mapping = joblib.load(class_path)

            # print(f"{self.model_name} loaded successfully")
            # print(f"Features: {self.features}")
            # print(f"Classes: {list(self.class_mapping.values())}")

        except Exception as e:
            raise Exception(f"Error loading model files: {str(e)}")

    def _prepare_input(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Prepare and validate input data.

        Args:
            input_data: Dictionary containing feature values

        Returns:
            DataFrame with prepared features
        """
        if input_data is None:
            input_data = {}

        # Clean input data - remove None values and convert to float
        cleaned_data = {}
        for k, v in input_data.items():
            if v is not None and v != "":
                try:
                    cleaned_data[k] = float(v)
                except (ValueError, TypeError):
                    print(f"Warning: Invalid value for {k}: {v}, skipping.")

        # Create DataFrame
        patient_data_df = pd.DataFrame([cleaned_data])

        # check if 50% of features are present
        missing_features = len(set(self.features) - set(patient_data_df.columns))
        if missing_features > len(self.features) / 2:
            raise ValueError(
                f"Insufficient data: {missing_features} features missing out of {len(self.features)}"
            )

        # Add missing features with NaN (imputer will handle them)
        for feature in self.features:
            if feature not in patient_data_df.columns:
                patient_data_df[feature] = float("nan")

        # Reorder columns to match feature order
        patient_data_df = patient_data_df[self.features]

        return patient_data_df

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make predictions using the loaded model.

        Args:
            input_data: Dictionary containing patient features

        Returns:
            Dictionary with:
                - model_name: Name of the model
                - prediction_class: Predicted class name
                - class_probability: Dict with probability for each class
                - confidence: Highest probability value
                - error: Empty string if success, error message if failure
        """
        if self.model is None:
            return {
                "model_name": self.model_name,
                "prediction_class": "Unknown",
                "class_probability": {},
                "confidence": 0.0,
                "error": f"{self.model_name} not loaded",
            }

        try:
            # Prepare input data
            prepared_data = self._prepare_input(input_data)

            # Impute missing values
            imputed_data = self.imputer.transform(prepared_data)
            imputed_df = pd.DataFrame(imputed_data, columns=self.features)

            # Scale the data
            scaled_data = self.encoder.transform(imputed_df)
            scaled_df = pd.DataFrame(scaled_data, columns=self.features)

            # Make predictions
            prediction_class = self.model.predict(scaled_df)[0]
            prediction_proba = self.model.predict_proba(scaled_df)[0]

            # Format results
            class_probabilities = {
                self.class_mapping[i]: float(prob)
                for i, prob in enumerate(prediction_proba)
            }

            result = {
                "model_name": self.model_name,
                "prediction_class": self.class_mapping[prediction_class],
                "class_probability": class_probabilities,
                "confidence": float(max(prediction_proba)),
                "error": "",
            }

            return result

        except Exception as e:
            return {
                "model_name": self.model_name,
                "prediction_class": "Unknown",
                "class_probability": {},
                "confidence": 0.0,
                "error": str(e),
            }


def load_model(
    model_dir: str,
    model_name: str,
) -> GeneralPredictor:
    """
    Convenience function to load a model from a directory.

    Args:
        model_dir: Directory containing the model files (features.pkl, scaler.pkl, etc.)
        model_name: Display name for the model

    Returns:
        GeneralPredictor instance

    Example:
        predictor = load_model('path/to/lr_model', 'Logistic Regression')
    """

    features_path = os.path.join(model_dir, "features.pkl")
    encoder_path = os.path.join(model_dir, "scaler.pkl")
    imputer_path = os.path.join(model_dir, "imputer.pkl")
    model_path = os.path.join(model_dir, "model.pkl")
    class_path = os.path.join(model_dir, "class.pkl")

    return GeneralPredictor(
        features_path=features_path,
        encoder_path=encoder_path,
        imputer_path=imputer_path,
        model_path=model_path,
        class_path=class_path,
        model_name=model_name,
    )


# Example usage
if __name__ == "__main__":
    # Get the current directory (where the model files are)
    current_dir = os.path.dirname(__file__)

    # Test data
    test_patient = {
        "Age": 50,
        "SEX": "0",
        "ALB": 40.0,
        "ALP": 32.7,
        "AST": 46.0,
        "BIL": 10.0,
        "CHE": 7.51,
        "CHOL": 4.67,
        "CREA": 56.6,
        "CGT": 22.3,
        "PROT": 70.1,
        "ALT": 9.0,
    }

    # Partial data test
    partial_data = {
        "Age": 45,
        "ALB": 40.0,
        "ALP": 50.0,
        "AST": 30.0,
    }

    print("=" * 80)
    print("General Purpose Model Predictor - Testing")
    print("=" * 80)

    # Load and test LR model
    print("\n" + "=" * 80)
    print("Loading Logistic Regression Model")
    print("=" * 80)
    try:
        lr_predictor = load_model(current_dir + "/lr", "Logistic Regression")

        print("\n--- Full Data Test ---")
        lr_result = lr_predictor.predict(test_patient)
        print(f"Model: {lr_result['model_name']}")
        if lr_result["error"]:
            print(f"Error: {lr_result['error']}")
        else:
            print(f"Prediction: {lr_result['prediction_class']}")
            print(f"Confidence: {lr_result['confidence']:.2%}")
            print("Probabilities:")
            for cls, prob in lr_result["class_probability"].items():
                print(f"  {cls}: {prob:.2%}")

        print("\n--- Partial Data Test ---")
        lr_result_partial = lr_predictor.predict(partial_data)
        print(f"Model: {lr_result_partial['model_name']}")
        if lr_result_partial["error"]:
            print(f"Error: {lr_result_partial['error']}")
        else:
            print(f"Prediction: {lr_result_partial['prediction_class']}")
            print(f"Confidence: {lr_result_partial['confidence']:.2%}")

    except Exception as e:
        print(f"Failed to load LR model: {str(e)}")

    # Load and test XGBoost model
    print("\n" + "=" * 80)
    print("Loading XGBoost Model")
    print("=" * 80)
    try:
        xgb_predictor = load_model(current_dir + "/xgboost", "XGBoost")

        print("\n--- Full Data Test ---")
        xgb_result = xgb_predictor.predict(test_patient)
        print(f"Model: {xgb_result['model_name']}")
        if xgb_result["error"]:
            print(f"Error: {xgb_result['error']}")
        else:
            print(f"Prediction: {xgb_result['prediction_class']}")
            print(f"Confidence: {xgb_result['confidence']:.2%}")
            print("Probabilities:")
            for cls, prob in xgb_result["class_probability"].items():
                print(f"  {cls}: {prob:.2%}")

        print("\n--- Partial Data Test ---")
        xgb_result_partial = xgb_predictor.predict(partial_data)
        print(f"Model: {xgb_result_partial['model_name']}")
        if xgb_result_partial["error"]:
            print(f"Error: {xgb_result_partial['error']}")
        else:
            print(f"Prediction: {xgb_result_partial['prediction_class']}")
            print(f"Confidence: {xgb_result_partial['confidence']:.2%}")

    except Exception as e:
        print(f"Failed to load XGBoost model: {str(e)}")

    print("\n" + "=" * 80)
    print("Testing Complete")
    print("=" * 80)
