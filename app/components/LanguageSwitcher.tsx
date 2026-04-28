"use client";

import { useLanguage } from "../context/LanguageContext";
import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface LanguageSwitcherProps {
  isMobile?: boolean;
}

export default function LanguageSwitcher({ isMobile = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "en", name: "English", flag: "" },
    { code: "ar", name: "العربية", flag: "" },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // نسخة مبسطة للهواتف (تظهر كقائمة عمودية)
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as "en" | "ar")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              language === lang.code
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
            {language === lang.code && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>
    );
  }

  // النسخة الأصلية للشاشات الكبيرة
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/70 shadow-sm dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group"
      >
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 transition-colors" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
          {currentLang.name}
        </span>
        <span className="text-base sm:hidden">{currentLang.flag}</span>
        <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as "en" | "ar");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                language === lang.code
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
              {language === lang.code && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}