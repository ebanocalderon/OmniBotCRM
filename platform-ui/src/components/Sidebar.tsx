"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Bot,
  Calendar,
  FileText,
  LineChart,
  LogOut,
  HelpCircle,
  Link as LinkIcon,
  Filter
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();
  const { logout } = useAuth();

  if (pathname === "/login" || pathname === "/") {
    return null;
  }

  const principalRoutes = [
    { name: t.sidebar.conversations, path: "/conversations", icon: MessageSquare },
    { name: t.sidebar.clients, path: "/contacts", icon: Users },
    { name: t.sidebar.reports, path: "/reports", icon: LineChart },
    { name: t.sidebar.calendar, path: "/calendar", icon: Calendar },
    { name: t.sidebar.templates, path: "/templates", icon: FileText },
  ];

  const configRoutes = [
    { name: t.sidebar.whatsapp, path: "/whatsapp", icon: MessageSquare },
    { name: t.sidebar.aiAgent, path: "/agents", icon: Bot },
    { name: t.sidebar.knowledge, path: "/knowledge", icon: FileText },
    { name: t.sidebar.funnel, path: "/funnel", icon: Filter },
    { name: t.sidebar.webhooks, path: "/webhooks", icon: LinkIcon },
  ];

  const adminRoutes = [
    { name: t.sidebar.adminPanel, path: "/admin", icon: Settings },
    { name: t.sidebar.demoRequests, path: "/demo-requests", icon: Users },
    { name: t.sidebar.help, path: "/help", icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#f9fafb] border-r border-gray-200 flex flex-col h-full z-10 flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-[#12826a] rounded flex items-center justify-center mr-3">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[#1e293b] leading-tight">
              {t.app.title}
            </h1>
          </div>
        </div>
        <div className="bg-[#fff9e6] border border-[#fde047] text-[#854d0e] text-xs font-medium px-3 py-1.5 rounded-full flex items-center">
          <span className="w-2 h-2 bg-[#eab308] rounded-full mr-2"></span>
          {t.app.viewing} Erik Taveras
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        
        {/* PRINCIPAL */}
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
            {t.sidebar.principal}
          </div>
          <div className="space-y-1">
            {principalRoutes.map((route) => {
              const isActive = pathname === route.path || (pathname.startsWith(route.path) && route.path !== "/");
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive 
                      ? "bg-[#e6f2ec] text-[#12826a] font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <route.icon 
                    className={`w-4 h-4 mr-3 ${isActive ? "text-[#12826a]" : "text-gray-400"}`} 
                  />
                  {route.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CONFIGURACION */}
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
            {t.sidebar.configuration}
          </div>
          <div className="space-y-1">
            {configRoutes.map((route) => {
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <route.icon className="w-4 h-4 mr-3 text-gray-400" />
                  {route.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ADMINISTRACION */}
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
            {t.sidebar.administration}
          </div>
          <div className="space-y-1">
            {adminRoutes.map((route) => {
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <route.icon className="w-4 h-4 mr-3 text-gray-400" />
                  {route.name}
                </Link>
              );
            })}
          </div>
        </div>

      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4 px-2">
          <button 
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 bg-gray-100 px-2 py-1 rounded"
          >
            {lang.toUpperCase()}
          </button>
          
          <button onClick={logout} className="flex items-center text-xs text-red-600 hover:text-red-700 font-medium">
            <LogOut className="w-3 h-3 mr-1" />
            {t.app.logout}
          </button>
        </div>

        <div className="flex items-center px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white mr-3">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
