"""
Twilio SMS Channel Driver
Handles sending and receiving SMS/MMS via Twilio.
"""
import logging
from typing import Optional

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

class TwilioSMSDriver:
    """
    Driver for Twilio SMS integration.
    Expects inbox configuration to contain:
      - twilio_account_sid
      - twilio_auth_token
      - twilio_phone_number
    """

    def __init__(self, config: dict):
        self.account_sid = config.get("twilio_account_sid")
        self.auth_token = config.get("twilio_auth_token")
        self.phone_number = config.get("twilio_phone_number")
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("TwilioSMSDriver initialized without credentials. Mock mode enabled.")

    async def send_message(self, to_number: str, body: str, media_url: Optional[str] = None) -> dict:
        """
        Sends an SMS/MMS using Twilio.
        Returns the Twilio Message SID or a mock ID if credentials are not set.
        """
        if not self.client:
            logger.info(f"[MOCK TWILIO SMS] Sending to {to_number}: {body}")
            return {"provider_message_id": "mock_twilio_sid_12345", "status": "sent"}

        try:
            # Twilio's python client is synchronous by default, but we wrap it logically.
            # For a truly async implementation at scale, we'd use HTTPX directly to Twilio's API,
            # but the Twilio SDK is reliable for MVP.
            kwargs = {
                "to": to_number,
                "from_": self.phone_number,
                "body": body
            }
            if media_url:
                kwargs["media_url"] = [media_url]

            message = self.client.messages.create(**kwargs)
            return {
                "provider_message_id": message.sid,
                "status": message.status,
                "error_code": message.error_code
            }
        except TwilioRestException as e:
            logger.error(f"Twilio SMS send failed: {e}")
            raise

    async def handle_incoming_webhook(self, payload: dict) -> dict:
        """
        Parses an incoming Twilio SMS webhook.
        Extracts sender, receiver, body, and media attachments.
        """
        # Twilio sends data as form-urlencoded which FastAPI parses into a dict
        sender = payload.get("From")
        receiver = payload.get("To")
        body = payload.get("Body", "")
        message_sid = payload.get("MessageSid")
        
        # Extract media if MMS
        num_media = int(payload.get("NumMedia", 0))
        media_urls = []
        for i in range(num_media):
            media_urls.append(payload.get(f"MediaUrl{i}"))
            
        return {
            "provider_message_id": message_sid,
            "sender": sender,
            "receiver": receiver,
            "content": body,
            "media_urls": media_urls
        }
