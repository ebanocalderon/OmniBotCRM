"use client";

import React, { useState } from "react";
import { Plus, Image as ImageIcon, MessageSquare, ThumbsUp, MapPin, Globe, Share2, Clock, Hash } from "lucide-react";

export default function SocialPlanner() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activePreview, setActivePreview] = useState("facebook");

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Social Planner</h1>
          <p className="text-sm text-slate-500 font-medium">Schedule and manage your posts across all connected channels.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors shadow-sm">
            Accounts Settings
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm"
            onClick={() => setIsComposerOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Connected Accounts Quick View */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white border-2 border-slate-50 shadow-sm z-30 text-xs font-bold">
              FB
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white border-2 border-slate-50 shadow-sm z-20 text-xs font-bold">
              IG
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white border-2 border-slate-50 shadow-sm z-10 text-xs font-bold">
              IN
            </div>
          </div>
          <span className="text-sm font-medium text-slate-600">3 Accounts Connected</span>
        </div>

        {/* Mock Calendar Grid */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="py-3 px-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="grid grid-cols-7 border-b border-slate-200 last:border-b-0 h-32">
            {Array.from({length: 7}).map((_, i) => (
              <div key={`row1-${i}`} className={`p-2 border-r border-slate-200 last:border-r-0 relative hover:bg-slate-50 transition-colors cursor-pointer ${i === 3 ? 'bg-blue-50/30' : ''}`}>
                <div className="text-right text-sm font-semibold text-slate-400 mb-2">{i + 1}</div>
                {i === 3 && (
                  <div className="absolute top-8 left-1 right-1 bg-blue-100 border-l-4 border-blue-500 text-blue-800 text-xs p-1.5 rounded shadow-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-bold">FB</span>
                      <span className="font-bold text-pink-600">IG</span>
                    </div>
                    <div className="truncate font-semibold">Summer Sale Launch</div>
                    <div className="text-[10px] text-blue-600">09:00 AM</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-b border-slate-200 last:border-b-0 h-32">
            {Array.from({length: 7}).map((_, i) => (
              <div key={`row2-${i}`} className={`p-2 border-r border-slate-200 last:border-r-0 relative hover:bg-slate-50 transition-colors cursor-pointer ${i === 1 ? 'bg-blue-50/30' : ''}`}>
                <div className="text-right text-sm font-semibold text-slate-400 mb-2">{i + 8}</div>
                {i === 1 && (
                  <div className="absolute top-8 left-1 right-1 bg-green-100 border-l-4 border-green-500 text-green-800 text-xs p-1.5 rounded shadow-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-bold">IN</span>
                    </div>
                    <div className="truncate font-semibold">Company Update</div>
                    <div className="text-[10px] text-green-600">14:00 PM • Posted</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Composer Modal Overlay */}
      {isComposerOpen && (
        <div className="absolute inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex overflow-hidden">
            
            {/* Left Side: Editor */}
            <div className="w-1/2 flex flex-col border-r border-slate-200">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">Create Post</h2>
                <button 
                  onClick={() => setIsComposerOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Socials</label>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 p-2 border-2 border-blue-500 bg-blue-50 rounded-lg text-blue-700 font-semibold text-sm">
                      <span className="font-bold w-4 h-4 text-xs">FB</span> Facebook
                    </button>
                    <button className="flex items-center gap-2 p-2 border-2 border-pink-500 bg-pink-50 rounded-lg text-pink-700 font-semibold text-sm">
                      <span className="font-bold w-4 h-4 text-xs">IG</span> Instagram
                    </button>
                    <button className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">
                      <span className="font-bold w-4 h-4 text-xs text-blue-700">IN</span> LinkedIn
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Post Content</label>
                  <textarea 
                    className="w-full border border-slate-300 rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What do you want to share?"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer">
                    <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                    <span className="font-semibold text-sm">Upload Photo or Video</span>
                    <span className="text-xs">Drag and drop files here</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input type="datetime-local" className="border border-slate-300 rounded px-2 py-1.5 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-bold bg-white"
                  >
                    Save Draft
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-bold shadow-sm"
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Side: Preview */}
            <div className="w-1/2 flex flex-col bg-slate-100">
              <div className="p-4 border-b border-slate-200 bg-white flex justify-center gap-4">
                <button 
                  onClick={() => setActivePreview('facebook')}
                  className={`flex flex-col items-center gap-1 ${activePreview === 'facebook' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  <span className="font-bold w-6 h-6 flex justify-center items-center">FB</span>
                  <span className="text-[10px] font-bold">Facebook</span>
                </button>
                <button 
                  onClick={() => setActivePreview('instagram')}
                  className={`flex flex-col items-center gap-1 ${activePreview === 'instagram' ? 'text-pink-600' : 'text-slate-400'}`}
                >
                  <span className="font-bold w-6 h-6 flex justify-center items-center">IG</span>
                  <span className="text-[10px] font-bold">Instagram</span>
                </button>
              </div>
              
              <div className="flex-1 flex justify-center items-start p-8 overflow-y-auto">
                {/* Mock Phone Preview */}
                <div className="w-[320px] bg-white rounded-[2rem] shadow-xl border-[8px] border-slate-800 h-[600px] overflow-hidden flex flex-col">
                  
                  {/* Phone Header */}
                  <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Your Business Name</div>
                      <div className="text-[10px] text-slate-500">Just now • 🌍</div>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="p-3 text-sm text-slate-800">
                    Preview of your post content will appear here...
                  </div>
                  
                  {/* Mock Image Area */}
                  <div className="aspect-square bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                  </div>
                  
                  {/* Social Actions */}
                  <div className="p-3 flex justify-between border-t border-slate-100 text-slate-500">
                    <div className="flex gap-4">
                      <ThumbsUp className="w-4 h-4" />
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <Share2 className="w-4 h-4" />
                  </div>

                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
