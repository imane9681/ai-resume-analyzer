"use client";

import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, LogOut, LogIn, Home, Sparkles, User, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

interface MobileMenuProps {
  user: { id: string; email: string; name: string } | null;
  showDashboard: boolean;
  onDashboardClick: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function MobileMenu({ user, showDashboard, onDashboardClick, onLoginClick, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  // منع التمرير عندما تكون القائمة مفتوحة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleDashboardClick = () => {
    onDashboardClick();
    closeMenu();
  };

  const handleLoginClick = () => {
    onLoginClick();
    closeMenu();
  };

  const handleLogoutClick = () => {
    onLogout();
    closeMenu();
  };

  return (
    <>
      {/* زر القائمة للهواتف - يبقى في مكانه (الجهة اليمين في Navbar) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden relative w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800 shadow-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* الخلفية المعتمة (Overlay) */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMenu}
      />

      {/* القائمة الجانبية - من جهة اليسار (تم التعديل هنا) */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* رأس القائمة */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-sm">
              AI Resume Analyzer
            </span>
          </div>
          <button
            onClick={closeMenu}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* معلومات المستخدم (إذا كان مسجل الدخول) */}
        {user && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* روابط القائمة */}
        <div className="p-4 space-y-2">
          {user && (
            <button
              onClick={handleDashboardClick}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                showDashboard
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md"
                  : "bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium text-sm">{t("dashboard") || "Dashboard"}</span>
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          )}

          {/* فصل بين الروابط والإعدادات */}
          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 px-2">
              {t("preferences") || "Preferences"}
            </p>
            
            {/* إعدادات السمة واللغة */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("dark_mode") || "Dark Mode"}
                </span>
                <ThemeToggle />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("language") || "Language"}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* زر تسجيل الخروج/الدخول في أسفل القائمة */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800">
          {user ? (
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">{t("logout") || "Sign Out"}</span>
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm">{t("login") || "Sign In"}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}