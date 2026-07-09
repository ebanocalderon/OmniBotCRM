"use client";

import React, { useState } from "react";
import { Bot, Plus, Settings, Brain, MessageSquare, Edit3, MoreHorizontal, CheckCircle2, Zap } from "lucide-react";

const MOCK_AGENTS = [
  { id: 1, name: "Customer Support Bot", type: "conversation", provider: "OpenAI", model: "gpt-4-turbo", active: true },
  { id: 2, name: "Social Media Writer", type: "content", provider: "Anthropic", model: "claude-3-opus", active: true },
  { id: 3, name: "Review Responder", type: "review", provider: "OpenAI", model: "gpt-3.5-turbo", active: true },
  { id: 4, name: "Sales Qualifer", type: "workflow", provider: "Ollama", model: "llama3", active: false },
];

export default function AIAgentsSettings() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Agents</h1>
          <p className="text-sm text-slate-500 font-medium">Configure customized AI assistants for different tasks.</p>
        </div>
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_AGENTS.map((agent) => (
            <div key={agent.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-colors group">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    agent.type === 'conversation' ? 'bg-blue-100 text-blue-600' :
                    agent.type === 'content' ? 'bg-purple-100 text-purple-600' :
                    agent.type === 'review' ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {agent.type === 'conversation' ? <MessageSquare className="w-6 h-6" /> :
                     agent.type === 'content' ? <Edit3 className="w-6 h-6" /> :
                     agent.type === 'review' ? <Brain className="w-6 h-6" /> :
                     <Zap className="w-6 h-6" />}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${agent.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {agent.active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-1">{agent.name}</h3>
                <p className="text-sm text-slate-500 font-medium capitalize mb-4">{agent.type} Agent</p>
                
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-500">Provider</span>
                    <span className="font-semibold text-slate-700">{agent.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model</span>
                    <span className="font-semibold text-slate-700">{agent.model}</span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Settings className="w-4 h-4" /> Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="absolute inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Configure AI Agent
              </h2>
              <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Agent Name</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="New Agent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Agent Type</label>
                  <select className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Conversation</option>
                    <option>Content Generation</option>
                    <option>Review Responder</option>
                    <option>Workflow Logic</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Provider</label>
                  <select className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>OpenAI</option>
                    <option>Anthropic</option>
                    <option>Ollama (Local)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Model</label>
                  <select className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>gpt-4o</option>
                    <option>gpt-4-turbo</option>
                    <option>gpt-3.5-turbo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">System Prompt (Persona)</label>
                <textarea 
                  rows={4} 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="You are a helpful customer support agent for a SaaS company. Always be polite, concise, and professional."
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">Defines how the AI behaves and responds.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                  <span>Temperature (Creativity)</span>
                  <span className="text-blue-600">0.7</span>
                </label>
                <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-slate-500 mt-1 font-medium">
                  <span>Strict / Factual</span>
                  <span>Creative</span>
                </div>
              </div>

            </div>
            
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors bg-white"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Save Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
