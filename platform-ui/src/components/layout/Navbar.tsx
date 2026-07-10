"use client";

import { Phone, Megaphone, Bell, User, ChevronDown, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/") {
    return null;
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      {/* Left side empty for spacing, or we can put breadcrumbs here later */}
      <div className="flex-1"></div>

      {/* Right side global actions */}
      <div className="flex items-center gap-4">
        {/* Phone dialer */}
        <button className="w-9 h-9 rounded-full bg-[#12826a] hover:bg-[#0e6b57] text-white flex items-center justify-center transition-colors shadow-sm">
          <Phone className="w-4 h-4" />
        </button>

        {/* Megaphone */}
        <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors">
          <Megaphone className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Help */}
        <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 cursor-pointer group" onClick={logout}>
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center">
            AU
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </header>
  );
}
