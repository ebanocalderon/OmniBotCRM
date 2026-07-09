"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Rocket, 
  LayoutDashboard, 
  MessageSquare, 
  CalendarDays, 
  Users, 
  Briefcase,
  CreditCard,
  Send,
  Bot,
  Globe,
  Award,
  Image as ImageIcon,
  Star,
  BarChart3,
  Store,
  Settings,
  ChevronDown,
  Search,
  UserCircle2
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/") {
    return null;
  }

  const navLinks = [
    { name: "Launchpad", path: "/launchpad", icon: Rocket },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Conversations", path: "/conversations", icon: MessageSquare },
    { name: "Calendars", path: "/calendars", icon: CalendarDays },
    { name: "Contacts", path: "/contacts", icon: Users },
    { name: "Opportunities", path: "/opportunities", icon: Briefcase },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Marketing", path: "/marketing", icon: Send },
    { name: "Automation", path: "/automation", icon: Bot },
    { name: "Sites", path: "/sites", icon: Globe },
    { name: "Memberships", path: "/memberships", icon: Award },
    { name: "Media Storage", path: "/media", icon: ImageIcon },
    { name: "Reputation", path: "/reputation", icon: Star },
    { name: "Reporting", path: "/reporting", icon: BarChart3 },
    { name: "App Marketplace", path: "/marketplace", icon: Store },
  ];

  return (
    <aside className="w-[240px] bg-[#1e293b] text-slate-300 flex flex-col h-full flex-shrink-0 border-r border-[#0f172a] shadow-xl">
      {/* Top Header Location Switcher */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="bg-slate-800 rounded-md p-2 flex items-center justify-between cursor-pointer hover:bg-slate-700 transition-colors">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCircle2 className="w-8 h-8 text-slate-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">Demo Biz 2</span>
              <span className="text-[10px] text-slate-400 truncate">Los Angeles, CA</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        
        {/* Search Input */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5">
            <kbd className="bg-slate-700 px-1 py-0.5 rounded text-[9px] text-slate-400">⌘</kbd>
            <kbd className="bg-slate-700 px-1 py-0.5 rounded text-[9px] text-slate-400">K</kbd>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <ul className="space-y-0.5 px-2">
          {navLinks.map((link) => {
            // Precise active route matching
            const isActive = pathname === link.path || pathname.startsWith(link.path + "/");
            return (
              <li key={link.path}>
                <Link
                  href={link.path}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive 
                      ? "bg-blue-600/10 text-white border-l-4 border-blue-500" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
                  }`}
                >
                  <link.icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                  <span className="font-medium">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Sticky Footer */}
      <div className="p-2 border-t border-slate-700/50 bg-[#1e293b]">
        <Link
          href="/settings"
          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-blue-600/10 text-white border-l-4 border-blue-500"
              : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
          }`}
        >
          <Settings className={`w-4 h-4 mr-3 shrink-0 ${pathname.startsWith("/settings") ? "text-blue-500" : "text-slate-400"}`} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
