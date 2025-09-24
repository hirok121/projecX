import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.helpers import get_client_ip
import logging

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get client IP using the utility function
        client_ip = get_client_ip(request)
        
        # Start timer
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate process time
        process_time = time.time() - start_time
        
        # Get API logger (goes to main app.log for common logs)
        api_logger = logging.getLogger("api")
        
        # Log API call details
        api_logger.info(
            f"API Call - Method: {request.method} | "
            f"Path: {request.url.path} | "
            f"IP: {client_ip} | "
            f"Status: {response.status_code} | "
            f"Process Time: {process_time:.4f}s"
        )
        
        # Add process time to response headers
        response.headers["X-Process-Time"] = str(process_time)
        
        return response