"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Globe, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Details, 3: Confirmation
  
  // Mock data for the booking page
  const calendarData = {
    name: "Discovery Call",
    duration: 30,
    timezone: "America/New_York (Eastern Time)",
    owner: "John Smith",
    avatar: "https://ui-avatars.com/api/?name=John+Smith&background=0D8ABC&color=fff",
    description: "Book a 30-minute discovery call to discuss your needs and how we can help."
  };
  
  const mockTimes = ["09:00", "09:30", "10:00", "11:30", "13:00", "14:30", "15:00", "16:00"];

  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">You're booked!</h1>
          <p className="text-slate-600 mb-6">
            A calendar invitation has been sent to your email address.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Discovery Call</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <CalendarIcon className="w-5 h-5 text-slate-400" />
                <span>Friday, July 14, 2026</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="w-5 h-5 text-slate-400" />
                <span>{selectedTime} ({calendarData.duration} min)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Globe className="w-5 h-5 text-slate-400" />
                <span>{calendarData.timezone}</span>
              </div>
            </div>
          </div>
          
          <button className="text-blue-600 font-medium hover:underline">
            Schedule another appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Calendar Details */}
        <div className="md:w-[320px] bg-slate-50 border-r border-slate-200 p-8 flex flex-col">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="flex items-center text-blue-600 text-sm font-medium hover:underline mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          <img src={calendarData.avatar} alt={calendarData.owner} className="w-16 h-16 rounded-full mb-4 shadow-sm" />
          <div className="text-sm font-semibold text-slate-500 mb-1">{calendarData.owner}</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">{calendarData.name}</h1>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <Clock className="w-5 h-5 text-slate-400" />
              {calendarData.duration} min
            </div>
            
            {step === 2 && selectedDate && selectedTime && (
              <div className="flex items-center gap-3 text-green-700 font-bold bg-green-50 p-2 rounded-md -ml-2">
                <CalendarIcon className="w-5 h-5 text-green-600" />
                July {selectedDate}, 2026<br/>{selectedTime}
              </div>
            )}
            
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <Globe className="w-5 h-5 text-slate-400" />
              {calendarData.timezone}
            </div>
          </div>
          
          <p className="text-slate-600 text-sm leading-relaxed">
            {calendarData.description}
          </p>
        </div>
        
        {/* Right Side - Interactive Area */}
        <div className="flex-1 p-8 bg-white">
          
          {step === 1 ? (
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Select a Date & Time</h2>
              
              <div className="flex flex-col lg:flex-row gap-8 flex-1">
                {/* Date Picker (Mock) */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="font-semibold text-slate-800">July 2026</div>
                    <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                      <div key={day} className="text-[10px] font-bold text-slate-500">{day}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty padding */}
                    <div className="aspect-square"></div>
                    <div className="aspect-square"></div>
                    
                    {/* Days */}
                    {Array.from({length: 31}).map((_, i) => {
                      const day = i + 1;
                      const isPast = day < 10;
                      const isWeekend = (day + 2) % 7 === 5 || (day + 2) % 7 === 6;
                      const isAvailable = !isPast && !isWeekend;
                      const isSelected = selectedDate === day;
                      
                      return (
                        <button 
                          key={day}
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedDate(day);
                              setSelectedTime(null);
                            }
                          }}
                          className={`
                            aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                            ${!isAvailable ? 'text-slate-300 cursor-not-allowed' : ''}
                            ${isAvailable && !isSelected ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer' : ''}
                            ${isSelected ? 'bg-blue-600 text-white shadow-md scale-110' : ''}
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Time Slots (Mock) */}
                {selectedDate && (
                  <div className="w-full lg:w-48 flex flex-col h-[400px]">
                    <div className="text-slate-600 font-medium mb-4 text-center">Friday, July {selectedDate}</div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {mockTimes.map(time => (
                        <div key={time} className="flex gap-2">
                          <button 
                            onClick={() => setSelectedTime(time)}
                            className={`flex-1 py-3 rounded-md text-sm font-bold border transition-all ${
                              selectedTime === time 
                                ? 'bg-slate-800 text-white border-slate-800 w-1/2' 
                                : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400 hover:border-2'
                            }`}
                          >
                            {time}
                          </button>
                          
                          {selectedTime === time && (
                            <button 
                              onClick={() => setStep(2)}
                              className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-sm transition-colors shadow-sm"
                            >
                              Next
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full max-w-md mx-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Enter Details</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Name *</label>
                  <input type="text" className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                  <input type="email" className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Please share anything that will help prepare for our meeting.</label>
                  <textarea rows={4} className="w-full border border-slate-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                
                <button 
                  onClick={() => setStep(3)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-md shadow-md transition-colors mt-4"
                >
                  Schedule Event
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
