from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


# Disease Schemas
class DiseaseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    available_modalities: List[str] = Field(default_factory=list)
    required_features: Optional[Dict[str, str]] = None


class DiseaseCreate(DiseaseBase):
    pass


class DiseaseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    available_modalities: Optional[List[str]] = None
    required_features: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None


class DiseaseResponse(DiseaseBase):
    id: int
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Classifier Schemas
class ClassifierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    disease_id: int
    modality: str = Field(..., description="MRI, CT, X-Ray, or Tabular")
    model_type: Optional[str] = Field(None, max_length=100)
    accuracy: Optional[float] = Field(None, ge=0.0, le=1.0)
    precision: Optional[float] = Field(None, ge=0.0, le=1.0)
    recall: Optional[float] = Field(None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    training_samples: Optional[int] = Field(None, ge=0)
    version: Optional[str] = Field(None, max_length=50)


class ClassifierCreate(ClassifierBase):
    model_file: str = Field(..., description="Filename of the pickle model")


class ClassifierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    modality: Optional[str] = None
    model_file: Optional[str] = None
    model_type: Optional[str] = None
    accuracy: Optional[float] = Field(None, ge=0.0, le=1.0)
    precision: Optional[float] = Field(None, ge=0.0, le=1.0)
    recall: Optional[float] = Field(None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    training_samples: Optional[int] = Field(None, ge=0)
    version: Optional[str] = None
    is_active: Optional[bool] = None


class ClassifierResponse(ClassifierBase):
    id: int
    model_file: str
    disease_name: Optional[str]
    training_date: Optional[datetime]
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Prediction Schemas
class PredictionRequest(BaseModel):
    disease_id: int
    classifier_ids: List[int]
    modality: str
    input_data: Optional[Dict[str, float]] = None  # For tabular data


class PredictionResponse(BaseModel):
    id: int
    disease_id: int
    disease_name: Optional[str]
    classifier_id: int
    classifier_name: Optional[str]
    modality: str
    prediction: str
    confidence: float
    probabilities: Optional[Dict[str, float]]
    status: str
    error_message: Optional[str]
    processing_time: Optional[float]
    created_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class PredictionListResponse(BaseModel):
    predictions: List[PredictionResponse]
    total: int
