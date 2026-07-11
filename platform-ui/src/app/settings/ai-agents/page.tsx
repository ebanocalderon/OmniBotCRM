"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Plus, Settings, Brain, MessageSquare, Edit3, MoreHorizontal, CheckCircle2, Zap, Loader2, Send, X } from "lucide-react";

// Interfaces
interface Agent {
  id: string | number;
  name: string;
  type: string;
  provider: string;
  model: string;
  active: boolean;
  systemPrompt: string;
  temperature: number;
}

export default function AIAgentsSettings() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [currentAgent, setCurrentAgent] = useState<Partial<Agent>>({
    name: "New Agent",
    type: "conversation",
    provider: "OpenAI",
    model: "gpt-4-turbo",
    active: true,
    systemPrompt: "You are a helpful customer support agent for a SaaS company. Always be polite, concise, and professional.",
    temperature: 0.7
  });

  // Playground State
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [playgroundChat, setPlaygroundChat] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Agents
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        // Empty state
        setAgents([]);
      } catch (error) {
        console.error("Failed to fetch agents", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Scroll to bottom of playground
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [playgroundChat]);

  const handleSaveAgent = async () => {
    setIsSaving(true);
    try {
      console.log("Saving agent payload:", currentAgent);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAgent = { ...currentAgent, id: Date.now() } as Agent;
      setAgents([...agents, newAgent]);
      setIsConfigOpen(false);
    } catch (error) {
      console.error("Failed to save agent", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateAI = async () => {
    if (!playgroundInput.trim()) return;
    
    const userText = playgroundInput;
    setPlaygroundInput("");
    setPlaygroundChat(prev => [...prev, { role: 'user', text: userText }]);
    setIsSimulating(true);
    
    try {
      if (currentAgent.provider === 'Ollama') {
        const response = await fetch('/api/ollama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: currentAgent.model,
            temperature: currentAgent.temperature,
            messages: [
              { role: 'system', content: currentAgent.systemPrompt },
              ...playgroundChat,
              { role: 'user', content: userText }
            ]
          })
        });

        if (!response.ok) throw new Error("Network response was not ok");
        if (!response.body) throw new Error("No response body");

        setPlaygroundChat(prev => [...prev, { role: 'ai', text: "" }]);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\\n').filter(l => l.trim() !== '');
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.message && data.message.content) {
                setPlaygroundChat(prev => {
                  const newChat = [...prev];
                  newChat[newChat.length - 1].text += data.message.content;
                  return newChat;
                });
              }
            } catch (e) {
              // Ignore partial JSON parsing errors during stream
            }
          }
        }
      } else {
        // Fallback for non-Ollama providers (simulated for now until backend proxy is ready)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPlaygroundChat(prev => [...prev, { 
          role: 'ai', 
          text: `(Backend Response) Based on my instructions to be a "${currentAgent.type}" agent, here is my response to: "${userText}".`
        }]);
      }
    } catch (error) {
      console.error("Failed AI simulation", error);
      setPlaygroundChat(prev => [...prev, { role: 'ai', text: "Error: Could not connect to AI Provider." }]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleAgentStatus = async (id: string | number) => {
    // Optimistic Update
    setAgents(agents.map(a => a.id === id ? { ...a, active: !a.active } : a));
    try {
      // await fetch(`/api/v1/agents/${id}/status`, { method: 'PATCH' });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Revert on fail
      setAgents(agents.map(a => a.id === id ? { ...a, active: !a.active } : a));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Agents</h1>
          <p className="text-sm text-slate-500 font-medium">Configure customized AI assistants for different tasks.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentAgent({
              name: "New Agent",
              type: "conversation",
              provider: "OpenAI",
              model: "gpt-4-turbo",
              active: true,
              systemPrompt: "You are a helpful assistant.",
              temperature: 0.7
            });
            setPlaygroundChat([]);
            setIsConfigOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-xl">
            <Brain className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-600 font-bold mb-1">No AI Agents Configured</p>
            <p className="text-sm text-slate-500 mb-4">Click "Create Agent" to setup your first assistant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
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
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => handleToggleAgentStatus(agent.id)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full transition-colors ${agent.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {agent.active ? 'Active' : 'Inactive'}
                      </button>
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
        )}
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="absolute inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden">
            
            {/* Left Side - Config Form */}
            <div className="w-1/2 flex flex-col border-r border-slate-200 bg-white">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Agent Settings
                </h2>
                <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Agent Name</label>
                    <input 
                      type="text" 
                      value={currentAgent.name}
                      onChange={e => setCurrentAgent({...currentAgent, name: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Agent Type</label>
                    <select 
                      value={currentAgent.type}
                      onChange={e => setCurrentAgent({...currentAgent, type: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    >
                      <option value="conversation">Conversation</option>
                      <option value="content">Content Generation</option>
                      <option value="review">Review Responder</option>
                      <option value="workflow">Workflow Logic</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Provider</label>
                    <select 
                      value={currentAgent.provider}
                      onChange={e => {
                        const newProvider = e.target.value;
                        const defaultModel = newProvider === 'OpenAI' ? 'gpt-4o' : newProvider === 'Anthropic' ? 'claude-3-opus' : 'qwen-0.8b';
                        setCurrentAgent({...currentAgent, provider: newProvider, model: defaultModel});
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    >
                      <option value="OpenAI">OpenAI</option>
                      <option value="Anthropic">Anthropic</option>
                      <option value="Ollama">Ollama (Local)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Model</label>
                    <select 
                      value={currentAgent.model}
                      onChange={e => setCurrentAgent({...currentAgent, model: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    >
                      {currentAgent.provider === 'OpenAI' && (
                        <>
                          <option value="gpt-4o">gpt-4o</option>
                          <option value="gpt-4-turbo">gpt-4-turbo</option>
                          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        </>
                      )}
                      {currentAgent.provider === 'Anthropic' && (
                        <>
                          <option value="claude-3-opus">claude-3-opus</option>
                          <option value="claude-3-sonnet">claude-3-sonnet</option>
                          <option value="claude-3-haiku">claude-3-haiku</option>
                        </>
                      )}
                      {currentAgent.provider === 'Ollama' && (
                        <>
                          <option value="qwen-0.8b">qwen-0.8b</option>
                          <option value="llama3">llama3</option>
                          <option value="mistral">mistral</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">System Prompt (Persona)</label>
                  <textarea 
                    rows={5} 
                    value={currentAgent.systemPrompt}
                    onChange={e => setCurrentAgent({...currentAgent, systemPrompt: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  <p className="text-xs text-slate-500 mt-1">Defines how the AI behaves and responds.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                    <span>Temperature (Creativity)</span>
                    <span className="text-blue-600">{currentAgent.temperature}</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.1" 
                    value={currentAgent.temperature}
                    onChange={e => setCurrentAgent({...currentAgent, temperature: parseFloat(e.target.value)})}
                    className="w-full accent-blue-600 cursor-pointer" 
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                    <span>Factual</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors bg-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAgent}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSaving ? "Saving..." : "Save Agent"}
                </button>
              </div>
            </div>

            {/* Right Side - Test Playground */}
            <div className="w-1/2 flex flex-col bg-[#f8fafc]">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-600" />
                  Test Playground
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {playgroundChat.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Bot className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Test your agent's responses here.</p>
                    <p className="text-xs mt-1">Changes to the system prompt apply immediately.</p>
                  </div>
                ) : (
                  playgroundChat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                      }`}>
                        {msg.role === 'ai' && <Bot className="w-4 h-4 text-emerald-500 mb-1 inline-block mr-2" />}
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isSimulating && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      <span className="text-xs font-medium">AI is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <input 
                    type="text"
                    value={playgroundInput}
                    onChange={e => setPlaygroundInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSimulateAI()}
                    placeholder="Send a test message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 outline-none"
                  />
                  <button 
                    onClick={handleSimulateAI}
                    disabled={!playgroundInput.trim() || isSimulating}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
