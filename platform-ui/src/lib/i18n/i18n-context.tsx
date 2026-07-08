"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { en, Dictionary } from "./en";
import { es } from "./es";

type Language = "en" | "es";

interface I18nContextType {
  lang: Language;
  t: Dictionary;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: "es",
  t: es,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language;
    if (saved && (saved === "en" || saved === "es")) {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = lang === "es" ? es : en;

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) {
    return <div className="min-h-screen bg-[#F9FAFB]"></div>;
  }

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
