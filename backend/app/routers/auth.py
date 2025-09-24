from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import BaseModel
from app.db.connection import get_db
from app.schemas.user import (
    UserLogin, UserCreate, Token, User, 
    PasswordResetRequest, PasswordReset, PasswordResetResponse, 
    ChangePasswordRequest, ChangePasswordResponse,
    GoogleCallbackRequest, RegistrationResponse, 
    VerificationRequest, VerificationResponse
)
from app.models.user import User as UserModel  # SQLAlchemy User model
from app.services.user_service import UserService
from app.services.oauth_service import GoogleOAuthService
from app.core.security import create_access_token, verify_token
from app.core.config import settings
from app.core.logging import log_endpoint_activity, track_endpoint_performance
from app.utils.helpers import get_client_ip
from app.utils.tokens import generate_verification_token, verify_verification_token
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


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
    
    # Use getattr to safely check is_active
    is_active = getattr(user, 'is_active', True)
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


@router.post("/register", response_model=RegistrationResponse)
@track_endpoint_performance("auth", "register")
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new user and send email verification."""
    # Get client IP
    client_ip = get_client_ip(request)
    
    log_endpoint_activity("auth", "registration_attempt", user.email, client_ip)
    
    # Check if user already exists
    db_user = UserService.get_user_by_email(db, email=user.email)
    if db_user:
        # If user exists with Google OAuth but no password, link the account
        # Use getattr to safely access SQLAlchemy attributes
        provider = getattr(db_user, 'provider', None)
        has_password = getattr(db_user, 'hashed_password', None) is not None
        
        if provider == "google" and not has_password:
            # Link the account by adding password (Google users are already verified)
            linked_user = UserService.link_password_to_oauth_user(db, db_user, user.password)
            
            log_endpoint_activity("auth", "registration_successful", user.email, client_ip, 
                                additional_info={"type": "google_account_linked"})
            
            return RegistrationResponse(
                message="Password successfully added to your Google account! You can now login with email and password.",
                email=user.email
            )
        else:
            # User already exists with local account or both providers
            log_endpoint_activity("auth", "registration_failed", user.email, client_ip, 
                                success=False, additional_info={"reason": "email_exists"})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered with a password"
            )
    
    # Create new user (inactive by default for email verification)
    try:
        db_user = UserService.create_user(db=db, user=user)
        
        # Generate verification token
        verification_token = generate_verification_token(user.email)
        
        # Send verification email
        email_sent = EmailService.send_verification_email(
            to_email=user.email,
            verification_token=verification_token,
            user_name=user.full_name or "User"  # Fallback if full_name is None
        )
        
        if not email_sent:
            log_endpoint_activity("auth", "email_send_failed", user.email, client_ip, 
                                success=False, additional_info={"reason": "smtp_error"})
            # Don't fail registration if email fails, just log it
        
        log_endpoint_activity("auth", "registration_successful", user.email, client_ip, 
                            additional_info={"type": "verification_pending", "email_sent": email_sent})
        
        return RegistrationResponse(
            message="Registration successful! Please check your email to verify your account.",
            email=user.email
        )
        
    except Exception as e:
        log_endpoint_activity("auth", "registration_failed", user.email, client_ip, 
                            success=False, additional_info={"reason": "database_error"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


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
        if existing_user:
            # Use getattr to safely access SQLAlchemy attributes
            provider = getattr(existing_user, 'provider', None)
            has_password = getattr(existing_user, 'hashed_password', None) is not None
            
            if provider == "google" and not has_password:
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
    
    # Use getattr to safely check is_active
    is_active = getattr(user, 'is_active', True)
    if not is_active:
        log_endpoint_activity("auth", "login_failed", user_credentials.email, client_ip, 
                            success=False, additional_info={"reason": "inactive_user"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login - use getattr for safe access
    user_id = getattr(user, 'id', None)
    user_email = getattr(user, 'email', user_credentials.email)
    user_provider = getattr(user, 'provider', 'local')
    
    if user_id is not None:
        UserService.update_last_login(db, user_id)
    
    # Log successful login
    log_endpoint_activity("auth", "login_successful", user_email, client_ip, 
                        additional_info={"user_id": user_id, "provider": user_provider})
    
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
            # Link Google account to existing user using session update
            user_id = getattr(user, 'id', None)
            if user_id:
                update_data = {"google_id": google_user.id, "updated_at": datetime.utcnow()}
                
                # Use getattr to safely check existing attributes
                current_avatar = getattr(user, 'avatar_url', None)
                current_fullname = getattr(user, 'full_name', None)
                current_provider = getattr(user, 'provider', 'local')
                has_password = getattr(user, 'hashed_password', None) is not None
                
                # Update avatar if not set
                if not current_avatar and google_user.picture:
                    update_data["avatar_url"] = google_user.picture
                    
                # Update full name if not set
                if not current_fullname and google_user.name:
                    update_data["full_name"] = google_user.name
                
                # Update provider based on current status
                if current_provider == "local" and has_password:
                    update_data["provider"] = "both"
                elif current_provider == "google":
                    update_data["provider"] = "google"
                    
                # Apply updates using SQLAlchemy session with string keys
                db.query(UserModel).filter(UserModel.id == user_id).update({
                    "google_id": google_user.id,
                    "updated_at": datetime.utcnow(),
                    **{k: v for k, v in update_data.items() if k not in ["google_id", "updated_at"]}
                })
                db.commit()
                db.refresh(user)
        else:
            # Create new user
            user = UserService.create_google_user(db, google_user)
    
    # Use getattr to safely check is_active
    is_active = getattr(user, 'is_active', True)
    if not is_active:
        user_email = getattr(user, 'email', google_user.email)
        log_endpoint_activity("auth", "google_oauth_failed", user_email, client_ip, 
                            success=False, additional_info={"reason": "inactive_user"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login - use getattr for safe access
    user_id = getattr(user, 'id', None)
    user_email = getattr(user, 'email', google_user.email)
    user_provider = getattr(user, 'provider', 'google')
    
    if user_id is not None:
        UserService.update_last_login(db, user_id)
    
    # Log successful OAuth login
    log_endpoint_activity("auth", "google_oauth_successful", user_email, client_ip, 
                        additional_info={"user_id": user_id, "provider": user_provider})
    
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


@router.post("/verify-email", response_model=VerificationResponse)
@track_endpoint_performance("auth", "verify_email")
def verify_email(verification: VerificationRequest, request: Request, db: Session = Depends(get_db)):
    """Verify user email address with token."""
    client_ip = get_client_ip(request)
    
    # Verify the token
    email = verify_verification_token(verification.token, "email_verification")
    if not email:
        log_endpoint_activity("auth", "email_verification_failed", None, client_ip, 
                            success=False, additional_info={"reason": "invalid_token"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Find and verify the user
    user = UserService.verify_user_email(db, email)
    if not user:
        log_endpoint_activity("auth", "email_verification_failed", email, client_ip, 
                            success=False, additional_info={"reason": "user_not_found"})
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    log_endpoint_activity("auth", "email_verification_successful", email, client_ip)
    
    return VerificationResponse(
        message="Email verified successfully! Your account is now active.",
        email=email
    )


@router.post("/forgot-password", response_model=PasswordResetResponse)
@track_endpoint_performance("auth", "forgot_password")
async def forgot_password(
    request: PasswordResetRequest,
    request_obj: Request,
    db: Session = Depends(get_db)
):
    """Request password reset - sends reset email if user exists."""
    client_ip = get_client_ip(request_obj)
    
    # Check if user exists
    user = UserService.get_user_by_email(db, request.email)
    if not user:
        # Don't reveal if user exists or not for security
        log_endpoint_activity("auth", "password_reset_requested", request.email, client_ip, 
                            success=False, additional_info={"reason": "user_not_found"})
        return PasswordResetResponse(
            message="If your email is registered, you will receive a password reset link.",
            success=True
        )
    
    # Check if user is active
    is_active = getattr(user, 'is_active', True)
    if not is_active:
        log_endpoint_activity("auth", "password_reset_requested", request.email, client_ip, 
                            success=False, additional_info={"reason": "inactive_user"})
        return PasswordResetResponse(
            message="If your email is registered, you will receive a password reset link.",
            success=True
        )
    
    # Generate reset token (24 hour expiry)
    reset_token = generate_verification_token(request.email)
    
    # Send password reset email
    user_name = getattr(user, 'full_name', None) or getattr(user, 'username', None)
    email_sent = EmailService.send_password_reset_email(
        to_email=request.email,
        reset_token=reset_token,
        user_name=user_name
    )
    
    if email_sent:
        log_endpoint_activity("auth", "password_reset_email_sent", request.email, client_ip)
        return PasswordResetResponse(
            message="If your email is registered, you will receive a password reset link.",
            success=True
        )
    else:
        log_endpoint_activity("auth", "password_reset_email_failed", request.email, client_ip, 
                            success=False, additional_info={"reason": "email_send_failed"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email. Please try again later."
        )


@router.post("/reset-password", response_model=PasswordResetResponse)
@track_endpoint_performance("auth", "reset_password")
async def reset_password(
    request: PasswordReset,
    request_obj: Request,
    db: Session = Depends(get_db)
):
    """Reset password using reset token."""
    client_ip = get_client_ip(request_obj)
    
    try:
        # Verify the reset token
        email = verify_verification_token(request.token)
        if not email:
            log_endpoint_activity("auth", "password_reset_failed", None, client_ip, 
                                success=False, additional_info={"reason": "invalid_token"})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
    except Exception:
        log_endpoint_activity("auth", "password_reset_failed", None, client_ip, 
                            success=False, additional_info={"reason": "token_verification_failed"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Reset the user's password
    user = UserService.reset_user_password(db, email, request.new_password)
    if not user:
        log_endpoint_activity("auth", "password_reset_failed", email, client_ip, 
                            success=False, additional_info={"reason": "user_not_found"})
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    log_endpoint_activity("auth", "password_reset_successful", email, client_ip, 
                        additional_info={"user_id": getattr(user, 'id', None)})
    
    return PasswordResetResponse(
        message="Password reset successfully! You can now login with your new password.",
        success=True
    )


@router.post("/change-password", response_model=ChangePasswordResponse)
@track_endpoint_performance("auth", "change_password")
async def change_password(
    request: ChangePasswordRequest,
    request_obj: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password for authenticated user."""
    client_ip = get_client_ip(request_obj)
    user_email = getattr(current_user, 'email', None)
    user_id = getattr(current_user, 'id', None)
    
    log_endpoint_activity("auth", "password_change_attempt", user_email, client_ip, 
                        additional_info={"user_id": user_id})
    
    if not user_id:
        log_endpoint_activity("auth", "password_change_failed", user_email, client_ip, 
                            success=False, additional_info={"reason": "invalid_user"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user"
        )
    
    # Check if user has a password (not OAuth-only)
    has_password = getattr(current_user, 'hashed_password', None) is not None
    if not has_password:
        log_endpoint_activity("auth", "password_change_failed", user_email, client_ip, 
                            success=False, additional_info={"reason": "oauth_only_account"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was created with Google OAuth and has no password. Please use 'Forgot Password' to set a password."
        )
    
    # Attempt to change the password
    updated_user = UserService.change_user_password(
        db, user_id, request.current_password, request.new_password
    )
    
    if not updated_user:
        log_endpoint_activity("auth", "password_change_failed", user_email, client_ip, 
                            success=False, additional_info={"reason": "incorrect_current_password"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    log_endpoint_activity("auth", "password_change_successful", user_email, client_ip, 
                        additional_info={"user_id": user_id})
    
    return ChangePasswordResponse(
        message="Password changed successfully!",
        success=True
    )