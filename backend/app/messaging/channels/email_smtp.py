"""
SMTP Email Channel Driver
Handles sending outgoing transactional emails using aiosmtplib.
"""
import logging
from email.message import EmailMessage
import aiosmtplib

logger = logging.getLogger(__name__)

class SMTPEmailDriver:
    """
    Driver for sending emails via SMTP asynchronously.
    Expects inbox configuration to contain:
      - smtp_host
      - smtp_port
      - smtp_user
      - smtp_password
      - from_email
    """
    def __init__(self, config: dict):
        self.host = config.get("smtp_host")
        self.port = int(config.get("smtp_port", 587))
        self.user = config.get("smtp_user")
        self.password = config.get("smtp_password")
        self.from_email = config.get("from_email")
        
        self.mock_mode = not (self.host and self.user and self.password and self.from_email)
        if self.mock_mode:
            logger.warning("SMTPEmailDriver initialized without full credentials. Mock mode enabled.")

    async def send_email(self, to_email: str, subject: str, html_body: str, text_body: str = "", reply_to_msg_id: str = None) -> dict:
        """
        Sends an email. Handles threading via In-Reply-To header if reply_to_msg_id is provided.
        """
        if self.mock_mode:
            logger.info(f"[MOCK SMTP] Sending email to {to_email}: {subject}")
            return {"provider_message_id": f"mock_smtp_id_{subject[:10]}", "status": "sent"}

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = to_email
        
        if reply_to_msg_id:
            msg['In-Reply-To'] = reply_to_msg_id
            msg['References'] = reply_to_msg_id

        # Add parts
        if text_body:
            msg.set_content(text_body)
        if html_body:
            msg.add_alternative(html_body, subtype='html')

        try:
            await aiosmtplib.send(
                msg,
                hostname=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                use_tls=(self.port == 465),
                start_tls=(self.port == 587)
            )
            # In a real app, we'd extract the generated Message-ID from the SMTP response
            # to store in our DB for threading future replies.
            generated_msg_id = msg.get('Message-ID', 'unknown_msg_id')
            return {
                "provider_message_id": generated_msg_id,
                "status": "sent"
            }
        except Exception as e:
            logger.error(f"SMTP email send failed: {e}")
            raise
