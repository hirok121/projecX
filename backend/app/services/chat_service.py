from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional
from datetime import datetime

from app.models.chat import Chat
from app.models.message import Message
from app.core.logging import app_logger


class ChatService:
    """Service class for managing chat operations."""

    @staticmethod
    def create_chat(
        db: Session, user_id: int, title: str, description: str = None
    ) -> Chat:
        """Create a new chat session."""
        try:
            chat = Chat(
                user_id=user_id,
                title=title,
                description=description,
                last_message_at=datetime.utcnow(),
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)

            app_logger.info(f"Created new chat {chat.id} for user {user_id}")
            return chat

        except Exception as e:
            app_logger.error(f"Error creating chat: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def get_user_chats(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        include_archived: bool = False,
    ) -> List[Chat]:
        """Get user's chat list, ordered by last activity."""
        try:
            query = db.query(Chat).filter(Chat.user_id == user_id)

            if not include_archived:
                query = query.filter(Chat.is_archived == False)

            chats = (
                query.order_by(
                    desc(Chat.is_pinned),  # Pinned chats first
                    desc(Chat.last_message_at),  # Then by last activity
                )
                .offset(skip)
                .limit(limit)
                .all()
            )

            app_logger.info(f"Retrieved {len(chats)} chats for user {user_id}")
            return chats

        except Exception as e:
            app_logger.error(f"Error retrieving chats for user {user_id}: {str(e)}")
            raise

    @staticmethod
    def get_chat_with_messages(
        db: Session, chat_id: int, user_id: int, message_limit: int = 100
    ) -> Optional[Chat]:
        """Get chat with messages, ensuring user owns the chat."""
        try:
            chat = (
                db.query(Chat)
                .filter(and_(Chat.id == chat_id, Chat.user_id == user_id))
                .first()
            )

            if not chat:
                app_logger.warning(f"Chat {chat_id} not found for user {user_id}")
                return None

            # Load messages if needed (they should be loaded via relationship)
            if message_limit and message_limit < len(chat.messages):
                # Get the most recent messages
                recent_messages = (
                    db.query(Message)
                    .filter(Message.chat_id == chat_id)
                    .order_by(desc(Message.created_at))
                    .limit(message_limit)
                    .all()
                )
                # Reverse to get chronological order
                chat.messages = list(reversed(recent_messages))

            app_logger.info(
                f"Retrieved chat {chat_id} with {len(chat.messages)} messages"
            )
            return chat

        except Exception as e:
            app_logger.error(f"Error retrieving chat {chat_id}: {str(e)}")
            raise

    @staticmethod
    def add_message(
        db: Session,
        chat_id: int,
        content: str,
        role: str,
        message_type: str = "text",
        file_metadata: dict = None,
        model_used: str = None,
        tokens_used: int = None,
        processing_time: float = None,
        is_internal: bool = False,
    ) -> Message:
        """Add a message to a chat."""
        try:
            message = Message(
                chat_id=chat_id,
                content=content,
                role=role,
                message_type=message_type,
                file_metadata=file_metadata,
                model_used=model_used,
                tokens_used=tokens_used,
                processing_time=processing_time,
                is_internal=is_internal,
                processed_at=datetime.utcnow() if role == "assistant" else None,
            )

            db.add(message)

            # Update chat's last_message_at
            chat = db.query(Chat).filter(Chat.id == chat_id).first()
            if chat:
                chat.last_message_at = datetime.utcnow()
                chat.updated_at = datetime.utcnow()

            db.commit()
            db.refresh(message)

            app_logger.info(f"Added {role} message to chat {chat_id}")
            return message

        except Exception as e:
            app_logger.error(f"Error adding message to chat {chat_id}: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def update_chat_title(
        db: Session, chat_id: int, user_id: int, new_title: str
    ) -> Optional[Chat]:
        """Update chat title."""
        try:
            chat = (
                db.query(Chat)
                .filter(and_(Chat.id == chat_id, Chat.user_id == user_id))
                .first()
            )

            if not chat:
                return None

            chat.title = new_title
            chat.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(chat)

            app_logger.info(f"Updated title for chat {chat_id}")
            return chat

        except Exception as e:
            app_logger.error(f"Error updating chat title: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def archive_chat(
        db: Session, chat_id: int, user_id: int, archived: bool = True
    ) -> bool:
        """Archive or unarchive a chat."""
        try:
            chat = (
                db.query(Chat)
                .filter(and_(Chat.id == chat_id, Chat.user_id == user_id))
                .first()
            )

            if not chat:
                return False

            chat.is_archived = archived
            chat.updated_at = datetime.utcnow()
            db.commit()

            action = "archived" if archived else "unarchived"
            app_logger.info(f"Chat {chat_id} {action}")
            return True

        except Exception as e:
            app_logger.error(f"Error archiving chat: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def pin_chat(db: Session, chat_id: int, user_id: int, pinned: bool = True) -> bool:
        """Pin or unpin a chat."""
        try:
            chat = (
                db.query(Chat)
                .filter(and_(Chat.id == chat_id, Chat.user_id == user_id))
                .first()
            )

            if not chat:
                return False

            chat.is_pinned = pinned
            chat.updated_at = datetime.utcnow()
            db.commit()

            action = "pinned" if pinned else "unpinned"
            app_logger.info(f"Chat {chat_id} {action}")
            return True

        except Exception as e:
            app_logger.error(f"Error pinning chat: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def delete_chat(db: Session, chat_id: int, user_id: int) -> bool:
        """Delete a chat and all its messages."""
        try:
            chat = (
                db.query(Chat)
                .filter(and_(Chat.id == chat_id, Chat.user_id == user_id))
                .first()
            )

            if not chat:
                return False

            # Delete the chat (messages will be deleted automatically due to cascade)
            db.delete(chat)
            db.commit()

            app_logger.info(f"Deleted chat {chat_id} for user {user_id}")
            return True

        except Exception as e:
            app_logger.error(f"Error deleting chat {chat_id}: {str(e)}")
            db.rollback()
            raise

    @staticmethod
    def get_chat_stats(db: Session, user_id: int) -> dict:
        """Get user's chat statistics."""
        try:
            total_chats = db.query(Chat).filter(Chat.user_id == user_id).count()
            archived_chats = (
                db.query(Chat)
                .filter(and_(Chat.user_id == user_id, Chat.is_archived == True))
                .count()
            )
            pinned_chats = (
                db.query(Chat)
                .filter(and_(Chat.user_id == user_id, Chat.is_pinned == True))
                .count()
            )

            total_messages = (
                db.query(Message).join(Chat).filter(Chat.user_id == user_id).count()
            )

            return {
                "total_chats": total_chats,
                "active_chats": total_chats - archived_chats,
                "archived_chats": archived_chats,
                "pinned_chats": pinned_chats,
                "total_messages": total_messages,
            }

        except Exception as e:
            app_logger.error(f"Error getting chat stats for user {user_id}: {str(e)}")
            raise
