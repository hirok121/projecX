# Frontend API Update - Disease & Classifier Routes

## Overview

Updated frontend to match the new backend API structure where disease and classifier endpoints have been separated into their own routers.

## Changes Made

### 1. New API Service Files

#### `frontend/src/services/diseaseAPI.js`

New dedicated API service for disease management:

- **Public Endpoints:**

  - `getDiseases(params)` - Get list with filters (category, is_active, skip, limit)
  - `getDisease(diseaseId)` - Get specific disease

- **Admin Endpoints:**
  - `createDisease(diseaseData)` - Create new disease
  - `updateDisease(diseaseId, diseaseData)` - Update disease
  - `deleteDisease(diseaseId)` - Delete disease

#### `frontend/src/services/classifierAPI.js`

New dedicated API service for classifier management:

- **Public Endpoints:**

  - `getClassifiers(params)` - Get list with filters (disease_id, modality, is_active)
  - `getClassifier(classifierId)` - Get specific classifier
  - `getClassifiersByDisease(diseaseId, isActive)` - Get classifiers for a disease

- **Admin Endpoints:**
  - `createClassifier(classifierData)` - Create new classifier
  - `uploadModelFiles(classifierId, files)` - Upload 5 model .pkl files
  - `updateClassifier(classifierId, classifierData)` - Update classifier
  - `deleteClassifier(classifierId)` - Delete classifier

### 2. Updated `diagnosisAPI.js`

- **Removed** all backward-compatible wrapper methods for diseases and classifiers
- **Removed** imports for `diseaseAPI` and `classifierAPI`
- Now contains **only diagnosis/prediction-specific endpoints**:
  - Legacy HCV endpoints (createDiagnosis, getUserDiagnoses, etc.)
  - Statistics & Analytics (getQuickStats, getUserAnalytics)
  - Export functions (exportCSV, exportExcel)
  - Search functions (searchDiagnoses, adminSearchDiagnoses)
- **Components must now import and use `diseaseAPI` and `classifierAPI` directly**

### 3. Updated Components

#### `AdminDiseaseUpload.jsx`

- **Imports:** Changed from `diagnosisAPI` to direct imports:
  ```javascript
  import { diseaseAPI } from "../../services/diseaseAPI";
  import { classifierAPI } from "../../services/classifierAPI";
  ```
- **API Calls:** Updated all methods to use new services directly:
  - `diseaseAPI.getDiseases()`, `diseaseAPI.createDisease()`, etc.
  - `classifierAPI.getClassifiers()`, `classifierAPI.createClassifier()`, etc.

#### `DiagnosisMain.jsx`

- **Imports:** Changed from `diagnosisAPI` to `diseaseAPI`:
  ```javascript
  import { diseaseAPI } from "../../services/diseaseAPI";
  ```
- **API Calls:** Updated `fetchDiseases()` to use `diseaseAPI.getDiseases()`

#### State Changes

- **Old:** Single `modelFile` state
- **New:** `modelFiles` object with 5 properties:
  ```javascript
  {
    features_file: null,
    scaler_file: null,
    imputer_file: null,
    model_file: null,
    class_file: null
  }
  ```

#### Classifier Form Changes

- Added `required_features` array field
- Changed file upload from single file to 5 separate files
- Updated UI to show 5 individual upload buttons with checkmarks

#### Handler Updates

- **`handleClassifierSubmit()`:**

  - Now uses 2-step process:
    1. Create/update classifier with metadata
    2. Upload model files separately (if provided)
  - Validates all 5 files are present when uploading
  - Model files are optional when editing (keeps existing if not provided)

- **`handleDeleteDisease()`:**

  - Removed `hardDelete` parameter
  - Now performs permanent deletion only

- **`handleDeleteClassifier()`:**
  - Removed `hardDelete` parameter
  - Now performs permanent deletion only

#### UI Changes

- Replaced single file upload with 5 separate file inputs
- Each file shows checkmark (✓) when selected
- Display selected filename for each file
- Updated helper text for editing mode
- Removed file requirement from submit button validation

## Backend API Structure

### Disease Routes (`/diseases`)

```
POST   /diseases/                  - Create disease
GET    /diseases/                  - List diseases (filters: category, is_active)
GET    /diseases/{id}              - Get disease
PUT    /diseases/{id}              - Update disease
DELETE /diseases/{id}              - Delete disease
```

### Classifier Routes (`/classifiers`)

```
POST   /classifiers/                           - Create classifier
POST   /classifiers/{id}/upload-model-files   - Upload 5 .pkl files
GET    /classifiers/                           - List classifiers (filters: disease_id, modality)
GET    /classifiers/{id}                       - Get classifier
GET    /classifiers/by-disease/{disease_id}   - Get classifiers for disease
PUT    /classifiers/{id}                       - Update classifier
DELETE /classifiers/{id}                       - Delete classifier
```

## Model Files Structure

Each classifier requires 5 pickle files:

1. **features.pkl** - Feature names used by the model
2. **scaler.pkl** - Data normalization scaler
3. **imputer.pkl** - Missing value imputer
4. **model.pkl** - Trained ML model
5. **class.pkl** - Class label mapping

All files must be uploaded together when adding model files to a classifier.

## Migration Notes

### Breaking Changes

1. ~~`/admin/diagnosis/diseases`~~ → `/diseases/`
2. ~~`/admin/diagnosis/classifiers`~~ → `/classifiers/`
3. ~~Single model file upload~~ → 5 separate .pkl files
4. ~~Soft delete with `hard_delete` param~~ → Direct deletion only

### Breaking Changes

1. ~~`diagnosisAPI.getDiseases()`~~ → Import and use `diseaseAPI.getDiseases()`
2. ~~`diagnosisAPI.getDisease(id)`~~ → Import and use `diseaseAPI.getDisease(id)`
3. ~~`diagnosisAPI.getDiseaseClassifiers(id)`~~ → Import and use `classifierAPI.getClassifiersByDisease(id)`
4. ~~`diagnosisAPI.adminCreateDisease()`~~ → Import and use `diseaseAPI.createDisease()`
5. ~~`diagnosisAPI.adminCreateClassifier()`~~ → Import and use `classifierAPI.createClassifier()`
6. ~~`diagnosisAPI.adminUploadModelFiles()`~~ → Import and use `classifierAPI.uploadModelFiles()`
7. All other disease/classifier wrapper methods removed from `diagnosisAPI`
8. ~~`/admin/diagnosis/diseases`~~ → `/diseases/`
9. ~~`/admin/diagnosis/classifiers`~~ → `/classifiers/`
10. ~~Single model file upload~~ → 5 separate .pkl files
11. ~~Soft delete with `hard_delete` param~~ → Direct deletion only

### What Remains in diagnosisAPI

`diagnosisAPI` now contains **only** diagnosis/prediction-specific functionality:

- HCV legacy endpoints
- Statistics and analytics
- Export functions
- Search functions

**For disease and classifier management, components MUST import and use `diseaseAPI` and `classifierAPI` directly.**

## Testing Checklist

### Disease Management

- [ ] Create new disease
- [ ] List diseases with category filter
- [ ] View disease details
- [ ] Update disease information
- [ ] Delete disease

### Classifier Management

- [ ] Create classifier without model files
- [ ] Upload 5 model files to classifier
- [ ] Create classifier and upload files together
- [ ] List classifiers filtered by disease
- [ ] Update classifier metadata
- [ ] Update classifier model files
- [ ] Delete classifier

### Integration

- [ ] Disease deletion removes associated classifiers
- [ ] Classifier requires valid disease_id
- [ ] Model files are stored in correct directory structure
- [ ] File upload validation works (all 5 files required)

## File Structure

```
backend/ml_models/
└── <disease-uuid>/
    └── <classifier-uuid>/
        ├── features.pkl
        ├── scaler.pkl
        ├── imputer.pkl
        ├── model.pkl
        └── class.pkl
```

## Next Steps

1. Test the updated admin interface
2. Verify model file uploads work correctly
3. Check that predictions work with new file structure
4. Update any other frontend components using old API endpoints
