"""
Diagnosis Router - Endpoints for diagnosis requests
"""

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.connection import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.services.diagnosis_service import DiagnosisService
from app.schemas.diagnosis import (
    DiagnosisCreate,
    DiagnosisResponse,
    DiagnosisAcknowledgement,
)
from app.core.logging import log_endpoint_activity, track_endpoint_performance
from app.core.config import settings

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


@router.post("/", response_model=DiagnosisAcknowledgement)
@track_endpoint_performance("diagnosis", "create")
def create_diagnosis(
    diagnosis_data: DiagnosisCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new diagnosis request.

    Returns immediate acknowledgement while processing happens in background.
    User will receive email and notification when complete.
    """
    log_endpoint_activity(
        "diagnosis",
        "create_diagnosis",
        additional_info={
            "user_id": current_user.id,
            "classifier_id": diagnosis_data.classifier_id,
        },
    )

    try:
        # Create diagnosis record
        diagnosis = DiagnosisService.create_diagnosis(
            db=db,
            user_id=current_user.id,
            classifier_id=diagnosis_data.classifier_id,
            name=diagnosis_data.name,
            age=diagnosis_data.age,
            sex=diagnosis_data.sex,
            input_data=diagnosis_data.input_data,
            input_file=diagnosis_data.input_file,
        )

        # Add background task to process diagnosis
        background_tasks.add_task(DiagnosisService.process_diagnosis, db, diagnosis.id)

        # Return immediate acknowledgement
        result_link = f"{settings.frontend_url}/diagnosis/{diagnosis.id}"

        return DiagnosisAcknowledgement(
            id=diagnosis.id,
            status="pending",
            message="Your diagnosis request has been received and is being processed. You will receive an email and notification when results are ready.",
            result_link=result_link,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create diagnosis: {str(e)}"
        )


@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
@track_endpoint_performance("diagnosis", "get")
def get_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a diagnosis by ID."""
    log_endpoint_activity(
        "diagnosis",
        "get_diagnosis",
        additional_info={"diagnosis_id": diagnosis_id, "user_id": current_user.id},
    )

    try:
        return DiagnosisService.get_diagnosis(
            db=db, diagnosis_id=diagnosis_id, user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/", response_model=list[DiagnosisResponse])
@track_endpoint_performance("diagnosis", "list_user")
def get_my_diagnoses(
    disease_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all diagnoses for the current user with related disease and classifier info."""
    log_endpoint_activity(
        "diagnosis",
        "list_my_diagnoses",
        additional_info={"user_id": current_user.id, "disease_id": disease_id},
    )

    diagnoses = DiagnosisService.get_user_diagnoses(
        db=db,
        user_id=current_user.id,
        disease_id=disease_id,
        status=status,
        skip=skip,
        limit=limit,
    )
    
    # Enrich with disease and classifier information
    enriched_diagnoses = []
    for diagnosis in diagnoses:
        diagnosis_dict = {
            "id": diagnosis.id,
            "user_id": diagnosis.user_id,
            "disease_id": diagnosis.disease_id,
            "classifier_id": diagnosis.classifier_id,
            "modality": diagnosis.modality,
            "name": diagnosis.name,
            "age": diagnosis.age,
            "sex": diagnosis.sex,
            "input_file": diagnosis.input_file,
            "input_data": diagnosis.input_data,
            "prediction": diagnosis.prediction,
            "confidence": diagnosis.confidence,
            "probabilities": diagnosis.probabilities,
            "status": diagnosis.status.value if diagnosis.status else None,
            "error_message": diagnosis.error_message,
            "processing_time": diagnosis.processing_time,
            "created_at": diagnosis.created_at,
            "started_at": diagnosis.started_at,
            "completed_at": diagnosis.completed_at,
            # Disease info
            "disease_name": diagnosis.disease.name if diagnosis.disease else None,
            "disease_description": diagnosis.disease.description if diagnosis.disease else None,
            "disease_blog_link": diagnosis.disease.blog_link if diagnosis.disease else None,
            # Classifier info
            "classifier_name": diagnosis.classifier.name if diagnosis.classifier else None,
            "classifier_title": diagnosis.classifier.name if diagnosis.classifier else None,
            "classifier_description": diagnosis.classifier.description if diagnosis.classifier else None,
            "classifier_blog_link": diagnosis.classifier.blog_link if diagnosis.classifier else None,
            "classifier_paper_link": diagnosis.classifier.paper_link if diagnosis.classifier else None,
        }
        enriched_diagnoses.append(diagnosis_dict)
    
    return enriched_diagnoses


@router.get("/admin/all", response_model=list[DiagnosisResponse])
@track_endpoint_performance("diagnosis", "list_all_admin")
def get_all_diagnoses_admin(
    disease_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all diagnoses (admin only) with related disease and classifier info."""
    # Check if user is admin
    if not (current_user.is_staff or current_user.is_superuser):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    log_endpoint_activity(
        "diagnosis",
        "list_all_diagnoses_admin",
        additional_info={"admin_id": current_user.id, "disease_id": disease_id},
    )

    diagnoses = DiagnosisService.get_all_diagnoses(
        db=db,
        disease_id=disease_id,
        status=status,
        skip=skip,
        limit=limit,
    )
    
    # Enrich with disease and classifier information
    enriched_diagnoses = []
    for diagnosis in diagnoses:
        diagnosis_dict = {
            "id": diagnosis.id,
            "user_id": diagnosis.user_id,
            "disease_id": diagnosis.disease_id,
            "classifier_id": diagnosis.classifier_id,
            "modality": diagnosis.modality,
            "name": diagnosis.name,
            "age": diagnosis.age,
            "sex": diagnosis.sex,
            "input_file": diagnosis.input_file,
            "input_data": diagnosis.input_data,
            "prediction": diagnosis.prediction,
            "confidence": diagnosis.confidence,
            "probabilities": diagnosis.probabilities,
            "status": diagnosis.status.value if diagnosis.status else None,
            "error_message": diagnosis.error_message,
            "processing_time": diagnosis.processing_time,
            "created_at": diagnosis.created_at,
            "started_at": diagnosis.started_at,
            "completed_at": diagnosis.completed_at,
            # Disease info
            "disease_name": diagnosis.disease.name if diagnosis.disease else None,
            "disease_description": diagnosis.disease.description if diagnosis.disease else None,
            "disease_blog_link": diagnosis.disease.blog_link if diagnosis.disease else None,
            # Classifier info
            "classifier_name": diagnosis.classifier.name if diagnosis.classifier else None,
            "classifier_title": diagnosis.classifier.name if diagnosis.classifier else None,
            "classifier_description": diagnosis.classifier.description if diagnosis.classifier else None,
            "classifier_blog_link": diagnosis.classifier.blog_link if diagnosis.classifier else None,
            "classifier_paper_link": diagnosis.classifier.paper_link if diagnosis.classifier else None,
        }
        enriched_diagnoses.append(diagnosis_dict)
    
    return enriched_diagnoses
