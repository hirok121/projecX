from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    DateTime,
    Boolean,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.connection import Base
import enum


class ModalityType(str, enum.Enum):
    MRI = "MRI"
    CT = "CT"
    XRAY = "X-Ray"
    TABULAR = "Tabular"


class Classifier(Base):
    __tablename__ = "classifiers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Disease association
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False, index=True)

    # Modality type
    modality = Column(SQLEnum(ModalityType), nullable=False, index=True)

    # Model file info
    model_file = Column(String(500), nullable=False)  # Path to pickle file
    model_type = Column(
        String(100), nullable=True
    )  # e.g., "RandomForest", "CNN", "LogisticRegression"

    # Performance metrics
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)

    # Training info
    training_date = Column(DateTime(timezone=True), nullable=True)
    training_samples = Column(Integer, nullable=True)
    version = Column(String(50), nullable=True)  # e.g., "v1.0.0"

    # Metadata
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    disease = relationship("Disease", back_populates="classifiers", lazy="select")
    predictions = relationship(
        "PredictionResult",
        back_populates="classifier",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "disease_id": self.disease_id,
            "disease_name": self.disease.name if self.disease else None,
            "modality": self.modality.value if self.modality else None,
            "model_file": self.model_file,
            "model_type": self.model_type,
            "accuracy": self.accuracy,
            "precision": self.precision,
            "recall": self.recall,
            "f1_score": self.f1_score,
            "training_date": (
                self.training_date.isoformat() if self.training_date else None
            ),
            "training_samples": self.training_samples,
            "version": self.version,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
