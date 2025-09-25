from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import Optional
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, GoogleUser
from app.utils.security import get_password_hash, verify_password, is_super_user


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
        """Create a new user with email verification required (inactive by default)."""
        hashed_password = get_password_hash(user.password)
        
        # Extract username from email (part before @)
        username = user.email.split('@')[0]
        
        # Check if username already exists, if so, make it unique
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            # Add a number to make it unique
            counter = 1
            base_username = username
            while existing_user:
                username = f"{base_username}{counter}"
                existing_user = db.query(User).filter(User.username == username).first()
                counter += 1
        
        db_user = User(
            email=user.email,
            username=username,
            full_name=user.full_name,
            hashed_password=hashed_password,
            provider="local",
            is_active=True,  # Active by default
            is_superuser=is_super_user(user.email),
            is_email_verified=False,
            is_phone_verified=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def link_password_to_oauth_user(db: Session, user: User, password: str) -> User:
        """Link a password to an existing OAuth user."""
        hashed_password = get_password_hash(password)
        # Use SQLAlchemy update to avoid type checker issues
        db.query(User).filter(User.id == user.id).update({
            User.hashed_password: hashed_password,
            User.provider: "both",
            User.updated_at: datetime.utcnow()
        })
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def create_google_user(db: Session, google_user: GoogleUser) -> User:
        """Create a new user from Google OAuth."""
        username = google_user.email.split('@')[0]  # Generate username from email
        
        # Extract values to avoid type checker issues with GoogleUser attributes
        verified_email = bool(getattr(google_user, 'verified_email', True))
        
        db_user = User(
            email=google_user.email,
            username=username,
            full_name=google_user.name,
            google_id=google_user.id,
            provider="google",
            avatar_url=google_user.picture,
            is_email_verified=verified_email,
            is_active=verified_email,
            is_superuser=is_super_user(google_user.email)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        
        # Use getattr to safely access hashed_password
        hashed_password = getattr(user, 'hashed_password', None)
        if not hashed_password:
            return None
            
        if not verify_password(password, hashed_password):
            return None
        return user
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user information."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        update_data = user_update.model_dump(exclude_unset=True)
        
        # Map field names to SQLAlchemy columns for safe update
        column_updates = {}
        for field, value in update_data.items():
            if hasattr(User, field):
                column_updates[getattr(User, field)] = value
        
        # Always update the timestamp
        column_updates[User.updated_at] = datetime.utcnow()
        
        # Use SQLAlchemy update to avoid type issues
        db.query(User).filter(User.id == user_id).update(column_updates)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def update_last_login(db: Session, user_id: int) -> None:
        """Update user's last login timestamp."""
        db.query(User).filter(User.id == user_id).update({
            User.last_login: datetime.utcnow()
        })
        db.commit()
    
    @staticmethod
    def activate_user(db: Session, user_id: int) -> Optional[User]:
        """Activate a user account."""
        user = UserService.get_user_by_id(db, user_id)
        if user:
            db.query(User).filter(User.id == user_id).update({
                User.is_active: True,
                User.updated_at: datetime.utcnow()
            })
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def deactivate_user(db: Session, user_id: int) -> Optional[User]:
        """Deactivate a user account."""
        user = UserService.get_user_by_id(db, user_id)
        if user:
            db.query(User).filter(User.id == user_id).update({
                User.is_active: False,
                User.updated_at: datetime.utcnow()
            })
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def verify_user_email(db: Session, email: str) -> Optional[User]:
        """Verify user email and activate account."""
        user = UserService.get_user_by_email(db, email)
        if user:
            # Use SQLAlchemy query to update the user
            db.query(User).filter(User.email == email).update({
                User.is_email_verified: True,
                User.is_active: True,
                User.updated_at: datetime.utcnow()
            })
            db.commit()
            # Refresh the user object to get updated values
            db.refresh(user)
        return user
    
    @staticmethod
    def reset_user_password(db: Session, email: str, new_password: str) -> Optional[User]:
        """Reset user password."""
        user = UserService.get_user_by_email(db, email)
        if user:
            hashed_password = get_password_hash(new_password)
            db.query(User).filter(User.email == email).update({
                User.hashed_password: hashed_password,
                User.updated_at: datetime.utcnow()
            })
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def change_user_password(db: Session, user_id: int, current_password: str, new_password: str) -> Optional[User]:
        """Change user password after verifying current password."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Get current hashed password safely
        current_hashed = getattr(user, 'hashed_password', None)
        if not current_hashed:
            return None  # User has no password (OAuth only)
        
        # Verify current password
        if not verify_password(current_password, current_hashed):
            return None  # Current password is incorrect
        
        # Update to new password
        new_hashed_password = get_password_hash(new_password)
        db.query(User).filter(User.id == user_id).update({
            User.hashed_password: new_hashed_password,
            User.updated_at: datetime.utcnow()
        })
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def promote_to_staff(db: Session, user_id: int) -> Optional[User]:
        """Promote a user to staff status."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Update user to staff
        db.query(User).filter(User.id == user_id).update({
            User.is_staff: True,
            User.updated_at: datetime.utcnow()
        })
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def demote_from_staff(db: Session, user_id: int) -> Optional[User]:
        """Demote a user from staff status."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Update user to remove staff status
        db.query(User).filter(User.id == user_id).update({
            User.is_staff: False,
            User.updated_at: datetime.utcnow()
        })
        db.commit()
        db.refresh(user)
        return user