import httpx
from typing import Optional
from app.core.config import settings
from app.schemas.user import GoogleUser


class GoogleOAuthService:
    
    @staticmethod
    async def get_google_user_info(access_token: str) -> Optional[GoogleUser]:
        """Get user information from Google using access token."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code == 200:
                    user_data = response.json()
                    return GoogleUser(
                        id=user_data["id"],
                        email=user_data["email"],
                        name=user_data.get("name", ""),
                        picture=user_data.get("picture"),
                        verified_email=user_data.get("verified_email", False)
                    )
                return None
        except Exception as e:
            print(f"Error getting Google user info: {e}")
            return None
    
    @staticmethod
    def get_google_auth_url() -> str:
        """Generate Google OAuth authorization URL."""
        if not settings.google_client_id:
            raise ValueError("Google Client ID not configured")
        
        base_url = "https://accounts.google.com/o/oauth2/auth"
        params = {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "scope": "openid email profile",
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    @staticmethod
    async def exchange_code_for_token(code: str) -> Optional[str]:
        """Exchange authorization code for access token."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": settings.google_client_id,
                        "client_secret": settings.google_client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": settings.google_redirect_uri,
                    }
                )
                
                if response.status_code == 200:
                    token_data = response.json()
                    return token_data.get("access_token")
                return None
        except Exception as e:
            print(f"Error exchanging code for token: {e}")
            return None