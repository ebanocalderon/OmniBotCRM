import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class ChatwootClient:
    def __init__(self, base_url: str, api_token: str, account_id: str):
        self.base_url = base_url.rstrip("/")
        self.api_token = api_token
        self.account_id = account_id

    async def send_message(self, conversation_id: int, content: str) -> Optional[dict]:
        """
        Sends an outbound message to a specific Chatwoot conversation.
        """
        url = f"{self.base_url}/api/v1/accounts/{self.account_id}/conversations/{conversation_id}/messages"
        headers = {
            "api_access_token": self.api_token,
            "Content-Type": "application/json"
        }
        payload = {
            "content": content,
            "message_type": "outgoing",
            "private": False
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload, timeout=10.0)
                response.raise_for_status()
                logger.info(f"Successfully sent message to Chatwoot Conversation ID: {conversation_id}")
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Chatwoot API Error ({e.response.status_code}): {e.response.text}")
                return None
            except Exception as e:
                logger.error(f"Error communicating with Chatwoot: {str(e)}")
                return None
