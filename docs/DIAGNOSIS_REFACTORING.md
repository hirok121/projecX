# Diagnosis System Refactoring

## Overview

The diagnosis system has been refactored to follow a clean service-layer architecture, separating concerns between disease management, classifier management, and prediction operations.

## Architecture Changes

### Before

- Single `diagnosis.py` router handling all operations (380+ lines)
- Mixed responsibilities: disease CRUD, classifier CRUD, predictions

### After

Three separate routers with dedicated services:

1. **Disease Router** (`app/routers/disease.py`) - Disease CRUD
2. **Classifier Router** (`app/routers/classifier.py`) - Classifier CRUD
3. **Diagnosis Router** (`app/routers/diagnosis.py`) - Predictions only

## New Components

### Services (Business Logic Layer)

#### `app/services/disease_service.py`

Handles all disease-related business logic:

- `create_disease()` - Creates disease + storage directory
- `get_disease()` - Retrieve disease by ID
- `get_diseases()` - List with filters (category, is_active)
- `update_disease()` - Update disease fields
- `delete_disease()` - Delete disease + storage, validates no classifiers exist

#### `app/services/classifier_service.py`

Handles all classifier-related business logic:

- `create_classifier()` - Creates classifier + storage directory
- `upload_model_files()` - Saves 5 required pkl files
- `get_classifier()` - Retrieve classifier by ID
- `get_classifiers()` - List with filters (disease_id, modality, is_active)
- `update_classifier()` - Update classifier metadata
- `delete_classifier()` - Delete classifier + storage directory

#### `app/services/storage_service.py`

File system operations for model storage:

- `create_disease_directory()` - Creates disease storage directory
- `create_classifier_directory()` - Creates classifier storage directory
- `save_model_files()` - Saves pkl files to classifier directory
- `delete_disease_directory()` - Removes disease storage
- `delete_classifier_directory()` - Removes classifier storage

### Routers (API Endpoints)

#### `app/routers/disease.py`

Disease management endpoints:

- `POST /diseases` - Create disease
- `GET /diseases` - List diseases with filters
- `GET /diseases/{disease_id}` - Get disease detail
- `PUT /diseases/{disease_id}` - Update disease
- `DELETE /diseases/{disease_id}` - Delete disease

#### `app/routers/classifier.py`

Classifier management endpoints:

- `POST /classifiers` - Create classifier
- `POST /classifiers/{classifier_id}/upload-model-files` - Upload 5 pkl files
- `GET /classifiers` - List classifiers with filters
- `GET /classifiers/{classifier_id}` - Get classifier detail
- `GET /classifiers/by-disease/{disease_id}` - Get classifiers for disease
- `PUT /classifiers/{classifier_id}` - Update classifier
- `DELETE /classifiers/{classifier_id}` - Delete classifier

### Schemas (Request/Response Models)

#### `app/schemas/disease.py`

- `DiseaseCreate` - Create disease request
- `DiseaseUpdate` - Update disease request (all optional)
- `DiseaseResponse` - Disease response with timestamps

#### `app/schemas/classifier.py`

- `ClassifierCreate` - Create classifier request
- `ClassifierUpdate` - Update classifier request (all optional)
- `ClassifierResponse` - Classifier response with timestamps

## Storage Structure

```
backend/ml_models/
├── <disease-uuid>/              # Auto-generated on disease creation
│   ├── <classifier-uuid>/       # Auto-generated on classifier creation
│   │   ├── features.pkl        # Feature names
│   │   ├── scaler.pkl          # Data scaler
│   │   ├── imputer.pkl         # Missing data imputer
│   │   ├── model.pkl           # Trained ML model
│   │   └── class.pkl           # Class name mapping
│   └── <classifier-uuid-2>/
└── <disease-uuid-2>/
```

## Key Features

### Auto-Generated UUIDs

- **Disease**: `storage_path` auto-generated on creation
- **Classifier**: `model_path` auto-generated on creation
- Both use UUID4 for uniqueness

### Storage Integration

- Disease creation → creates storage directory
- Classifier creation → creates nested classifier directory
- Deletion → removes associated directories

### Validation

- **Modality**: Must be one of `[MRI, CT, X-Ray, Tabular]`
- **Available Modalities**: Validated against VALID_MODALITIES set
- **Disease Deletion**: Prevents deletion if classifiers exist

### Required Pickle Files

Every classifier must have 5 files:

1. `features.pkl` - List of feature names
2. `scaler.pkl` - StandardScaler or similar
3. `imputer.pkl` - SimpleImputer with mean strategy
4. `model.pkl` - Trained sklearn/XGBoost model
5. `class.pkl` - Dict mapping class indices to names

## Usage Examples

### Create Disease

```python
POST /diseases
{
  "name": "Hepatitis C",
  "description": "Viral liver disease",
  "category": "Infectious Disease",
  "severity": "High",
  "symptoms": ["Fatigue", "Jaundice"],
  "available_modalities": ["Tabular"]
}
# Response includes auto-generated storage_path
```

### Create Classifier

```python
POST /classifiers
{
  "name": "HCV Logistic Regression",
  "disease_id": 1,
  "modality": "Tabular",
  "model_type": "LogisticRegression",
  "required_features": ["ALB", "ALP", "ALT", ...],
  "accuracy": 0.92
}
# Response includes auto-generated model_path
```

### Upload Model Files

```python
POST /classifiers/1/upload-model-files
Content-Type: multipart/form-data
- features_file: features.pkl
- scaler_file: scaler.pkl
- imputer_file: imputer.pkl
- model_file: model.pkl
- class_file: class.pkl
```

## Benefits

1. **Separation of Concerns**: Each router handles one responsibility
2. **Testability**: Services can be unit tested independently
3. **Maintainability**: Smaller, focused files easier to understand
4. **Reusability**: Services can be used by multiple routers
5. **Logging**: Consistent logging via decorators
6. **Performance Tracking**: All endpoints tracked automatically

## Migration Notes

### Updated Files

- `app/main.py` - Added disease and classifier router imports/includes
- `app/models/disease.py` - Added storage_path field
- `app/models/classifier.py` - Added required_features and model_path
- `app/core/config.py` - Added ml_models_path setting

### New Files

- `app/services/disease_service.py`
- `app/services/classifier_service.py`
- `app/services/storage_service.py`
- `app/routers/disease.py`
- `app/routers/classifier.py`
- `app/schemas/disease.py`
- `app/schemas/classifier.py`

### Next Steps

- Update `app/routers/diagnosis.py` to keep only prediction endpoints
- Add comprehensive tests for services and routers
- Add API documentation with examples
- Consider adding background tasks for file processing
