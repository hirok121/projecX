"""
Notification Service - Business logic for user notifications
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from app.models.notification import Notification, NotificationType

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing user notifications."""

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        link: Optional[str] = None,
        diagnosis_id: Optional[int] = None,
    ) -> Notification:
        """
        Create a new notification for a user.

        Args:
            db: Database session
            user_id: User ID
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            link: Optional link to related resource
            diagnosis_id: Optional diagnosis ID

        Returns:
            Notification: Created notification
        """
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            link=link,
            diagnosis_id=diagnosis_id,
        )

        try:
            db.add(notification)
            db.commit()
            db.refresh(notification)

            logger.info(f"✅ Created notification for user {user_id}: {title}")
            return notification

        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to create notification: {str(e)}")
            raise

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        is_read: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Notification]:
        """
        Get notifications for a user.

        Args:
            db: Database session
            user_id: User ID
            is_read: Optional filter by read status
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List[Notification]: List of notifications
        """
        query = db.query(Notification).filter(Notification.user_id == user_id)

        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)

        query = query.order_by(Notification.created_at.desc())
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """
        Get count of unread notifications for a user.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            int: Count of unread notifications
        """
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .count()
        )

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> Notification:
        """
        Mark a notification as read.

        Args:
            db: Database session
            notification_id: Notification ID
            user_id: User ID (for authorization)

        Returns:
            Notification: Updated notification

        Raises:
            ValueError: If notification not found or unauthorized
        """
        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )

        if not notification:
            raise ValueError("Notification not found or unauthorized")

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.commit()
            db.refresh(notification)

            logger.info(f"✅ Marked notification {notification_id} as read")

        return notification

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """
        Mark all notifications as read for a user.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            int: Number of notifications marked as read
        """
        count = (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .update(
                {"is_read": True, "read_at": datetime.utcnow()},
                synchronize_session=False,
            )
        )

        db.commit()
        logger.info(f"✅ Marked {count} notifications as read for user {user_id}")
        return count

    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """
        Delete a notification.

        Args:
            db: Database session
            notification_id: Notification ID
            user_id: User ID (for authorization)

        Returns:
            bool: True if deleted

        Raises:
            ValueError: If notification not found or unauthorized
        """
        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )

        if not notification:
            raise ValueError("Notification not found or unauthorized")

        db.delete(notification)
        db.commit()

        logger.info(f"✅ Deleted notification {notification_id}")
        return True
