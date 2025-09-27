from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any, List


class ChatBase(BaseModel):
    title: str
    description: Optional[str] = None


class ChatCreate(ChatBase):
    pass


class ChatUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None


class ChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    description: Optional[str] = None
    is_pinned: bool
    is_archived: bool
    model_name: Optional[str] = None
    temperature: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime] = None
    message_count: int


class ChatDetail(ChatResponse):
    messages: List[Dict[str, Any]] = []


class ChatStats(BaseModel):
    total_chats: int
    active_chats: int
    archived_chats: int
    pinned_chats: int
    total_messages: int