from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any


class MessageBase(BaseModel):
    content: str
    message_type: str = "text"


class MessageCreate(MessageBase):
    pass


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    chat_id: int
    content: str
    role: str  # 'user' or 'assistant'
    message_type: str
    processing_status: str
    file_metadata: Optional[Dict[str, Any]] = None
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None
    processing_time: Optional[float] = None
    confidence_score: Optional[float] = None
    is_edited: bool
    is_deleted: bool
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime] = None


class FileUploadResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse
    file_info: Dict[str, Any]


class StructuredAnalysisRequest(BaseModel):
    prompt: str
    schema_type: str = "general"  # 'general', 'summary', 'extraction', etc.


class StructuredAnalysisResponse(BaseModel):
    data: Dict[str, Any]
    processing_time: float
    processing_status: str