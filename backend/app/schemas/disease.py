"""
Disease Pydantic Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DiseaseBase(BaseModel):
    """Base schema for Disease."""

    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    available_modalities: Optional[List[str]] = None


class DiseaseCreate(DiseaseBase):
    """Schema for creating a disease."""

    pass


class DiseaseUpdate(BaseModel):
    """Schema for updating a disease. All fields optional."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    available_modalities: Optional[List[str]] = None
    is_active: Optional[bool] = None


class DiseaseResponse(DiseaseBase):
    """Schema for disease response."""

    id: int
    storage_path: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
