"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Search, Filter, Send, ThumbsUp, MapPin, Globe } from "lucide-react";

// Mock Data
const MOCK_REVIEWS = [
  { id: 1, author: "Sarah Jenkins", platform: "Google", rating: 5, date: "2 days ago", text: "Amazing service! The team was super responsive and helped me resolve my issue within minutes. Highly recommend to anyone looking for reliable support.", reply: "Thank you so much, Sarah! We're thrilled to hear you had a great experience." },
  { id: 2, author: "Michael Chen", platform: "Facebook", rating: 4, date: "1 week ago", text: "Good product overall. The onboarding could be slightly better but once you get the hang of it, it's very powerful.", reply: null },
  { id: 3, author: "Elena Rodriguez", platform: "Google", rating: 1, date: "2 weeks ago", text: "Very disappointed. Nobody showed up for my scheduled appointment.", reply: null },
  { id: 4, author: "David Kim", platform: "Yelp", rating: 5, date: "3 weeks ago", text: "Best in the business! The new features are exactly what we needed to scale our operations.", reply: "We appreciate the kind words, David. Let us know if you need anything else!" },
];

export default function ReputationDashboard() {
  const [activeTab, setActiveTab] = useState("reviews");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reputation Management</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor and respond to customer reviews across platforms.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm self-start md:self-auto">
          <Send className="w-4 h-4" />
          Send Review Request
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Total Reviews</div>
              <div className="text-3xl font-bold text-slate-800">142</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Average Rating</div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-slate-800">4.8</div>
                <div className="flex">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Invites Sent</div>
              <div className="text-3xl font-bold text-slate-800">356</div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Unreplied Reviews</div>
              <div className="text-3xl font-bold text-red-600">2</div>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Tabs & Filters */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4">
            <div className="flex">
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Reviews Feed
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'requests' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Review Requests
              </button>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button className="p-1.5 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Reviews List */}
          <div className="p-0">
            {activeTab === 'reviews' && MOCK_REVIEWS.map(review => (
              <div key={review.id} className="p-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{review.author}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                          {review.platform === 'Google' ? <Globe className="w-3 h-3 text-red-500" /> : <ThumbsUp className="w-3 h-3 text-blue-600" />}
                          {review.platform}
                        </span>
                        <span>•</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                
                <p className="text-slate-700 text-sm mb-4">{review.text}</p>
                
                {review.reply ? (
                  <div className="ml-10 bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                    <div className="absolute top-4 -left-2 w-4 h-4 bg-slate-50 border-t border-l border-slate-200 transform -rotate-45"></div>
                    <div className="text-xs font-bold text-slate-500 mb-1">Response from Owner</div>
                    <p className="text-sm text-slate-700">{review.reply}</p>
                  </div>
                ) : (
                  <div className="ml-10">
                    {activeReplyId === review.id ? (
                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                        <textarea 
                          className="w-full text-sm p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Write your response..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          autoFocus
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-3">
                          <button 
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded"
                            onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                          >Cancel</button>
                          <button className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">
                            Post Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        onClick={() => setActiveReplyId(review.id)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Reply to this review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
