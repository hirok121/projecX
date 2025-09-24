from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings
import secrets
import string


def generate_verification_token(email: str, token_type: str = "email_verification") -> str:
    """Generate a verification token for email verification or password reset."""
    # Calculate expiration time based on token type
    if token_type == "password_reset":
        expire = datetime.utcnow() + timedelta(hours=1)  # 1 hour for password reset
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.verification_token_expire_hours)  # 24 hours default
    
    # Create token payload
    to_encode = {
        "email": email,
        "type": token_type,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    # Generate JWT token
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_verification_token(token: str, expected_type: str = "email_verification") -> Optional[str]:
    """Verify a verification token and return the email if valid."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("email")
        token_type = payload.get("type")
        
        # Check if email and token type are present
        if email is None or token_type != expected_type:
            return None
            
        return str(email)
    except JWTError:
        return None


def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token for various purposes."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))