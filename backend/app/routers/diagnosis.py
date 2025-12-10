from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import numpy as np
import json
from datetime import datetime
import logging
import time
import shutil
from pathlib import Path

from app.db.connection import get_db
from app.models.user import User
from app.models.disease import Disease
from app.models.classifier import Classifier
from app.models.prediction import PredictionResult, PredictionStatus
from app.routers.auth import get_current_user
from app.core.logging import track_endpoint_performance, log_endpoint_activity
from app.schemas.diagnosis import (
    DiseaseResponse,
    ClassifierResponse,
    PredictionResponse,
    PredictionListResponse,
)
from app.services.model_service import model_service

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])
logger = logging.getLogger(__name__)

# Upload directory for user files
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads" / "predictions"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/diseases", response_model=List[DiseaseResponse])
@track_endpoint_performance("diagnosis", "get_diseases")
async def get_diseases(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all available diseases for diagnosis.

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **category**: Filter by disease category (optional)
    """
    log_endpoint_activity(
        "diagnosis", "get_diseases", getattr(current_user, "email", None), "list"
    )

    query = db.query(Disease).filter(Disease.is_active == True)

    if category:
        query = query.filter(Disease.category == category)

    diseases = query.offset(skip).limit(limit).all()

    logger.info(f"✅ Retrieved {len(diseases)} diseases")
    return diseases


@router.get("/diseases/{disease_id}", response_model=DiseaseResponse)
@track_endpoint_performance("diagnosis", "get_disease")
async def get_disease(
    disease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed information about a specific disease."""
    log_endpoint_activity(
        "diagnosis",
        "get_disease",
        getattr(current_user, "email", None),
        f"disease_id={disease_id}",
    )

    disease = (
        db.query(Disease)
        .filter(Disease.id == disease_id, Disease.is_active == True)
        .first()
    )

    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    return disease


@router.get(
    "/diseases/{disease_id}/classifiers", response_model=List[ClassifierResponse]
)
@track_endpoint_performance("diagnosis", "get_classifiers")
async def get_disease_classifiers(
    disease_id: int,
    modality: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all available classifiers for a disease.

    - **disease_id**: ID of the disease
    - **modality**: Filter by modality type (MRI, CT, X-Ray, Tabular)
    """
    log_endpoint_activity(
        "diagnosis",
        "get_classifiers",
        getattr(current_user, "email", None),
        f"disease_id={disease_id}",
    )

    # Verify disease exists
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    query = db.query(Classifier).filter(
        Classifier.disease_id == disease_id, Classifier.is_active == True
    )

    if modality:
        query = query.filter(Classifier.modality == modality)

    classifiers = query.all()

    logger.info(f"✅ Retrieved {len(classifiers)} classifiers for disease {disease_id}")
    return classifiers


@router.post("/predict")
@track_endpoint_performance("diagnosis", "predict")
async def predict(
    disease_id: int = Form(...),
    classifier_ids: str = Form(...),  # JSON string of list
    modality: str = Form(...),
    image: Optional[UploadFile] = File(None),
    input_data: Optional[str] = Form(None),  # JSON string
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Make a prediction using selected classifiers.

    - **disease_id**: ID of the disease
    - **classifier_ids**: JSON array of classifier IDs to use
    - **modality**: Modality type (MRI, CT, X-Ray, Tabular)
    - **image**: Image file for image-based predictions (optional)
    - **input_data**: JSON object with tabular data (optional)
    """
    start_time = time.time()
    log_endpoint_activity(
        "diagnosis",
        "predict",
        getattr(current_user, "email", None),
        f"disease_id={disease_id}",
    )

    # Parse classifier IDs
    try:
        classifier_id_list = json.loads(classifier_ids)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid classifier_ids format")

    # Verify disease exists
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    results = []

    for classifier_id in classifier_id_list:
        # Get classifier
        classifier = (
            db.query(Classifier)
            .filter(
                Classifier.id == classifier_id,
                Classifier.disease_id == disease_id,
                Classifier.is_active == True,
            )
            .first()
        )

        if not classifier:
            logger.warning(f"⚠️ Classifier {classifier_id} not found or inactive")
            continue

        # Create prediction record
        prediction_record = PredictionResult(
            user_id=current_user.id,
            disease_id=disease_id,
            classifier_id=classifier_id,
            modality=modality,
            status=PredictionStatus.PENDING,
        )

        try:
            # Handle image upload
            if image and modality in ["MRI", "CT", "X-Ray"]:
                # Save uploaded file
                file_extension = image.filename.split(".")[-1]
                filename = f"{current_user.id}_{disease_id}_{classifier_id}_{int(time.time())}.{file_extension}"
                file_path = UPLOAD_DIR / filename

                with file_path.open("wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)

                prediction_record.input_file = str(file_path)

                # TODO: Process image and extract features
                # For now, use dummy features
                features = np.random.rand(1, 10)

            elif input_data and modality == "Tabular":
                # Parse tabular data
                try:
                    data_dict = json.loads(input_data)
                    prediction_record.input_data = data_dict

                    # Convert to numpy array (preserve feature order from required_features)
                    if disease.required_features:
                        features_list = [
                            float(data_dict.get(key, 0))
                            for key in disease.required_features.keys()
                        ]
                        features = np.array([features_list])
                    else:
                        features = np.array([list(data_dict.values())])

                except (json.JSONDecodeError, ValueError) as e:
                    raise HTTPException(
                        status_code=400, detail=f"Invalid input_data: {str(e)}"
                    )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Missing required input (image or input_data)",
                )

            # Make prediction
            prediction, confidence, probabilities = model_service.predict(
                classifier_id=classifier_id,
                model_file=classifier.model_file,
                input_data=features,
            )

            # Update prediction record
            prediction_record.prediction = prediction
            prediction_record.confidence = confidence
            prediction_record.probabilities = probabilities
            prediction_record.status = PredictionStatus.COMPLETED
            prediction_record.completed_at = datetime.now()
            prediction_record.processing_time = time.time() - start_time

            logger.info(f"✅ Prediction successful: {prediction} ({confidence:.2%})")

        except Exception as e:
            logger.error(f"❌ Prediction failed: {str(e)}")
            prediction_record.status = PredictionStatus.FAILED
            prediction_record.error_message = str(e)
            prediction_record.processing_time = time.time() - start_time

        # Save to database
        db.add(prediction_record)
        db.commit()
        db.refresh(prediction_record)

        results.append(prediction_record.id)

    if not results:
        raise HTTPException(status_code=400, detail="No valid classifiers found")

    return {"prediction_ids": results, "message": "Predictions completed"}


@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
@track_endpoint_performance("diagnosis", "get_prediction")
async def get_prediction_result(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific prediction result."""
    log_endpoint_activity(
        "diagnosis",
        "get_prediction",
        getattr(current_user, "email", None),
        f"prediction_id={prediction_id}",
    )

    prediction = (
        db.query(PredictionResult)
        .filter(
            PredictionResult.id == prediction_id,
            PredictionResult.user_id == current_user.id,
        )
        .first()
    )

    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return prediction


@router.get("/predictions/user/{user_id}", response_model=PredictionListResponse)
@track_endpoint_performance("diagnosis", "get_user_predictions")
async def get_user_predictions(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all predictions for a specific user (user can only access their own)."""
    log_endpoint_activity(
        "diagnosis",
        "get_user_predictions",
        getattr(current_user, "email", None),
        f"user_id={user_id}",
    )

    # Users can only view their own predictions (unless admin)
    user_current_id = getattr(current_user, "id", None)
    is_staff = getattr(current_user, "is_staff", False)
    is_superuser = getattr(current_user, "is_superuser", False)

    if user_current_id != user_id and not (is_staff or is_superuser):
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(PredictionResult).filter(PredictionResult.user_id == user_id)

    total = query.count()
    predictions = (
        query.order_by(PredictionResult.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"predictions": predictions, "total": total}


@router.get("/predictions", response_model=PredictionListResponse)
@track_endpoint_performance("diagnosis", "get_all_predictions")
async def get_all_predictions(
    skip: int = 0,
    limit: int = 50,
    disease_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all predictions (admin only).

    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    - **disease_id**: Filter by disease (optional)
    - **status**: Filter by status (pending, completed, failed)
    """
    # Admin only
    if not (
        getattr(current_user, "is_staff", False)
        or getattr(current_user, "is_superuser", False)
    ):
        raise HTTPException(status_code=403, detail="Admin access required")

    log_endpoint_activity(
        "diagnosis",
        "get_all_predictions",
        getattr(current_user, "email", None),
        "admin_list",
    )

    query = db.query(PredictionResult)

    if disease_id:
        query = query.filter(PredictionResult.disease_id == disease_id)

    if status:
        query = query.filter(PredictionResult.status == status)

    total = query.count()
    predictions = (
        query.order_by(PredictionResult.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"predictions": predictions, "total": total}
