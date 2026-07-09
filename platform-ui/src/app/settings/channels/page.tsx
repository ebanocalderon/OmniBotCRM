"use client";

import { useState } from "react";
import { 
  MessageCircle, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Smartphone,
  Globe,
  Mail,
  MoreVertical,
  Key,
  Link as LinkIcon
} from "lucide-react";

export default function ChannelsSettingsPage() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waConfig, setWaConfig] = useState({
    phoneNumberId: "",
    accessToken: "",
    verifyToken: "omnibot_v1_verify",
  });

  const handleSaveWhatsApp = async () => {
    // Phase 3.5 TODO: Send config to backend to create an Inbox
    setShowWhatsAppModal(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 text-slate-900 p-8">
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Channels & Integrations</h1>
            <p className="text-sm text-slate-500 mt-1">Configure OmniBot to connect with your favorite messaging channels.</p>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WhatsApp Cloud API */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 mb-1">WhatsApp Cloud API</h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
              Connect your WhatsApp Business account directly to OmniBot. Meta official API.
            </p>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-500">1 Number Configured</span>
              <button 
                onClick={() => setShowWhatsAppModal(true)}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Configure
              </button>
            </div>
          </div>

          {/* Telegram */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <MessageCircle className="w-6 h-6" /> {/* Replace with Telegram icon later */}
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 mb-1">Telegram Bot</h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
              Connect a Telegram bot via BotFather to manage conversations directly.
            </p>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-400">Not Configured</span>
              <button className="text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Bot
              </button>
            </div>
          </div>

          {/* Web Chat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 mb-1">Live Web Chat</h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
              Embed a customizable chat widget on your website to talk to visitors.
            </p>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-400">Not Configured</span>
              <button className="text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Create Widget
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* WhatsApp Configuration Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">WhatsApp Configuration</h3>
                  <p className="text-xs text-slate-500">Connect to Meta Cloud API</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-400" /> Phone Number ID
                </label>
                <input 
                  type="text" 
                  value={waConfig.phoneNumberId}
                  onChange={(e) => setWaConfig({...waConfig, phoneNumberId: e.target.value})}
                  placeholder="e.g. 10293847561" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" /> Permanent Access Token
                </label>
                <input 
                  type="password" 
                  value={waConfig.accessToken}
                  onChange={(e) => setWaConfig({...waConfig, accessToken: e.target.value})}
                  placeholder="EAAL..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
                <h4 className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Webhook Setup</h4>
                <p className="text-xs text-blue-700 mb-3">Copy this information into your Meta Developer App settings under WhatsApp &gt; Configuration.</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800">Callback URL</span>
                    <div className="flex items-center gap-2 mt-1 bg-white border border-blue-200 rounded-lg px-3 py-2">
                      <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                      <code className="text-xs text-slate-700 flex-1">https://your-domain.com/api/v1/messaging/webhooks/whatsapp</code>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-800">Verify Token</span>
                    <div className="flex items-center gap-2 mt-1 bg-white border border-blue-200 rounded-lg px-3 py-2">
                      <Key className="w-3.5 h-3.5 text-blue-400" />
                      <code className="text-xs text-slate-700 flex-1">{waConfig.verifyToken}</code>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveWhatsApp}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
