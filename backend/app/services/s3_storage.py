import boto3
from botocore.exceptions import ClientError
import mimetypes
from typing import Optional
from app.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)


class S3Storage:
    """S3-compatible storage helper for Railway buckets.

    Supports AWS S3 and S3-compatible services (like Railway's bucket).
    Uses boto3 for file operations.

    Requires environment variables:
    - AWS_ENDPOINT_URL (for Railway bucket)
    - AWS_S3_BUCKET_NAME
    - AWS_DEFAULT_REGION
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    """

    @classmethod
    def _get_s3_client(cls):
        """Initialize and return S3 client with Railway bucket configuration."""
        endpoint_url = settings.aws_endpoint_url

        # Create S3 client configuration
        config_kwargs = {
            "aws_access_key_id": settings.aws_access_key_id,
            "aws_secret_access_key": settings.aws_secret_access_key,
            "region_name": settings.aws_default_region,
        }

        # Add endpoint URL if provided (for Railway or S3-compatible services)
        if endpoint_url:
            config_kwargs["endpoint_url"] = endpoint_url

        try:
            s3_client = boto3.client("s3", **config_kwargs)
            logger.debug(
                f"S3 client initialized with endpoint: {endpoint_url or 'AWS S3'}"
            )
            return s3_client
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            raise RuntimeError(f"Failed to initialize S3 client: {str(e)}")

    @classmethod
    def upload_file(cls, bucket: Optional[str], path: str, file_obj) -> str:
        """Upload file-like object to S3 bucket and return public URL.

        Args:
            bucket: bucket name (uses default from settings if None)
            path: path inside bucket (no leading slash)
            file_obj: file-like object supporting .read() or bytes

        Returns:
            public URL string
        """
        bucket = bucket or settings.aws_s3_bucket_name

        if not bucket:
            raise RuntimeError("S3 bucket name not configured")

        s3_client = cls._get_s3_client()

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
            logger.warning(
                "Could not determine MIME type, defaulting to application/octet-stream"
            )
            content_type = "application/octet-stream"

        logger.debug(f"Uploading to S3 with Content-Type: {content_type}")

        # Read file data
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

        # Upload to S3
        try:
            extra_args = {
                "ContentType": content_type,
                "ACL": "public-read",  # Make file publicly accessible
            }

            s3_client.put_object(Bucket=bucket, Key=path, Body=data, **extra_args)

            logger.info(f"Successfully uploaded file to S3: {bucket}/{path}")

        except ClientError as e:
            logger.error(
                f"S3 upload failed: {e.response['Error']['Code']} - {e.response['Error']['Message']}"
            )
            raise RuntimeError(f"Failed to upload file to S3: {str(e)}")

        # Construct public URL
        public_url = cls.get_public_url(bucket, path)
        return public_url

    @classmethod
    def get_public_url(cls, bucket: Optional[str], path: str) -> str:
        """Generate public URL for an object in S3.

        Args:
            bucket: bucket name (uses default from settings if None)
            path: path inside bucket

        Returns:
            public URL string
        """
        bucket = bucket or settings.aws_s3_bucket_name
        endpoint_url = settings.aws_endpoint_url

        if endpoint_url:
            # For S3-compatible services (Railway), construct URL with endpoint
            base_url = endpoint_url.rstrip("/")
            public_url = f"{base_url}/{bucket}/{path}"
        else:
            # For AWS S3, use standard URL format
            region = settings.aws_default_region
            public_url = f"https://{bucket}.s3.{region}.amazonaws.com/{path}"

        return public_url

    @classmethod
    def delete_file(cls, bucket: Optional[str], path: str) -> bool:
        """Delete a file from S3 bucket.

        Args:
            bucket: bucket name (uses default from settings if None)
            path: path inside bucket

        Returns:
            bool: True if deleted successfully, False otherwise
        """
        bucket = bucket or settings.aws_s3_bucket_name

        if not bucket:
            raise RuntimeError("S3 bucket name not configured")

        s3_client = cls._get_s3_client()

        try:
            s3_client.delete_object(Bucket=bucket, Key=path)
            logger.info(f"Successfully deleted file from S3: {bucket}/{path}")
            return True
        except ClientError as e:
            logger.error(
                f"S3 delete failed: {e.response['Error']['Code']} - {e.response['Error']['Message']}"
            )
            return False

    @classmethod
    def file_exists(cls, bucket: Optional[str], path: str) -> bool:
        """Check if a file exists in S3 bucket.

        Args:
            bucket: bucket name (uses default from settings if None)
            path: path inside bucket

        Returns:
            bool: True if file exists, False otherwise
        """
        bucket = bucket or settings.aws_s3_bucket_name

        if not bucket:
            raise RuntimeError("S3 bucket name not configured")

        s3_client = cls._get_s3_client()

        try:
            s3_client.head_object(Bucket=bucket, Key=path)
            return True
        except ClientError:
            return False
