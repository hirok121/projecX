from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
from pathlib import Path
import logging
from datetime import datetime

from app.db.connection import get_db
from app.models.user import User
from app.models.disease import Disease
from app.models.classifier import Classifier, ModalityType
from app.routers.auth import get_current_user
from app.core.logging import track_endpoint_performance, log_endpoint_activity
from app.schemas.disease import DiseaseCreate, DiseaseUpdate, DiseaseResponse
from app.schemas.classifier import (
    ClassifierCreate,
    ClassifierUpdate,
    ClassifierResponse,
)


router = APIRouter(prefix="/admin/diagnosis", tags=["admin-diagnosis"])
logger = logging.getLogger(__name__)


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verify user has admin privileges."""
    is_staff = getattr(current_user, "is_staff", False)
    is_superuser = getattr(current_user, "is_superuser", False)

    if not (is_staff or is_superuser):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ============ DISEASE MANAGEMENT ============


@router.post("/diseases", response_model=DiseaseResponse)
@track_endpoint_performance("admin", "create_disease")
async def create_disease(
    disease: DiseaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new disease (admin only)."""
    log_endpoint_activity(
        "admin", "create_disease", getattr(current_user, "email", None), disease.name
    )

    # Check if disease already exists
    existing = db.query(Disease).filter(Disease.name == disease.name).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Disease with this name already exists"
        )

    # Create new disease
    db_disease = Disease(
        name=disease.name,
        description=disease.description,
        category=disease.category,
        available_modalities=disease.available_modalities,
        required_features=disease.required_features,
    )

    db.add(db_disease)
    db.commit()
    db.refresh(db_disease)

    logger.info(f"✅ Created disease: {disease.name} (ID: {db_disease.id})")
    return db_disease


@router.put("/diseases/{disease_id}", response_model=DiseaseResponse)
@track_endpoint_performance("admin", "update_disease")
async def update_disease(
    disease_id: int,
    disease: DiseaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update an existing disease (admin only)."""
    log_endpoint_activity(
        "admin",
        "update_disease",
        getattr(current_user, "email", None),
        f"disease_id={disease_id}",
    )

    db_disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not db_disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    # Update fields
    update_data = disease.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_disease, field, value)

    db.commit()
    db.refresh(db_disease)

    logger.info(f"✅ Updated disease: {db_disease.name} (ID: {disease_id})")
    return db_disease


@router.delete("/diseases/{disease_id}")
@track_endpoint_performance("admin", "delete_disease")
async def delete_disease(
    disease_id: int,
    hard_delete: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Delete a disease (admin only).

    - **hard_delete**: If True, permanently delete. If False, just deactivate.
    """
    log_endpoint_activity(
        "admin",
        "delete_disease",
        getattr(current_user, "email", None),
        f"disease_id={disease_id}",
    )

    db_disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not db_disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    if hard_delete:
        # Delete all associated classifiers and their models
        classifiers = (
            db.query(Classifier).filter(Classifier.disease_id == disease_id).all()
        )
        for classifier in classifiers:
            model_service.delete_model(classifier.id, classifier.model_file)

        db.delete(db_disease)
        logger.info(
            f"✅ Permanently deleted disease: {db_disease.name} (ID: {disease_id})"
        )
    else:
        db_disease.is_active = False
        logger.info(f"✅ Deactivated disease: {db_disease.name} (ID: {disease_id})")

    db.commit()
    return {"message": "Disease deleted successfully", "hard_delete": hard_delete}


# ============ CLASSIFIER MANAGEMENT ============


@router.post("/classifiers", response_model=ClassifierResponse)
@track_endpoint_performance("admin", "create_classifier")
async def create_classifier(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    disease_id: int = Form(...),
    modality: str = Form(...),
    model_type: Optional[str] = Form(None),
    accuracy: Optional[float] = Form(None),
    precision: Optional[float] = Form(None),
    recall: Optional[float] = Form(None),
    f1_score: Optional[float] = Form(None),
    training_samples: Optional[int] = Form(None),
    version: Optional[str] = Form(None),
    model_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Create a new classifier with model file upload (admin only).

    Uploads a .pkl model file and creates a classifier entry.
    """
    log_endpoint_activity(
        "admin", "create_classifier", getattr(current_user, "email", None), name
    )

    # Verify disease exists
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    # Validate modality
    try:
        modality_enum = ModalityType(modality)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid modality. Must be one of: {[m.value for m in ModalityType]}",
        )

    # Validate file extension
    if not model_file.filename.endswith(".pkl"):
        raise HTTPException(status_code=400, detail="Model file must be a .pkl file")

    # Create classifier entry (to get ID)
    db_classifier = Classifier(
        name=name,
        description=description,
        disease_id=disease_id,
        modality=modality_enum,
        model_file=model_file.filename,
        model_type=model_type,
        accuracy=accuracy,
        precision=precision,
        recall=recall,
        f1_score=f1_score,
        training_samples=training_samples,
        version=version,
        training_date=datetime.now(),
    )

    db.add(db_classifier)
    db.commit()
    db.refresh(db_classifier)

    try:
        # Save model file
        model_dir = Path(__file__).parent.parent / "ml_models" / str(db_classifier.id)
        model_dir.mkdir(parents=True, exist_ok=True)

        model_path = model_dir / model_file.filename
        with model_path.open("wb") as buffer:
            shutil.copyfileobj(model_file.file, buffer)

        logger.info(f"✅ Created classifier: {name} (ID: {db_classifier.id})")
        logger.info(f"✅ Saved model file to: {model_path}")

    except Exception as e:
        # Rollback if file save fails
        db.delete(db_classifier)
        db.commit()
        logger.error(f"❌ Failed to save model file: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to save model file: {str(e)}"
        )

    return db_classifier


@router.put("/classifiers/{classifier_id}", response_model=ClassifierResponse)
@track_endpoint_performance("admin", "update_classifier")
async def update_classifier(
    classifier_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    modality: Optional[str] = Form(None),
    model_type: Optional[str] = Form(None),
    accuracy: Optional[float] = Form(None),
    precision: Optional[float] = Form(None),
    recall: Optional[float] = Form(None),
    f1_score: Optional[float] = Form(None),
    training_samples: Optional[int] = Form(None),
    version: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    model_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Update an existing classifier (admin only).

    Optionally upload a new model file to replace the existing one.
    """
    log_endpoint_activity(
        "admin",
        "update_classifier",
        getattr(current_user, "email", None),
        f"classifier_id={classifier_id}",
    )

    db_classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
    if not db_classifier:
        raise HTTPException(status_code=404, detail="Classifier not found")

    # Update text fields
    if name:
        db_classifier.name = name
    if description is not None:
        db_classifier.description = description
    if modality:
        try:
            db_classifier.modality = ModalityType(modality)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid modality. Must be one of: {[m.value for m in ModalityType]}",
            )
    if model_type:
        db_classifier.model_type = model_type
    if accuracy is not None:
        db_classifier.accuracy = accuracy
    if precision is not None:
        db_classifier.precision = precision
    if recall is not None:
        db_classifier.recall = recall
    if f1_score is not None:
        db_classifier.f1_score = f1_score
    if training_samples is not None:
        db_classifier.training_samples = training_samples
    if version:
        db_classifier.version = version
    if is_active is not None:
        db_classifier.is_active = is_active

    # Update model file if provided
    if model_file:
        if not model_file.filename.endswith(".pkl"):
            raise HTTPException(
                status_code=400, detail="Model file must be a .pkl file"
            )

        try:
            # Delete old model
            model_service.delete_model(classifier_id, db_classifier.model_file)

            # Save new model
            model_dir = Path(__file__).parent.parent / "ml_models" / str(classifier_id)
            model_dir.mkdir(parents=True, exist_ok=True)

            model_path = model_dir / model_file.filename
            with model_path.open("wb") as buffer:
                shutil.copyfileobj(model_file.file, buffer)

            db_classifier.model_file = model_file.filename
            db_classifier.training_date = datetime.now()

            logger.info(f"✅ Updated model file for classifier {classifier_id}")

        except Exception as e:
            logger.error(f"❌ Failed to update model file: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update model file: {str(e)}"
            )

    db.commit()
    db.refresh(db_classifier)

    logger.info(f"✅ Updated classifier: {db_classifier.name} (ID: {classifier_id})")
    return db_classifier


@router.delete("/classifiers/{classifier_id}")
@track_endpoint_performance("admin", "delete_classifier")
async def delete_classifier(
    classifier_id: int,
    hard_delete: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Delete a classifier (admin only).

    - **hard_delete**: If True, permanently delete including model file. If False, just deactivate.
    """
    log_endpoint_activity(
        "admin",
        "delete_classifier",
        getattr(current_user, "email", None),
        f"classifier_id={classifier_id}",
    )

    db_classifier = db.query(Classifier).filter(Classifier.id == classifier_id).first()
    if not db_classifier:
        raise HTTPException(status_code=404, detail="Classifier not found")

    if hard_delete:
        # Delete model file
        model_service.delete_model(classifier_id, db_classifier.model_file)

        # Delete database entry
        db.delete(db_classifier)
        logger.info(
            f"✅ Permanently deleted classifier: {db_classifier.name} (ID: {classifier_id})"
        )
    else:
        db_classifier.is_active = False
        logger.info(
            f"✅ Deactivated classifier: {db_classifier.name} (ID: {classifier_id})"
        )

    db.commit()
    return {"message": "Classifier deleted successfully", "hard_delete": hard_delete}


@router.get("/classifiers", response_model=List[ClassifierResponse])
@track_endpoint_performance("admin", "list_all_classifiers")
async def list_all_classifiers(
    skip: int = 0,
    limit: int = 100,
    disease_id: Optional[int] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    List all classifiers (admin only).

    - **disease_id**: Filter by disease (optional)
    - **include_inactive**: Include deactivated classifiers
    """
    log_endpoint_activity(
        "admin", "list_all_classifiers", getattr(current_user, "email", None), "list"
    )

    query = db.query(Classifier)

    if disease_id:
        query = query.filter(Classifier.disease_id == disease_id)

    if not include_inactive:
        query = query.filter(Classifier.is_active == True)

    classifiers = query.offset(skip).limit(limit).all()

    logger.info(f"✅ Retrieved {len(classifiers)} classifiers")
    return classifiers
