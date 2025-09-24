from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import BaseModel
from app.models.user import get_db
from app.schemas.user import UserLogin, UserCreate, Token, User
from app.services.user_service import UserService
from app.services.oauth_service import GoogleOAuthService
from app.core.security import create_access_token, verify_token
from app.core.config import settings
from app.core.logging import log_endpoint_activity, get_client_ip, track_endpoint_performance

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


# Request models
class GoogleCallbackRequest(BaseModel):
    code: str


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    email = verify_token(token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = UserService.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


@router.post("/register", response_model=Token)
@track_endpoint_performance("auth", "register")
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new user."""
    # Get client IP
    client_ip = get_client_ip(request)
    
    log_endpoint_activity("auth", "registration_attempt", user.email, client_ip)
    
    # Check if user already exists
    db_user = UserService.get_user_by_email(db, email=user.email)
    if db_user:
        # If user exists with Google OAuth but trying to register with password
        if db_user.provider == "google" and not db_user.hashed_password:
            # Link the account by adding password
            linked_user = UserService.link_password_to_oauth_user(db, db_user, user.password)
            
            # Update last login
            UserService.update_last_login(db, linked_user.id)
            
            log_endpoint_activity("auth", "registration_successful", user.email, client_ip, 
                                additional_info={"type": "account_linked"})
            
            # Create access token
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            access_token = create_access_token(
                data={"sub": linked_user.email}, expires_delta=access_token_expires
            )
            
            return {"access_token": access_token, "token_type": "bearer"}
        else:
            log_endpoint_activity("auth", "registration_failed", user.email, client_ip, 
                                success=False, additional_info={"reason": "email_exists"})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    db_user = UserService.create_user(db=db, user=user)
    
    # Update last login
    UserService.update_last_login(db, db_user.id)
    
    log_endpoint_activity("auth", "registration_successful", user.email, client_ip, 
                        additional_info={"type": "new_user"})
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
@track_endpoint_performance("auth", "login")
def login(user_credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login with email and password."""
    # Get client IP
    client_ip = get_client_ip(request)
    
    log_endpoint_activity("auth", "login_attempt", user_credentials.email, client_ip)
    
    user = UserService.authenticate_user(
        db, user_credentials.email, user_credentials.password
    )
    if not user:
        # Check if user exists with Google OAuth only
        existing_user = UserService.get_user_by_email(db, user_credentials.email)
        if existing_user and existing_user.provider == "google" and not existing_user.hashed_password:
            log_endpoint_activity("auth", "login_failed", user_credentials.email, client_ip, 
                                success=False, additional_info={"reason": "oauth_only_account"})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is registered with Google OAuth only. Please sign in with Google or register with a password to link your account."
            )
        
        log_endpoint_activity("auth", "login_failed", user_credentials.email, client_ip, 
                            success=False, additional_info={"reason": "invalid_credentials"})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        log_endpoint_activity("auth", "login_failed", user_credentials.email, client_ip, 
                            success=False, additional_info={"reason": "inactive_user"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    UserService.update_last_login(db, user.id)
    
    # Log successful login
    log_endpoint_activity("auth", "login_successful", user.email, client_ip, 
                        additional_info={"user_id": user.id, "provider": user.provider})
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/google")
@track_endpoint_performance("auth", "google_login")
def google_login():
    """Get Google OAuth login URL."""
    try:
        auth_url = GoogleOAuthService.get_google_auth_url()
        return {"auth_url": auth_url}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/google/callback", response_model=Token)
@track_endpoint_performance("auth", "google_oauth_callback")
async def google_callback(request: GoogleCallbackRequest, req: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback."""
    # Get client IP
    client_ip = get_client_ip(req)
    
    log_endpoint_activity("auth", "google_oauth_callback", ip_address=client_ip)
    
    # Exchange code for access token
    access_token = await GoogleOAuthService.exchange_code_for_token(request.code)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get access token from Google"
        )
    
    # Get user info from Google
    google_user = await GoogleOAuthService.get_google_user_info(access_token)
    if not google_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get user info from Google"
        )
    
    # Check if user exists
    user = UserService.get_user_by_google_id(db, google_user.id)
    if not user:
        # Check if user exists with same email but different provider
        user = UserService.get_user_by_email(db, google_user.email)
        if user:
            # Link Google account to existing user
            user.google_id = google_user.id
            if not user.avatar_url and google_user.picture:
                user.avatar_url = google_user.picture
            if not user.full_name and google_user.name:
                user.full_name = google_user.name
            # Update provider to indicate both methods are available
            if user.provider == "local" and user.hashed_password:
                user.provider = "both"
            elif user.provider == "google":
                user.provider = "google"
            user.updated_at = datetime.utcnow()
            db.commit()
        else:
            # Create new user
            user = UserService.create_google_user(db, google_user)
    
    if not user.is_active:
        log_endpoint_activity("auth", "google_oauth_failed", google_user.email, client_ip, 
                            success=False, additional_info={"reason": "inactive_user"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    UserService.update_last_login(db, user.id)
    
    # Log successful OAuth login
    log_endpoint_activity("auth", "google_oauth_successful", user.email, client_ip, 
                        additional_info={"user_id": user.id, "provider": user.provider})
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    jwt_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": jwt_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
@track_endpoint_performance("auth", "get_current_user_info")
def get_current_user_info(request: Request, current_user: User = Depends(get_current_user)):
    """Get current user information."""
    client_ip = get_client_ip(request)
    log_endpoint_activity("auth", "get_current_user_info", ip_address=client_ip)
    return current_user