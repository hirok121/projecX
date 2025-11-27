from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.connection import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.core.logging import track_endpoint_performance, log_endpoint_activity
import logging

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])
logger = logging.getLogger(__name__)


@router.get("/diseases")
@track_endpoint_performance("diagnosis", "get_diseases")
async def get_diseases(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Get all available diseases for diagnosis
    """
    log_endpoint_activity("diagnosis", "get_diseases", current_user.email, "list")

    # TODO: Replace with actual database query
    # For now, return sample data
    sample_diseases = [
        {
            "id": 1,
            "name": "Hepatocellular Carcinoma (HCV)",
            "category": "Hepatic",
            "description": "Liver disease diagnosis using clinical laboratory data",
            "input_type": "tabular",
            "created_at": "2025-01-01T00:00:00",
        },
        {
            "id": 2,
            "name": "Diabetes Mellitus",
            "category": "Metabolic",
            "description": "Diabetes prediction using blood test results",
            "input_type": "tabular",
            "created_at": "2025-01-01T00:00:00",
        },
        {
            "id": 3,
            "name": "Pneumonia Detection",
            "category": "Respiratory",
            "description": "Pneumonia detection from chest X-rays",
            "input_type": "xray",
            "created_at": "2025-01-01T00:00:00",
        },
    ]

    return sample_diseases


@router.get("/diseases/{disease_id}")
@track_endpoint_performance("diagnosis", "get_disease")
async def get_disease(
    disease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get specific disease by ID
    """
    log_endpoint_activity(
        "diagnosis", "get_disease", current_user.email, str(disease_id)
    )

    # TODO: Replace with actual database query
    sample_diseases = {
        1: {
            "id": 1,
            "name": "Hepatocellular Carcinoma (HCV)",
            "category": "Hepatic",
            "description": "Liver disease diagnosis using clinical laboratory data",
            "input_type": "tabular",
            "required_features": [
                "Age",
                "Sex",
                "ALB",
                "ALP",
                "ALT",
                "AST",
                "BIL",
                "CHE",
                "CHOL",
                "CREA",
                "GGT",
                "PROT",
            ],
            "created_at": "2025-01-01T00:00:00",
        },
        2: {
            "id": 2,
            "name": "Diabetes Mellitus",
            "category": "Metabolic",
            "description": "Diabetes prediction using blood test results",
            "input_type": "tabular",
            "required_features": ["Age", "BMI", "BloodPressure", "Glucose", "Insulin"],
            "created_at": "2025-01-01T00:00:00",
        },
        3: {
            "id": 3,
            "name": "Pneumonia Detection",
            "category": "Respiratory",
            "description": "Pneumonia detection from chest X-rays",
            "input_type": "xray",
            "created_at": "2025-01-01T00:00:00",
        },
    }

    if disease_id not in sample_diseases:
        raise HTTPException(status_code=404, detail="Disease not found")

    return sample_diseases[disease_id]


@router.get("/diseases/{disease_id}/classifiers")
@track_endpoint_performance("diagnosis", "get_classifiers")
async def get_disease_classifiers(
    disease_id: int,
    modality: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all classifiers for a specific disease
    Optionally filter by modality
    """
    log_endpoint_activity(
        "diagnosis", "get_classifiers", current_user.email, f"disease_{disease_id}"
    )

    # TODO: Replace with actual database query
    sample_classifiers = {
        1: [
            {
                "id": 1,
                "name": "Random Forest Classifier",
                "disease_id": 1,
                "model_type": "RandomForest",
                "accuracy": 0.92,
                "description": "Ensemble model with high accuracy",
                "modality": "tabular",
                "created_at": "2025-01-01T00:00:00",
            },
            {
                "id": 2,
                "name": "Gradient Boosting Model",
                "disease_id": 1,
                "model_type": "GradientBoosting",
                "accuracy": 0.89,
                "description": "Boosting algorithm for liver disease",
                "modality": "tabular",
                "created_at": "2025-01-01T00:00:00",
            },
        ],
        2: [
            {
                "id": 3,
                "name": "Logistic Regression",
                "disease_id": 2,
                "model_type": "LogisticRegression",
                "accuracy": 0.85,
                "description": "Simple and interpretable model",
                "modality": "tabular",
                "created_at": "2025-01-01T00:00:00",
            }
        ],
        3: [
            {
                "id": 4,
                "name": "CNN Pneumonia Detector",
                "disease_id": 3,
                "model_type": "CNN",
                "accuracy": 0.94,
                "description": "Deep learning model for X-ray analysis",
                "modality": "xray",
                "created_at": "2025-01-01T00:00:00",
            }
        ],
    }

    if disease_id not in sample_classifiers:
        return []

    classifiers = sample_classifiers[disease_id]

    # Filter by modality if provided
    if modality:
        classifiers = [
            c for c in classifiers if c.get("modality", "").lower() == modality.lower()
        ]

    return classifiers


@router.post("/predict")
@track_endpoint_performance("diagnosis", "predict")
async def predict(
    disease_id: int = Form(...),
    classifier_ids: str = Form(...),  # JSON string of list
    input_data: Optional[str] = Form(None),  # JSON string for tabular data
    image: Optional[UploadFile] = File(None),  # For image modalities
    modality: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run prediction using selected classifiers
    """
    import json

    log_endpoint_activity(
        "diagnosis", "predict", current_user.email, f"disease_{disease_id}"
    )

    # Parse classifier IDs
    try:
        classifier_id_list = json.loads(classifier_ids)
    except:
        raise HTTPException(status_code=400, detail="Invalid classifier_ids format")

    # TODO: Implement actual prediction logic
    # For now, return mock results
    results = []
    for classifier_id in classifier_id_list:
        result = {
            "id": len(results) + 1,
            "user_id": current_user.id,
            "disease_id": disease_id,
            "classifier_id": classifier_id,
            "classifier_name": f"Model {classifier_id}",
            "prediction": "Positive" if classifier_id % 2 == 0 else "Negative",
            "confidence_score": 0.85 + (classifier_id * 0.02),
            "created_at": "2025-11-26T18:30:00",
        }
        results.append(result)

    logger.info(
        f"✅ Prediction completed for user {current_user.email} - {len(results)} results"
    )

    return results


@router.get("/predictions/{prediction_id}")
@track_endpoint_performance("diagnosis", "get_prediction")
async def get_prediction_result(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get specific prediction result by ID
    """
    log_endpoint_activity(
        "diagnosis", "get_prediction", current_user.email, str(prediction_id)
    )

    # TODO: Replace with actual database query
    result = {
        "id": prediction_id,
        "user_id": current_user.id,
        "disease_id": 1,
        "classifier_id": 1,
        "classifier_name": "Random Forest Classifier",
        "prediction": "Positive",
        "confidence_score": 0.87,
        "created_at": "2025-11-26T18:30:00",
    }

    return result


@router.get("/predictions/user/{user_id}")
@track_endpoint_performance("diagnosis", "get_user_predictions")
async def get_user_predictions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all predictions for a specific user
    """
    # Check if requesting own data or is admin
    if current_user.id != user_id and not current_user.is_staff:
        raise HTTPException(status_code=403, detail="Not authorized to view this data")

    log_endpoint_activity(
        "diagnosis", "get_user_predictions", current_user.email, str(user_id)
    )

    # TODO: Replace with actual database query
    return []


@router.get("/predictions")
@track_endpoint_performance("diagnosis", "get_all_predictions")
async def get_all_predictions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Get all predictions (admin only)
    """
    if not current_user.is_staff:
        raise HTTPException(status_code=403, detail="Admin access required")

    log_endpoint_activity(
        "diagnosis", "get_all_predictions", current_user.email, "admin"
    )

    # TODO: Replace with actual database query
    return []
