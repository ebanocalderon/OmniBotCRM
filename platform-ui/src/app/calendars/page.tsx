"use client";

import React, { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Calendar as CalendarIcon, Clock, Users, Link as LinkIcon, Settings, ChevronLeft, ChevronRight } from "lucide-react";

// Mock Data
const MOCK_APPOINTMENTS = [
  { id: "apt-1", title: "Discovery Call", contact: "John Doe", time: "09:00 AM - 09:30 AM", status: "confirmed", type: "Zoom" },
  { id: "apt-2", title: "Onboarding Session", contact: "Jane Smith", time: "11:00 AM - 12:00 PM", status: "confirmed", type: "Google Meet" },
  { id: "apt-3", title: "Quarterly Review", contact: "Acme Corp", time: "02:00 PM - 03:00 PM", status: "cancelled", type: "Phone" },
  { id: "apt-4", title: "Technical Support", contact: "Peter Gibbons", time: "04:30 PM - 05:00 PM", status: "confirmed", type: "Zoom" },
];

export default function CalendarsPage() {
  const [view, setView] = useState("week"); // week, month, day

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-800">Calendars</h1>
          
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium">
            <option>Sales Team Round Robin</option>
            <option>Personal (Demo Biz)</option>
            <option>Support Queue</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-md">
            <button 
              className={`px-3 py-1 text-sm font-medium rounded ${view === 'day' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setView('day')}
            >Day</button>
            <button 
              className={`px-3 py-1 text-sm font-medium rounded ${view === 'week' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setView('week')}
            >Week</button>
            <button 
              className={`px-3 py-1 text-sm font-medium rounded ${view === 'month' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setView('month')}
            >Month</button>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors border border-slate-200">
            <Settings className="w-4 h-4" />
            Calendar Settings
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* Left Side - Calendar Grid */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            
            {/* Calendar Controls */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-slate-800 w-48 text-center">July 10 - 16, 2026</h2>
                <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors ml-2">
                  Today
                </button>
              </div>
            </div>

            {/* Mock Weekly Calendar Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                <div className="w-16 shrink-0 border-r border-slate-200"></div>
                {['Mon 10', 'Tue 11', 'Wed 12', 'Thu 13', 'Fri 14', 'Sat 15', 'Sun 16'].map((day, i) => (
                  <div key={day} className={`flex-1 py-3 text-center border-r border-slate-200 text-sm font-medium ${i === 2 ? 'text-blue-600' : 'text-slate-600'}`}>
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="relative">
                {/* Time labels & horizontal lines */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex h-16 border-b border-slate-100">
                    <div className="w-16 shrink-0 border-r border-slate-200 flex items-start justify-center pt-2">
                      <span className="text-[10px] text-slate-400 font-medium">{i + 8}:00 AM</span>
                    </div>
                    <div className="flex-1 flex border-r border-slate-100">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <div key={j} className="flex-1 border-r border-slate-100 last:border-r-0 hover:bg-blue-50/30 transition-colors cursor-pointer"></div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Mock Appointments blocks (absolute positioned) */}
                <div className="absolute top-[16px] left-[calc(4rem+2*14.28%)] w-[13%] h-[32px] bg-blue-100 border-l-4 border-blue-500 rounded-r p-1 text-xs overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                  <div className="font-bold text-blue-800 truncate">Discovery Call</div>
                  <div className="text-blue-600 truncate">John Doe</div>
                </div>
                
                <div className="absolute top-[192px] left-[calc(4rem+3*14.28%)] w-[13%] h-[64px] bg-indigo-100 border-l-4 border-indigo-500 rounded-r p-1 text-xs overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                  <div className="font-bold text-indigo-800 truncate">Onboarding Session</div>
                  <div className="text-indigo-600 truncate">Jane Smith</div>
                </div>
                
                <div className="absolute top-[384px] left-[calc(4rem+2*14.28%)] w-[13%] h-[64px] bg-red-100 border-l-4 border-red-500 rounded-r p-1 text-xs overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow opacity-50">
                  <div className="font-bold text-red-800 truncate line-through">Quarterly Review</div>
                  <div className="text-red-600 truncate">Acme Corp</div>
                </div>
                
                <div className="absolute top-[560px] left-[calc(4rem+4*14.28%)] w-[13%] h-[32px] bg-emerald-100 border-l-4 border-emerald-500 rounded-r p-1 text-xs overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                  <div className="font-bold text-emerald-800 truncate">Technical Support</div>
                  <div className="text-emerald-600 truncate">Peter Gibbons</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Upcoming Agenda & Links */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-xl z-20">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-md group transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">Copy Booking Link</div>
                  <div className="text-xs text-slate-500">Sales Team Round Robin</div>
                </div>
              </div>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Upcoming Today</h3>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">3</span>
            </div>
            
            <div className="space-y-3">
              {MOCK_APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600">{apt.time}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{apt.title}</h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {apt.contact}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    {apt.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
