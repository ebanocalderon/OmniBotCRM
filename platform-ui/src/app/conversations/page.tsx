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
  Bot,
  Loader2,
  Inbox,
  MessageSquare
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useApi, useTenant } from "@/components/TenantProvider";

// Interfaces for our state
interface Conversation {
  id: string | number;
  contactName: string;
  channel: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
}

interface Message {
  id: string | number;
  sender: string;
  text: string;
  time: string;
  type: string;
}

export default function ConversationsPage() {
  const { t } = useI18n();
  const { tenantId } = useTenant();
  const { apiFetch } = useApi();
  const [activeTab, setActiveTab] = useState("all");
  
  // Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Loading State
  const [isLoadingConv, setIsLoadingConv] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Form State
  const [messageInput, setMessageInput] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // WebSocket Connection
  useEffect(() => {
    if (!tenantId || tenantId === "00000000-0000-0000-0000-000000000000") return;

    // Use ws:// for local dev, wss:// for production
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Assuming backend runs on 8000 locally
    const host = window.location.hostname === "localhost" ? "localhost:8000" : window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/api/v1/messaging/ws/${tenantId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "new_message" && data.message) {
          const backendMsg = data.message;
          const newMsg: Message = {
            id: backendMsg.id,
            sender: backendMsg.sender_type,
            text: backendMsg.content,
            time: new Date(backendMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "text"
          };
          
          setMessages(prev => {
            // Prevent duplicate messages if optimistic update already added it (naive dedupe by text/sender)
            if (prev.some(m => m.text === newMsg.text && m.sender === newMsg.sender)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      } catch (err) {
        console.error("WS parsing error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [tenantId]);

  // Fetch Conversations (Real API)
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingConv(true);
      try {
        const res = await apiFetch(`/api/v1/messaging/conversations`);
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        
        const mapped = data.map((c: any) => ({
          id: c.id,
          contactName: c.contact_id ? `Contact ${c.contact_id.substring(0, 4)}` : "Unknown",
          channel: c.channel || "sms",
          lastMessage: "Click to view...",
          time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          status: c.status
        }));
        
        setConversations(mapped);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setIsLoadingConv(false);
      }
    };
    
    fetchConversations();
  }, [activeTab, apiFetch]);

  // Fetch Messages when a conversation is selected (Real API)
  useEffect(() => {
    if (!selectedConv) return;
    
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await apiFetch(`/api/v1/messaging/conversations/${selectedConv.id}/messages`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        
        const mapped = data.map((m: any) => ({
          id: m.id,
          sender: m.sender_type,
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "text"
        }));
        setMessages(mapped.reverse()); // Assume API returns latest first, so we reverse for chat UI
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [selectedConv, apiFetch]);
  
  // API Handlers
  const handleCall = () => {
    setIsDialerOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConv) return;

    const payloadText = messageInput;
    setMessageInput("");

    // 1. Optimistic Update
    const optimisticMessage: Message = {
      id: Date.now(),
      sender: "agent",
      text: payloadText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    // 2. Real API Call
    try {
      const payload = {
        content: payloadText,
        sender_type: "agent"
      };
      
      const res = await apiFetch(`/api/v1/messaging/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Send failed');
    } catch (error) {
      console.error("Message failed to send", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Derived state for filtering
  const filteredConversations = conversations.filter(c => 
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
          {isLoadingConv ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-500" />
              <p className="text-xs">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Inbox className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">No conversations found</p>
              <p className="text-xs mt-1 text-center px-4">There are no messages matching your current filters.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedConv?.id === conv.id 
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
          )}
        </div>
      </div>

      {/* CENTER PANE: Chat Window */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] relative">
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-600">Select a conversation</h3>
            <p className="text-sm mt-2">Choose a thread from the left panel to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold uppercase">
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
                <button 
                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-full transition-colors flex items-center gap-1 shadow-sm border border-emerald-200"
                  title="Toggle AI Auto-Reply"
                >
                  <Bot className="w-4 h-4" />
                  <span className="text-[10px] font-bold">AI Active</span>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button onClick={handleCall} className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                  <p className="text-sm">Loading message history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
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
                })
              )}
            </div>

            {/* Universal Composer Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all overflow-hidden">
                
                {/* Conditional Email Subject Line */}
                {selectedConv.channel === "email" && (
                  <div className="px-4 py-2 border-b border-slate-200 bg-white">
                    <input 
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Subject"
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
                    />
                  </div>
                )}
                
                <div className="flex items-end gap-2 p-2">
                  <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedConv.channel === "email" ? "Type your email..." : `Message via ${selectedConv.channel}...`}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-sm text-slate-700 outline-none"
                    rows={selectedConv.channel === "email" ? 3 : 1}
                  />
                  <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 mb-1">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl shadow-md transition-colors shrink-0 mb-0.5"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANE: Contact Info (280px) */}
      {selectedConv && (
        <div className="w-[280px] flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto custom-scrollbar">
          <div className="p-6 flex flex-col items-center border-b border-slate-100">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-2xl mb-4 shadow-inner uppercase">
              {selectedConv.contactName.charAt(0)}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{selectedConv.contactName}</h3>
            <p className="text-sm text-slate-500 mb-4">Contact Profile</p>
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
                  <span className="truncate">Not provided</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Not provided</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Not provided</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 px-2 py-1 rounded-md transition-colors">
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Activity */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h4>
              <div className="space-y-4">
                <p className="text-xs text-slate-400 italic">No recent activity.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Call Widget Overlay */}
      {isDialerOpen && selectedConv && (
        <div className="absolute top-20 right-8 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 flex flex-col">
          <div className="p-6 text-center text-white border-b border-slate-700">
            <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-3 flex items-center justify-center text-xl font-bold border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] uppercase">
              {selectedConv.contactName.charAt(0)}
            </div>
            <h3 className="font-bold text-lg">{selectedConv.contactName}</h3>
            <p className="text-emerald-400 text-sm mb-2">00:03</p>
            <p className="text-xs text-slate-400">Calling...</p>
          </div>
          <div className="p-6 bg-slate-800 grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
              <div className="p-3 bg-slate-700 rounded-full"><Phone className="w-4 h-4" /></div>
              <span className="text-[10px]">Mute</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
              <div className="p-3 bg-slate-700 rounded-full"><MoreVertical className="w-4 h-4" /></div>
              <span className="text-[10px]">Keypad</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
              <div className="p-3 bg-slate-700 rounded-full"><User className="w-4 h-4" /></div>
              <span className="text-[10px]">Add</span>
            </button>
          </div>
          <div className="p-4 bg-slate-900 flex justify-center">
            <button onClick={() => setIsDialerOpen(false)} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4 rotate-[135deg]" /> End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
