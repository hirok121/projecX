from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.connection import get_db
from app.schemas.user import User, UserUpdate
from app.schemas.contact import ContactMessage, ContactResponse
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.routers.auth import get_current_user
from app.core.logging import track_endpoint_performance, log_endpoint_activity
from app.utils.helpers import get_client_ip

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[User])
@track_endpoint_performance("admin", "get_all_users")
def get_all_users(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of users to return"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all users (superuser or staff only)."""
    client_ip = get_client_ip(request)

    # Log admin access attempt
    log_endpoint_activity(
        "admin",
        "get_all_users_attempt",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "is_superuser": current_user.is_superuser,
            "is_staff": current_user.is_staff,
            "skip": skip,
            "limit": limit,
        },
    )

    # Check if user has sufficient privileges (superuser or staff)
    if not (current_user.is_superuser or current_user.is_staff):
        log_endpoint_activity(
            "admin",
            "unauthorized_get_all_users",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "reason": "insufficient_permissions",
                "is_superuser": current_user.is_superuser,
                "is_staff": current_user.is_staff,
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Staff or superuser access required.",
        )

    users = UserService.get_all_users(db, skip=skip, limit=limit)

    # Log successful operation
    log_endpoint_activity(
        "admin",
        "get_all_users_successful",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "is_superuser": current_user.is_superuser,
            "is_staff": current_user.is_staff,
            "users_returned": len(users),
            "skip": skip,
            "limit": limit,
        },
    )

    return users


@router.get("/profile", response_model=User)
@track_endpoint_performance("users", "get_profile")
def get_profile(request: Request, current_user: User = Depends(get_current_user)):
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
            "provider": current_user.provider,
        },
    )

    return current_user


@router.put("/profile", response_model=User)
@track_endpoint_performance("users", "update_profile")
def update_profile(
    user_update: UserUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
            "fields_to_update": list(user_update.dict(exclude_unset=True).keys()),
        },
    )

    updated_user = UserService.update_user(db, current_user.id, user_update)
    if not updated_user:
        log_endpoint_activity(
            "users",
            "profile_update_failed",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={"reason": "user_not_found"},
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Log successful update
    log_endpoint_activity(
        "users",
        "profile_updated",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "user_id": current_user.id,
            "updated_fields": list(user_update.dict(exclude_unset=True).keys()),
        },
    )

    return updated_user


# Admin endpoints (require superuser)
@router.get("/{user_id}", response_model=User)
@track_endpoint_performance("admin", "fetch_user_by_id")
def get_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
            "is_superuser": current_user.is_superuser,
        },
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
                "reason": "insufficient_permissions",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
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
                "reason": "user_not_found",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
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
            "target_user_email": user.email,
        },
    )

    return user


@router.post("/{user_id}/activate")
@track_endpoint_performance("admin", "activate_user_account")
def activate_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Activate user account (staff or superuser)."""
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
            "is_superuser": current_user.is_superuser,
            "is_staff": current_user.is_staff,
        },
    )

    if not (current_user.is_superuser or current_user.is_staff):
        log_endpoint_activity(
            "admin",
            "unauthorized_user_activation",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Staff or superuser access required.",
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
                "reason": "user_not_found",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
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
            "target_user_email": user.email,
        },
    )

    return {"message": f"User {user.email} activated successfully"}


@router.post("/{user_id}/deactivate")
@track_endpoint_performance("admin", "deactivate_user_account")
def deactivate_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deactivate user account (staff or superuser)."""
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
            "is_superuser": current_user.is_superuser,
            "is_staff": current_user.is_staff,
        },
    )

    if not (current_user.is_superuser or current_user.is_staff):
        log_endpoint_activity(
            "admin",
            "unauthorized_user_deactivation",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Staff or superuser access required.",
        )

    # Prevent users from deactivating themselves
    if current_user.id == user_id:
        log_endpoint_activity(
            "admin",
            "self_deactivation_blocked",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "reason": "cannot_deactivate_self",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    # Get user to check if they are a superuser
    user = UserService.get_user_by_id(db, user_id)
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
                "reason": "user_not_found",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Prevent deactivating superuser accounts
    if user.is_superuser:
        log_endpoint_activity(
            "admin",
            "superuser_deactivation_blocked",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "target_user_email": user.email,
                "reason": "cannot_deactivate_superuser",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Superuser accounts cannot be deactivated.",
        )

    # Deactivate the user
    user = UserService.deactivate_user(db, user_id)

    # Log successful deactivation - Critical security event
    log_endpoint_activity(
        "admin",
        "user_deactivated",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "target_user_email": user.email,
        },
    )

    return {"message": f"User {user.email} deactivated successfully"}


@router.post("/{user_id}/promote-to-staff")
@track_endpoint_performance("admin", "promote_user_to_staff")
def promote_user_to_staff(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Promote user to staff status (superuser only)."""
    client_ip = get_client_ip(request)

    # Log admin action attempt
    log_endpoint_activity(
        "admin",
        "staff_promotion_attempt",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "is_superuser": current_user.is_superuser,
        },
    )

    if not current_user.is_superuser:
        log_endpoint_activity(
            "admin",
            "unauthorized_staff_promotion",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    user = UserService.promote_to_staff(db, user_id)
    if not user:
        log_endpoint_activity(
            "admin",
            "staff_promotion_failed",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "user_not_found",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Log successful promotion - Critical admin event
    log_endpoint_activity(
        "admin",
        "user_promoted_to_staff",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "target_user_email": user.email,
        },
    )

    return {"message": f"User {user.email} promoted to staff successfully"}


@router.post("/{user_id}/demote-from-staff")
@track_endpoint_performance("admin", "demote_user_from_staff")
def demote_user_from_staff(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Demote user from staff status (superuser only)."""
    client_ip = get_client_ip(request)

    # Log admin action attempt
    log_endpoint_activity(
        "admin",
        "staff_demotion_attempt",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "is_superuser": current_user.is_superuser,
        },
    )

    if not current_user.is_superuser:
        log_endpoint_activity(
            "admin",
            "unauthorized_staff_demotion",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "insufficient_permissions",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    user = UserService.demote_from_staff(db, user_id)
    if not user:
        log_endpoint_activity(
            "admin",
            "staff_demotion_failed",
            user_email=current_user.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "admin_id": current_user.id,
                "target_user_id": user_id,
                "reason": "user_not_found",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Log successful demotion - Critical admin event
    log_endpoint_activity(
        "admin",
        "user_demoted_from_staff",
        user_email=current_user.email,
        ip_address=client_ip,
        additional_info={
            "admin_id": current_user.id,
            "target_user_id": user_id,
            "target_user_email": user.email,
        },
    )

    return {"message": f"User {user.email} demoted from staff successfully"}


@router.post("/contact/me/", response_model=ContactResponse)
@track_endpoint_performance("users", "contact_form_submission")
def submit_contact_form(
    contact_data: ContactMessage,
    request: Request,
):
    """Submit contact form (public endpoint)."""
    client_ip = get_client_ip(request)

    # Log contact form submission
    log_endpoint_activity(
        "users",
        "contact_form_submitted",
        user_email=contact_data.email,
        ip_address=client_ip,
        additional_info={
            "name": contact_data.name,
            "subject": contact_data.subject,
            "message_length": len(contact_data.message),
        },
    )

    # Send email to admin
    try:
        email_sent = EmailService.send_contact_form_email(
            name=contact_data.name,
            email=contact_data.email,
            subject=contact_data.subject,
            message=contact_data.message,
        )

        if email_sent:
            log_endpoint_activity(
                "users",
                "contact_email_sent",
                user_email=contact_data.email,
                ip_address=client_ip,
                additional_info={
                    "name": contact_data.name,
                    "subject": contact_data.subject,
                },
            )
        else:
            log_endpoint_activity(
                "users",
                "contact_email_failed",
                user_email=contact_data.email,
                ip_address=client_ip,
                success=False,
                additional_info={
                    "name": contact_data.name,
                    "subject": contact_data.subject,
                },
            )
    except Exception as e:
        log_endpoint_activity(
            "users",
            "contact_email_error",
            user_email=contact_data.email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "name": contact_data.name,
                "subject": contact_data.subject,
                "error": str(e),
            },
        )

    return ContactResponse(
        status="success",
        message="Thank you for contacting us! We'll get back to you soon.",
    )
