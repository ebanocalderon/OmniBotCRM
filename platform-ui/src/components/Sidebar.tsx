"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Bot,
  Zap,
  Phone,
  BarChart3,
  CreditCard,
  LogOut,
  ChevronRight
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();
  const { logout } = useAuth();

  // Do not render on login or landing pages
  if (pathname === "/login" || pathname === "/") {
    return null;
  }

  // GoHighLevel style structure
  const mainNavigation = [
    { name: "Launchpad", path: "/launchpad", icon: Zap },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Conversations", path: "/conversations", icon: MessageSquare },
    { name: "CRM", path: "/contacts", icon: Users },
    { name: "Automations", path: "/automations", icon: Bot },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Reporting", path: "/reporting", icon: BarChart3 },
  ];

  const configNavigation = [
    { name: "Phone System", path: "/phone", icon: Phone },
    { name: "Integrations", path: "/settings/channels", icon: Zap },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-slate-950 text-slate-300 border-r border-slate-900 flex flex-col h-full z-10 flex-shrink-0 transition-all duration-300">
      
      {/* Brand / Logo Area */}
      <div className="h-16 px-6 border-b border-slate-800/60 flex items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">OmniBot</span>
        </div>
      </div>

      {/* Agency/Sub-Account Switcher (GHL style) */}
      <div className="p-4">
        <button className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:bg-slate-800/80 hover:border-slate-700 transition-all group">
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Sub-Account</span>
            <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">Acme Corp</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* Main Navigation */}
        <div className="mb-6">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Platform
          </div>
          <div className="space-y-[2px]">
            {mainNavigation.map((route) => {
              const isActive = pathname === route.path || pathname.startsWith(route.path + "/");
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <route.icon 
                    className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${
                      isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                    }`} 
                  />
                  {route.name}
                  
                  {/* Unread badge example for Conversations */}
                  {route.name === "Conversations" && (
                    <span className="ml-auto bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Configuration Navigation */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Configuration
          </div>
          <div className="space-y-[2px]">
            {configNavigation.map((route) => {
              const isActive = pathname === route.path || pathname.startsWith(route.path + "/");
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <route.icon 
                    className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${
                      isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                    }`} 
                  />
                  {route.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/50">
        
        {/* Language Toggle */}
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-xs text-slate-500">Language</span>
          <button 
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors"
          >
            {lang.toUpperCase()}
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 group cursor-pointer" onClick={logout}>
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-white shadow-sm group-hover:border-red-500/50 transition-colors">
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">Admin User</p>
            <p className="text-[11px] text-slate-500 truncate group-hover:text-red-400 transition-colors flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Log out
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
