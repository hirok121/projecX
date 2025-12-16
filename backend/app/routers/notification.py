"""
Notification Router - Endpoints for user notifications
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.connection import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse
from app.core.logging import log_endpoint_activity, track_endpoint_performance

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=list[NotificationResponse])
@track_endpoint_performance("notification", "list")
def get_my_notifications(
    is_read: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get notifications for the current user."""
    log_endpoint_activity(
        "notification",
        "list_notifications",
        extra={"user_id": current_user.id, "is_read": is_read},
    )

    return NotificationService.get_user_notifications(
        db=db, user_id=current_user.id, is_read=is_read, skip=skip, limit=limit
    )


@router.get("/unread-count")
@track_endpoint_performance("notification", "unread_count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get count of unread notifications."""
    count = NotificationService.get_unread_count(db=db, user_id=current_user.id)
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
@track_endpoint_performance("notification", "mark_read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    log_endpoint_activity(
        "notification",
        "mark_read",
        extra={"notification_id": notification_id, "user_id": current_user.id},
    )

    try:
        return NotificationService.mark_as_read(
            db=db, notification_id=notification_id, user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/mark-all-read")
@track_endpoint_performance("notification", "mark_all_read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for current user."""
    count = NotificationService.mark_all_as_read(db=db, user_id=current_user.id)
    return {"message": f"Marked {count} notifications as read"}


@router.delete("/{notification_id}")
@track_endpoint_performance("notification", "delete")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a notification."""
    log_endpoint_activity(
        "notification",
        "delete_notification",
        extra={"notification_id": notification_id, "user_id": current_user.id},
    )

    try:
        NotificationService.delete_notification(
            db=db, notification_id=notification_id, user_id=current_user.id
        )
        return {"message": "Notification deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
