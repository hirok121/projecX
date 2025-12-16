# Code Cleanup - Redundant Prediction System

## Summary

The **Diagnosis** system (with async processing, notifications, and email) has replaced the older **Prediction** system. The following files are now redundant and can be safely removed.

## Files to Remove

### 1. Old Prediction Service

**File**: `backend/app/services/prediction_service.py`

- **Status**: ❌ Redundant
- **Reason**: Replaced by `diagnosis_service.py` which has better async processing, notifications, and email integration
- **Action**: Can be deleted

### 2. Old Prediction Schemas

**File**: `backend/app/schemas/prediction.py`

- **Status**: ❌ Redundant
- **Reason**: Replaced by `diagnosis.py` schemas (DiagnosisCreate, DiagnosisResponse, DiagnosisAcknowledgement)
- **Action**: Can be deleted

### 3. Old Prediction Model

**File**: `backend/app/models/prediction.py`

- **Status**: ⚠️ May need migration
- **Reason**: `PredictionResult` table replaced by `Diagnosis` table
- **Action**:
  - If no existing data: Delete file
  - If has production data: Create migration to move data from `prediction_results` to `diagnoses` table, then delete

### 4. Backup Diagnosis Router

**File**: `backend/app/routers/diagnosis.backup.py`

- **Status**: ❌ Redundant
- **Reason**: Backup of old diagnosis router
- **Action**: Can be deleted

## Files Already Fixed

### ✅ Disease Model (`backend/app/models/disease.py`)

- Removed `predictions` relationship to `PredictionResult`
- Only keeps `diagnoses` relationship

### ✅ Classifier Model (`backend/app/models/classifier.py`)

- Removed `predictions` relationship to `PredictionResult`
- Only keeps `diagnoses` relationship

### ✅ Main Application (`backend/app/main.py`)

- Fixed duplicate `diagnosis` router import
- Removed incorrect import path
- Diagnosis router now properly registered once

## Current Active System

### Diagnosis System (Active ✅)

- **Router**: `backend/app/routers/diagnosis.py`
- **Service**: `backend/app/services/diagnosis_service.py`
- **Model**: `backend/app/models/diagnosis.py`
- **Schemas**: `backend/app/schemas/diagnosis.py`

**Features**:

- ✅ Async background processing with BackgroundTasks
- ✅ Email notifications on completion/failure
- ✅ In-app notifications via Notification table
- ✅ Status tracking: PENDING → PROCESSING → COMPLETED/FAILED
- ✅ Proper error handling and logging
- ✅ JWT authentication integrated

### Notification System (Active ✅)

- **Router**: `backend/app/routers/notification.py`
- **Service**: `backend/app/services/notification_service.py`
- **Model**: `backend/app/models/notification.py`
- **Schemas**: `backend/app/schemas/notification.py`

## Database Migration Needed

If you have existing `prediction_results` table with data:

```sql
-- 1. Copy data from prediction_results to diagnoses
INSERT INTO diagnoses (
    user_id, disease_id, classifier_id, modality,
    input_file, input_data, prediction, confidence,
    probabilities, status, error_message, processing_time,
    created_at, completed_at
)
SELECT
    user_id, disease_id, classifier_id, modality,
    input_file, input_data, prediction, confidence,
    probabilities, status, error_message, processing_time,
    created_at, completed_at
FROM prediction_results;

-- 2. Drop old table
DROP TABLE prediction_results;
```

If no existing data, just remove the files.

## Recommendation

**Safe cleanup steps**:

1. Check if `prediction_results` table exists and has data
2. If no data: Delete all 4 redundant files listed above
3. If has data: Run migration script first, then delete files
4. Test the diagnosis endpoints to ensure everything works

## Verification Commands

```bash
# Check if prediction_results table exists
sqlite3 your_database.db "SELECT COUNT(*) FROM prediction_results;"

# Test new diagnosis endpoint
curl -X POST http://localhost:8000/diagnosis \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"classifier_id": 1, "input_data": {...}}'

# Check notifications work
curl http://localhost:8000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```
