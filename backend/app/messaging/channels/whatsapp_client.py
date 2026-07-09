import httpx
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)

class WhatsAppClient:
    """
    Client for interacting with the Meta WhatsApp Cloud API.
    """
    def __init__(self, token: str, phone_number_id: str):
        self.token = token
        self.phone_number_id = phone_number_id
        self.base_url = f"https://graph.facebook.com/v19.0/{self.phone_number_id}/messages"
        
    async def send_text_message(self, to_phone_number: str, message: str) -> bool:
        """
        Sends a simple text message via WhatsApp API.
        """
        if not self.token or not self.phone_number_id:
            logger.warning("WhatsApp API credentials missing. Skipping send.")
            return False
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone_number,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": message
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.base_url, headers=headers, json=payload, timeout=10.0)
                if response.status_code == 200:
                    logger.info(f"Successfully sent WhatsApp message to {to_phone_number}")
                    return True
                else:
                    logger.error(f"Failed to send WhatsApp message: {response.text}")
                    return False
        except Exception as e:
            logger.error(f"Exception sending WhatsApp message: {e}")
            return False
