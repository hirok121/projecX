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
    """Get all diagnoses for the current user."""
    log_endpoint_activity(
        "diagnosis",
        "list_my_diagnoses",
        additional_info={"user_id": current_user.id, "disease_id": disease_id},
    )

    return DiagnosisService.get_user_diagnoses(
        db=db,
        user_id=current_user.id,
        disease_id=disease_id,
        status=status,
        skip=skip,
        limit=limit,
    )
