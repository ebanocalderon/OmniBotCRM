"""
Twilio Voice Channel Driver
Handles initiating outbound calls and generating TwiML for incoming routing.
"""
import logging
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse

logger = logging.getLogger(__name__)

class TwilioVoiceDriver:
    """
    Driver for Twilio VoIP integration.
    Expects inbox configuration to contain:
      - twilio_account_sid
      - twilio_auth_token
      - twilio_phone_number
      - ngrok_base_url (for webhook routing if testing locally)
    """

    def __init__(self, config: dict):
        self.account_sid = config.get("twilio_account_sid")
        self.auth_token = config.get("twilio_auth_token")
        self.phone_number = config.get("twilio_phone_number")
        self.base_url = config.get("ngrok_base_url", "https://api.omnibot.io")
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("TwilioVoiceDriver initialized without credentials. Mock mode enabled.")

    async def initiate_outbound_call(self, to_number: str, agent_id: str) -> dict:
        """
        Initiates an outbound call.
        The call first rings the customer, and when they answer, Twilio hits 
        a webhook (TwiML) to bridge the call to the agent's softphone or SIP.
        """
        if not self.client:
            logger.info(f"[MOCK TWILIO VOICE] Dialing {to_number} for agent {agent_id}")
            return {"provider_call_id": "mock_twilio_call_sid", "status": "queued"}

        try:
            # When the customer answers, Twilio requests this URL for instructions on what to do next.
            twiml_url = f"{self.base_url}/api/v1/webhooks/twilio/voice/outbound-bridge?agent_id={agent_id}"
            
            call = self.client.calls.create(
                to=to_number,
                from_=self.phone_number,
                url=twiml_url,
                record=True,
                status_callback=f"{self.base_url}/api/v1/webhooks/twilio/voice/status",
                status_callback_event=['initiated', 'ringing', 'answered', 'completed']
            )
            return {
                "provider_call_id": call.sid,
                "status": call.status
            }
        except Exception as e:
            logger.error(f"Twilio Voice call initiation failed: {e}")
            raise

    def generate_inbound_twiml(self, from_number: str) -> str:
        """
        Generates TwiML for an incoming call.
        By default, we ring the agent's web client (Client name is usually based on Agent ID)
        or route to a voicemail/IVR if no agents are available.
        """
        response = VoiceResponse()
        
        # Simple IVR / Routing example
        # In a real app, we'd query the DB to check routing rules (Step 3 in the UI settings)
        response.say("Thank you for calling Demo Business. Please wait while we connect you.", voice='alice')
        
        # Dial the browser client (softphone) registered as 'agent_desktop'
        # Requires Twilio Client token generation on the frontend
        dial = response.dial(record='record-from-answer')
        dial.client("agent_desktop")
        
        return str(response)
