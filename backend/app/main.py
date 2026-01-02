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
    blog,
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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        settings.frontend_url,
    ],
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
app.include_router(blog.router)


@app.get("/")
def read_root():
    """Root endpoint."""
    app_logger.info("Root endpoint accessed")
    return {"message": "The DeepMed Backend server is running!"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/debug/logs")
def get_recent_logs():
    """Get recent log files (Railway: shows what's in container, won't persist)."""
    from pathlib import Path
    import os

    log_dir = Path("logs")
    logs_info = {
        "log_dir_exists": log_dir.exists(),
        "log_dir_path": str(log_dir.absolute()),
        "files": [],
    }

    if log_dir.exists():
        for log_file in log_dir.glob("*.log*"):
            try:
                size = os.path.getsize(log_file)
                # Read last 50 lines
                with open(log_file, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    last_lines = lines[-50:] if len(lines) > 50 else lines

                logs_info["files"].append(
                    {
                        "name": log_file.name,
                        "size_bytes": size,
                        "last_50_lines": last_lines,
                    }
                )
            except Exception as e:
                logs_info["files"].append({"name": log_file.name, "error": str(e)})

    return logs_info
