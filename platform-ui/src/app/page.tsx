"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Bot, MessageSquare, Workflow, Globe2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="min-h-screen bg-white text-gray-900 w-full overflow-y-auto">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#12826a] rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">OmniBot</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
            <a href="#features" className="hover:text-[#12826a] transition-colors">{t.landing.features}</a>
            <a href="#pricing" className="hover:text-[#12826a] transition-colors">{t.landing.pricing}</a>
            <a href="#about" className="hover:text-[#12826a] transition-colors">{t.landing.about}</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            <Link 
              href="/login" 
              className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {t.landing.login}
            </Link>
            <Link 
              href="/login" 
              className="bg-[#12826a] hover:bg-[#0e6b57] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {t.landing.startFree}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#e6f2ec]/50 to-white/0 -z-10" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              {t.landing.heroTitle.split(" ").map((word, i) => (
                <span key={i} className={i >= 3 ? "text-[#12826a]" : ""}> {word}</span>
              ))}
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t.landing.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-[#12826a] hover:bg-[#0e6b57] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {t.landing.startFree} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#demo" 
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-sm flex items-center justify-center"
              >
                {t.landing.bookDemo}
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="max-w-6xl mx-auto px-4 mt-20 relative">
            <div className="rounded-2xl border border-gray-200/60 bg-white shadow-2xl overflow-hidden aspect-video relative ring-1 ring-black/5 flex items-center justify-center bg-gray-50">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100/50" />
              <div className="relative text-center">
                <Bot className="w-20 h-20 text-[#12826a]/30 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </section>

        {/* LOGOS / SOCIAL PROOF */}
        <section className="py-10 border-y border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
              {t.landing.trustedBy}
            </p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale">
              {/* Dummy logos */}
              <div className="flex items-center gap-2 font-bold text-xl"><Globe2 /> AcmeCorp</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Workflow /> Globex</div>
              <div className="flex items-center gap-2 font-bold text-xl"><MessageSquare /> Initech</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              
              {/* Feature 1 */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-[#e6f2ec] rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <MessageSquare className="w-7 h-7 text-[#12826a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.landing.feature1Title}</h3>
                <p className="text-gray-600 leading-relaxed">{t.landing.feature1Desc}</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-[#e6f2ec] rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <Bot className="w-7 h-7 text-[#12826a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.landing.feature2Title}</h3>
                <p className="text-gray-600 leading-relaxed">{t.landing.feature2Desc}</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-[#e6f2ec] rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <Workflow className="w-7 h-7 text-[#12826a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t.landing.feature3Title}</h3>
                <p className="text-gray-600 leading-relaxed">{t.landing.feature3Desc}</p>
              </div>

            </div>
          </div>
        </section>
        
        {/* BOTTOM CTA */}
        <section className="py-24 bg-[#12826a] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to transform your support?</h2>
            <p className="text-xl text-[#e6f2ec] mb-10 max-w-2xl mx-auto">
              Join thousands of businesses that use OmniBot to scale their operations and delight their customers.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 bg-white text-[#12826a] px-8 py-4 rounded-xl text-lg font-bold transition-transform hover:scale-105 shadow-xl"
            >
              {t.landing.startFree}
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0 font-semibold">
            <Bot className="w-5 h-5 text-gray-400" /> OmniBot
          </div>
          <p>{t.landing.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
