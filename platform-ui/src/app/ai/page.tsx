"use client";

import React, { useState } from "react";
import { Sparkles, Type, FileText, Send, Copy, CheckCircle2, RotateCw, Settings2, Hash, Mail } from "lucide-react";

export default function ContentPlayground() {
  const [contentType, setContentType] = useState("social");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    setGeneratedOutput("");
    
    // Simulate generation delay
    setTimeout(() => {
      if (contentType === 'social') {
        setGeneratedOutput("🚀 We're thrilled to announce the launch of our new OmniBot AI capabilities! \n\nNow you can automate responses, qualify leads, and generate content faster than ever before. 🤖✨\n\nDrop a 💬 below if you're ready to upgrade your customer ops game!\n\n#OmniBot #AI #CustomerOps #SaaS");
      } else {
        setGeneratedOutput("Subject: Welcome to the Future of Customer Ops\n\nHi {{first_name}},\n\nI noticed you've been looking for ways to scale your customer support without losing that personal touch.\n\nWith OmniBot's new AI features, you can now automate routine queries while keeping your agents focused on high-value conversations.\n\nWould you be open to a quick 10-minute demo next week?\n\nBest,\nThe OmniBot Team");
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Content Playground
          </h1>
          <p className="text-sm text-slate-500 font-medium">Generate high-converting marketing copy and emails with AI.</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Input Form */}
        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
            Generation Settings
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Content Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setContentType('social')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-colors ${contentType === 'social' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <Hash className="w-6 h-6" />
                  <span className="font-semibold text-sm">Social Post</span>
                </button>
                <button 
                  onClick={() => setContentType('email')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-colors ${contentType === 'email' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <Mail className="w-6 h-6" />
                  <span className="font-semibold text-sm">Email Copy</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tone of Voice</label>
              <select className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm">
                <option>Professional & Trustworthy</option>
                <option>Friendly & Approachable</option>
                <option>Excited & Promotional</option>
                <option>Witty & Clever</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">What is this about?</label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={5}
                placeholder="E.g. We are launching a new AI feature that helps businesses automate their customer support..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience (Optional)</label>
              <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="E.g. Small business owners" />
            </div>

          </div>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm ${!prompt ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="w-2/3 bg-slate-50 flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-700">Generated Output</h2>
            {generatedOutput && (
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-sm font-semibold bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? "Copied!" : "Copy Text"}
                </button>
                <button className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                  {contentType === 'social' ? 'Schedule Post' : 'Use in Campaign'}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
            
            {/* Toolbar mockup */}
            <div className="border-b border-slate-200 bg-slate-50 p-2 flex items-center gap-2">
              <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><Type className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600 font-bold">B</button>
              <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600 italic font-serif">I</button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><Settings2 className="w-4 h-4" /></button>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 p-6 relative">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-600 animate-pulse" />
                  </div>
                  <p className="font-semibold text-purple-600 animate-pulse">AI is writing your content...</p>
                </div>
              ) : generatedOutput ? (
                <textarea 
                  className="w-full h-full resize-none focus:outline-none text-slate-700 whitespace-pre-wrap"
                  value={generatedOutput}
                  onChange={(e) => setGeneratedOutput(e.target.value)}
                ></textarea>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="font-semibold">Your generated content will appear here</p>
                  <p className="text-sm">Fill out the settings on the left and hit generate!</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
