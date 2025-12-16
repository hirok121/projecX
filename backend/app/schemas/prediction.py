from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime


class PredictionCreate(BaseModel):
    """Schema for creating a prediction request."""

    classifier_id: int = Field(..., gt=0, description="ID of the classifier to use")
    input_data: Dict[str, Any] = Field(..., description="Feature values for prediction")


class PredictionResponse(BaseModel):
    """Schema for prediction response."""

    id: int
    user_id: int
    disease_id: int
    classifier_id: int
    modality: str
    input_data: Optional[Dict[str, Any]] = None
    prediction: str
    confidence: float
    probabilities: Optional[Dict[str, float]] = None
    status: str
    error_message: Optional[str] = None
    processing_time: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PredictionListResponse(BaseModel):
    """Schema for list of predictions."""

    predictions: List[PredictionResponse]
    total: int
