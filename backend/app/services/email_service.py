import smtplib
import ssl
from email.mime.text import MIMEText
from typing import Optional
from datetime import datetime
from pathlib import Path
from app.core.config import settings
import logging

logger = logging.getLogger("email")


class EmailService:
    """Simple email service for sending verification and reset emails"""
    
    @staticmethod
    def _load_template(template_name: str) -> str:
        """Load HTML template from file"""
        template_path = Path(__file__).parent.parent / "templates" / "emails" / f"{template_name}.html"
        try:
            with open(template_path, 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            logger.error(f"Template not found: {template_path}")
            raise FileNotFoundError(f"Email template '{template_name}' not found")
    
    @staticmethod
    def _send_email(to_email: str, subject: str, html_content: str) -> bool:
        """Internal method to send email"""
        try:
            # Create HTML message
            message = MIMEText(html_content, "html")
            message["Subject"] = subject
            
            # Format sender with display name
            if settings.smtp_from_email:
                from_name = getattr(settings, 'smtp_from_name', 'ProjectX')
                message["From"] = f"{from_name} <{settings.smtp_from_email}>"
            else:
                message["From"] = "ProjectX <noreply@projectx.com>"
            
            message["To"] = to_email
            
            # Send email
            if settings.smtp_enabled and settings.smtp_from_email:
                logger.info(f"Attempting to send email to {to_email} via SMTP")
                context = ssl.create_default_context()
                with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
                    logger.info(f"Connected to SMTP server {settings.smtp_server}:{settings.smtp_port}")
                    
                    if settings.smtp_tls:
                        server.starttls(context=context)
                        logger.info("TLS started successfully")
                    
                    if settings.smtp_username and settings.smtp_password:
                        server.login(settings.smtp_username, settings.smtp_password)
                        logger.info(f"SMTP login successful for {settings.smtp_username}")
                    
                    server.sendmail(settings.smtp_from_email, to_email, message.as_string())
                    logger.info(f"Email sent successfully to {to_email}")
                
                return True
            else:
                # Log for development (when SMTP is disabled)
                logger.info(f"Email sending disabled. Subject: {subject} to {to_email}")
                print(f"📧 Email: {subject}")
                print(f"📩 To: {to_email}")
                return True
                
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed for {to_email}: {str(e)}")
            return False
        except smtplib.SMTPRecipientsRefused as e:
            logger.error(f"SMTP Recipients refused for {to_email}: {str(e)}")
            return False
        except smtplib.SMTPServerDisconnected as e:
            logger.error(f"SMTP Server disconnected for {to_email}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return False

    @staticmethod
    def send_verification_email(to_email: str, verification_token: str, user_name: Optional[str] = None) -> bool:
        """Send email verification email"""
        verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
        greeting = f", {user_name}" if user_name else " User"
        
        subject = f"Verify your email address - {settings.app_name}"
        
        # Load and format template
        template = EmailService._load_template("email_verification")
        html_content = template.format(
            greeting=greeting,
            app_name=settings.app_name,
            verification_url=verification_url
        )
        
        return EmailService._send_email(to_email, subject, html_content)

    @staticmethod
    def send_password_reset_email(to_email: str, reset_token: str, user_name: Optional[str] = None) -> bool:
        """Send password reset email"""
        reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
        greeting = f" {user_name}" if user_name else "user"
        
        subject = f"Reset your password - {settings.app_name}"
        
        # Load and format template
        template = EmailService._load_template("password_reset")
        html_content = template.format(
            greeting=greeting,
            app_name=settings.app_name,
            reset_url=reset_url
        )
        
        return EmailService._send_email(to_email, subject, html_content)