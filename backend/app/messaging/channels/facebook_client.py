import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class FacebookClient:
    def __init__(self, page_access_token: str, page_id: str = "me"):
        # Graph API v19.0
        self.base_url = f"https://graph.facebook.com/v19.0/{page_id}/messages"
        self.access_token = page_access_token

    async def send_text_message(self, recipient_psid: str, text: str) -> Optional[dict]:
        """
        Sends an outbound text message to a Facebook Messenger user.
        """
        params = {
            "access_token": self.access_token
        }
        payload = {
            "recipient": {
                "id": recipient_psid
            },
            "message": {
                "text": text
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, params=params, json=payload, timeout=10.0)
                response.raise_for_status()
                logger.info(f"Successfully sent Meta Graph API message to PSID: {recipient_psid}")
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Meta Graph API Error ({e.response.status_code}): {e.response.text}")
                return None
            except Exception as e:
                logger.error(f"Error communicating with Meta Graph API: {str(e)}")
                return None
