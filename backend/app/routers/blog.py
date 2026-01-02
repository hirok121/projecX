from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
    UploadFile,
    File,
    Form,
)
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.schemas.blog import BlogCreate, BlogOut, BlogUpdate, BlogWithAuthor
from app.services.blog_service import BlogService, slugify
from app.services.user_service import UserService
from app.routers.auth import get_current_user
from app.models.user import User
from app.core.logging import app_logger
from app.services.s3_storage import S3Storage
from app.core.config import settings
import uuid

router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.get("/", response_model=List[BlogWithAuthor])
def list_blogs(
    db: Session = Depends(get_db),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    published: Optional[bool] = Query(None, description="Filter by published status"),
    q: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(20, le=100, description="Maximum number of results"),
    offset: int = Query(0, description="Offset for pagination"),
):
    """List all blogs with optional filters."""
    try:
        blogs = BlogService.list(
            db,
            author_id=author_id,
            tag=tag,
            published=published,
            q=q,
            limit=limit,
            offset=offset,
        )

        # Convert to BlogWithAuthor to include author details
        blogs_with_author = []
        for blog in blogs:
            blog_dict = {
                "id": getattr(blog, "id"),
                "title": getattr(blog, "title"),
                "slug": getattr(blog, "slug"),
                "content": getattr(blog, "content"),
                "summary": getattr(blog, "summary", None),
                "tags": getattr(blog, "tags", None),
                "published": getattr(blog, "published", False),
                "author_id": getattr(blog, "author_id"),
                "image_url": getattr(blog, "image_url", None),
                "created_at": getattr(blog, "created_at"),
                "updated_at": getattr(blog, "updated_at"),
                "author_name": (
                    getattr(blog.author, "full_name", None) if blog.author else None
                ),
                "author_email": (
                    getattr(blog.author, "email", None) if blog.author else None
                ),
            }
            blogs_with_author.append(BlogWithAuthor(**blog_dict))

        app_logger.info(f"Listed {len(blogs_with_author)} blogs")
        return blogs_with_author
    except Exception as e:
        app_logger.error(f"Error listing blogs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list blogs")


@router.get("/{id_or_slug}", response_model=BlogWithAuthor)
def get_blog(id_or_slug: str, db: Session = Depends(get_db)):
    """Get a single blog by ID or slug."""
    try:
        # Try to get by slug first
        blog = BlogService.get_by_slug_with_author(db, id_or_slug)

        # If not found and id_or_slug is numeric, try by ID
        if not blog and id_or_slug.isdigit():
            blog = BlogService.get_with_author(db, int(id_or_slug))

        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")

        # Build response with author details using getattr for SQLAlchemy fields
        response = BlogWithAuthor(
            id=getattr(blog, "id"),
            title=getattr(blog, "title"),
            slug=getattr(blog, "slug"),
            content=getattr(blog, "content"),
            summary=getattr(blog, "summary", None),
            tags=getattr(blog, "tags", None),
            published=getattr(blog, "published", False),
            author_id=getattr(blog, "author_id"),
            image_url=getattr(blog, "image_url", None),
            created_at=getattr(blog, "created_at"),
            updated_at=getattr(blog, "updated_at"),
            author_name=(
                getattr(blog.author, "full_name", None) if blog.author else None
            ),
            author_email=getattr(blog.author, "email", None) if blog.author else None,
        )

        app_logger.info(f"Retrieved blog: {blog.slug}")
        return response
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error retrieving blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve blog")


@router.post("/", response_model=BlogOut, status_code=status.HTTP_201_CREATED)
def create_blog(
    title: str = Form(...),
    slug: Optional[str] = Form(None),
    content: str = Form(...),
    summary: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    published: Optional[bool] = Form(False),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new blog post with optional image (admin only)."""
    # Check if user is admin
    is_staff = getattr(current_user, "is_staff", False)
    is_superuser = getattr(current_user, "is_superuser", False)
    if not is_staff and not is_superuser:
        raise HTTPException(
            status_code=403, detail="Only administrators can create blog posts"
        )

    try:
        # parse tags
        tags_list = [t.strip() for t in tags.split(",")] if tags else None

        # generate slug if not provided
        if not slug or slug.strip() == "":
            slug = BlogService.generate_unique_slug(db, title)
        else:
            if not BlogService.is_slug_available(db, slug):
                raise HTTPException(
                    status_code=400, detail=f"Slug '{slug}' is already taken"
                )

        image_url = None
        if image:
            # build path: <slug>/<uuid>_<filename>
            filename = f"{uuid.uuid4().hex}_{image.filename}"
            path = f"{slug}/{filename}"
            image_url = S3Storage.upload_file(
                settings.aws_s3_bucket_name, path, image.file
            )

        payload = BlogCreate(
            title=title,
            slug=slug,
            content=content,
            summary=summary,
            tags=tags_list,
            published=published,
            image_url=image_url,
        )

        blog = BlogService.create(db, payload, getattr(current_user, "id"))
        app_logger.info(
            f"Blog created by user {getattr(current_user, 'id')}: {blog.slug}"
        )
        return blog
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error creating blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create blog")


@router.put("/{blog_id}", response_model=BlogOut)
def update_blog(
    blog_id: int,
    title: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    summary: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    published: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a blog post with optional image (author or admin only)."""
    try:
        blog = BlogService.get_by_id(db, blog_id)

        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")

        # Check permissions: must be author, staff, or superuser
        blog_author_id = getattr(blog, "author_id")
        current_user_id = getattr(current_user, "id")
        is_staff = getattr(current_user, "is_staff", False)
        is_superuser = getattr(current_user, "is_superuser", False)

        if blog_author_id != current_user_id and not is_staff and not is_superuser:
            raise HTTPException(
                status_code=403, detail="Not authorized to update this blog"
            )

        # If slug is being changed, check availability
        if slug and slug != getattr(blog, "slug"):
            if not BlogService.is_slug_available(db, slug, exclude_id=blog_id):
                raise HTTPException(
                    status_code=400, detail=f"Slug '{slug}' is already taken"
                )

        # Parse tags if provided
        tags_list = None
        if tags is not None:
            tags_list = [t.strip() for t in tags.split(",")] if tags else []

        # Upload new image if provided
        image_url = None
        if image:
            filename = f"{uuid.uuid4().hex}_{image.filename}"
            current_slug = slug if slug else getattr(blog, "slug")
            path = f"{current_slug}/{filename}"
            image_url = S3Storage.upload_file(
                settings.aws_s3_bucket_name, path, image.file
            )

        # Build update payload
        payload = BlogUpdate(
            title=title,
            slug=slug,
            content=content,
            summary=summary,
            tags=tags_list,
            published=published,
            image_url=image_url,
        )

        updated_blog = BlogService.update(db, blog, payload)
        app_logger.info(f"Blog {blog_id} updated by user {current_user_id}")
        return updated_blog
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error updating blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update blog")


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a blog post (author or admin only)."""
    try:
        blog = BlogService.get_by_id(db, blog_id)

        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")

        # Check permissions: must be author, staff, or superuser
        blog_author_id = getattr(blog, "author_id")
        current_user_id = getattr(current_user, "id")
        is_staff = getattr(current_user, "is_staff", False)
        is_superuser = getattr(current_user, "is_superuser", False)

        if blog_author_id != current_user_id and not is_staff and not is_superuser:
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this blog"
            )

        BlogService.delete(db, blog)
        app_logger.info(f"Blog {blog_id} deleted by user {current_user_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error deleting blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete blog")


@router.post("/slug/generate")
def generate_slug(
    title: str = Query(..., description="Blog title to generate slug from"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a unique slug from a title (authenticated users only)."""
    try:
        slug = BlogService.generate_unique_slug(db, title)
        return {"slug": slug}
    except Exception as e:
        app_logger.error(f"Error generating slug: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate slug")


@router.get("/slug/check/{slug}")
def check_slug_availability(
    slug: str,
    exclude_id: Optional[int] = Query(
        None, description="Exclude blog ID when checking"
    ),
    db: Session = Depends(get_db),
):
    """Check if a slug is available."""
    try:
        available = BlogService.is_slug_available(db, slug, exclude_id)
        return {"available": available, "slug": slug}
    except Exception as e:
        app_logger.error(f"Error checking slug availability: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check slug availability")
