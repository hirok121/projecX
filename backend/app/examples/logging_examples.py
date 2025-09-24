# Example: How to use the generalized logging system for new features

from fastapi import APIRouter, Depends, Request
from app.core.logging import (
    get_logger, 
    log_endpoint_activity, 
    track_endpoint_performance
)
from app.utils.helpers import get_client_ip

# Example 1: User Profile Management Feature
router = APIRouter(prefix="/profile", tags=["user_profile"])

# Method 1: Using the generalized logging function
@router.put("/update")
async def update_user_profile(profile_data: dict, request: Request):
    """Update user profile with manual logging"""
    client_ip = get_client_ip(request)
    user_email = profile_data.get("email")
    
    try:
        # Your business logic here
        updated_fields = ["name", "bio", "avatar"]
        
        # Log success
        log_endpoint_activity(
            logger_name="user_profile",
            action="profile_updated",
            user_email=user_email,
            ip_address=client_ip,
            success=True,
            additional_info={
                "updated_fields": updated_fields,
                "field_count": len(updated_fields)
            }
        )
        
        return {"success": True, "updated_fields": updated_fields}
        
    except Exception as e:
        # Log failure
        log_endpoint_activity(
            logger_name="user_profile",
            action="profile_update_failed",
            user_email=user_email,
            ip_address=client_ip,
            success=False,
            additional_info={"error": str(e)}
        )
        raise

# Method 2: Using the performance tracking decorator (automatic!)
@router.get("/{user_id}")
@track_endpoint_performance("user_profile", "fetch_profile")
async def get_user_profile(user_id: int):
    """Get user profile - logging is automatic with decorator!"""
    # Your logic here - performance and errors are logged automatically
    return {"user_id": user_id, "name": "John Doe", "bio": "Software Developer"}

# Method 3: Using direct logger for complex scenarios
@router.post("/avatar/upload")
async def upload_avatar(file_data: dict, request: Request):
    """Upload user avatar with custom logging"""
    logger = get_logger("user_profile")  # Dynamic logger for this feature
    client_ip = get_client_ip(request)
    user_email = file_data.get("user_email")
    
    logger.info(f"Avatar upload started - User: {user_email} | IP: {client_ip} | Size: {file_data.get('size', 0)} bytes")
    
    try:
        # Your upload logic here
        avatar_url = "https://example.com/avatar.jpg"
        
        logger.info(f"Avatar upload successful - User: {user_email} | URL: {avatar_url}")
        
        return {"avatar_url": avatar_url}
        
    except Exception as e:
        logger.error(f"Avatar upload failed - User: {user_email} | Error: {str(e)}")
        raise


# Example 2: E-commerce Orders Feature
orders_router = APIRouter(prefix="/orders", tags=["orders"])

@orders_router.post("/create")
@track_endpoint_performance("orders", "create_order")
async def create_order(order_data: dict, request: Request):
    """Create a new order with automatic performance tracking"""
    client_ip = get_client_ip(request)
    
    # Manual logging for important business events
    log_endpoint_activity(
        logger_name="orders",
        action="order_creation_started",
        user_email=order_data.get("customer_email"),
        ip_address=client_ip,
        additional_info={
            "items_count": len(order_data.get("items", [])),
            "total_amount": order_data.get("total", 0),
            "payment_method": order_data.get("payment_method")
        }
    )
    
    # Your business logic here
    order_id = "ORD-12345"
    
    # Log successful order creation
    log_endpoint_activity(
        logger_name="orders",
        action="order_created",
        user_email=order_data.get("customer_email"),
        ip_address=client_ip,
        additional_info={
            "order_id": order_id,
            "amount": order_data.get("total", 0)
        }
    )
    
    return {"order_id": order_id, "status": "created"}

@orders_router.get("/{order_id}/status")
@track_endpoint_performance("orders", "check_order_status")
async def get_order_status(order_id: str):
    """Check order status - automatic logging with decorator"""
    # Performance tracking is automatic
    return {"order_id": order_id, "status": "shipped"}


# Example 3: Admin Panel Feature
admin_router = APIRouter(prefix="/admin", tags=["admin"])

@admin_router.delete("/users/{user_id}")
async def delete_user(user_id: int, request: Request, admin_user: dict = None):
    """Delete user with security logging"""
    client_ip = get_client_ip(request)
    admin_email = admin_user.get("email") if admin_user else "unknown"
    
    # Important security action - log with high detail
    log_endpoint_activity(
        logger_name="admin_security",
        action="user_deletion_attempted",
        user_email=admin_email,
        ip_address=client_ip,
        additional_info={
            "target_user_id": user_id,
            "admin_id": admin_user.get("id") if admin_user else None,
            "admin_role": admin_user.get("role") if admin_user else None
        }
    )
    
    try:
        # Your deletion logic here
        
        # Log successful deletion
        log_endpoint_activity(
            logger_name="admin_security",
            action="user_deleted",
            user_email=admin_email,
            ip_address=client_ip,
            additional_info={
                "deleted_user_id": user_id,
                "admin_id": admin_user.get("id") if admin_user else None
            }
        )
        
        return {"success": True, "deleted_user_id": user_id}
        
    except Exception as e:
        # Log failed deletion
        log_endpoint_activity(
            logger_name="admin_security",
            action="user_deletion_failed",
            user_email=admin_email,
            ip_address=client_ip,
            success=False,
            additional_info={
                "target_user_id": user_id,
                "error": str(e)
            }
        )
        raise


"""
What logs will be generated:

1. API Middleware (automatic for ALL endpoints):
   2024-09-24 10:30:15 - api - INFO - API Call - Method: PUT | Path: /profile/update | IP: 192.168.1.100 | Status: 200 | Process Time: 0.1234s

2. User Profile Feature:
   2024-09-24 10:30:15 - user_profile - INFO - ✅ Profile Updated | User: john@example.com | IP: 192.168.1.100 | updated_fields: ['name', 'bio', 'avatar'] | field_count: 3
   2024-09-24 10:30:16 - user_profile - INFO - ✅ Fetch Profile completed successfully in 0.045s

3. Orders Feature:
   2024-09-24 10:35:10 - orders - INFO - ✅ Order Creation Started | User: customer@example.com | IP: 192.168.1.100 | items_count: 3 | total_amount: 99.99 | payment_method: credit_card
   2024-09-24 10:35:11 - orders - INFO - ✅ Order Created | User: customer@example.com | IP: 192.168.1.100 | order_id: ORD-12345 | amount: 99.99
   2024-09-24 10:35:11 - orders - INFO - ✅ Create Order completed successfully in 0.234s

4. Admin Security:
   2024-09-24 10:40:20 - admin_security - INFO - ✅ User Deletion Attempted | User: admin@example.com | IP: 192.168.1.100 | target_user_id: 123 | admin_id: 1 | admin_role: super_admin
   2024-09-24 10:40:21 - admin_security - INFO - ✅ User Deleted | User: admin@example.com | IP: 192.168.1.100 | deleted_user_id: 123 | admin_id: 1
"""