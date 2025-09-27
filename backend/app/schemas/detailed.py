from pydantic import BaseModel, ConfigDict
from typing import List
from .chat import ChatResponse
from .message import MessageResponse


class ChatWithMessages(BaseModel):
    """Chat response with full message details"""
    model_config = ConfigDict(from_attributes=True)
    
    chat: ChatResponse
    messages: List[MessageResponse] = []


# Update ChatDetail to be simpler
class ChatDetailResponse(ChatResponse):
    """Enhanced chat response with basic message info"""
    messages: List[dict] = []  # Simple dict to avoid circular references