"""
Diagnosis Model - Stores diagnostic requests and results
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    JSON,
    Float,
    ForeignKey,
    DateTime,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.connection import Base
import enum


class DiagnosisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)

    # User and disease info
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False, index=True)
    classifier_id = Column(
        Integer, ForeignKey("classifiers.id"), nullable=False, index=True
    )

    # Patient information
    name = Column(String(200), nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String(20), nullable=True)  # "Male", "Female", "Other"

    # Input data
    modality = Column(String(50), nullable=False)  # "MRI", "CT", "X-Ray", "Tabular"
    input_file = Column(String(500), nullable=True)  # Path to uploaded image file
    input_data = Column(JSON, nullable=True)  # Tabular data or extracted features

    # Diagnosis results
    prediction = Column(String(100), nullable=True)  # "Positive", "Negative", etc.
    confidence = Column(Float, nullable=True)  # 0.0 to 1.0
    probabilities = Column(JSON, nullable=True)  # {"Positive": 0.85, "Negative": 0.15}

    # Status and metadata
    status = Column(
        SQLEnum(DiagnosisStatus), default=DiagnosisStatus.PENDING, index=True
    )
    error_message = Column(Text, nullable=True)
    processing_time = Column(Float, nullable=True)  # in seconds

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="diagnoses", lazy="select")
    disease = relationship("Disease", backref="diagnoses", lazy="select")
    classifier = relationship("Classifier", backref="diagnoses", lazy="select")

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "disease_id": self.disease_id,
            "disease_name": self.disease.name if self.disease else None,
            "classifier_id": self.classifier_id,
            "classifier_name": self.classifier.name if self.classifier else None,
            "modality": self.modality,
            "name": self.name,
            "age": self.age,
            "sex": self.sex,
            "input_file": self.input_file,
            "input_data": self.input_data,
            "prediction": self.prediction,
            "confidence": self.confidence,
            "probabilities": self.probabilities,
            "status": self.status.value if self.status else None,
            "error_message": self.error_message,
            "processing_time": self.processing_time,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
        }
