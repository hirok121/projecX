from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    
    @validator('phone_number')
    def validate_phone_number(cls, v):
        if v is not None:
            # Remove all non-digit characters for validation
            digits_only = re.sub(r'\D', '', v)
            # Check if it's a valid phone number (10-15 digits)
            if not re.match(r'^\d{10,15}$', digits_only):
                raise ValueError('Phone number must contain 10-15 digits')
        return v


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None


class UserInDB(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    is_email_verified: bool
    is_phone_verified: bool
    is_staff: bool
    provider: str
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class User(UserInDB):
    pass


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class GoogleUser(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    verified_email: bool


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class PasswordResetResponse(BaseModel):
    message: str
    success: bool


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        return v


class ChangePasswordResponse(BaseModel):
    message: str
    success: bool


class GoogleCallbackRequest(BaseModel):
    code: str


class RegistrationResponse(BaseModel):
    message: str
    email: str


class VerificationRequest(BaseModel):
    token: str


class VerificationResponse(BaseModel):
    message: str
    email: str