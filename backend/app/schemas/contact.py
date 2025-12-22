from pydantic import BaseModel, EmailStr


class ContactMessage(BaseModel):
    """Schema for contact form submission."""

    name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    """Schema for contact form response."""

    status: str
    message: str
