# Asynchronous Diagnosis System

## Overview

This system provides asynchronous diagnosis processing with email and in-app notifications. When a user submits a diagnosis request, they receive immediate acknowledgement while processing happens in the background.

## Architecture

### Database Tables

#### 1. Diagnosis Table (`diagnoses`)

Stores diagnosis requests and results.

**Fields:**

- `id` - Primary key
- `user_id` - Foreign key to users table
- `disease_id` - Foreign key to diseases table
- `classifier_id` - Foreign key to classifiers table
- `modality` - Type of data (Tabular, MRI, CT, X-Ray)
- `input_file` - Path to uploaded image file (optional)
- `input_data` - JSON field for tabular feature values
- `prediction` - Prediction result (e.g., "Positive", "Stage 1")
- `confidence` - Confidence score (0.0 to 1.0)
- `probabilities` - JSON with class probabilities
- `status` - Enum: PENDING, PROCESSING, COMPLETED, FAILED
- `error_message` - Error details if failed
- `processing_time` - Time taken to process (seconds)
- `created_at` - When request was created
- `started_at` - When processing started
- `completed_at` - When processing finished

#### 2. Notification Table (`notifications`)

Stores user notifications for in-app display.

**Fields:**

- `id` - Primary key
- `user_id` - Foreign key to users table
- `type` - Enum: DIAGNOSIS_COMPLETED, DIAGNOSIS_FAILED, SYSTEM, INFO
- `title` - Notification title
- `message` - Notification message
- `link` - Optional link to related page (e.g., diagnosis result)
- `diagnosis_id` - Foreign key to diagnoses table (optional)
- `is_read` - Boolean, default False
- `created_at` - When notification was created
- `read_at` - When notification was marked as read

## Workflow

### 1. User Submits Diagnosis Request

```
POST /diagnosis
{
  "classifier_id": 1,
  "input_data": {
    "Age": 50,
    "ALB": 40.0,
    "ALP": 32.7,
    ...
  }
}
```

**Immediate Response (200 OK):**

```json
{
  "id": 123,
  "status": "pending",
  "message": "Your diagnosis request has been received and is being processed...",
  "result_link": "http://localhost:5173/diagnosis/123"
}
```

### 2. Background Processing

- Status changes: PENDING → PROCESSING → COMPLETED/FAILED
- Tabular data processed using `gentabengine.py`
- Results saved to database
- Timestamps recorded (started_at, completed_at)

### 3. Completion Notifications

#### A. Email Notification

Sent automatically when diagnosis completes (success or failure).

**Success Email:**

- Subject: "Your [Disease Name] Diagnosis is Ready"
- Contains prediction result and confidence
- Includes "View Full Results" button linking to result page

**Failure Email:**

- Subject: "Issue with Your [Disease Name] Diagnosis"
- Contains error message
- Suggests retry or contact support

#### B. In-App Notification

Created in `notifications` table.

**Success Notification:**

- Title: "[Disease Name] Diagnosis Complete"
- Message: "Your diagnosis result is ready: [Prediction] ([Confidence]% confidence)"
- Link: Result page URL
- Type: DIAGNOSIS_COMPLETED

**Failure Notification:**

- Title: "[Disease Name] Diagnosis Failed"
- Message: Error details
- Type: DIAGNOSIS_FAILED

### 4. User Views Results

```
GET /diagnosis/123
```

**Response:**

```json
{
  "id": 123,
  "user_id": 1,
  "disease_id": 5,
  "classifier_id": 10,
  "modality": "Tabular",
  "input_data": {...},
  "prediction": "Positive",
  "confidence": 0.92,
  "probabilities": {
    "Positive": 0.92,
    "Negative": 0.08
  },
  "status": "completed",
  "processing_time": 1.25,
  "created_at": "2025-12-17T10:30:00Z",
  "completed_at": "2025-12-17T10:30:02Z"
}
```

## API Endpoints

### Diagnosis Endpoints

| Method | Endpoint                       | Description                  |
| ------ | ------------------------------ | ---------------------------- |
| POST   | `/diagnosis`                   | Create diagnosis request     |
| GET    | `/diagnosis/{id}`              | Get diagnosis by ID          |
| GET    | `/diagnosis/user/my-diagnoses` | Get current user's diagnoses |

### Notification Endpoints

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/notifications`               | Get user's notifications      |
| GET    | `/notifications/unread-count`  | Get unread notification count |
| PATCH  | `/notifications/{id}/read`     | Mark notification as read     |
| PATCH  | `/notifications/mark-all-read` | Mark all as read              |
| DELETE | `/notifications/{id}`          | Delete notification           |

## Services

### DiagnosisService

- `create_diagnosis()` - Create diagnosis record
- `process_diagnosis()` - Background processing task
- `get_diagnosis()` - Retrieve diagnosis by ID
- `get_user_diagnoses()` - List user's diagnoses
- `_process_tabular()` - Process tabular data
- `_send_completion_notifications()` - Send success notifications
- `_send_failure_notifications()` - Send failure notifications

### NotificationService

- `create_notification()` - Create notification
- `get_user_notifications()` - Get user's notifications
- `get_unread_count()` - Count unread notifications
- `mark_as_read()` - Mark single notification as read
- `mark_all_as_read()` - Mark all as read
- `delete_notification()` - Delete notification

### EmailService

- `send_diagnosis_complete_email()` - Success email
- `send_diagnosis_failed_email()` - Failure email

## Frontend Integration

### 1. Submit Diagnosis

```javascript
const response = await axios.post("/diagnosis", {
  classifier_id: 1,
  input_data: featureValues,
});

// Show acknowledgement message
toast.success(response.data.message);

// Optionally redirect to results page (will show "processing" initially)
navigate(response.data.result_link);
```

### 2. Check Diagnosis Status

```javascript
const diagnosis = await axios.get(`/diagnosis/${diagnosisId}`);

if (diagnosis.status === "completed") {
  // Show results
} else if (diagnosis.status === "processing") {
  // Show loading indicator
} else if (diagnosis.status === "failed") {
  // Show error message
}
```

### 3. Display Notifications

```javascript
// Get notifications
const notifications = await axios.get("/notifications?is_read=false");

// Get unread count for badge
const { unread_count } = await axios.get("/notifications/unread-count");

// Mark as read when user clicks
await axios.patch(`/notifications/${notificationId}/read`);
```

### 4. Notification Bell Icon

```javascript
useEffect(() => {
  // Poll for new notifications every 30 seconds
  const interval = setInterval(async () => {
    const { unread_count } = await axios.get("/notifications/unread-count");
    setUnreadCount(unread_count);
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

## Current Limitations

1. **Modality Support**: Only Tabular data is currently supported. MRI, CT, and X-Ray will return 501 Not Implemented.

2. **Email Configuration**: Email service is implemented but requires SMTP configuration in settings. Currently logs email content without actually sending.

3. **Authentication**: Uses placeholder `get_current_user_id()` function. Should be replaced with actual JWT token validation.

4. **File Upload**: `input_file` field exists but file upload handling not fully implemented for image modalities.

5. **Real-time Updates**: Currently requires polling. Consider adding WebSocket support for real-time notification updates.

## Future Enhancements

1. **WebSocket Support**: Real-time diagnosis status updates and notifications
2. **Image Processing**: Implement MRI, CT, and X-Ray modality support
3. **Batch Diagnosis**: Support multiple diagnoses in one request
4. **Result Sharing**: Allow users to share results with doctors
5. **Export Results**: PDF export of diagnosis results
6. **Notification Preferences**: Let users customize notification settings
7. **Mobile Push Notifications**: Firebase Cloud Messaging integration

## Testing

### Create Diagnosis

```bash
curl -X POST http://localhost:8000/diagnosis \
  -H "Content-Type: application/json" \
  -d '{
    "classifier_id": 1,
    "input_data": {
      "Age": 50,
      "SEX": "0",
      "ALB": 40.0,
      "ALP": 32.7,
      "ALT": 30.0,
      "AST": 46.0,
      "BIL": 10.0,
      "CHE": 9.0,
      "CHOL": 5.5,
      "CREA": 80.0,
      "GGT": 50.0,
      "PROT": 70.0
    }
  }'
```

### Check Status

```bash
curl http://localhost:8000/diagnosis/123
```

### Get Notifications

```bash
curl http://localhost:8000/notifications?is_read=false
```

## Migration Notes

To add these tables to your database, run:

```sql
-- Create diagnoses table
CREATE TABLE diagnoses (
  -- See model definition for full schema
);

-- Create notifications table
CREATE TABLE notifications (
  -- See model definition for full schema
);
```

Or use Alembic migrations if configured.
