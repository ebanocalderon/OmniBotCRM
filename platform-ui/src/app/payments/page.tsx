"use client";

import React, { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, FileText, CreditCard, Link as LinkIcon, DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock } from "lucide-react";

// Mock data based on invoice schemas
const MOCK_INVOICES = [
  { id: "inv-001", contact: "Acme Corp", amount: 1500.00, status: "paid", due_date: "2025-02-15", created_at: "2025-02-01" },
  { id: "inv-002", contact: "Globex Enterprise", amount: 4500.00, status: "sent", due_date: "2025-03-01", created_at: "2025-02-15" },
  { id: "inv-003", contact: "Initech Software", amount: 850.00, status: "overdue", due_date: "2025-02-10", created_at: "2025-01-20" },
  { id: "inv-004", contact: "Stark Industries", amount: 12000.00, status: "draft", due_date: "2025-04-01", created_at: "2025-03-01" },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Payments & Invoicing</h1>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors border border-slate-200">
              <LinkIcon className="w-4 h-4" />
              Payment Links
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500 mb-1">Total Revenue (30d)</div>
            <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              $18,450.00
              <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
              </span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500 mb-1">Outstanding Invoices</div>
            <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              $5,350.00
              <span className="text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-0.5" /> 2%
              </span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500 mb-1">Overdue Amount</div>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              $850.00
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm flex items-center justify-between group cursor-pointer hover:bg-slate-700 transition-colors">
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Stripe Connect</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Connected
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-slate-500 group-hover:text-slate-400 transition-colors" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 pt-2">
          <button 
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "invoices" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("invoices")}
          >
            Invoices
          </button>
          <button 
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "transactions" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button 
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "subscriptions" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            Subscriptions
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors border border-slate-200">
              <Filter className="w-4 h-4" />
              Status: All
            </button>
          </div>
          
          {/* Invoices Table */}
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {inv.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{inv.contact}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                      inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                      {inv.status === 'overdue' && <Clock className="w-3 h-3" />}
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{inv.created_at}</td>
                  <td className={`px-6 py-4 ${inv.status === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                    {inv.due_date}
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
