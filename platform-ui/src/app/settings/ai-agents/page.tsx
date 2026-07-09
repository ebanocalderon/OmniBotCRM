"use client";

import { useState } from "react";
import { Bot, Save, UploadCloud, Play, FileText, Send, User } from "lucide-react";

export default function AIAgentsSettingsPage() {
  const [temperature, setTemperature] = useState(0.7);
  const [messages, setMessages] = useState<{role: "user" | "bot", text: string}[]>([
    { role: "bot", text: "Hello! I'm your AI agent. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleTestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: "user" as const, text: input }];
    setMessages(newMsgs);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages([...newMsgs, { role: "bot" as const, text: "This is a simulated response based on your current settings and knowledge base." }]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Agents & Bots</h1>
            <p className="text-gray-500 mt-1">Train your AI assistant with custom prompts and knowledge.</p>
          </div>
          <button className="bg-[#12826a] hover:bg-[#0e6b57] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - Configuration */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-gray-200 bg-gray-50">
          
          <div className="max-w-2xl space-y-8">
            
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" /> Basic Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                  <input type="text" defaultValue="Support Assistant" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Temperature (Creativity)</label>
                    <span className="text-sm text-gray-500">{temperature.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.1" 
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> System Prompt
              </h3>
              <p className="text-sm text-gray-500 mb-3">Give your AI its personality and core instructions.</p>
              <textarea 
                rows={6} 
                defaultValue="You are a helpful customer support agent for Demo Biz. Always be polite and concise. If you don't know the answer, tell the user you will escalate to a human."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 font-mono resize-none"
              ></textarea>
            </section>

            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" /> Knowledge Base
              </h3>
              <p className="text-sm text-gray-500 mb-4">Upload PDFs, docs, or text files for the AI to use as context.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-center">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                <span className="text-sm font-medium text-blue-600">Click to upload</span>
                <span className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT up to 10MB</span>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">company-faq-2025.pdf</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Trained</span>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Right Panel - Test Playground */}
        <div className="w-[450px] bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Play className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Test Playground</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "bot" ? "bg-indigo-100 text-indigo-600" : "bg-blue-600 text-white"}`}>
                  {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleTestChat} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Test a message..." 
                className="w-full bg-gray-50 border border-gray-300 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button 
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5 ml-px" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
