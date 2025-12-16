import pandas as pd
import joblib
import os
import sys
from typing import Dict, Any, Optional, List

# import LogisticRegression and XGBoost from sklearn and xgboost
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

# Try to handle the pickle loading issue by adding the modules to sys.modules
import sklearn.linear_model

sys.modules["LogisticRegression"] = sklearn.linear_model.LogisticRegression
sys.modules["XGBClassifier"] = XGBClassifier


class AiDiagnosisTool:
    """
    AI Diagnosis Tool class for loading and using machine learning models
    to diagnose hepatitis C and liver disease stages.

    Two main prediction functions:
    - predict_with_lr(): Predicts liver disease stage (Blood Donors, Hepatitis, Fibrosis, Cirrhosis)
    - predict_with_xgboost(): Predicts HCV status (Positive/Negative)
    required features:
    {'CREA', 'ALP', 'CGT', 'CHE', 'AST'}
    """

    # Stage mapping for LR model
    STAGE_MAPPING = {
        0: "Blood Donors",
        1: "Hepatitis",
        2: "Fibrosis",
        3: "Cirrhosis",
    }

    # HCV status mapping for XGBoost model
    HCV_STATUS_MAPPING = {
        0: "Negative",
        1: "Positive",
    }

    # Default average values for missing features (calculated from training data)
    FEATURE_AVERAGES = {
        "Age": 47.0,
        "SEX": 0.5,
        "ALB": 41.0,
        "ALP": 69.0,
        "ALT": 28.0,
        "AST": 39.0,
        "BIL": 11.0,
        "CHE": 8.2,
        "CHOL": 5.3,
        "CREA": 80.0,
        "CGT": 38.0,
        "PROT": 72.0,
    }

    def __init__(self, model_dir: Optional[str] = None):
        """
        Initialize the AI Diagnosis Tool with model loading.

        Args:
            model_dir: Directory containing the model files. If None, uses current directory.
        """
        self.model_dir = model_dir or os.path.dirname(__file__)
        self.lr_model = None
        self.lr_scaler = None
        self.lr_feature_names = []
        self.xgboost_model = None
        self.xgboost_scaler = None
        self.xgboost_feature_names = []
        self._load_models()

    def _load_models(self):
        """Load the trained models from joblib files."""
        try:
            # Load LR model
            lr_model_path = os.path.join(self.model_dir, "lr_model.pkl")
            lr_scaler_path = os.path.join(self.model_dir, "lr_scaler.pkl")
            lr_features_path = os.path.join(self.model_dir, "lr_features.pkl")

            self.lr_model = joblib.load(lr_model_path)
            self.lr_scaler = joblib.load(lr_scaler_path)
            lr_features = joblib.load(lr_features_path)

            self.lr_feature_names = (
                lr_features.tolist()
                if hasattr(lr_features, "tolist")
                else list(lr_features)
            )

            # Load XGBoost model
            xgboost_model_path = os.path.join(self.model_dir, "xgboost_model.pkl")
            xgboost_scaler_path = os.path.join(self.model_dir, "xgboost_scaler.pkl")
            xgboost_features_path = os.path.join(self.model_dir, "xgboost_features.pkl")

            self.xgboost_model = joblib.load(xgboost_model_path)
            self.xgboost_scaler = joblib.load(xgboost_scaler_path)
            xgb_features = joblib.load(xgboost_features_path)

            self.xgboost_feature_names = (
                xgb_features.tolist()
                if hasattr(xgb_features, "tolist")
                else list(xgb_features)
            )

        except Exception as e:
            print(f"Error loading models: {str(e)}")
            raise

    def _prepare_input_data(
        self,
        input_data: Dict[str, Any],
        required_features: List[str],
        min_required_ratio: float = 0.5,
    ) -> pd.DataFrame:
        """
        Prepare and validate input data for prediction.

        Args:
            input_data: Dictionary containing feature values
            required_features: List of features expected by the model
            min_required_ratio: Minimum ratio of features that must be present (default 0.5 = 50%)

        Returns:
            DataFrame with prepared features

        Raises:
            ValueError: If insufficient features are provided
        """
        if input_data is None:
            input_data = {}

        # Clean input data - remove None values and convert to float
        cleaned_data = {}
        for k, v in input_data.items():
            if v is not None and v != "":
                try:
                    cleaned_data[k.upper()] = float(v)
                except (ValueError, TypeError):
                    print(f"Invalid value for {k}: {v}, skipping.")

        # Handle AGE -> Age conversion
        if "AGE" in cleaned_data:
            cleaned_data["Age"] = cleaned_data.pop("AGE")

        # Check if we have enough features
        provided_features = set(cleaned_data.keys())
        expected_features = set(required_features)
        common_features = provided_features.intersection(expected_features)

        min_required = int(len(expected_features) * min_required_ratio)
        if len(common_features) < min_required:
            raise ValueError(
                f"Insufficient data: Need at least {min_required} features "
                f"({min_required_ratio*100}%), but only {len(common_features)} provided. "
                f"Missing: {expected_features - provided_features}"
            )

        # Create DataFrame with all required features
        patient_data_df = pd.DataFrame([cleaned_data])

        # Add missing features with their average values
        for feature in required_features:
            if feature not in patient_data_df.columns:
                # Use feature-specific average or fallback to 0.0
                avg_value = self.FEATURE_AVERAGES.get(feature, 0.0)
                patient_data_df[feature] = avg_value

        return patient_data_df[required_features]

    def predict_with_lr(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict liver disease stage using Logistic Regression model.

        Args:
            input_data: Dictionary containing patient features

        Returns:
            Dictionary with:
                - model_name: "Logistic Regression"
                - prediction_class: Stage name (Blood Donors, Hepatitis, Fibrosis, Cirrhosis)
                - class_probability: Dict with probability for each class
                - confidence: Highest probability value
                - error: Empty string if success, error message if failure
        """
        if self.lr_model is None:
            return {
                "model_name": "Logistic Regression",
                "prediction_class": "Unknown",
                "class_probability": {},
                "confidence": 0.0,
                "error": "LR model not loaded",
            }

        try:
            # Prepare input data
            prepared_data = self._prepare_input_data(
                input_data, self.lr_feature_names, min_required_ratio=0.5
            )

            # Scale the data
            scaled_data = self.lr_scaler.transform(prepared_data)
            scaled_df = pd.DataFrame(scaled_data, columns=self.lr_feature_names)

            # Make predictions
            prediction_class = self.lr_model.predict(scaled_df)[0]
            prediction_proba = self.lr_model.predict_proba(scaled_df)[0]

            # Format results
            class_probabilities = {
                self.STAGE_MAPPING[i]: float(prob)
                for i, prob in enumerate(prediction_proba)
            }

            result = {
                "model_name": "Logistic Regression",
                "prediction_class": self.STAGE_MAPPING[prediction_class],
                "class_probability": class_probabilities,
                "confidence": float(max(prediction_proba)),
                "error": "",
            }

            return result

        except Exception as e:
            return {
                "model_name": "Logistic Regression",
                "prediction_class": "Unknown",
                "class_probability": {},
                "confidence": 0.0,
                "error": str(e),
            }

    def predict_with_xgboost(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict HCV status (Positive/Negative) using XGBoost model.

        Args:
            input_data: Dictionary containing patient features

        Returns:
            Dictionary with:
                - model_name: "XGBoost"
                - prediction_class: HCV status (Positive or Negative)
                - class_probability: Dict with probability for each class
                - confidence: Highest probability value
                - error: Empty string if success, error message if failure
        """
        if self.xgboost_model is None:
            return {
                "model_name": "XGBoost",
                "prediction_class": "Unknown",
                "class_probability": {},
                "confidence": 0.0,
                "error": "XGBoost model not loaded",
            }

        try:
            # Prepare input data
            prepared_data = self._prepare_input_data(
                input_data, self.xgboost_feature_names, min_required_ratio=0.5
            )

            # Scale the data
            scaled_data = self.xgboost_scaler.transform(prepared_data)
            scaled_df = pd.DataFrame(scaled_data, columns=self.xgboost_feature_names)

            # Make predictions
            prediction_class = self.xgboost_model.predict(scaled_df)[0]
            prediction_proba = self.xgboost_model.predict_proba(scaled_df)[0]

            # Format results
            class_probabilities = {
                self.HCV_STATUS_MAPPING[i]: float(prob)
                for i, prob in enumerate(prediction_proba)
            }

            result = {
                "model_name": "XGBoost",
                "prediction_class": self.HCV_STATUS_MAPPING[prediction_class],
                "class_probability": class_probabilities,
                "confidence": float(max(prediction_proba)),
                "error": "",
            }

            return result

        except Exception as e:
            return {
                "model_name": "XGBoost",
                "prediction_class": "Unknown",
                "class_probability": {},
                "confidence": 0.0,
                "error": str(e),
            }


# Example usage
if __name__ == "__main__":
    # Create an instance of the diagnosis tool
    diagnosis_tool = AiDiagnosisTool()

    # Test data samples
    patient_data_list = [
        {
            "age": 32,
            "sex": "1",
            "alb": 38.5,
            "alp": 52.5,
            "ast": 22.1,
            "bil": 7.5,
            "che": 6.93,
            "chol": 3.23,
            "crea": 106.0,
            "cgt": 12.1,
            "prot": 69.0,
            "alt": 7.7,
        },
        {
            "age": 50,
            "sex": "0",
            "alb": 40.0,
            "alp": 32.7,
            "ast": 46.0,
            "bil": 10.0,
            "che": 7.51,
            "chol": 4.67,
            "crea": 56.6,
            "cgt": 22.3,
            "prot": 70.1,
            "alt": 9.0,
        },
        {
            "age": 61,
            "sex": "0",
            "alb": 50.0,
            "alp": 34.4,
            "ast": 114.4,
            "bil": 22.0,
            "che": 9.48,
            "chol": 4.62,
            "crea": 61.9,
            "cgt": 169.8,
            "prot": 86.0,
            "alt": 27.4,
        },
        # Test with partial data (should still work with 50% rule)
        {
            "age": 45,
            "alb": 40.0,
            "alp": 50.0,
            "ast": 30.0,
            "bil": 8.0,
            "che": 7.0,
        },
    ]

    print("=" * 80)
    print("HCV Diagnosis Tool - Testing")
    print("=" * 80)

    for i, patient_data in enumerate(patient_data_list, 1):
        print(f"\n{'='*80}")
        print(f"Patient {i}:")
        print(f"{'='*80}")

        try:
            # Test LR model prediction
            print("\n--- Logistic Regression Model (Stage Prediction) ---")
            lr_result = diagnosis_tool.predict_with_lr(patient_data)
            print(f"Model Name: {lr_result['model_name']}")
            if lr_result["error"]:
                print(f"Error: {lr_result['error']}")
            else:
                print(f"Prediction Class: {lr_result['prediction_class']}")
                print(f"Confidence: {lr_result['confidence']:.2%}")
                print("Class Probabilities:")
                for stage, prob in lr_result["class_probability"].items():
                    print(f"  {stage}: {prob:.2%}")

            # Test XGBoost model prediction
            print("\n--- XGBoost Model (HCV Status Prediction) ---")
            xgb_result = diagnosis_tool.predict_with_xgboost(patient_data)
            print(f"Model Name: {xgb_result['model_name']}")
            if xgb_result["error"]:
                print(f"Error: {xgb_result['error']}")
            else:
                print(f"Prediction Class: {xgb_result['prediction_class']}")
                print(f"Confidence: {xgb_result['confidence']:.2%}")
                print("Class Probabilities:")
                for status, prob in xgb_result["class_probability"].items():
                    print(f"  {status}: {prob:.2%}")

        except Exception as e:
            print(f"Error processing patient {i}: {str(e)}")

    # Test with insufficient data
    print(f"\n{'='*80}")
    print("Testing with insufficient data (should return error):")
    print(f"{'='*80}")
    insufficient_data = {"age": 30, "alb": 40.0}
    result = diagnosis_tool.predict_with_lr(insufficient_data)
    if result["error"]:
        print(f"Expected error received: {result['error']}")
    else:
        print(f"Unexpected success: {result['prediction_class']}")
