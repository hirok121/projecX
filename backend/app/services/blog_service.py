from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc
from app.models.blog import Blog
from app.models.user import User
from app.schemas.blog import BlogCreate, BlogUpdate
import re


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s[:255]


class BlogService:

    @staticmethod
    def create(db: Session, payload: BlogCreate, author_id: int) -> Blog:
        """Create a new blog post."""
        blog_data = payload.dict()
        blog_data["author_id"] = author_id

        blog = Blog(**blog_data)
        db.add(blog)
        db.commit()
        db.refresh(blog)
        return blog

    @staticmethod
    def get_by_id(db: Session, blog_id: int) -> Optional[Blog]:
        """Get blog by ID."""
        return db.query(Blog).filter(Blog.id == blog_id).first()

    @staticmethod
    def get_by_slug(db: Session, slug: str) -> Optional[Blog]:
        """Get blog by slug."""
        return db.query(Blog).filter(Blog.slug == slug).first()

    @staticmethod
    def get_with_author(db: Session, blog_id: int) -> Optional[Blog]:
        """Get blog with author details."""
        return (
            db.query(Blog)
            .options(joinedload(Blog.author))
            .filter(Blog.id == blog_id)
            .first()
        )

    @staticmethod
    def get_by_slug_with_author(db: Session, slug: str) -> Optional[Blog]:
        """Get blog by slug with author details."""
        return (
            db.query(Blog)
            .options(joinedload(Blog.author))
            .filter(Blog.slug == slug)
            .first()
        )

    @staticmethod
    def list(
        db: Session,
        author_id: Optional[int] = None,
        tag: Optional[str] = None,
        published: Optional[bool] = None,
        q: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Blog]:
        """List blogs with filters."""
        query = db.query(Blog)

        if author_id is not None:
            query = query.filter(Blog.author_id == author_id)

        if tag is not None:
            query = query.filter(Blog.tags.contains([tag]))

        if published is not None:
            query = query.filter(Blog.published == published)

        if q:
            like_pattern = f"%{q}%"
            query = query.filter(
                or_(
                    Blog.title.ilike(like_pattern),
                    Blog.content.ilike(like_pattern),
                    Blog.summary.ilike(like_pattern),
                )
            )

        return query.order_by(desc(Blog.created_at)).limit(limit).offset(offset).all()

    @staticmethod
    def update(db: Session, blog: Blog, payload: BlogUpdate) -> Blog:
        """Update blog post."""
        update_data = payload.dict(exclude_unset=True)

        for field, value in update_data.items():
            setattr(blog, field, value)

        db.add(blog)
        db.commit()
        db.refresh(blog)
        return blog

    @staticmethod
    def delete(db: Session, blog: Blog) -> None:
        """Delete blog post."""
        db.delete(blog)
        db.commit()

    @staticmethod
    def generate_unique_slug(db: Session, title: str) -> str:
        """Generate a unique slug from title."""
        base_slug = slugify(title)
        slug = base_slug
        counter = 1

        while db.query(Blog).filter(Blog.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    @staticmethod
    def is_slug_available(
        db: Session, slug: str, exclude_id: Optional[int] = None
    ) -> bool:
        """Check if slug is available."""
        query = db.query(Blog).filter(Blog.slug == slug)

        if exclude_id:
            query = query.filter(Blog.id != exclude_id)

        return query.first() is None
