from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    auth,
    users,
    aiassistant,
    admin_diagnosis,
    disease,
    classifier,
    notification,
    diagnosis,
)
from app.core.config import settings
from app.core.logging import app_logger
from app.middleware.logging import LoggingMiddleware
from app.db.connection import init_db

# Initialize database
init_db()

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["localhost", settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(aiassistant.router)
app.include_router(disease.router)
app.include_router(classifier.router)
app.include_router(diagnosis.router)
app.include_router(notification.router)
app.include_router(admin_diagnosis.router)


@app.get("/")
def read_root():
    """Root endpoint."""
    app_logger.info("Root endpoint accessed")
    return {"message": "The DeepMed Backend server is running!"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
