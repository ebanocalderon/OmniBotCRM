"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Bot, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const { t, lang, setLang } = useI18n();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="text-sm font-medium text-gray-500 hover:text-gray-800 bg-white shadow-sm border border-gray-200 px-3 py-1.5 rounded-md"
        >
          {lang === "es" ? "English" : "Español"}
        </button>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#12826a] rounded-xl flex items-center justify-center mb-4 shadow-md">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.login.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.login.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.login.email}
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12826a]/50 focus:border-[#12826a] text-gray-900"
              placeholder="admin@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.login.password}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12826a]/50 focus:border-[#12826a] text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">
              {t.login.error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-[#12826a] hover:bg-[#0e6b57] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-2"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {t.login.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
