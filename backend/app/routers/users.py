from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.models.user import get_db
from app.schemas.user import User, UserUpdate
from app.services.user_service import UserService
from app.routers.auth import get_current_user
from app.core.logging import track_endpoint_performance, get_client_ip, log_endpoint_activity

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=User)
@track_endpoint_performance("users", "get_profile")
def get_profile(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile."""
    client_ip = get_client_ip(request)
    
    # Log profile access
    log_endpoint_activity(
        "users", 
        "profile_accessed", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "user_id": current_user.id,
            "is_active": current_user.is_active,
            "provider": current_user.provider
        }
    )
    
    return current_user


@router.put("/profile", response_model=User)
@track_endpoint_performance("users", "update_profile")
def update_profile(
    user_update: UserUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    client_ip = get_client_ip(request)
    
    # Log the update attempt with details
    log_endpoint_activity(
        "users", 
        "profile_update_attempt", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "user_id": current_user.id,
            "fields_to_update": list(user_update.dict(exclude_unset=True).keys())
        }
    )
    
    updated_user = UserService.update_user(db, current_user.id, user_update)
    if not updated_user:
        log_endpoint_activity(
            "users", 
            "profile_update_failed", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={"reason": "user_not_found"}
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log successful update
    log_endpoint_activity(
        "users", 
        "profile_updated", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "user_id": current_user.id,
            "updated_fields": list(user_update.dict(exclude_unset=True).keys())
        }
    )
    
    return updated_user


# Admin endpoints (require superuser)
@router.get("/{user_id}", response_model=User)
@track_endpoint_performance("admin", "fetch_user_by_id")
def get_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin only)."""
    client_ip = get_client_ip(request)
    
    # Log admin access attempt
    log_endpoint_activity(
        "admin", 
        "user_lookup_attempt", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "is_superuser": current_user.is_superuser
        }
    )
    
    if not current_user.is_superuser:
        log_endpoint_activity(
            "admin", 
            "unauthorized_user_lookup", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        log_endpoint_activity(
            "admin", 
            "user_lookup_failed", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "user_not_found"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log successful lookup
    log_endpoint_activity(
        "admin", 
        "user_lookup_successful", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "target_user_email": user.email
        }
    )
    
    return user


@router.post("/{user_id}/activate")
@track_endpoint_performance("admin", "activate_user_account")
def activate_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate user account (admin only)."""
    client_ip = get_client_ip(request)
    
    # Log admin activation attempt
    log_endpoint_activity(
        "admin", 
        "user_activation_attempt", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "is_superuser": current_user.is_superuser
        }
    )
    
    if not current_user.is_superuser:
        log_endpoint_activity(
            "admin", 
            "unauthorized_user_activation", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = UserService.activate_user(db, user_id)
    if not user:
        log_endpoint_activity(
            "admin", 
            "user_activation_failed", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "user_not_found"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log successful activation
    log_endpoint_activity(
        "admin", 
        "user_activated", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "target_user_email": user.email
        }
    )
    
    return {"message": f"User {user.email} activated successfully"}


@router.post("/{user_id}/deactivate")
@track_endpoint_performance("admin", "deactivate_user_account")
def deactivate_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate user account (admin only)."""
    client_ip = get_client_ip(request)
    
    # Log admin deactivation attempt - This is a critical security action
    log_endpoint_activity(
        "admin", 
        "user_deactivation_attempt", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "is_superuser": current_user.is_superuser
        }
    )
    
    if not current_user.is_superuser:
        log_endpoint_activity(
            "admin", 
            "unauthorized_user_deactivation", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = UserService.deactivate_user(db, user_id)
    if not user:
        log_endpoint_activity(
            "admin", 
            "user_deactivation_failed", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "user_not_found"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log successful deactivation - Critical security event
    log_endpoint_activity(
        "admin", 
        "user_deactivated", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "target_user_email": user.email
        }
    )
    
    return {"message": f"User {user.email} deactivated successfully"}

@router.post("/{user_id}/activate")
@track_endpoint_performance("admin", "activate_user_account")
def activate_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate user account (admin only)."""
    client_ip = get_client_ip(request)
    
    # Log admin activation attempt
    log_endpoint_activity(
        "admin", 
        "user_activation_attempt", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "is_superuser": current_user.is_superuser
        }
    )
    
    if not current_user.is_superuser:
        log_endpoint_activity(
            "admin", 
            "unauthorized_user_activation", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = UserService.activate_user(db, user_id)
    if not user:
        log_endpoint_activity(
            "admin", 
            "user_activation_failed", 
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "user_not_found"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log successful activation
    log_endpoint_activity(
        "admin", 
        "user_activated", 
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "target_user_email": user.email
        }
    )
    
    return {"message": f"User {user.email} activated successfully"}