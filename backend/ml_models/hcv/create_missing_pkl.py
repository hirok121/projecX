"""
Script to create missing pickle files (imputer and class mappings)
from the existing HCV diagnosis tool for generalized model usage.
"""

import joblib
import os
from sklearn.impute import SimpleImputer
import numpy as np

# Feature averages from the original code
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

# Stage mapping for LR model
LR_CLASS_MAPPING = {
    0: "Blood Donors",
    1: "Hepatitis",
    2: "Fibrosis",
    3: "Cirrhosis",
}

# HCV status mapping for XGBoost model
XGBOOST_CLASS_MAPPING = {
    0: "Negative",
    1: "Positive",
}


def create_imputer_pkl(features_pkl_path, imputer_output_path):
    """
    Create an imputer pickle file based on feature names and averages.

    Args:
        features_pkl_path: Path to features.pkl file
        imputer_output_path: Output path for imputer.pkl
    """
    # Load features
    features = joblib.load(features_pkl_path)
    feature_list = features.tolist() if hasattr(features, "tolist") else list(features)

    # Create a SimpleImputer with strategy 'constant'
    # We'll store the fill values for each feature
    fill_values = []
    for feature in feature_list:
        fill_values.append(FEATURE_AVERAGES.get(feature, 0.0))

    # Create imputer
    imputer = SimpleImputer(strategy="constant", fill_value=None)

    # We need to fit it with dummy data to set up the imputer properly
    # Create dummy data with NaN values
    dummy_data = np.array([fill_values]).reshape(1, -1)
    imputer.fit(dummy_data)

    # Store the fill values as statistics_
    imputer.statistics_ = np.array(fill_values)

    # Save the imputer
    joblib.dump(imputer, imputer_output_path)
    print(f"Created imputer: {imputer_output_path}")


def create_class_mapping_pkl(class_mapping, output_path):
    """
    Create a class mapping pickle file.

    Args:
        class_mapping: Dictionary mapping class indices to names
        output_path: Output path for class.pkl
    """
    joblib.dump(class_mapping, output_path)
    print(f"Created class mapping: {output_path}")


if __name__ == "__main__":
    # Get the current directory
    current_dir = os.path.dirname(__file__)

    print("=" * 80)
    print("Creating Missing PKL Files for HCV Models")
    print("=" * 80)

    # Create LR model files
    print("\n--- Logistic Regression Model ---")
    lr_features_path = os.path.join(current_dir, "lr_features.pkl")
    lr_imputer_path = os.path.join(current_dir, "lr_imputer.pkl")
    lr_class_path = os.path.join(current_dir, "lr_class.pkl")

    if os.path.exists(lr_features_path):
        create_imputer_pkl(lr_features_path, lr_imputer_path)
        create_class_mapping_pkl(LR_CLASS_MAPPING, lr_class_path)
    else:
        print(f"Warning: {lr_features_path} not found!")

    # Create XGBoost model files
    print("\n--- XGBoost Model ---")
    xgboost_features_path = os.path.join(current_dir, "xgboost_features.pkl")
    xgboost_imputer_path = os.path.join(current_dir, "xgboost_imputer.pkl")
    xgboost_class_path = os.path.join(current_dir, "xgboost_class.pkl")

    if os.path.exists(xgboost_features_path):
        create_imputer_pkl(xgboost_features_path, xgboost_imputer_path)
        create_class_mapping_pkl(XGBOOST_CLASS_MAPPING, xgboost_class_path)
    else:
        print(f"Warning: {xgboost_features_path} not found!")

    print("\n" + "=" * 80)
    print("All PKL files created successfully!")
    print("=" * 80)
    print("\nFiles created:")
    print(f"  - {lr_imputer_path}")
    print(f"  - {lr_class_path}")
    print(f"  - {xgboost_imputer_path}")
    print(f"  - {xgboost_class_path}")
