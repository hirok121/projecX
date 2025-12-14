# File Upload Feature Implementation

## Overview

Implemented the file upload functionality for the AI Assistant, allowing users to upload images and PDF files through the attachment button.

## Changes Made

### Frontend Changes

#### 1. ChatInput Component (`frontend/src/components/aiassistant/ChatInput.jsx`)

- Added file upload state management:

  - `selectedFile`: Stores the selected file
  - `filePreview`: Stores image preview URL
  - `uploadError`: Stores validation error messages
  - `fileInputRef`: Reference to hidden file input element

- **New Functions:**

  - `handleFileSelect`: Validates and previews selected files
    - Accepts: images (JPG, PNG) and PDFs
    - Max size: 10MB
    - Creates preview for images
  - `handleRemoveFile`: Clears selected file and preview
  - `handleAttachClick`: Triggers file input dialog
  - Updated `handleSend`: Handles both text and file uploads

- **UI Enhancements:**

  - Hidden file input element with proper file type restrictions
  - File preview card showing:
    - Image thumbnail or PDF icon
    - File name and size
    - Remove button
  - Error alert for validation failures
  - Attachment button highlights when file is selected
  - Send button enabled when file is selected (even without text)

- **New Props:**
  - `onFileUpload`: Callback function for file uploads (optional)

#### 2. AIAssistant Page (`frontend/src/pages/AIAssistant.jsx`)

- **New Function: `handleFileUpload`**

  - Auto-creates chat if none is selected
  - Calls `aiAssistantService.uploadImage()` with file and optional prompt
  - Adds user and assistant messages to chat
  - Updates chat list after successful upload
  - Handles errors gracefully

- Updated `ChatInput` component call to include `onFileUpload` prop

#### 3. API Service (`frontend/src/services/aiAssistantAPI.js`)

- Fixed endpoint path: `/aiassistant/chats/${chatId}/files` (removed trailing slash)
- Enhanced error handling to include `detail` field from FastAPI responses

### Backend (Already Implemented)

The backend endpoint `/aiassistant/chats/{chat_id}/files` already handles:

- File upload and validation
- Image processing (OCR, description generation)
- PDF text extraction
- AI-powered file analysis
- Storage of file metadata
- Internal messages (not shown to user but used for context)

## Usage

1. **Upload a File:**

   - Click the attachment button (📎) in the chat input
   - Select an image (JPG, PNG) or PDF file (max 10MB)
   - Optional: Add a prompt/question about the file
   - Click send

2. **File Processing:**

   - Backend extracts content from the file
   - AI generates a description and answers any questions
   - Description is stored as internal context for future messages

3. **Chat Continuation:**
   - Users can ask follow-up questions about the uploaded file
   - AI uses the stored file description to answer questions

## Supported File Types

- **Images:** JPEG, PNG, JPG
- **Documents:** PDF
- **Maximum Size:** 10MB

## Error Handling

- File type validation (client-side)
- File size validation (client-side)
- Upload errors (server-side)
- User-friendly error messages
- Automatic error dismissal

## Features

- Real-time file preview for images
- PDF icon for document files
- File size display
- Easy file removal before sending
- Loading states during upload
- Auto-chat creation if needed
- Works on mobile and desktop

## Technical Notes

- Files are processed server-side using Groq API vision models
- Internal messages (is_internal=true) store file context without displaying to users
- File metadata is preserved in the database
- FormData is used for multipart/form-data uploads
- Axios automatically sets Content-Type headers for FormData
