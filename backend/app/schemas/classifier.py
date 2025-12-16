"""
Classifier Pydantic Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ClassifierBase(BaseModel):
    """Base schema for Classifier."""

    name: str = Field(..., min_length=1, max_length=200)
    disease_id: int = Field(..., gt=0)
    modality: str = Field(..., description="Must be one of: MRI, CT, X-Ray, Tabular")
    description: Optional[str] = None
    model_type: Optional[str] = None
    required_features: Optional[List[str]] = None
    accuracy: Optional[float] = Field(None, ge=0, le=1)
    precision: Optional[float] = Field(None, ge=0, le=1)
    recall: Optional[float] = Field(None, ge=0, le=1)
    f1_score: Optional[float] = Field(None, ge=0, le=1)
    version: Optional[str] = None


class ClassifierCreate(ClassifierBase):
    """Schema for creating a classifier."""

    pass


class ClassifierUpdate(BaseModel):
    """Schema for updating a classifier. All fields optional."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    model_type: Optional[str] = None
    required_features: Optional[List[str]] = None
    accuracy: Optional[float] = Field(None, ge=0, le=1)
    precision: Optional[float] = Field(None, ge=0, le=1)
    recall: Optional[float] = Field(None, ge=0, le=1)
    f1_score: Optional[float] = Field(None, ge=0, le=1)
    version: Optional[str] = None
    is_active: Optional[bool] = None


class ClassifierResponse(ClassifierBase):
    """Schema for classifier response."""

    id: int
    model_path: str
    disease_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
