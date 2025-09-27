from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.connection import Base


class Chat(Base):
    """Chat session model for AI assistant conversations."""
    __tablename__ = "chats"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Chat metadata
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)  # Optional chat description
    
    # Chat settings
    is_archived = Column(Boolean, default=False)  # For organizing chats
    is_pinned = Column(Boolean, default=False)    # For important chats
    
    # AI model settings (optional, for different models per chat)
    model_name = Column(String(100), nullable=True, default="llama-3.3-70b-versatile")
    temperature = Column(String(10), nullable=True, default="0.7")  # Store as string for flexibility
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_message_at = Column(DateTime, nullable=True)  # Track last activity
    
    # Relationships
    user = relationship("User", back_populates="chats")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan", order_by="Message.created_at")
    
    def __repr__(self):
        return f"<Chat(id={self.id}, title='{self.title}', user_id={self.user_id})>"
    
    @property
    def message_count(self):
        """Get count of messages in this chat."""
        return len(self.messages) if self.messages else 0
    
    @property
    def last_user_message(self):
        """Get the last user message."""
        if self.messages:
            user_messages = [msg for msg in self.messages if msg.role == "user"]
            return user_messages[-1] if user_messages else None
        return None
    
    @property
    def last_assistant_message(self):
        """Get the last assistant message."""
        if self.messages:
            assistant_messages = [msg for msg in self.messages if msg.role == "assistant"]
            return assistant_messages[-1] if assistant_messages else None
        return None