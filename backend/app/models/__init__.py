# Import all models for proper table creation
from .user import User
from .chat import Chat
from .message import Message

__all__ = ["User", "Chat", "Message"]