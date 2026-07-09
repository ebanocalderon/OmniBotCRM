"use client";

import { useEffect, useState } from "react";
import { DollarSign, Users, MessageSquare, Briefcase } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface StageData {
  name: string;
  value: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface DashboardData {
  total_revenue: number;
  active_opportunities: number;
  total_contacts: number;
  total_conversations: number;
  opportunities_by_stage: StageData[];
  leads_by_status: StatusData[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/proxy/analytics/dashboard", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500 font-medium">Loading Dashboard...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">Dashboard Overview</h1>
        <p className="text-slate-400 mt-1">Your CRM performance metrics at a glance.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card rounded-2xl p-6 flex flex-col group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Total Revenue (Won)</p>
          <h3 className="text-3xl font-bold text-white drop-shadow-sm">
            ${data.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Active Opportunities</p>
          <h3 className="text-3xl font-bold text-white drop-shadow-sm">{data.active_opportunities}</h3>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/30 transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Total Contacts</p>
          <h3 className="text-3xl font-bold text-white drop-shadow-sm">{data.total_contacts}</h3>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30 transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Total Conversations</p>
          <h3 className="text-3xl font-bold text-white drop-shadow-sm">{data.total_conversations}</h3>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Pipeline Funnel (Bar Chart) */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Opportunities by Stage</h3>
          <div className="h-[300px]">
            {data.opportunities_by_stage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.opportunities_by_stage}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dx={-10}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No opportunities data</div>
            )}
          </div>
        </div>

        {/* Leads by Status (Pie Chart) */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Leads by Status</h3>
          <div className="h-[300px]">
            {data.leads_by_status.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.leads_by_status}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.leads_by_status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No leads data</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
