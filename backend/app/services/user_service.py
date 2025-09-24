from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import Optional
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, GoogleUser
from app.core.security import get_password_hash, verify_password


class UserService:
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
        """Get user by Google ID."""
        return db.query(User).filter(User.google_id == google_id).first()
    
    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """Create a new user with email and password."""
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            hashed_password=hashed_password,
            bio=user.bio,
            location=user.location,
            website=user.website,
            provider="local",
            is_verified=False  # Email verification can be added later
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def link_password_to_oauth_user(db: Session, user: User, password: str) -> User:
        """Link a password to an existing OAuth user."""
        hashed_password = get_password_hash(password)
        user.hashed_password = hashed_password
        user.provider = "both"  # Now supports both login methods
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def create_google_user(db: Session, google_user: GoogleUser) -> User:
        """Create a new user from Google OAuth."""
        username = google_user.email.split('@')[0]  # Generate username from email
        db_user = User(
            email=google_user.email,
            username=username,
            full_name=google_user.name,
            google_id=google_user.id,
            provider="google",
            avatar_url=google_user.picture,
            is_verified=google_user.verified_email,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = UserService.get_user_by_email(db, email)
        if not user or not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user information."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def update_last_login(db: Session, user_id: int) -> None:
        """Update user's last login timestamp."""
        user = UserService.get_user_by_id(db, user_id)
        if user:
            user.last_login = datetime.utcnow()
            db.commit()
    
    @staticmethod
    def deactivate_user(db: Session, user_id: int) -> Optional[User]:
        """Deactivate a user account."""
        user = UserService.get_user_by_id(db, user_id)
        if user:
            user.is_active = False
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def activate_user(db: Session, user_id: int) -> Optional[User]:
        """Activate a user account."""
        user = UserService.get_user_by_id(db, user_id)
        if user:
            user.is_active = True
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
        return user