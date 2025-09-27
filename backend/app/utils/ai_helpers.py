from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.chat import Chat
from app.models.user import User
from app.core.logging import app_logger
from typing import Optional
import re


def validate_chat_access(user_id: int, chat_id: int, db: Session) -> Chat:
    """Validate that user has access to the specified chat."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == user_id
    ).first()
    
    if not chat:
        app_logger.warning(f"Unauthorized chat access attempt: user {user_id}, chat {chat_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or access denied"
        )
    
    return chat


def sanitize_ai_response(response: str) -> str:
    """Clean and validate AI responses."""
    if not response:
        return ""
    
    # Remove excessive whitespace
    response = re.sub(r'\n\s*\n\s*\n', '\n\n', response)
    response = response.strip()
    
    # Basic content filtering (you can expand this)
    # Remove any potentially harmful content patterns
    # This is a basic example - implement more sophisticated filtering as needed
    
    return response


def handle_ai_api_error(error: Exception, context: str = "") -> HTTPException:
    """Convert AI API errors to appropriate HTTP responses."""
    error_msg = str(error).lower()
    
    if "rate limit" in error_msg or "quota" in error_msg:
        app_logger.warning(f"AI API rate limit exceeded: {context}")
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI service is currently busy. Please try again in a moment."
        )
    elif "api key" in error_msg or "unauthorized" in error_msg:
        app_logger.error(f"AI API authentication error: {context}")
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable. Please try again later."
        )
    elif "timeout" in error_msg:
        app_logger.warning(f"AI API timeout: {context}")
        return HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="The AI request took too long to process. Please try again."
        )
    else:
        app_logger.error(f"Unexpected AI API error: {error} - {context}")
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service encountered an error. Please try again."
        )


def validate_message_content(content: str) -> bool:
    """Validate message content for basic safety."""
    if not content or not content.strip():
        return False
    
    # Check for reasonable length
    if len(content) > 10000:  # 10k character limit
        return False
    
    # Add more validation rules as needed
    return True


def get_default_analysis_schemas() -> dict:
    """Get predefined schemas for structured analysis."""
    return {
        "general": {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "key_points": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "recommendations": {
                    "type": "array", 
                    "items": {"type": "string"}
                },
                "confidence": {"type": "number"}
            }
        },
        "document_summary": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "summary": {"type": "string"},
                "main_topics": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "key_findings": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "word_count": {"type": "number"},
                "complexity_level": {"type": "string"}
            }
        },
        "image_analysis": {
            "type": "object",
            "properties": {
                "description": {"type": "string"},
                "objects_detected": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "colors": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "mood": {"type": "string"},
                "technical_quality": {"type": "string"}
            }
        },
        "question_answer": {
            "type": "object",
            "properties": {
                "answer": {"type": "string"},
                "confidence": {"type": "number"},
                "sources_needed": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "follow_up_questions": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            }
        }
    }


def format_chat_title(title: str) -> str:
    """Format and validate chat title."""
    if not title:
        return "New Chat"
    
    # Clean the title
    title = title.strip()
    title = re.sub(r'[^\w\s\-\.,!?]', '', title)  # Remove special chars except basic punctuation
    
    # Limit length
    if len(title) > 100:
        title = title[:97] + "..."
    
    return title if title else "New Chat"


def estimate_tokens(text: str) -> int:
    """Rough estimation of token count for text."""
    # Simple approximation: ~4 characters per token
    return len(text) // 4


def should_regenerate_title(current_title: str, message_count: int) -> bool:
    """Determine if chat title should be regenerated based on activity."""
    # Regenerate if it's still the default title and we have enough messages
    if current_title == "New Chat" and message_count >= 3:
        return True
    
    # Could add more sophisticated logic here
    return False