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
        template_path = (
            Path(__file__).parent.parent
            / "templates"
            / "emails"
            / f"{template_name}.html"
        )
        try:
            with open(template_path, "r", encoding="utf-8") as file:
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
                from_name = getattr(settings, "smtp_from_name", "ProjectX")
                message["From"] = f"{from_name} <{settings.smtp_from_email}>"
            else:
                message["From"] = "ProjectX <noreply@projectx.com>"

            message["To"] = to_email

            # Send email
            if settings.smtp_enabled and settings.smtp_from_email:
                logger.info(f"Attempting to send email to {to_email} via SMTP")
                context = ssl.create_default_context()
                with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
                    logger.info(
                        f"Connected to SMTP server {settings.smtp_server}:{settings.smtp_port}"
                    )

                    if settings.smtp_tls:
                        server.starttls(context=context)
                        logger.info("TLS started successfully")

                    if settings.smtp_username and settings.smtp_password:
                        server.login(settings.smtp_username, settings.smtp_password)
                        logger.info(
                            f"SMTP login successful for {settings.smtp_username}"
                        )

                    server.sendmail(
                        settings.smtp_from_email, to_email, message.as_string()
                    )
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
    def send_verification_email(
        to_email: str, verification_token: str, user_name: Optional[str] = None
    ) -> bool:
        """Send email verification email"""
        verification_url = (
            f"{settings.frontend_url}/verify-email?token={verification_token}"
        )
        greeting = f", {user_name}" if user_name else " User"

        subject = f"Verify your email address - {settings.app_name}"

        # Load and format template
        template = EmailService._load_template("email_verification")
        html_content = template.format(
            greeting=greeting,
            app_name=settings.app_name,
            verification_url=verification_url,
        )

        return EmailService._send_email(to_email, subject, html_content)

    @staticmethod
    def send_password_reset_email(
        to_email: str, reset_token: str, user_name: Optional[str] = None
    ) -> bool:
        """Send password reset email"""
        reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
        greeting = f" {user_name}" if user_name else "user"

        subject = f"Reset your password - {settings.app_name}"

        # Load and format template
        template = EmailService._load_template("password_reset")
        html_content = template.format(
            greeting=greeting, app_name=settings.app_name, reset_url=reset_url
        )

        return EmailService._send_email(to_email, subject, html_content)

    @staticmethod
    def send_diagnosis_complete_email(
        to_email: str,
        user_name: str,
        diagnosis_id: int,
        disease_name: str,
        prediction: str,
        confidence: float,
        result_link: str,
    ) -> bool:
        """
        Send email notification when diagnosis is completed.

        Args:
            to_email: User's email address
            user_name: User's name
            diagnosis_id: Diagnosis ID
            disease_name: Disease name
            prediction: Prediction result
            confidence: Confidence score
            result_link: Link to results page

        Returns:
            bool: True if email sent successfully
        """
        subject = f"Your {disease_name} Diagnosis is Ready - {settings.app_name}"

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Hello {user_name},</h2>
                    <p>Your diagnosis request (ID: <strong>{diagnosis_id}</strong>) for <strong>{disease_name}</strong> has been completed.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2c3e50;">Results Summary:</h3>
                        <ul style="list-style: none; padding-left: 0;">
                            <li><strong>Prediction:</strong> {prediction}</li>
                            <li><strong>Confidence:</strong> {confidence:.2%}</li>
                        </ul>
                    </div>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{result_link}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">
                            View Full Results
                        </a>
                    </p>
                    
                    <p>Thank you for using our diagnostic service.</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: gray; font-size: 12px; text-align: center;">
                        This is an automated message. Please do not reply to this email.<br>
                        © {settings.app_name} - All rights reserved
                    </p>
                </div>
            </body>
        </html>
        """

        logger.info(
            f"📧 Sending diagnosis completion email to {to_email} for diagnosis {diagnosis_id}"
        )
        return EmailService._send_email(to_email, subject, html_content)

    @staticmethod
    def send_diagnosis_failed_email(
        to_email: str,
        user_name: str,
        diagnosis_id: int,
        disease_name: str,
        error_message: str,
    ) -> bool:
        """
        Send email notification when diagnosis fails.

        Args:
            to_email: User's email address
            user_name: User's name
            diagnosis_id: Diagnosis ID
            disease_name: Disease name
            error_message: Error message

        Returns:
            bool: True if email sent successfully
        """
        subject = f"Issue with Your {disease_name} Diagnosis - {settings.app_name}"

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Hello {user_name},</h2>
                    <p>We encountered an issue processing your diagnosis request (ID: <strong>{diagnosis_id}</strong>) for <strong>{disease_name}</strong>.</p>
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                        <strong>Error:</strong> {error_message}
                    </div>
                    
                    <p>Please try submitting your request again, or contact our support team if the issue persists.</p>
                    
                    <p>We apologize for the inconvenience.</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: gray; font-size: 12px; text-align: center;">
                        This is an automated message. Please do not reply to this email.<br>
                        © {settings.app_name} - All rights reserved
                    </p>
                </div>
            </body>
        </html>
        """

        logger.warning(
            f"📧 Sending diagnosis failure email to {to_email} for diagnosis {diagnosis_id}"
        )
        return EmailService._send_email(to_email, subject, html_content)
