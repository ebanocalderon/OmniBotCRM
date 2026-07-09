"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Video, 
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  User,
  Mail,
  Tag,
  Building,
  Clock,
  Bot
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

// Mock Data for UI presentation
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    contactName: "Sarah Jenkins",
    channel: "whatsapp",
    lastMessage: "Thanks, I will check the proposal and get back to you.",
    time: "10:42 AM",
    unread: 2,
    status: "open"
  },
  {
    id: 2,
    contactName: "Michael Chang",
    channel: "web",
    lastMessage: "How do I upgrade my current plan?",
    time: "Yesterday",
    unread: 0,
    status: "open"
  },
  {
    id: 3,
    contactName: "Acme Corp Support",
    channel: "telegram",
    lastMessage: "The integration is working perfectly now.",
    time: "Tuesday",
    unread: 0,
    status: "resolved"
  }
];

const MOCK_MESSAGES = [
  { id: 1, sender: "contact", text: "Hi, I have a question about my recent invoice.", time: "10:30 AM", type: "text" },
  { id: 2, sender: "agent", text: "Hello Sarah! I'd be happy to help you with that. Can you provide the invoice number?", time: "10:32 AM", type: "text" },
  { id: 3, sender: "contact", text: "Yes, it's INV-2026-089", time: "10:35 AM", type: "text" },
  { id: 4, sender: "ai_agent", text: "I found invoice INV-2026-089. It was issued on July 1st for $299.00. What specific question do you have about it?", time: "10:35 AM", type: "text" },
  { id: 5, sender: "contact", text: "Thanks, I will check the proposal and get back to you.", time: "10:42 AM", type: "text" },
];

export default function ConversationsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedConv, setSelectedConv] = useState(MOCK_CONVERSATIONS[0]);
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="h-full flex overflow-hidden bg-white">
      
      {/* LEFT PANE: Chat List (320px) */}
      <div className="w-[320px] flex-shrink-0 border-r border-slate-200 flex flex-col bg-white">
        {/* Header */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-lg text-slate-800">Conversations</h2>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-3 gap-1 shrink-0 mb-2">
          {["all", "mine", "unassigned"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md capitalize transition-colors ${
                activeTab === tab 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1 pb-4">
          {MOCK_CONVERSATIONS.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                selectedConv.id === conv.id 
                  ? "bg-slate-50 border border-slate-200 shadow-sm" 
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-sm text-slate-900 truncate pr-2">{conv.contactName}</h3>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 truncate flex-1">{conv.lastMessage}</p>
                {conv.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANE: Chat Window */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] relative">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              {selectedConv.contactName.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{selectedConv.contactName}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Online
                </span>
                <span>•</span>
                <span className="capitalize">{selectedConv.channel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {MOCK_MESSAGES.map((msg) => {
            const isMe = msg.sender === "agent";
            const isBot = msg.sender === "ai_agent";
            
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${isMe ? "order-2" : "order-1"}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {isMe ? "You" : isBot ? "OmniBot AI" : selectedConv.contactName}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? "bg-emerald-600 text-white rounded-tr-sm" 
                      : isBot 
                        ? "bg-white border border-emerald-100 rounded-tl-sm"
                        : "bg-white border border-slate-100 rounded-tl-sm text-slate-700"
                  }`}>
                    {isBot && <Bot className="w-4 h-4 text-emerald-500 mb-1 inline-block mr-2" />}
                    {msg.text}
                  </div>
                  
                  {isMe && (
                    <div className="text-right mt-1 px-1">
                      <CheckCheck className="w-3 h-3 text-emerald-500 inline-block" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-sm text-slate-700"
              rows={1}
            />
            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 mb-1">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors shrink-0 mb-0.5">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Contact Info (280px) */}
      <div className="w-[280px] flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto custom-scrollbar">
        <div className="p-6 flex flex-col items-center border-b border-slate-100">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-2xl mb-4 shadow-inner">
            {selectedConv.contactName.charAt(0)}
          </div>
          <h3 className="font-bold text-lg text-slate-900">{selectedConv.contactName}</h3>
          <p className="text-sm text-slate-500 mb-4">CEO at Acme Corp</p>
          <div className="flex gap-2 w-full">
            <button className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold transition-colors">
              Profile
            </button>
            <button className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 py-2 rounded-lg text-xs font-semibold transition-colors">
              Deal
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">About</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">sarah@acmecorp.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+1 (555) 019-2834</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Acme Corp</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-1 rounded-md">VIP Client</span>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-1 rounded-md">Enterprise</span>
              <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 px-2 py-1 rounded-md transition-colors">
                + Add Tag
              </button>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-700 font-medium">Visited Pricing Page</p>
                  <p className="text-[10px] text-slate-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-700 font-medium">Deal moved to "Negotiation"</p>
                  <p className="text-[10px] text-slate-400">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
