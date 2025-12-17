from typing import List, Optional
from pydantic import BaseModel, validator
from datetime import datetime
import re


class BlogBase(BaseModel):
    title: str
    slug: str
    content: str
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = False
    image_url: Optional[str] = None

    @validator("slug")
    def validate_slug(cls, v):
        if not v:
            raise ValueError("Slug cannot be empty")
        # Ensure slug is URL-safe
        if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", v):
            raise ValueError("Slug must be lowercase alphanumeric with hyphens only")
        return v


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    image_url: Optional[str] = None

    @validator("slug")
    def validate_slug(cls, v):
        if v is not None and v != "":
            if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", v):
                raise ValueError(
                    "Slug must be lowercase alphanumeric with hyphens only"
                )
        return v


class BlogOut(BlogBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class BlogWithAuthor(BlogOut):
    """Blog response with author details."""

    author_name: Optional[str] = None
    author_email: Optional[str] = None

    class Config:
        orm_mode = True
