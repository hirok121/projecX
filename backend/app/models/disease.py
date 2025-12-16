from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    JSON,
    DateTime,
    Boolean,
    CheckConstraint,
)
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func
from app.db.connection import Base
import enum
import uuid


class ModalityType(str, enum.Enum):
    MRI = "MRI"
    CT = "CT"
    XRAY = "X-Ray"
    TABULAR = "Tabular"


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    category = Column(
        String(100), nullable=True, index=True
    )  # e.g., "Liver", "Metabolic", "Respiratory"

    # Storage path for disease-related resources (auto-generated UUID)
    storage_path = Column(
        String(500),
        nullable=False,
        unique=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
    )  # Unique directory path for this disease

    # Available modalities for this disease (list of ModalityType enum values)
    # Stores multiple modality types: e.g., ["MRI", "CT", "Tabular"]
    available_modalities = Column(
        JSON, nullable=False, default=list
    )  # Must contain only: MRI, CT, X-Ray, Tabular

    # Valid modality values from ModalityType enum
    VALID_MODALITIES = {m.value for m in ModalityType}

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

    @validates("available_modalities")
    def validate_modalities(self, key, value):
        """Validate that all modalities are valid ModalityType enum values."""
        if value:
            if not isinstance(value, list):
                raise ValueError("available_modalities must be a list")
            invalid = [m for m in value if m not in self.VALID_MODALITIES]
            if invalid:
                raise ValueError(
                    f"Invalid modalities: {invalid}. Must be one of: {list(self.VALID_MODALITIES)}"
                )
        return value if value else []

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "storage_path": self.storage_path,
            "available_modalities": self.available_modalities or [],
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
