"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Bot, Play, Pause, Activity, Clock } from "lucide-react";

// Mock Data
const MOCK_WORKFLOWS = [
  { id: "wf-001", name: "New Lead Welcome Sequence", status: "active", trigger: "Form Submitted", executions: 1245, success_rate: 98 },
  { id: "wf-002", name: "Missed Call Auto-Text", status: "active", trigger: "Call Missed", executions: 342, success_rate: 100 },
  { id: "wf-003", name: "Stale Deal Nurture", status: "paused", trigger: "Pipeline Stage Changed", executions: 89, success_rate: 45 },
];

export default function AutomationDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Workflows & Automations</h1>
          
          <Link href="/automation/builder/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create Workflow
          </Link>
        </div>

        {/* Top-Level Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Bot className="w-6 h-6" /></div>
            <div>
              <div className="text-sm font-medium text-slate-500">Active Workflows</div>
              <div className="text-2xl font-bold text-slate-800">12</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Play className="w-6 h-6" /></div>
            <div>
              <div className="text-sm font-medium text-slate-500">Executions (30d)</div>
              <div className="text-2xl font-bold text-slate-800">4,892</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Activity className="w-6 h-6" /></div>
            <div>
              <div className="text-sm font-medium text-slate-500">Success Rate</div>
              <div className="text-2xl font-bold text-slate-800">99.2%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search workflows..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors border border-slate-200">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Workflow Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Trigger Event</th>
                <th className="px-6 py-4">Total Executions</th>
                <th className="px-6 py-4">Success Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {MOCK_WORKFLOWS.map((wf) => (
                <tr key={wf.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <Link href={`/automation/builder/${wf.id}`} className="hover:text-blue-600 hover:underline">
                      {wf.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 ${
                      wf.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {wf.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs">
                      {wf.trigger}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{wf.executions.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full ${wf.success_rate > 90 ? 'bg-green-500' : 'bg-amber-500'}`} 
                          style={{ width: `${wf.success_rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{wf.success_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
