"use client";

import { Phone, Search, Save, Plus, ArrowRight } from "lucide-react";

export default function VoIPSettingsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">VoIP & Telephony</h1>
        <p className="text-gray-500 mt-1">Configure your phone system, purchase numbers, and set up call routing.</p>
      </div>

      <div className="space-y-8">
        
        {/* Step 1: Credentials */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Step 1: Provider Credentials</h2>
            <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Twilio Connected</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account SID</label>
              <input type="text" value="ACb8****************************" readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auth Token</label>
              <input type="password" value="********************************" readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Edit Credentials</button>
            </div>
          </div>
        </section>

        {/* Step 2: Phone Number Marketplace */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Step 2: Phone Numbers</h2>
            <p className="text-sm text-gray-500 mt-1">Manage existing numbers or purchase new ones.</p>
          </div>
          
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Active Numbers</h3>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">+1 (305) 555-1234</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Voice & SMS</span>
              </div>
              <button className="text-sm text-blue-600 font-medium">Configure</button>
            </div>
          </div>

          <div className="p-6 bg-gray-50/30">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Buy a New Number</h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by area code (e.g. 305)" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* Step 3: Routing Rules */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-900">Step 3: Call Routing Rules</h2>
              <p className="text-sm text-gray-500 mt-1">Determine what happens when a customer calls you.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
          
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">If call is to</span>
                    <span className="font-medium text-gray-900">+1 (305) 555-1234</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Route to</span>
                    <span className="font-medium text-gray-900">Main IVR Menu</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">Edit</button>
                  <button className="px-3 py-1.5 text-sm border border-red-200 bg-red-50 rounded-md font-medium text-red-600 hover:bg-red-100">Remove</button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                <Save className="w-4 h-4" /> Save Routing Configuration
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
