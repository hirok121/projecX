"""
Notification Pydantic Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    """Schema for notification response."""

    id: int
    user_id: int
    type: str
    title: str
    message: str
    link: Optional[str] = None
    diagnosis_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    """Schema for marking notification as read."""

    notification_id: int = Field(..., gt=0)
