import requests
import mimetypes
from typing import Optional
from app.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)


class SupabaseStorage:
    """Minimal Supabase Storage helper using HTTP API and service role key.

    Requires `settings.supabase_url` and `settings.supabase_service_role_key`.
    Assumes the bucket is public; constructs a public URL of the form:
    {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
    """

    @classmethod
    def upload_file(cls, bucket: Optional[str], path: str, file_obj) -> str:
        """Upload file-like object to Supabase storage and return public URL.

        Args:
            bucket: bucket name (default from settings)
            path: path inside bucket (no leading slash)
            file_obj: file-like object supporting .read() or bytes

        Returns:
            public URL string
        """
        bucket = bucket or settings.supabase_public_bucket
        supabase_url = settings.supabase_url
        service_key = settings.supabase_service_role_key

        if not supabase_url or not service_key:
            raise RuntimeError("Supabase URL or service role key not configured")

        upload_url = f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{path}"

        headers = {"Authorization": f"Bearer {service_key}"}

        # Determine content type: prefer UploadFile.content_type, then filename guess
        content_type = None
        # file_obj may be a FastAPI UploadFile (has .content_type and .filename)
        if hasattr(file_obj, "content_type") and getattr(file_obj, "content_type"):
            content_type = file_obj.content_type
        else:
            filename = None
            if hasattr(file_obj, "filename") and getattr(file_obj, "filename"):
                filename = file_obj.filename
            elif isinstance(path, str):
                # fall back to path (which may contain extension)
                filename = path

            if filename:
                guessed, _ = mimetypes.guess_type(filename)
                content_type = guessed

        if not content_type:
            logger.error(
                "Could not determine MIME type for upload (no filename or content_type)"
            )
            raise RuntimeError(
                "Could not determine MIME type for upload. Ensure the uploaded file has a filename with a recognized extension."
            )

        headers["Content-Type"] = content_type
        logger.debug(f"Uploading to Supabase with Content-Type: {content_type}")

        # If file_obj is bytes
        if isinstance(file_obj, (bytes, bytearray)):
            data = file_obj
        else:
            # file_obj is UploadFile or file-like
            try:
                data = file_obj.read()
            except Exception:
                # Fallback to reading from file path
                if hasattr(file_obj, "filename") and os.path.exists(file_obj.filename):
                    with open(file_obj.filename, "rb") as f:
                        data = f.read()
                else:
                    raise

        resp = requests.post(upload_url, data=data, headers=headers)
        if resp.status_code not in (200, 201):
            logger.error(f"Supabase upload failed: {resp.status_code} {resp.text}")
            raise RuntimeError(f"Failed to upload file to Supabase: {resp.status_code}")

        # Construct public URL (assumes public bucket)
        public_url = (
            f"{supabase_url.rstrip('/')}/storage/v1/object/public/{bucket}/{path}"
        )
        return public_url
