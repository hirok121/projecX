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
    ClassifierListResponse,
    TabularMetadataUpdate,
    ImageMetadataUpdate,
)
from app.core.logging import log_endpoint_activity, track_endpoint_performance

router = APIRouter(prefix="/classifiers", tags=["classifiers"])


@router.post("/", response_model=ClassifierResponse)
@track_endpoint_performance("classifier", "create")
def create_classifier(classifier_data: ClassifierCreate, db: Session = Depends(get_db)):
    """
    Create a new classifier - Step 1: Basic Information.
    
    Creates classifier with basic info including title, description, authors, and links.
    """
    log_endpoint_activity(
        "classifier",
        "create_classifier",
        additional_info={
            "name": classifier_data.name,
            "disease_id": classifier_data.disease_id,
        },
    )

    return ClassifierService.create_classifier(db=db, classifier_data=classifier_data)


@router.post("/extract-features-from-file")
@track_endpoint_performance("classifier", "extract_features_from_file")
def extract_features_from_file(
    features_file: UploadFile = File(...),
):
    """
    Extract features from a features.pkl file without requiring a classifier ID.
    
    This endpoint is used during the wizard to preview features before creating the classifier.
    
    Args:
        features_file: The features.pkl file
        
    Returns:
        Dict with extracted features and count
    """
    log_endpoint_activity(
        "classifier",
        "extract_features_from_file",
        additional_info={"filename": features_file.filename},
    )

    if not features_file.filename.endswith(".pkl"):
        raise HTTPException(
            status_code=400, detail="File must be a .pkl file"
        )

    result = ClassifierService.extract_features_from_file(features_file)
    
    return {
        "features": result["features"],
        "count": result["count"],
    }


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
    Upload model pickle files for a tabular classifier - Step 2 (Tabular).
    
    Automatically extracts and updates required_features from features.pkl.

    Required files:
    - features.pkl: Feature names (automatically extracted)
    - scaler.pkl: Data scaler
    - imputer.pkl: Missing data imputer
    - model.pkl: Trained ML model
    - class.pkl: Class name mapping
    """
    log_endpoint_activity(
        "classifier",
        "upload_model_files",
        additional_info={"classifier_id": classifier_id},
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

    result = ClassifierService.upload_model_files(
        db=db,
        classifier_id=classifier_id,
        features_file=features_file,
        scaler_file=scaler_file,
        imputer_file=imputer_file,
        model_file=model_file,
        class_file=class_file,
    )

    return {
        "message": "Model files uploaded successfully",
        "saved_files": result["saved_files"],
        "extracted_features": result["extracted_features"],
        "feature_count": result["feature_count"]
    }


@router.post("/{classifier_id}/upload-image-model")
@track_endpoint_performance("classifier", "upload_image_model")
def upload_image_model(
    classifier_id: int,
    model_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload single model file for image classifier - Step 2 (Image).

    Supported formats:
    - TensorFlow: .h5, .keras
    - PyTorch: .pt, .pth
    - ONNX: .onnx
    """
    log_endpoint_activity(
        "classifier",
        "upload_image_model",
        additional_info={"classifier_id": classifier_id},
    )

    saved_paths = ClassifierService.upload_image_model_file(
        db=db,
        classifier_id=classifier_id,
        model_file=model_file,
    )

    return {"message": "Image model file uploaded successfully", "saved_files": saved_paths}


@router.post("/{classifier_id}/extract-features")
@track_endpoint_performance("classifier", "extract_features")
def extract_features(classifier_id: int, db: Session = Depends(get_db)):
    """
    Extract feature names from uploaded features.pkl file - Step 2 (Tabular).
    
    This automatically updates the classifier's required_features field.
    """
    log_endpoint_activity(
        "classifier",
        "extract_features",
        additional_info={"classifier_id": classifier_id},
    )

    features = ClassifierService.extract_features_from_pkl(
        db=db, classifier_id=classifier_id
    )

    return {
        "message": "Features extracted successfully",
        "features": features,
        "count": len(features),
    }


@router.put("/{classifier_id}/tabular-metadata", response_model=ClassifierResponse)
@track_endpoint_performance("classifier", "update_tabular_metadata")
def update_tabular_metadata(
    classifier_id: int,
    metadata: TabularMetadataUpdate,
    db: Session = Depends(get_db),
):
    """
    Update tabular classifier metadata - Step 3 (Tabular).
    
    Updates feature metadata and performance metrics for tabular models.
    """
    log_endpoint_activity(
        "classifier",
        "update_tabular_metadata",
        additional_info={"classifier_id": classifier_id},
    )

    return ClassifierService.update_tabular_metadata(
        db=db, classifier_id=classifier_id, metadata=metadata
    )


@router.put("/{classifier_id}/image-metadata", response_model=ClassifierResponse)
@track_endpoint_performance("classifier", "update_image_metadata")
def update_image_metadata(
    classifier_id: int,
    metadata: ImageMetadataUpdate,
    db: Session = Depends(get_db),
):
    """
    Update image classifier metadata - Step 3 (Image).
    
    Updates model configuration and performance metrics for image models.
    """
    log_endpoint_activity(
        "classifier",
        "update_image_metadata",
        additional_info={"classifier_id": classifier_id},
    )

    return ClassifierService.update_image_metadata(
        db=db, classifier_id=classifier_id, metadata=metadata
    )


@router.get("/", response_model=List[ClassifierListResponse])
@track_endpoint_performance("classifier", "list")
def list_classifiers(
    disease_id: Optional[int] = None,
    modality: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get list of classifiers with optional filters - Summary view only.
    
    Returns: name, modality, description, authors, links, required_features, accuracy
    Excludes: feature_metadata, classifier_config, detailed metrics
    
    Note: is_active defaults to None (returns all classifiers). 
    Set to True for active only, False for inactive only.
    """
    log_endpoint_activity(
        "classifier",
        "list_classifiers",
        additional_info={"disease_id": disease_id, "modality": modality},
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
    """
    Get a specific classifier by ID - Full details.
    
    Returns all fields including feature_metadata, classifier_config, and all metrics.
    """
    log_endpoint_activity(
        "classifier", "get_classifier", additional_info={"classifier_id": classifier_id}
    )

    return ClassifierService.get_classifier(db=db, classifier_id=classifier_id)


@router.get("/by-disease/{disease_id}", response_model=List[ClassifierResponse])
@track_endpoint_performance("classifier", "by_disease")
def get_classifiers_by_disease(
    disease_id: int, is_active: Optional[bool] = True, db: Session = Depends(get_db)
):
    """Get all classifiers for a specific disease."""
    log_endpoint_activity(
        "classifier",
        "get_classifiers_by_disease",
        additional_info={"disease_id": disease_id},
    )

    return ClassifierService.get_classifiers(
        db=db, disease_id=disease_id, is_active=is_active
    )


@router.put("/{classifier_id}", response_model=ClassifierResponse)
@track_endpoint_performance("classifier", "update")
def update_classifier(
    classifier_id: int, classifier_data: ClassifierUpdate, db: Session = Depends(get_db)
):
    """
    Update a classifier - Basic info only (same as create).
    
    Updates: name, title, description, authors, links, model_type, version, is_active
    
    Note: 
    - disease_id and modality cannot be updated
    - Use PUT /classifiers/{id}/tabular-metadata to update tabular metadata
    - Use PUT /classifiers/{id}/image-metadata to update image metadata
    """
    log_endpoint_activity(
        "classifier",
        "update_classifier",
        additional_info={"classifier_id": classifier_id},
    )

    return ClassifierService.update_classifier(
        db=db, classifier_id=classifier_id, classifier_data=classifier_data
    )


@router.patch("/{classifier_id}/toggle-active")
@track_endpoint_performance("classifier", "toggle_active")
def toggle_classifier_active(classifier_id: int, db: Session = Depends(get_db)):
    """
    Toggle classifier active status (activate/deactivate).
    
    Toggles the is_active field between True and False.
    """
    log_endpoint_activity(
        "classifier",
        "toggle_classifier_active",
        additional_info={"classifier_id": classifier_id},
    )

    return ClassifierService.toggle_classifier_active(db=db, classifier_id=classifier_id)


@router.delete("/{classifier_id}")
@track_endpoint_performance("classifier", "delete")
def delete_classifier(classifier_id: int, db: Session = Depends(get_db)):
    """Delete a classifier and its storage directory."""
    log_endpoint_activity(
        "classifier",
        "delete_classifier",
        additional_info={"classifier_id": classifier_id},
    )

    ClassifierService.delete_classifier(db=db, classifier_id=classifier_id)
    return {"message": "Classifier deleted successfully"}
