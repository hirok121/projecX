# Generalized ML Model Predictor

A flexible, reusable prediction system that works with any scikit-learn compatible ML model.

## Overview

This system provides a standardized way to make predictions with any ML model. Each model should be in its own directory with these 5 pickle files:

1. **features.pkl** - List of feature names required by the model
2. **scaler.pkl** - Scaler/encoder for feature transformation
3. **imputer.pkl** - Imputer for handling missing values with averages
4. **model.pkl** - The trained ML model
5. **class.pkl** - Dictionary mapping class indices to human-readable names

All files should be in the same directory with these exact names (no prefixes).

## Files

### 1. `general_predictor.py`

Main generalized prediction script that works with any model.

**Key Features:**

- Handles missing input data using imputer
- Standardizes input format
- Returns consistent output format
- Graceful error handling

**Usage:**

```python
from general_predictor import load_model

# Load a model from a directory containing the 5 required files
predictor = load_model(
    model_dir='path/to/model_directory',
    model_name='My Model Name'
)

# Make prediction
result = predictor.predict({
    "age": 50,
    "alb": 40.0,
    "ast": 46.0,
    # ... more features
})

# Access results
print(result['prediction_class'])  # e.g., "Hepatitis"
print(result['confidence'])         # e.g., 0.85
print(result['class_probability'])  # Dict of all class probabilities
print(result['error'])              # Empty string on success
```

### 2. `create_missing_pkl.py`

Utility script to generate `imputer.pkl` and `class.pkl` files from existing models.

**Usage:**

```bash
python create_missing_pkl.py
```

## Output Format

All predictions return a standardized dictionary:

```python
{
    "model_name": "Model Name",
    "prediction_class": "Class Name",
    "class_probability": {
        "Class1": 0.25,
        "Class2": 0.60,
        "Class3": 0.15
    },
    "confidence": 0.60,  # Highest probability
    "error": ""  # Empty on success, error message on failure
}
```

## HCV Model Files

For the HCV diagnosis models, the following files are used:

### Logistic Regression Model (Stage Prediction)

- `lr_features.pkl` - Feature names
- `lr_scaler.pkl` - StandardScaler for normalization
- `lr_imputer.pkl` - SimpleImputer with feature averages
- `lr_model.pkl` - Trained LogisticRegression model
- `lr_class.pkl` - Stage mappings (Blood Donors, Hepatitis, Fibrosis, Cirrhosis)

### XGBoost Model (HCV Status)

- `xgboost_features.pkl` - Feature names
- `xgboost_scaler.pkl` - StandardScaler for normalization
- `xgboost_imputer.pkl` - SimpleImputer with feature averages
- `xgboost_model.pkl` - Trained XGBClassifier model
- `xgboost_class.pkl` - Status mappings (Negative, Positive)

## Feature Averages

Default values used for missing features (calculated from training data):

```python
{
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
```

## Example: Adding a New Model

To use this system with a new model:

1. **Save your model files:**

```python
import joblib

# Save feature names
joblib.dump(feature_list, 'mymodel_features.pkl')

# Save scaler
joblib.dump(scaler, 'mymodel_scaler.pkl')

# Save imputer
joblib.dump(imputer, 'mymodel_imputer.pkl')

# Save trained model
joblib.dump(trained_model, 'mymodel_model.pkl')

# Save class mapping
class_mapping = {0: "ClassA", 1: "ClassB", 2: "ClassC"}
joblib.dump(class_mapping, 'mymodel_class.pkl')
```

2. **Use the general predictor:**

```python
from general_predictor import load_model

predictor = load_model(
    model_dir='path/to/models',
    model_prefix='mymodel',
    model_name='My Custom Model'
)

result = predictor.predict(input_data)
```

## Advantages

✅ **Model Agnostic** - Works with any scikit-learn compatible model  
✅ **Consistent API** - Same interface for all models  
✅ **Error Handling** - Graceful failures with error messages  
✅ **Missing Data** - Automatic imputation of missing features  
✅ **Flexible** - Easy to add new models without code changes  
✅ **Type Safe** - Clear input/output formats

## Requirements

```
pandas
joblib
scikit-learn
numpy
```

## Testing

Run the general predictor test:

```bash
python general_predictor.py
```

This will test both HCV models with full and partial data.

## Integration with FastAPI

Example endpoint using the general predictor:

```python
from fastapi import APIRouter
from general_predictor import load_model

router = APIRouter()

# Load models at startup (each in its own directory)
lr_model = load_model('models/lr_model', 'Logistic Regression')
xgb_model = load_model('models/xgboost_model', 'XGBoost')

@router.post("/predict/stage")
async def predict_stage(patient_data: dict):
    result = lr_model.predict(patient_data)
    return result

@router.post("/predict/status")
async def predict_status(patient_data: dict):
    result = xgb_model.predict(patient_data)
    return result
```

## Notes

- Feature names are case-insensitive (automatically converted to uppercase)
- Special handling for "AGE" → "Age" conversion
- All numeric values converted to float
- Invalid values are skipped with warnings
- Missing features filled with averages from imputer
