from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import time

from app.db.connection import get_db
from app.services.ai_service import ai_service
from app.services.chat_service import ChatService
from app.services.file_processor import FileProcessor
from app.routers.auth import get_current_user
from app.schemas.user import User
from app.schemas.chat import ChatCreate, ChatResponse, ChatUpdate, ChatStats
from app.schemas.message import MessageCreate, MessageResponse, FileUploadResponse, StructuredAnalysisRequest, StructuredAnalysisResponse
from app.core.logging import track_endpoint_performance, log_endpoint_activity
from app.utils.helpers import get_client_ip
from app.utils.ai_helpers import validate_chat_access, handle_ai_api_error, validate_message_content, get_default_analysis_schemas

router = APIRouter(prefix="/aiassistant", tags=["ai-assistant"])

# Create a new chat
@router.post("/chats")
@track_endpoint_performance("aiassistant", "create_chat")
async def create_chat(
    chat_data: ChatCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new AI chat session"""
    try:
        chat = ChatService.create_chat(db, current_user.id, chat_data.title, chat_data.description or "")
        
        log_endpoint_activity("aiassistant", "create_chat", current_user.email, get_client_ip(request), True, {"chat_id": str(chat.id)})
        
        # Return as dict to avoid Pydantic validation issues
        return {
            "id": chat.id,
            "title": chat.title,
            "description": chat.description,
            "is_pinned": chat.is_pinned,
            "is_archived": chat.is_archived,
            "model_name": chat.model_name,
            "temperature": chat.temperature,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at,
            "last_message_at": chat.last_message_at,
            "message_count": chat.message_count
        }
        
    except Exception as e:
        log_endpoint_activity("aiassistant", "create_chat_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create chat: {str(e)}"
        )

# Get user chats
@router.get("/chats")
@track_endpoint_performance("aiassistant", "get_chats")
async def get_chats(
    request: Request,
    skip: int = 0,
    limit: int = 20,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's chat sessions"""
    try:
        chats = ChatService.get_user_chats(db, current_user.id, skip, limit, include_archived)
        
        log_endpoint_activity("aiassistant", "get_chats", current_user.email, get_client_ip(request), True, 
                            {"count": len(chats), "skip": skip, "limit": limit})
        
        return [
            {
                "id": chat.id,
                "title": chat.title,
                "description": chat.description,
                "is_pinned": chat.is_pinned,
                "is_archived": chat.is_archived,
                "model_name": chat.model_name,
                "temperature": chat.temperature,
                "created_at": chat.created_at,
                "updated_at": chat.updated_at,
                "last_message_at": chat.last_message_at,
                "message_count": chat.message_count
            }
            for chat in chats
        ]
        
    except Exception as e:
        log_endpoint_activity("aiassistant", "get_chats_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chats: {str(e)}"
        )

# Get chat with messages
@router.get("/chats/{chat_id}/")
@track_endpoint_performance("aiassistant", "get_chat_detail")
async def get_chat_detail(
    chat_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific chat with its messages"""
    try:
        # Validate access
        if not validate_chat_access(current_user.id, chat_id, db):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        chat_with_messages = ChatService.get_chat_with_messages(db, chat_id, current_user.id)
        if not chat_with_messages:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        log_endpoint_activity("aiassistant", "get_chat_detail", current_user.email, get_client_ip(request), True,
                            {"chat_id": chat_id, "message_count": len(chat_with_messages.messages)})
        
        # Convert messages to dict format
        messages = []
        for msg in chat_with_messages.messages:
            messages.append({
                "id": msg.id,
                "chat_id": msg.chat_id,
                "content": msg.content,
                "role": msg.role,
                "message_type": msg.message_type,
                "processing_status": msg.processing_status,
                "file_metadata": msg.file_metadata,
                "model_used": msg.model_used,
                "tokens_used": msg.tokens_used,
                "processing_time": msg.processing_time,
                "confidence_score": msg.confidence_score,
                "is_edited": msg.is_edited,
                "is_deleted": msg.is_deleted,
                "error_message": msg.error_message,
                "created_at": msg.created_at,
                "updated_at": msg.updated_at,
                "processed_at": msg.processed_at
            })
        
        return {
            "id": chat_with_messages.id,
            "title": chat_with_messages.title,
            "description": chat_with_messages.description,
            "is_pinned": chat_with_messages.is_pinned,
            "is_archived": chat_with_messages.is_archived,
            "model_name": chat_with_messages.model_name,
            "temperature": chat_with_messages.temperature,
            "created_at": chat_with_messages.created_at,
            "updated_at": chat_with_messages.updated_at,
            "last_message_at": chat_with_messages.last_message_at,
            "message_count": chat_with_messages.message_count,
            "messages": messages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_endpoint_activity("aiassistant", "get_chat_detail_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chat detail: {str(e)}"
        )

# Send message to AI
@router.post("/chats/{chat_id}/messages")
@track_endpoint_performance("aiassistant", "send_message")
async def send_message(
    chat_id: int,
    message_data: MessageCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to AI and get response"""
    try:
        # Validate access - this will raise HTTPException if unauthorized
        validate_chat_access(current_user.id, chat_id, db)
        
        # Validate message content
        if not validate_message_content(message_data.content):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid message content"
            )
        
        # Add user message
        user_message = ChatService.add_message(
            db, chat_id, message_data.content, "user", message_data.message_type
        )
        
        # Get conversation context
        chat = ChatService.get_chat_with_messages(db, chat_id, current_user.id)
        if chat and chat.messages:
            context_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in chat.messages[:-1]  # Exclude the message we just added
            ]
        else:
            context_messages = []
        
        # Get AI response
        ai_result = await ai_service.process_text_message(
            message_data.content, context_messages
        )
        
        # Add AI response message
        assistant_message = ChatService.add_message(
            db, chat_id, ai_result.get("content", ""), "assistant", "text",
            model_used=ai_result.get("model_used", "unknown"),
            processing_time=ai_result.get("processing_time", 0.0),
            tokens_used=ai_result.get("tokens_used", 0)
        )
        
        log_endpoint_activity("aiassistant", "send_message", current_user.email, get_client_ip(request), True,
                            {"chat_id": chat_id, "message_length": len(message_data.content)})
        
        return {
            "user_message": {
                "id": user_message.id,
                "chat_id": user_message.chat_id,
                "content": user_message.content,
                "role": user_message.role,
                "message_type": user_message.message_type,
                "processing_status": user_message.processing_status,
                "created_at": user_message.created_at
            },
            "assistant_message": {
                "id": assistant_message.id,
                "chat_id": assistant_message.chat_id,
                "content": assistant_message.content,
                "role": assistant_message.role,
                "message_type": assistant_message.message_type,
                "processing_status": assistant_message.processing_status,
                "model_used": assistant_message.model_used,
                "processing_time": assistant_message.processing_time,
                "tokens_used": assistant_message.tokens_used,
                "created_at": assistant_message.created_at
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_endpoint_activity("aiassistant", "send_message_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

# Upload file and process with AI
@router.post("/chats/{chat_id}/files")
@track_endpoint_performance("aiassistant", "upload_file")
async def upload_file(
    chat_id: int,
    request: Request,
    file: UploadFile = File(...),
    prompt: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and process a file with AI"""
    try:
        # Validate access
        validate_chat_access(current_user.id, chat_id, db)
        
        # Read file content
        file_content = await file.read()
        content_type = file.content_type or "application/octet-stream"
        filename = file.filename or "unknown"
        

        # Create user message with file info
        if prompt.strip():
            user_content = f"[File uploaded: {file.filename}]\n{prompt}"
        else:
            user_content = f"[File uploaded: {file.filename}]"
        
        # Get AI response for file content (includes file processing internally)
        ai_result = await ai_service.process_file_message(file_content, content_type, filename, prompt)

        user_message = ChatService.add_message(
            db, chat_id, user_content, "user", "file",
            file_metadata=ai_result.get("file_metadata", {})
        )
        

        # Add AI response
        assistant_message = ChatService.add_message(
            db, chat_id, ai_result.get("content", ""), "assistant", "text",
            model_used=ai_result.get("model_used", "unknown"),
            processing_time=ai_result.get("processing_time", 0.0),
            tokens_used=ai_result.get("tokens_used", 0)
        )
        
        log_endpoint_activity("aiassistant", "upload_file", current_user.email, get_client_ip(request), True,
                            {"chat_id": chat_id, "file_type": content_type, "file_size": len(file_content)})
        
        return {
            "user_message": {
                "id": user_message.id,
                "content": user_message.content,
                "role": user_message.role,
                "file_metadata": user_message.file_metadata,
                "created_at": user_message.created_at
            },
            "assistant_message": {
                "id": assistant_message.id,
                "content": assistant_message.content,
                "role": assistant_message.role,
                "model_used": assistant_message.model_used,
                "processing_time": assistant_message.processing_time,
                "tokens_used": assistant_message.tokens_used,
                "created_at": assistant_message.created_at
            },
            "file_info": ai_result.get("file_metadata", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_endpoint_activity("aiassistant", "upload_file_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

# Update chat
@router.put("/chats/{chat_id}/")
@track_endpoint_performance("aiassistant", "update_chat")
async def update_chat(
    chat_id: int,
    chat_update: ChatUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a chat"""
    try:
        # Validate access
        validate_chat_access(current_user.id, chat_id, db)
        
        # Update individual fields using available methods
        updated_chat = None
        if chat_update.title:
            updated_chat = ChatService.update_chat_title(db, chat_id, current_user.id, chat_update.title)
        
        if chat_update.is_pinned is not None:
            ChatService.pin_chat(db, chat_id, current_user.id, chat_update.is_pinned)
        
        if chat_update.is_archived is not None:
            ChatService.archive_chat(db, chat_id, current_user.id, chat_update.is_archived)
        
        # Get updated chat for response
        updated_chat = ChatService.get_chat_with_messages(db, chat_id, current_user.id)
        if not updated_chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        log_endpoint_activity("aiassistant", "update_chat", current_user.email, get_client_ip(request), True,
                            {"chat_id": chat_id})
        
        return {
            "id": updated_chat.id,
            "title": updated_chat.title,
            "description": updated_chat.description,
            "is_pinned": updated_chat.is_pinned,
            "is_archived": updated_chat.is_archived,
            "updated_at": updated_chat.updated_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_endpoint_activity("aiassistant", "update_chat_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update chat: {str(e)}"
        )

# Delete chat
@router.delete("/chats/{chat_id}/")
@track_endpoint_performance("aiassistant", "delete_chat")
async def delete_chat(
    chat_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a chat"""
    try:
        # Validate access
        validate_chat_access(current_user.id, chat_id, db)
        
        ChatService.delete_chat(db, chat_id, current_user.id)
        
        log_endpoint_activity("aiassistant", "delete_chat", current_user.email, get_client_ip(request), True,
                            {"chat_id": chat_id})
        
        return {"message": "Chat deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        log_endpoint_activity("aiassistant", "delete_chat_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete chat: {str(e)}"
        )

# Get chat statistics
@router.get("/stats")
@track_endpoint_performance("aiassistant", "get_stats")
async def get_stats(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat statistics for the user"""
    try:
        stats = ChatService.get_chat_stats(db, current_user.id)
        
        log_endpoint_activity("aiassistant", "get_stats", current_user.email, get_client_ip(request), True)
        
        return {
            "total_chats": stats["total_chats"],
            "active_chats": stats["active_chats"], 
            "archived_chats": stats["archived_chats"],
            "pinned_chats": stats["pinned_chats"],
            "total_messages": stats["total_messages"]
        }
        
    except Exception as e:
        log_endpoint_activity("aiassistant", "get_stats_error", current_user.email, get_client_ip(request), False, {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )

