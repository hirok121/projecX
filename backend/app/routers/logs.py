"""
Logs management router for admin users
Provides endpoints to view, download, and manage application logs
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from pathlib import Path
import zipfile
import io
import os
from typing import List, Dict
from datetime import datetime

from app.db.connection import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.core.logging import log_endpoint_activity, track_endpoint_performance
import logging

logger = logging.getLogger("admin")

router = APIRouter(prefix="/admin/logs", tags=["admin-logs"])

# Path to logs directory
LOGS_DIR = Path(__file__).parent.parent.parent / "classifiers" / "logs"


def require_admin(current_user: User = Depends(get_current_user)):
    """Verify user is admin/staff"""
    if not (
        getattr(current_user, "is_staff", False)
        or getattr(current_user, "is_superuser", False)
    ):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/list")
@track_endpoint_performance("admin", "list_logs")
def list_log_files(
    current_user: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """
    List all available log files with metadata
    Returns: List of log files with size and last modified time
    """
    log_endpoint_activity(
        "admin", "list_logs", user_email=getattr(current_user, "email", None)
    )

    try:
        if not LOGS_DIR.exists():
            return {"files": [], "total": 0}

        log_files = []
        for file_path in LOGS_DIR.glob("*.log*"):
            if file_path.is_file():
                stat = file_path.stat()
                log_files.append(
                    {
                        "name": file_path.name,
                        "size": stat.st_size,
                        "size_mb": round(stat.st_size / (1024 * 1024), 2),
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "path": str(file_path.relative_to(LOGS_DIR.parent)),
                    }
                )

        # Sort by modified time (newest first)
        log_files.sort(key=lambda x: x["modified"], reverse=True)

        return {
            "files": log_files,
            "total": len(log_files),
            "total_size_mb": round(
                sum(f["size"] for f in log_files) / (1024 * 1024), 2
            ),
        }

    except Exception as e:
        logger.error(f"Error listing log files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing logs: {str(e)}")


@router.get("/download/{filename}")
@track_endpoint_performance("admin", "download_log")
def download_log_file(
    filename: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Download a specific log file
    """
    log_endpoint_activity(
        "admin",
        "download_log",
        user_email=getattr(current_user, "email", None),
        additional_info={"filename": filename},
    )

    try:
        # Security: prevent directory traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")

        file_path = LOGS_DIR / filename

        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Log file not found")

        return FileResponse(path=file_path, filename=filename, media_type="text/plain")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading log file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading log: {str(e)}")


@router.get("/download-all")
@track_endpoint_performance("admin", "download_all_logs")
def download_all_logs(
    current_user: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """
    Download all log files as a ZIP archive
    """
    log_endpoint_activity(
        "admin", "download_all_logs", user_email=getattr(current_user, "email", None)
    )

    try:
        if not LOGS_DIR.exists():
            raise HTTPException(status_code=404, detail="Logs directory not found")

        # Create ZIP file in memory
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            # Add all log files to ZIP
            log_files = list(LOGS_DIR.glob("*.log*"))

            if not log_files:
                raise HTTPException(status_code=404, detail="No log files found")

            for file_path in log_files:
                if file_path.is_file():
                    # Add file to ZIP with relative path
                    zip_file.write(file_path, arcname=file_path.name)

        # Seek to beginning of buffer
        zip_buffer.seek(0)

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"logs_{timestamp}.zip"

        logger.info(f"Created log archive {filename} for user {current_user.email}")

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating log archive: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating archive: {str(e)}")


@router.get("/view/{filename}")
@track_endpoint_performance("admin", "view_log")
def view_log_file(
    filename: str,
    lines: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    View the last N lines of a log file
    Args:
        filename: Name of the log file
        lines: Number of lines to return (default: 100, max: 1000)
    """
    log_endpoint_activity(
        "admin",
        "view_log",
        user_email=getattr(current_user, "email", None),
        additional_info={"filename": filename, "lines": lines},
    )

    try:
        # Security: prevent directory traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")

        # Limit lines to prevent memory issues
        lines = min(lines, 1000)

        file_path = LOGS_DIR / filename

        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Log file not found")

        # Read last N lines efficiently
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            # For large files, use efficient tail approach
            all_lines = f.readlines()
            last_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines

        return {
            "filename": filename,
            "lines": last_lines,
            "total_lines": len(all_lines),
            "showing": len(last_lines),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error viewing log file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error viewing log: {str(e)}")


@router.delete("/clear/{filename}")
@track_endpoint_performance("admin", "clear_log")
def clear_log_file(
    filename: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Clear (truncate) a specific log file
    WARNING: This will delete all content from the log file
    """
    log_endpoint_activity(
        "admin",
        "clear_log",
        user_email=getattr(current_user, "email", None),
        additional_info={"filename": filename},
    )

    # Additional security: only superusers can clear logs
    if not getattr(current_user, "is_superuser", False):
        raise HTTPException(status_code=403, detail="Superuser access required")

    try:
        # Security: prevent directory traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")

        file_path = LOGS_DIR / filename

        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Log file not found")

        # Truncate the file
        with open(file_path, "w") as f:
            f.write("")

        logger.warning(f"Log file {filename} cleared by {current_user.email}")

        return {
            "message": f"Log file {filename} cleared successfully",
            "filename": filename,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing log file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error clearing log: {str(e)}")
