(function() {
  if (window.OmniBotWidgetInitialized) return;
  window.OmniBotWidgetInitialized = true;

  const config = window.OmniBotConfig || {};
  const tenantId = config.tenantId;
  const apiUrl = config.apiUrl || "http://10.0.0.41:8001/api/v1"; // Hardcoded for demo/local testing

  if (!tenantId) {
    console.error("OmniBot: Missing tenantId in window.OmniBotConfig");
    return;
  }

  // Get or create session ID
  let sessionId = localStorage.getItem("omnibot_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("omnibot_session_id", sessionId);
  }

  // Inject CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .omnibot-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .omnibot-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #4f46e5;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .omnibot-bubble:hover {
      transform: scale(1.05);
    }
    .omnibot-bubble svg {
      fill: white;
      width: 30px;
      height: 30px;
    }
    .omnibot-chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .omnibot-chat-window.open {
      display: flex;
    }
    .omnibot-header {
      background: #4f46e5;
      color: white;
      padding: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .omnibot-header-close {
      cursor: pointer;
      opacity: 0.8;
    }
    .omnibot-header-close:hover {
      opacity: 1;
    }
    .omnibot-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .omnibot-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
    }
    .omnibot-message.contact {
      background: #4f46e5;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .omnibot-message.agent {
      background: white;
      color: #111827;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border: 1px solid #f3f4f6;
    }
    .omnibot-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    .omnibot-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      outline: none;
      font-size: 14px;
    }
    .omnibot-input:focus {
      border-color: #4f46e5;
    }
    .omnibot-send-btn {
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .omnibot-send-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    .omnibot-send-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  const container = document.createElement('div');
  container.className = 'omnibot-widget-container';
  container.innerHTML = `
    <div class="omnibot-chat-window" id="omnibot-chat-window">
      <div class="omnibot-header">
        <div>Live Chat</div>
        <div class="omnibot-header-close" id="omnibot-close">&times;</div>
      </div>
      <div class="omnibot-messages" id="omnibot-messages">
        <!-- Messages go here -->
      </div>
      <form class="omnibot-input-area" id="omnibot-form">
        <input type="text" class="omnibot-input" id="omnibot-input" placeholder="Type a message..." autocomplete="off">
        <button type="submit" class="omnibot-send-btn" id="omnibot-send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
      </form>
    </div>
    <div class="omnibot-bubble" id="omnibot-bubble">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
    </div>
  `;
  document.body.appendChild(container);

  const bubble = document.getElementById('omnibot-bubble');
  const chatWindow = document.getElementById('omnibot-chat-window');
  const closeBtn = document.getElementById('omnibot-close');
  const form = document.getElementById('omnibot-form');
  const input = document.getElementById('omnibot-input');
  const messagesDiv = document.getElementById('omnibot-messages');
  const sendBtn = document.getElementById('omnibot-send');

  let pollInterval = null;
  let lastMessageCount = 0;

  bubble.addEventListener('click', () => {
    chatWindow.classList.add('open');
    bubble.style.display = 'none';
    startPolling();
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
    bubble.style.display = 'flex';
    stopPolling();
  });

  function renderMessages(messages) {
    if (messages.length === lastMessageCount) return;
    lastMessageCount = messages.length;
    
    messagesDiv.innerHTML = '';
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.className = \`omnibot-message \${msg.sender_type === 'contact' ? 'contact' : 'agent'}\`;
      div.innerText = msg.content;
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function fetchMessages() {
    try {
      const res = await fetch(\`\${apiUrl}/messaging/webchat/\${tenantId}/messages?session_id=\${sessionId}\`);
      if (res.ok) {
        const data = await res.json();
        renderMessages(data);
      }
    } catch (e) {
      console.error("OmniBot fetch error:", e);
    }
  }

  function startPolling() {
    fetchMessages();
    if (!pollInterval) {
      pollInterval = setInterval(fetchMessages, 3000);
    }
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    // Optimistic UI
    const tempDiv = document.createElement('div');
    tempDiv.className = 'omnibot-message contact';
    tempDiv.innerText = text;
    messagesDiv.appendChild(tempDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      await fetch(\`\${apiUrl}/messaging/webchat/\${tenantId}/messages\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          content: text,
          name: "Website Visitor"
        })
      });
      fetchMessages();
    } catch (e) {
      console.error("Failed to send", e);
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  });

})();
