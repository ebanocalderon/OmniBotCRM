"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  UserCircle,
  MessageCircle,
  PhoneCall,
  Bot,
  Building,
  CreditCard,
  Key
} from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const settingsLinks = [
    { name: "My Profile", path: "/settings", icon: UserCircle },
    { name: "Chat Integrations", path: "/settings/chat-integrations", icon: MessageCircle },
    { name: "VoIP & Telephony", path: "/settings/voip", icon: PhoneCall },
    { name: "AI Agents & Bots", path: "/settings/ai-agents", icon: Bot },
    { name: "Company Billing", path: "/settings/billing", icon: CreditCard },
    { name: "Staff", path: "/settings/staff", icon: Building },
    { name: "API Keys", path: "/settings/api", icon: Key },
  ];

  return (
    <div className="flex h-full bg-[#f8fafc]">
      {/* Secondary Sidebar for Settings */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="text-xs text-gray-500">Configure your workspace</p>
        </div>
        <nav className="p-2 space-y-0.5">
          {settingsLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <link.icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Settings Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
