"""
Disease Router - CRUD endpoints for disease management
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.connection import get_db
from app.services.disease_service import DiseaseService
from app.schemas.disease import DiseaseCreate, DiseaseUpdate, DiseaseResponse
from app.core.logging import log_endpoint_activity, track_endpoint_performance

router = APIRouter(prefix="/diseases", tags=["diseases"])


@router.post("/", response_model=DiseaseResponse)
@track_endpoint_performance("disease", "create")
def create_disease(disease_data: DiseaseCreate, db: Session = Depends(get_db)):
    """Create a new disease with automatic storage directory creation."""
    log_endpoint_activity(
        "disease", "create_disease", extra={"disease_name": disease_data.name}
    )

    return DiseaseService.create_disease(
        db=db,
        name=disease_data.name,
        description=disease_data.description,
        category=disease_data.category,
        available_modalities=disease_data.available_modalities,
    )


@router.get("/", response_model=List[DiseaseResponse])
@track_endpoint_performance("disease", "list")
def list_diseases(
    category: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get list of diseases with optional filters."""
    log_endpoint_activity(
        "disease", "list_diseases", extra={"category": category, "is_active": is_active}
    )

    return DiseaseService.get_diseases(
        db=db, category=category, is_active=is_active, skip=skip, limit=limit
    )


@router.get("/{disease_id}", response_model=DiseaseResponse)
@track_endpoint_performance("disease", "get")
def get_disease(disease_id: int, db: Session = Depends(get_db)):
    """Get a specific disease by ID."""
    log_endpoint_activity("disease", "get_disease", extra={"disease_id": disease_id})

    return DiseaseService.get_disease(db=db, disease_id=disease_id)


@router.put("/{disease_id}", response_model=DiseaseResponse)
@track_endpoint_performance("disease", "update")
def update_disease(
    disease_id: int, disease_data: DiseaseUpdate, db: Session = Depends(get_db)
):
    """Update a disease."""
    log_endpoint_activity("disease", "update_disease", extra={"disease_id": disease_id})

    return DiseaseService.update_disease(
        db=db, disease_id=disease_id, disease_data=disease_data
    )


@router.delete("/{disease_id}")
@track_endpoint_performance("disease", "delete")
def delete_disease(disease_id: int, db: Session = Depends(get_db)):
    """Delete a disease and its storage directory."""
    log_endpoint_activity("disease", "delete_disease", extra={"disease_id": disease_id})

    DiseaseService.delete_disease(db=db, disease_id=disease_id)
    return {"message": "Disease deleted successfully"}
