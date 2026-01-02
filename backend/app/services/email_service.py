from __future__ import print_function
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from typing import Optional
from pathlib import Path
from app.core.config import settings
import logging

logger = logging.getLogger("email")


class EmailService:
    """Email service using Brevo (Sendinblue) API for transactional emails"""

    @staticmethod
    def _get_api_instance():
        """Get configured Brevo API instance"""
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key["api-key"] = settings.brevo_api_key
        return sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

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
        """Internal method to send email via Brevo API"""
        try:
            # Check if Brevo API is configured
            if not settings.brevo_api_key or not settings.brevo_from_email:
                # Log for development (when Brevo is not configured)
                logger.warning(
                    f"Brevo API not configured. Subject: {subject} to {to_email}"
                )
                print(f"📧 Email: {subject}")
                print(f"📩 To: {to_email}")
                print(f"⚠️  Brevo API not configured - email not sent")
                return True

            # Initialize Brevo API
            api_instance = EmailService._get_api_instance()

            # Create email object
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": to_email}],
                sender={
                    "name": settings.brevo_from_name,
                    "email": settings.brevo_from_email,
                },
                subject=subject,
                html_content=html_content,
            )

            # Send email via Brevo API
            logger.info(f"Attempting to send email to {to_email} via Brevo API")
            api_response = api_instance.send_transac_email(send_smtp_email)

            # Get message ID if available
            message_id = getattr(api_response, "message_id", "N/A")
            logger.info(
                f"Email sent successfully to {to_email}. Message ID: {message_id}"
            )

            return True

        except ApiException as e:
            logger.error(f"Brevo API Exception when sending to {to_email}: {str(e)}")
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
        result_link: Optional[str] = None,
    ) -> bool:
        """
        Send email notification when diagnosis fails.

        Args:
            to_email: User's email address
            user_name: User's name
            diagnosis_id: Diagnosis ID
            disease_name: Disease name
            error_message: Error message
            result_link: Link to view diagnosis details

        Returns:
            bool: True if email sent successfully
        """
        subject = f"Issue with Your {disease_name} Diagnosis - {settings.app_name}"

        # Build result link button if provided
        result_link_html = ""
        if result_link:
            result_link_html = f"""
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{result_link}" style="background-color: #2196F3; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">
                            View Diagnosis Details
                        </a>
                    </p>
            """

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Hello {user_name},</h2>
                    <p>We encountered an issue processing your diagnosis request (ID: <strong>{diagnosis_id}</strong>) for <strong>{disease_name}</strong>.</p>
                    
                    
                    <p>Your diagnosis record has been saved and you can view the details below.</p>
                    {result_link_html}
                    
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

    @staticmethod
    def send_contact_form_email(
        name: str, email: str, subject: str, message: str
    ) -> bool:
        """
        Send contact form submission to admin email.

        Args:
            name: Sender's name
            email: Sender's email
            subject: Message subject
            message: Message content

        Returns:
            bool: True if email sent successfully
        """
        admin_email = "hirokreza121@gmail.com"
        email_subject = f"Contact Form: {subject}"

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10B981;">New Contact Form Submission</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>From:</strong> {name}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2c3e50;">Message:</h3>
                        <p style="white-space: pre-wrap;">{message}</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: gray; font-size: 12px; text-align: center;">
                        This message was sent via the {settings.app_name} contact form<br>
                        Reply directly to {email} to respond to the sender
                    </p>
                </div>
            </body>
        </html>
        """

        logger.info(f"📧 Sending contact form email from {email} to {admin_email}")
        return EmailService._send_email(admin_email, email_subject, html_content)
