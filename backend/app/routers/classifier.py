"""
Classifier Router - CRUD endpoints for classifier management
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.connection import get_db
from app.services.classifier_service import ClassifierService
from app.schemas.classifier import (
    ClassifierCreate,
    ClassifierUpdate,
    ClassifierResponse,
)
from app.core.logging import log_endpoint_activity, track_endpoint_performance

router = APIRouter(prefix="/classifiers", tags=["classifiers"])


@router.post("/", response_model=ClassifierResponse)
@track_endpoint_performance("classifier", "create")
def create_classifier(classifier_data: ClassifierCreate, db: Session = Depends(get_db)):
    """Create a new classifier with automatic storage directory."""
    log_endpoint_activity(
        "classifier",
        "create_classifier",
        extra={"name": classifier_data.name, "disease_id": classifier_data.disease_id},
    )

    return ClassifierService.create_classifier(db=db, classifier_data=classifier_data)


@router.post("/{classifier_id}/upload-model-files")
@track_endpoint_performance("classifier", "upload_files")
def upload_model_files(
    classifier_id: int,
    features_file: UploadFile = File(...),
    scaler_file: UploadFile = File(...),
    imputer_file: UploadFile = File(...),
    model_file: UploadFile = File(...),
    class_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload model pickle files for a classifier.

    Required files:
    - features.pkl: Feature names
    - scaler.pkl: Data scaler
    - imputer.pkl: Missing data imputer
    - model.pkl: Trained ML model
    - class.pkl: Class name mapping
    """
    log_endpoint_activity(
        "classifier", "upload_model_files", extra={"classifier_id": classifier_id}
    )

    # Validate file extensions
    required_files = {
        "features": features_file,
        "scaler": scaler_file,
        "imputer": imputer_file,
        "model": model_file,
        "class": class_file,
    }

    for name, file in required_files.items():
        if not file.filename.endswith(".pkl"):
            raise HTTPException(
                status_code=400, detail=f"{name} file must be a .pkl file"
            )

    saved_paths = ClassifierService.upload_model_files(
        db=db,
        classifier_id=classifier_id,
        features_file=features_file,
        scaler_file=scaler_file,
        imputer_file=imputer_file,
        model_file=model_file,
        class_file=class_file,
    )

    return {"message": "Model files uploaded successfully", "saved_files": saved_paths}


@router.get("/", response_model=List[ClassifierResponse])
@track_endpoint_performance("classifier", "list")
def list_classifiers(
    disease_id: Optional[int] = None,
    modality: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get list of classifiers with optional filters."""
    log_endpoint_activity(
        "classifier",
        "list_classifiers",
        extra={"disease_id": disease_id, "modality": modality},
    )

    return ClassifierService.get_classifiers(
        db=db,
        disease_id=disease_id,
        modality=modality,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )


@router.get("/{classifier_id}", response_model=ClassifierResponse)
@track_endpoint_performance("classifier", "get")
def get_classifier(classifier_id: int, db: Session = Depends(get_db)):
    """Get a specific classifier by ID."""
    log_endpoint_activity(
        "classifier", "get_classifier", extra={"classifier_id": classifier_id}
    )

    return ClassifierService.get_classifier(db=db, classifier_id=classifier_id)


@router.get("/by-disease/{disease_id}", response_model=List[ClassifierResponse])
@track_endpoint_performance("classifier", "by_disease")
def get_classifiers_by_disease(
    disease_id: int, is_active: Optional[bool] = True, db: Session = Depends(get_db)
):
    """Get all classifiers for a specific disease."""
    log_endpoint_activity(
        "classifier", "get_classifiers_by_disease", extra={"disease_id": disease_id}
    )

    return ClassifierService.get_classifiers(
        db=db, disease_id=disease_id, is_active=is_active
    )


@router.put("/{classifier_id}", response_model=ClassifierResponse)
@track_endpoint_performance("classifier", "update")
def update_classifier(
    classifier_id: int, classifier_data: ClassifierUpdate, db: Session = Depends(get_db)
):
    """Update a classifier."""
    log_endpoint_activity(
        "classifier", "update_classifier", extra={"classifier_id": classifier_id}
    )

    return ClassifierService.update_classifier(
        db=db, classifier_id=classifier_id, classifier_data=classifier_data
    )


@router.delete("/{classifier_id}")
@track_endpoint_performance("classifier", "delete")
def delete_classifier(classifier_id: int, db: Session = Depends(get_db)):
    """Delete a classifier and its storage directory."""
    log_endpoint_activity(
        "classifier", "delete_classifier", extra={"classifier_id": classifier_id}
    )

    ClassifierService.delete_classifier(db=db, classifier_id=classifier_id)
    return {"message": "Classifier deleted successfully"}
