from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    # App settings
    app_name: str = "ProjectX"
    app_description: str = "A modern web application with FastAPI and React"
    app_version: str = "1.0.0"

    # Security settings
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    verification_token_expire_hours: int = 24

    # Database settings
    database_url: str = "sqlite:///./app.db"

    # Google OAuth settings
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:5173/auth/google/callback"

    # Frontend settings
    frontend_url: str = "http://localhost:5173"

    # Brevo Email API settings
    brevo_api_key: Optional[str] = None
    brevo_from_email: Optional[str] = None
    brevo_from_name: str = "DeepMed"

    # Superuser settings
    superuser_email: str = ""
    superuser_key: str = ""

    # AI Assistant settings
    groq_api_key: Optional[str] = None
    groq_model: str = "llama-3.3-70b-versatile"
    groq_temperature: float = 0.7
    llama_vision_model: str = (
        "meta-llama/llama-4-maverick-17b-128e-instruct"  # For image processing
    )
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_types: list = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
    ]
    max_tokens: int = 4000

    # ML Models storage settings (Railway volume mounted at /app/backend/classifiers)
    # Root directory in Railway is /backend, so paths are relative to /app/backend
    ml_models_path: str = "classifiers"  # Will be /app/backend/classifiers in Railway

    # AWS S3 / Railway Bucket storage settings
    aws_endpoint_url: Optional[str] = None  # For S3-compatible services like Railway
    aws_s3_bucket_name: Optional[str] = None
    aws_default_region: str = "us-east-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None

    # Supabase storage (deprecated - use S3 storage instead)
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    supabase_public_bucket: str = "blogs"

    class Config:
        env_file = ".env"


settings = Settings()
