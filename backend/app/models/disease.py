from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.connection import Base


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    category = Column(
        String(100), nullable=True, index=True
    )  # e.g., "Liver", "Metabolic", "Respiratory"

    # Available modalities for this disease
    available_modalities = Column(
        JSON, nullable=False, default=list
    )  # ["MRI", "CT", "X-Ray", "Tabular"]

    # Required features for tabular data (if applicable)
    required_features = Column(
        JSON, nullable=True
    )  # {"age": "numeric", "glucose": "numeric", ...}

    # Metadata
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    classifiers = relationship(
        "Classifier",
        back_populates="disease",
        cascade="all, delete-orphan",
        lazy="select",
    )
    predictions = relationship(
        "PredictionResult",
        back_populates="disease",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "available_modalities": self.available_modalities or [],
            "required_features": self.required_features or {},
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
