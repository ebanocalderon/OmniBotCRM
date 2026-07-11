"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, Calendar as CalendarIcon, Clock, Users, Link as LinkIcon, Settings, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { format, addDays, addWeeks, addMonths, startOfWeek, subDays, subWeeks, subMonths } from "date-fns";
import { useApi, useTenant } from "@/components/TenantProvider";

// Interfaces
interface Appointment {
  id: string;
  title: string;
  contact: string;
  time: string;
  date: Date;
  status: "confirmed" | "cancelled" | "pending";
  type: string;
}

export default function CalendarsPage() {
  const { apiFetch } = useApi();
  const { tenantId } = useTenant();
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [newAppt, setNewAppt] = useState({
    title: "",
    contact: "",
    date: "",
    time: "",
    type: "Zoom"
  });

  // Fetch Appointments
  useEffect(() => {
    if (!tenantId || tenantId === "00000000-0000-0000-0000-000000000000") return;
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`/api/v1/scheduling/appointments`);
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        const mapped = data.map((a: any) => ({
          id: a.id,
          title: a.status === 'confirmed' ? 'Meeting' : 'Pending',
          contact: a.contact_email || 'Unknown',
          time: new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(a.start_time),
          status: a.status,
          type: "Zoom" // default for now
        }));
        setAppointments(mapped);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [currentDate, view, tenantId, apiFetch]);

  // Date Navigation Handlers
  const handlePrevious = () => {
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // API Handlers
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Need a valid calendar_id for backend. Use hardcoded or fetch first one.
      // For now we will fetch the first calendar to attach to.
      const calRes = await apiFetch(`/api/v1/scheduling/calendars`);
      const calendars = await calRes.json();
      if (!calendars || calendars.length === 0) {
        alert("Please create a calendar first in Settings > Calendars");
        return;
      }
      
      const startDateTime = new Date(`${newAppt.date}T${newAppt.time}`);
      const endDateTime = addMonths(startDateTime, 1); // Mock end time
      
      const payload = {
        calendar_id: calendars[0].id,
        contact_email: newAppt.contact,
        start_time: startDateTime.toISOString(),
        end_time: startDateTime.toISOString(), // Just for mock
        status: "confirmed"
      };
      
      const res = await apiFetch('/api/v1/scheduling/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to book");
      const saved = await res.json();
      
      // Optimistic update
      const createdAppt: Appointment = {
        id: saved.id,
        title: newAppt.title,
        contact: newAppt.contact,
        time: newAppt.time,
        date: startDateTime,
        status: "confirmed",
        type: newAppt.type
      };
      
      setAppointments([...appointments, createdAppt]);
      setIsModalOpen(false);
      setNewAppt({ title: "", contact: "", date: "", time: "", type: "Zoom" });
      
    } catch (error) {
      console.error("Failed to book appointment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date header
  const getHeaderDateString = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } else if (view === "week") {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Helper to get week days
  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - (currentDate.getDay() || 7) + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-800">Calendars</h1>
          
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer">
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
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
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
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-20">
              <div className="flex items-center gap-4">
                <button onClick={handlePrevious} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-slate-800 w-56 text-center">{getHeaderDateString()}</h2>
                <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={handleToday} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors ml-2">
                  Today
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-30">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Loading calendar...</p>
                </div>
              ) : null}

              {view === 'week' && (
                <>
                  {/* Days Header */}
                  <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                    <div className="w-16 shrink-0 border-r border-slate-200"></div>
                    {weekDays.map((day, i) => {
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div key={i} className={`flex-1 py-3 text-center border-r border-slate-200 text-sm font-medium ${isToday ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}>
                          {day.toLocaleDateString('en-US', { weekday: 'short' })} {day.getDate()}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Time Grid */}
                  <div className="relative" onClick={() => setIsModalOpen(true)}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex h-16 border-b border-slate-100">
                        <div className="w-16 shrink-0 border-r border-slate-200 flex items-start justify-center pt-2 bg-white">
                          <span className="text-[10px] text-slate-400 font-medium">{i + 8}:00 AM</span>
                        </div>
                        <div className="flex-1 flex border-r border-slate-100">
                          {Array.from({ length: 7 }).map((_, j) => (
                            <div key={j} className="flex-1 border-r border-slate-100 last:border-r-0 hover:bg-blue-50/30 transition-colors cursor-pointer group relative">
                              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center">
                                <Plus className="w-4 h-4 text-blue-400 opacity-50" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Render Real Appointments (If any) */}
                    {appointments.map((apt, index) => (
                      <div key={apt.id} className="absolute top-[16px] left-[calc(4rem+2*14.28%)] w-[13%] h-[32px] bg-blue-100 border-l-4 border-blue-500 rounded-r p-1 text-xs overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow z-20" onClick={(e) => e.stopPropagation()}>
                        <div className="font-bold text-blue-800 truncate">{apt.title}</div>
                        <div className="text-blue-600 truncate">{apt.contact}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === 'month' && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                   <p className="font-medium">Month view rendering...</p>
                </div>
              )}

              {view === 'day' && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <Clock className="w-12 h-12 mb-4 opacity-20" />
                   <p className="font-medium">Day view rendering...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Upcoming Agenda */}
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
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Upcoming Agenda</h3>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">{appointments.length}</span>
            </div>
            
            {appointments.length === 0 ? (
               <div className="text-center py-8">
                 <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                 <p className="text-sm font-medium text-slate-500">No upcoming appointments</p>
               </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
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
            )}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 text-lg">New Appointment</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Appointment Title</label>
                <input 
                  type="text" 
                  required
                  value={newAppt.title}
                  onChange={e => setNewAppt({...newAppt, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Discovery Call"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                <input 
                  type="text" 
                  required
                  value={newAppt.contact}
                  onChange={e => setNewAppt({...newAppt, contact: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Select or type contact..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newAppt.date}
                    onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    required
                    value={newAppt.time}
                    onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Type</label>
                <select 
                  value={newAppt.type}
                  onChange={e => setNewAppt({...newAppt, type: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="Zoom">Zoom Video</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Phone">Phone Call</option>
                  <option value="In Person">In Person</option>
                </select>
              </div>
            </form>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleBookAppointment}
                disabled={isSubmitting || !newAppt.title || !newAppt.contact || !newAppt.date}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
