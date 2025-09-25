from pydantic_settings import BaseSettings
from typing import Optional


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
    
    # Email settings
    smtp_enabled: bool = False
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_tls: bool = True
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    smtp_from_name: str = "ProjectX"

    # Superuser settings
    superuser_email: str = ""
    superuser_key: str = ""
    
    class Config:
        env_file = ".env"


settings = Settings()