import smtplib
import ssl
from email.mime.text import MIMEText
from typing import Optional
from datetime import datetime
from app.core.config import settings
import logging

logger = logging.getLogger("email")


class EmailService:
    """Simple email service for sending verification and reset emails"""
    
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
        greeting = f", {user_name}" if user_name else ""
        
        subject = f"Verify your email address - {settings.app_name}"
        
        # Simple HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                .btn {{ display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; }}
                .link {{ word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px; }}
                .h1 {{color : white;}}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✉️ Verify Your Email</h1>
                </div>
                <div class="content">
                    <p>Hello{greeting}!</p>
                    <p>Thank you for registering with <strong>{settings.app_name}</strong>. Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{verification_url}" class="btn">Verify Email Address</a>
                    </div>
                    <p>If the button doesn't work, copy and paste this link:</p>
                    <div class="link">{verification_url}</div>
                    <p><strong>This link expires in 24 hours.</strong></p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return EmailService._send_email(to_email, subject, html_content)

    @staticmethod
    def send_password_reset_email(to_email: str, reset_token: str, user_name: Optional[str] = None) -> bool:
        """Send password reset email"""
        reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
        greeting = f" {user_name}" if user_name else ""
        
        subject = f"Reset your password - {settings.app_name}"
        
        # Simple HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                .btn {{ display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; }}
                .link {{ word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Reset Password</h1>
                </div>
                <div class="content">
                    <p>Hello{greeting},</p>
                    <p>We received a request to reset your password for your <strong>{settings.app_name}</strong> account. Click the button below to reset it:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{reset_url}" class="btn">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, copy and paste this link:</p>
                    <div class="link">{reset_url}</div>
                    <p><strong>This link expires in 1 hour.</strong></p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return EmailService._send_email(to_email, subject, html_content)