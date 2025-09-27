from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.connection import Base


class Message(Base):
    """Message model for individual chat messages."""
    __tablename__ = "messages"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to chat
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False, index=True)
    
    # Message content
    content = Column(Text, nullable=False)
    role = Column(String(20), nullable=False, index=True)  # 'user' or 'assistant'
    
    # Message type and processing info
    message_type = Column(String(20), default="text", index=True)  # 'text', 'image', 'pdf', 'file'
    processing_status = Column(String(20), default="completed")  # 'processing', 'completed', 'error'
    
    # File-related metadata (for file uploads)
    file_metadata = Column(JSON, nullable=True)  # Store file info, processing details, etc.
    
    # AI response metadata
    model_used = Column(String(100), nullable=True)  # Track which model generated response
    tokens_used = Column(Integer, nullable=True)     # Token usage tracking
    processing_time = Column(Float, nullable=True)   # Response time in seconds
    confidence_score = Column(Float, nullable=True)  # AI confidence if available
    
    # Message status
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    is_internal = Column(Boolean, default=False)  # Hide from user interface but keep for AI context
    error_message = Column(Text, nullable=True)  # Store error details if processing failed
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)  # When AI processing completed
    
    # Relationships
    chat = relationship("Chat", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, chat_id={self.chat_id}, role='{self.role}', type='{self.message_type}')>"
    
    @property
    def is_user_message(self):
        """Check if message is from user."""
        return self.role == "user"
    
    @property
    def is_assistant_message(self):
        """Check if message is from assistant."""
        return self.role == "assistant"
    
    @property
    def has_file_attachment(self):
        """Check if message has file attachment."""
        return self.message_type in ["image", "pdf", "file"] and getattr(self, 'file_metadata', None) is not None
    
    @property
    def file_info(self):
        """Get file information if available."""
        if self.has_file_attachment and getattr(self, 'file_metadata', None):
            return {
                "filename": self.file_metadata.get("filename"),
                "content_type": self.file_metadata.get("content_type"),
                "size": self.file_metadata.get("size")
            }
        return None