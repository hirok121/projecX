from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime


class DiagnosisCreate(BaseModel):
    """Schema for creating a diagnosis request."""

    classifier_id: int = Field(..., gt=0, description="ID of the classifier to use")
    name: Optional[str] = Field(None, max_length=200, description="Patient name")
    age: Optional[int] = Field(None, ge=0, le=150, description="Patient age")
    sex: Optional[str] = Field(None, description="Patient sex (Male, Female, Other)")
    input_data: Optional[Dict[str, Any]] = Field(
        None, description="Tabular feature values"
    )
    input_file: Optional[str] = Field(None, description="Path to uploaded image file")


class DiagnosisResponse(BaseModel):
    """Schema for diagnosis response."""

    id: int
    user_id: int
    disease_id: int
    classifier_id: int
    modality: str
    name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    input_file: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    probabilities: Optional[Dict[str, float]] = None
    status: str
    error_message: Optional[str] = None
    processing_time: Optional[float] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Additional fields for disease and classifier info
    disease_name: Optional[str] = None
    disease_description: Optional[str] = None
    disease_blog_link: Optional[str] = None
    classifier_name: Optional[str] = None
    classifier_title: Optional[str] = None
    classifier_description: Optional[str] = None
    classifier_blog_link: Optional[str] = None
    classifier_paper_link: Optional[str] = None

    class Config:
        from_attributes = True


class DiagnosisAcknowledgement(BaseModel):
    """Schema for immediate diagnosis acknowledgement."""

    id: int
    status: str
    message: str
    result_link: Optional[str] = None
