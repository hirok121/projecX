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


class PredictionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class PredictionResult(Base):
    __tablename__ = "prediction_results"

    id = Column(Integer, primary_key=True, index=True)

    # User and disease info
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False, index=True)
    classifier_id = Column(
        Integer, ForeignKey("classifiers.id"), nullable=False, index=True
    )

    # Input data
    modality = Column(String(50), nullable=False)  # "MRI", "CT", "X-Ray", "Tabular"
    input_file = Column(String(500), nullable=True)  # Path to uploaded image file
    input_data = Column(JSON, nullable=True)  # Tabular data or extracted features

    # Prediction results
    prediction = Column(
        String(100), nullable=False
    )  # "Positive", "Negative", "Stage 1", etc.
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    probabilities = Column(JSON, nullable=True)  # {"Positive": 0.85, "Negative": 0.15}

    # Additional metadata
    status = Column(
        SQLEnum(PredictionStatus), default=PredictionStatus.PENDING, index=True
    )
    error_message = Column(Text, nullable=True)
    processing_time = Column(Float, nullable=True)  # in seconds

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="predictions", lazy="select")
    disease = relationship("Disease", back_populates="predictions", lazy="select")
    classifier = relationship("Classifier", back_populates="predictions", lazy="select")

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
            "input_file": self.input_file,
            "input_data": self.input_data,
            "prediction": self.prediction,
            "confidence": self.confidence,
            "probabilities": self.probabilities,
            "status": self.status.value if self.status else None,
            "error_message": self.error_message,
            "processing_time": self.processing_time,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
        }
