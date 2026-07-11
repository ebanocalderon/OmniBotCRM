"use client";

import { useState } from "react";
import { MessageSquare, MessageCircle, Code2, Copy, CheckCircle2 } from "lucide-react";

export default function ChatIntegrationsPage() {
  const [active, setActive] = useState({
    whatsapp: false,
    messenger: true,
    webchat: true
  });
  
  const [copied, setCopied] = useState(false);

  const scriptSnippet = `<script>
  window.OmniBotConfig = { tenantId: "demo-biz-2" };
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://cdn.omnibot.io/widget.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'omnibot-jssdk'));
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = async (key: keyof typeof active) => {
    const newValue = !active[key];
    // Optimistic update
    setActive({ ...active, [key]: newValue });
    
    try {
      // Simulate API Patch
      console.log(`Patching integration ${key} to ${newValue}`);
      // await fetch('/api/v1/settings/integrations', { 
      //   method: 'PATCH', 
      //   body: JSON.stringify({ [key]: newValue }) 
      // });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to update integration setting", error);
      // Revert optimistic update
      setActive({ ...active, [key]: !newValue });
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chat Integrations</h1>
        <p className="text-gray-500 mt-1">Connect your messaging channels to unify customer conversations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* WhatsApp Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Business</h3>
                <p className="text-xs text-gray-500">Official API Integration</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={active.whatsapp} onChange={() => toggle("whatsapp")} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 flex-1">Send and receive WhatsApp messages directly from the Conversations tab.</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Configure Settings →</button>
          </div>
        </div>

        {/* Messenger Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Facebook Messenger</h3>
                <p className="text-xs text-gray-500">Facebook Pages</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={active.messenger} onChange={() => toggle("messenger")} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 flex-1">Connect your Facebook page to reply to Messenger inquiries seamlessly.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Connected to <strong className="text-gray-900">Demo Biz Page</strong></span>
            <button className="text-red-500 text-sm font-medium hover:text-red-600">Disconnect</button>
          </div>
        </div>
      </div>

      {/* Web Chat Widget Setup */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Web Chat Widget</h3>
              <p className="text-sm text-gray-500">Embed live chat on your website</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={active.webchat} onChange={() => toggle("webchat")} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {active.webchat && (
          <div className="p-6 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Installation Code</h4>
            <p className="text-sm text-gray-600 mb-4">Paste this code snippet right before the closing <code>&lt;/body&gt;</code> tag on your website.</p>
            
            <div className="relative">
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto font-mono">
                {scriptSnippet}
              </pre>
              <button 
                onClick={copyToClipboard}
                className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors flex items-center gap-2 text-xs"
              >
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
