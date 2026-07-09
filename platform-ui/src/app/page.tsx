"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Bot, MessageSquare, Workflow, Globe2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { t, lang, setLang } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-slate-950 text-slate-50 relative selection:bg-emerald-500/30">
      
      {/* Animated Glassmorphism Background Spheres */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/30 blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-x-0 border-t-0 border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white drop-shadow-md">OmniBot</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 font-medium text-sm text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors drop-shadow-sm">{t.landing.features}</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors drop-shadow-sm">{t.landing.pricing}</a>
            <a href="#about" className="hover:text-emerald-400 transition-colors drop-shadow-sm">{t.landing.about}</a>
          </nav>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="text-xs font-bold text-slate-300 hover:text-white glass-button px-3 py-1.5 rounded-lg tracking-widest"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            <Link 
              href="/login" 
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors drop-shadow-sm"
            >
              {t.landing.login}
            </Link>
            <Link 
              href="/login" 
              className="glass-button-primary px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              {t.landing.startFree}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-emerald-500/30 bg-emerald-500/5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-300">OmniBot 2.0 is live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight drop-shadow-2xl">
              {t.landing.heroTitle.split(" ").map((word, i) => (
                <span key={i} className={i >= 3 ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400" : ""}> {word}</span>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-light">
              {t.landing.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/login" 
                className="w-full sm:w-auto glass-button-primary px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-2 group"
              >
                {t.landing.startFree} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#demo" 
                className="w-full sm:w-auto glass-button px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center"
              >
                {t.landing.bookDemo}
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="max-w-6xl mx-auto px-4 mt-24 relative z-10">
            <div className="rounded-2xl glass-panel aspect-video relative flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
              <div className="relative text-center transform group-hover:scale-105 transition-transform duration-700">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Bot className="w-12 h-12 text-emerald-400" />
                </div>
                <p className="text-slate-300 font-medium text-lg tracking-widest uppercase">Ethereal Interface</p>
              </div>
            </div>
          </div>
        </section>

        {/* LOGOS / SOCIAL PROOF */}
        <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10 drop-shadow-sm">
              {t.landing.trustedBy}
            </p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60">
              <div className="flex items-center gap-3 font-bold text-2xl text-slate-300"><Globe2 className="w-8 h-8 text-emerald-400" /> AcmeCorp</div>
              <div className="flex items-center gap-3 font-bold text-2xl text-slate-300"><Workflow className="w-8 h-8 text-blue-400" /> Globex</div>
              <div className="flex items-center gap-3 font-bold text-2xl text-slate-300"><MessageSquare className="w-8 h-8 text-purple-400" /> Initech</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="glass-card p-10 rounded-3xl text-center md:text-left group hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto md:mx-0 group-hover:bg-emerald-500/20 transition-colors">
                  <MessageSquare className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">{t.landing.feature1Title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{t.landing.feature1Desc}</p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-10 rounded-3xl text-center md:text-left group hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto md:mx-0 group-hover:bg-blue-500/20 transition-colors">
                  <Bot className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">{t.landing.feature2Title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{t.landing.feature2Desc}</p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-10 rounded-3xl text-center md:text-left group hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto md:mx-0 group-hover:bg-purple-500/20 transition-colors">
                  <Workflow className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">{t.landing.feature3Title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{t.landing.feature3Desc}</p>
              </div>

            </div>
          </div>
        </section>
        
        {/* BOTTOM CTA */}
        <section className="py-32 relative">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="glass-panel p-16 rounded-[3rem] relative overflow-hidden border-emerald-500/30">
              <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
              <div className="relative z-10">
                <h2 className="text-5xl font-extrabold mb-6 text-white drop-shadow-xl">Ready to transform your support?</h2>
                <p className="text-xl text-emerald-100/70 mb-12 max-w-2xl mx-auto font-light">
                  Join thousands of businesses that use OmniBot to scale their operations and delight their customers.
                </p>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center gap-2 glass-button-primary px-10 py-5 rounded-2xl text-xl transition-transform hover:scale-105"
                >
                  {t.landing.startFree}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-black/40 border-t border-white/5 py-12 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0 font-bold text-slate-400">
            <Bot className="w-6 h-6 text-emerald-500/50" /> OmniBot
          </div>
          <p className="font-light">{t.landing.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
