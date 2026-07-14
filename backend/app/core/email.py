import logging

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Sends the password reset email via Resend. Raises on failure so the
    caller can decide how to handle it (we still return a generic success
    response to the user either way, to avoid email enumeration)."""
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": to_email,
            "subject": "Reset your InterviewAI password",
            "html": f"""
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #111827;">Reset your password</h2>
                    <p style="color: #374151; line-height: 1.6;">
                        We received a request to reset your InterviewAI password.
                        Click the button below to choose a new one. This link expires in 30 minutes.
                    </p>
                    <a href="{reset_link}"
                       style="display: inline-block; background: #6366f1; color: #fff;
                              padding: 12px 24px; border-radius: 8px; text-decoration: none;
                              font-weight: 600; margin: 16px 0;">
                        Reset Password
                    </a>
                    <p style="color: #6b7280; font-size: 13px;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            """,
        })
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
        raise