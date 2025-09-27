from typing import Optional
import io
import base64
import PyPDF2
from PIL import Image
from langchain_core.messages import HumanMessage
from app.core.config import settings
from app.core.logging import app_logger
from app.utils.ai_models import text_llm, vision_llm


import datetime


class FileProcessor:
    """Service class for processing uploaded files."""

    @staticmethod
    def _sanitize_metadata_for_json(metadata: dict) -> dict:
        """Convert any datetime objects to strings for JSON serialization."""
        sanitized = {}
        for key, value in metadata.items():
            if isinstance(value, datetime.datetime):
                sanitized[key] = value.isoformat()
            elif isinstance(value, datetime.date):
                sanitized[key] = value.isoformat()
            elif isinstance(value, dict):
                sanitized[key] = FileProcessor._sanitize_metadata_for_json(value)
            else:
                sanitized[key] = value
        return sanitized

    @staticmethod
    def validate_file(content_type: str, file_size: int) -> bool:
        """Validate file type and size."""
        try:
            # Check file size
            if file_size > settings.max_file_size:
                app_logger.warning(
                    f"File too large: {file_size} bytes (max: {settings.max_file_size})"
                )
                return False

            # Check content type
            if content_type not in settings.allowed_file_types:
                app_logger.warning(f"Invalid file type: {content_type}")
                return False

            return True

        except Exception as e:
            app_logger.error(f"Error validating file: {str(e)}")
            return False
    @staticmethod
    def encode_image_to_base64(image_file) -> str:
        """Convert uploaded image to base64 string"""
        try:
            image = Image.open(image_file)
            # Convert to RGB if necessary
            if image.mode != "RGB":
                image = image.convert("RGB")

            # Resize image if too large (optional)
            max_size = (1024, 1024)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)

            # Convert to base64
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            return img_base64
        except Exception as e:
            return str(e)

    @staticmethod
    async def process_image(file_content: bytes, content_type: str) -> dict:
        """Process image file and extract metadata with AI vision analysis."""
        try:
            # Encode image to base64
            img_base64 = FileProcessor.encode_image_to_base64(io.BytesIO(file_content))

            # Create message with image
            message_content = [
                {
                    "type": "text",
                    "text": """Analyze this image and provide a detailed description. Include:
1. Main subjects or objects in the image
2. Visual composition and layout
3. Colors, lighting, and visual style
4. Any text or written content visible
5. Overall mood or atmosphere
6. Notable details or interesting elements

Provide a comprehensive but concise description that would help someone understand the image without seeing it.""",
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"},
                },
            ]

            messages = [HumanMessage(content=message_content)]
            response = vision_llm.invoke(messages)

            # Open image with PIL for metadata extraction
            image = Image.open(io.BytesIO(file_content))

            # Get image metadata
            metadata = {
                "format": image.format,
                "mode": image.mode,
                "size": image.size,  # (width, height)
                "content_type": content_type,
                "file_size": len(file_content),
            }

            # Get additional EXIF data if available
            if hasattr(image, "_getexif") and image._getexif():
                exif_data = image._getexif()
                if exif_data:
                    metadata["has_exif"] = True
                else:
                    metadata["has_exif"] = False
            else:
                metadata["has_exif"] = False

            app_logger.info(
                f"Processed image: {metadata['format']} {metadata['size']} pixels"
            )


            return {
                "content": response.content,
                "metadata": metadata,
                "processing_status": "completed",
            }

        except Exception as e:
            app_logger.error(f"Error processing image: {str(e)}")
            return {
                "content": f"Error processing image: {str(e)}",
                "metadata": {"error": str(e)},
                "processing_status": "error",
            }

    @staticmethod
    def process_pdf(file_content: bytes) -> dict:
        """Process PDF file and extract text content."""
        try:
            # Create BytesIO object from file content
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)

            # Extract metadata
            metadata = {
                "num_pages": len(pdf_reader.pages),
                "content_type": "application/pdf",
                "file_size": len(file_content),
            }

            # Try to get PDF metadata
            try:
                pdf_info = pdf_reader.metadata
                if pdf_info:
                    # Convert datetime objects to strings for JSON serialization
                    creation_date = getattr(pdf_info, "creation_date", None)
                    if creation_date:
                        creation_date = creation_date.isoformat() if hasattr(creation_date, 'isoformat') else str(creation_date)
                    
                    metadata.update(
                        {
                            "title": getattr(pdf_info, "title", None),
                            "author": getattr(pdf_info, "author", None),
                            "creator": getattr(pdf_info, "creator", None),
                            "producer": getattr(pdf_info, "producer", None),
                            "creation_date": creation_date,
                        }
                    )
            except Exception:
                # Ignore metadata extraction errors
                pass

            # Extract text from all pages
            extracted_text = ""
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():
                        extracted_text += (
                            f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                        )
                except Exception as e:
                    extracted_text += f"\n--- Page {page_num + 1} (Error) ---\nError extracting text: {str(e)}\n"

            # Clean up the extracted text
            extracted_text = extracted_text.strip()

            if not extracted_text:
                extracted_text = "No text content could be extracted from this PDF."

            app_logger.info(
                f"Processed PDF: {metadata['num_pages']} pages, {len(extracted_text)} characters extracted"
            )

            message_content = [{
                "type": "text",
                "text": """Analyze this document text and provide a detailed summary. Include:
1. Main topics and themes
2. Key points and findings
3. Any notable quotes or sections
4. Overall summary in as descriptive detail as possible
Provide a detailed analysis that captures the essence of the document.""",
            }
            ,
            {
                "type": "text",
                "text": extracted_text
            }]

            processed_text = text_llm.invoke(
                [HumanMessage(content=message_content)]
            ).content

            return {
                "content": processed_text,
                "metadata": metadata,
                "processing_status": "completed",
            }

        except Exception as e:
            app_logger.error(f"Error processing PDF: {str(e)}")
            return {
                "content": f"Error processing PDF: {str(e)}",
                "metadata": {"error": str(e)},
                "processing_status": "error",
            }

    @staticmethod
    async def process_file(
        file_content: bytes, content_type: str, filename: str
    ) -> dict:
        """Process any supported file type."""
        try:
            # Validate file first
            if not FileProcessor.validate_file(content_type, len(file_content)):
                return {
                    "content": "Invalid file type or size",
                    "metadata": {"error": "Validation failed"},
                    "processing_status": "error",
                }

            # Process based on content type
            if content_type.startswith("image/"):
                result = await FileProcessor.process_image(file_content, content_type)
            elif content_type == "application/pdf":
                result = FileProcessor.process_pdf(file_content)
            else:
                return {
                    "content": f"Unsupported file type: {content_type}",
                    "metadata": {"error": f"Unsupported type: {content_type}"},
                    "processing_status": "error",
                }

            # Add common metadata
            result["metadata"]["filename"] = filename
            result["metadata"]["processed_at"] = f"{datetime.datetime.utcnow().isoformat()}Z"
            
            # Sanitize metadata for JSON serialization
            result["metadata"] = FileProcessor._sanitize_metadata_for_json(result["metadata"])

            return result

        except Exception as e:
            app_logger.error(f"Error processing file {filename}: {str(e)}")
            return {
                "content": f"Error processing file: {str(e)}",
                "metadata": {"filename": filename, "error": str(e)},
                "processing_status": "error",
            }

    @staticmethod
    def get_file_type_description(content_type: str) -> str:
        """Get user-friendly description of file type."""
        type_descriptions = {
            "image/jpeg": "JPEG Image",
            "image/png": "PNG Image",
            "image/webp": "WebP Image",
            "image/gif": "GIF Image",
            "application/pdf": "PDF Document",
        }
        return type_descriptions.get(content_type, content_type)

    @staticmethod
    def format_file_size(size_bytes: int) -> str:
        """Format file size in human-readable format."""
        size = float(size_bytes)
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
