import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
import functools
from logging.handlers import TimedRotatingFileHandler
from app.utils.helpers import get_client_ip


def setup_logging():
    """Setup logging configuration with main app log for common events"""

    # Create logs directory if it doesn't exist
    log_dir = Path("classifiers/logs")
    log_dir.mkdir(exist_ok=True)

    # Create main app log file handler (for common/basic logs)
    main_file_handler = TimedRotatingFileHandler(
        log_dir / "app.log",
        when="midnight",  # Rotate at midnight
        interval=1,  # Every 1 day
        backupCount=30,  # Keep 30 days of logs
        encoding="utf-8",
    )
    main_file_handler.suffix = "%Y-%m-%d"
    main_file_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )

    # Console handler for all logs
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )

    # Configure root logging for common logs
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Create main app logger for basic/common logs
    app_logger = logging.getLogger("app")
    app_logger.addHandler(main_file_handler)
    app_logger.addHandler(console_handler)
    app_logger.setLevel(logging.INFO)
    app_logger.propagate = False  # Don't propagate to root

    # API middleware logger (goes to main app.log)
    api_logger = logging.getLogger("api")
    api_logger.addHandler(main_file_handler)
    api_logger.addHandler(console_handler)
    api_logger.setLevel(logging.INFO)
    api_logger.propagate = False

    return app_logger


# Initialize main logger
app_logger = setup_logging()


def get_logger(name: str) -> logging.Logger:
    """
    Get a feature-specific logger with its own log file.
    Each feature gets its own log file: logs/auth.log, logs/users.log, etc.

    Usage:
        from app.core.logging import get_logger
        logger = get_logger("auth")       # Creates logs/auth.log
        logger = get_logger("users")      # Creates logs/users.log
        logger = get_logger("orders")     # Creates logs/orders.log
    """
    logger = logging.getLogger(name)

    # Don't add handlers if already configured
    if not logger.handlers:
        log_dir = Path("classifiers/logs")
        log_dir.mkdir(parents=True, exist_ok=True)

        # Create feature-specific file handler
        file_handler = TimedRotatingFileHandler(
            log_dir / f"{name}.log",
            when="midnight",
            interval=1,
            backupCount=30,  # Keep 30 days for each feature
            encoding="utf-8",
        )
        file_handler.suffix = "%Y-%m-%d"
        file_handler.setFormatter(
            logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        )

        # Console handler for this feature
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(
            logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        )

        # Add handlers to the logger
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False  # Don't propagate to root logger

    return logger


def log_endpoint_activity(
    logger_name: str,
    action: str,
    user_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    success: bool = True,
    additional_info: Optional[dict] = None,
):
    """
    Generalized logging function for any endpoint activity.
    This will log to the specific feature log file.

    Args:
        logger_name: Name of the feature (e.g., "auth", "users", "orders") - determines log file
        action: What action was performed (e.g., "login", "profile_update", "order_created")
        user_email: User's email if applicable
        ip_address: Client IP address
        success: Whether the action was successful
        additional_info: Any additional information to log

    Examples:
        # Goes to logs/auth.log
        log_endpoint_activity("auth", "login", user_email="user@example.com", ip_address="192.168.1.1")

        # Goes to logs/orders.log
        log_endpoint_activity("orders", "order_created", user_email="user@example.com",
                            additional_info={"order_id": "12345", "amount": 99.99})

        # Goes to logs/users.log
        log_endpoint_activity("users", "profile_updated", user_email="user@example.com")
    """
    logger = get_logger(logger_name)  # This creates logs/{logger_name}.log

    # Build log message
    parts = [f"{action.title()}"]

    if user_email:
        parts.append(f"User: {user_email}")

    if ip_address:
        parts.append(f"IP: {ip_address}")

    if additional_info:
        info_str = " | ".join([f"{k}: {v}" for k, v in additional_info.items()])
        parts.append(info_str)

    message = " | ".join(parts)

    # Log with appropriate level
    if success:
        logger.info(f"✅ {message}")
    else:
        logger.warning(f"❌ {message}")


def track_endpoint_performance(logger_name: str, action: str):
    """
    Decorator to automatically track endpoint performance and log execution details.
    Logs will go to the specific feature log file.

    Usage:
        @track_endpoint_performance("users", "update_profile")  # logs to logs/users.log
        async def update_user_profile(user_id: int, data: dict):
            pass

        @track_endpoint_performance("orders", "create_order")   # logs to logs/orders.log
        def create_order(order_data: dict):
            pass
    """

    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            logger = get_logger(logger_name)  # Feature-specific logger
            start_time = datetime.now()

            try:
                # Execute the function
                result = await func(*args, **kwargs)

                # Log success
                duration = (datetime.now() - start_time).total_seconds()
                logger.info(
                    f"✅ {action.title()} completed successfully in {duration:.3f}s"
                )

                return result

            except Exception as e:
                # Log failure
                duration = (datetime.now() - start_time).total_seconds()
                error_msg = str(e) if str(e) else f"{type(e).__name__}: {repr(e)}"
                logger.error(
                    f"❌ {action.title()} failed after {duration:.3f}s - Error: {error_msg}"
                )
                logger.exception("Full traceback:")
                raise

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            logger = get_logger(logger_name)  # Feature-specific logger
            start_time = datetime.now()

            try:
                # Execute the function
                result = func(*args, **kwargs)

                # Log success
                duration = (datetime.now() - start_time).total_seconds()
                logger.info(
                    f"✅ {action.title()} completed successfully in {duration:.3f}s"
                )

                return result

            except Exception as e:
                # Log failure
                duration = (datetime.now() - start_time).total_seconds()
                error_msg = str(e) if str(e) else f"{type(e).__name__}: {repr(e)}"
                logger.error(
                    f"❌ {action.title()} failed after {duration:.3f}s - Error: {error_msg}"
                )
                logger.exception("Full traceback:")
                raise

        # Return appropriate wrapper based on function type
        if hasattr(func, "__code__") and func.__code__.co_flags & 0x80:  # CO_COROUTINE
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


# Pre-configured loggers for common features (creates their own log files)
auth_logger = get_logger("auth")  # logs/auth.log
users_logger = get_logger("users")  # logs/users.log
