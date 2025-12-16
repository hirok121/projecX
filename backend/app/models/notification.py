"""
Notification Model - Stores user notifications
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    ForeignKey,
    DateTime,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.connection import Base
import enum


class NotificationType(str, enum.Enum):
    DIAGNOSIS_COMPLETED = "diagnosis_completed"
    DIAGNOSIS_FAILED = "diagnosis_failed"
    SYSTEM = "system"
    INFO = "info"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # User info
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Notification details
    type = Column(
        SQLEnum(NotificationType),
        default=NotificationType.INFO,
        nullable=False,
        index=True,
    )
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)  # Link to diagnosis result or other page

    # Related entities
    diagnosis_id = Column(
        Integer, ForeignKey("diagnoses.id"), nullable=True, index=True
    )

    # Status
    is_read = Column(Boolean, default=False, nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="notifications", lazy="select")
    diagnosis = relationship("Diagnosis", backref="notifications", lazy="select")

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type.value if self.type else None,
            "title": self.title,
            "message": self.message,
            "link": self.link,
            "diagnosis_id": self.diagnosis_id,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None,
        }
