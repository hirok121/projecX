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
    title: Optional[str] = None
    description: Optional[str] = None
    authors: Optional[str] = None
    blog_link: Optional[str] = Field(None, max_length=500)
    paper_link: Optional[str] = Field(None, max_length=500)
    model_type: Optional[str] = None
    required_features: Optional[List[str]] = None
    feature_metadata: Optional[dict] = None
    classifier_config: Optional[dict] = None
    accuracy: Optional[float] = Field(None, ge=0, le=1)
    precision: Optional[float] = Field(None, ge=0, le=1)
    recall: Optional[float] = Field(None, ge=0, le=1)
    f1_score: Optional[float] = Field(None, ge=0, le=1)
    auc_roc: Optional[float] = Field(None, ge=0, le=1)
    sensitivity: Optional[float] = Field(None, ge=0, le=1)
    specificity: Optional[float] = Field(None, ge=0, le=1)
    training_date: Optional[datetime] = None
    training_samples: Optional[int] = None
    version: Optional[str] = None


class ClassifierCreate(BaseModel):
    """Schema for creating a classifier - Step 1: Basic Info."""

    name: str = Field(..., min_length=1, max_length=200)
    disease_id: int = Field(..., gt=0)
    modality: str = Field(..., description="Must be one of: MRI, CT, X-Ray, Tabular")
    title: Optional[str] = None
    description: Optional[str] = None
    authors: Optional[str] = None
    blog_link: Optional[str] = Field(None, max_length=500)
    paper_link: Optional[str] = Field(None, max_length=500)
    model_type: Optional[str] = None
    version: Optional[str] = None


class TabularMetadataUpdate(BaseModel):
    """Schema for updating tabular classifier metadata - Step 3."""

    feature_metadata: Optional[dict] = Field(None, description="Metadata for each feature")
    accuracy: Optional[float] = Field(None, ge=0, le=1)
    precision: Optional[float] = Field(None, ge=0, le=1)
    recall: Optional[float] = Field(None, ge=0, le=1)
    f1_score: Optional[float] = Field(None, ge=0, le=1)
    training_date: Optional[datetime] = None
    training_samples: Optional[int] = None


class ImageMetadataUpdate(BaseModel):
    """Schema for updating image classifier metadata - Step 3."""

    classifier_config: Optional[dict] = Field(None, description="Model configuration (class_labels, input_shape)")
    accuracy: Optional[float] = Field(None, ge=0, le=1)
    auc_roc: Optional[float] = Field(None, ge=0, le=1)
    sensitivity: Optional[float] = Field(None, ge=0, le=1)
    specificity: Optional[float] = Field(None, ge=0, le=1)
    training_date: Optional[datetime] = None
    training_samples: Optional[int] = None


class ClassifierUpdate(BaseModel):
    """
    Schema for updating a classifier - Basic info only (same as create).
    
    Note: disease_id and modality cannot be updated.
    Use /tabular-metadata or /image-metadata endpoints to update metadata.
    """

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    title: Optional[str] = None
    description: Optional[str] = None
    authors: Optional[str] = None
    blog_link: Optional[str] = Field(None, max_length=500)
    paper_link: Optional[str] = Field(None, max_length=500)
    model_type: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None


class ClassifierListResponse(BaseModel):
    """Schema for classifier list response - Summary only."""

    id: int
    name: str
    modality: str
    description: Optional[str] = None
    authors: Optional[str] = None
    blog_link: Optional[str] = None
    paper_link: Optional[str] = None
    required_features: Optional[List[str]] = None
    accuracy: Optional[float] = None
    disease_id: int
    disease_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class ClassifierResponse(ClassifierBase):
    """Schema for classifier response - Full details."""

    id: int
    model_path: str
    disease_name: Optional[str] = None
    feature_metadata: Optional[dict] = None
    classifier_config: Optional[dict] = None
    blog_link: Optional[str] = Field(None, max_length=500)
    paper_link: Optional[str] = Field(None, max_length=500)
    training_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
