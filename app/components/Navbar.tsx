"use client";

import { useState } from "react";
import { LogIn, User, LogOut, LayoutDashboard, Sparkles, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

import { FaUser } from "react-icons/fa";


interface NavbarProps {
  user: { id: string; email: string; name: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onDashboardClick: () => void;
  showDashboard: boolean;
}

export default function Navbar({ user, onLoginClick, onLogout, onDashboardClick, showDashboard }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-gray-900/40 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"  dir="ltr">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="hidden sm:block">
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  AI Resume Analyzer
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
                  Smart Career Insights
                </span>
              </div>
            </div>
          </div>

          {/* Center - Dashboard Button (Only for logged in users) */}
          {user && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={onDashboardClick}
                className={`flex items-center cursor-pointer gap-2.5 px-5 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  showDashboard
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-emerald-500/20"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">{t("dashboard")}</span>
              </button>
            </div>
          )}

          {/* Right side - Theme Toggle & User Menu */}
          <div className="flex items-center gap-3">

             {/* Language Switcher */}
             <LanguageSwitcher />

             
            {/* Theme Toggle */}
            <div >
              <ThemeToggle />
            </div>

           
            
            {/* User Menu - Only shows when logged in */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-full bg-white/70 shadow-md dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                >
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <FaUser  className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{t("account") || "Account"}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 cursor-pointer text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={onLogout}
                        className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("logout") || "Sign Out"}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Login Button - Only shows when not logged in */
              <button
                onClick={onLoginClick}
                className="group relative cursor-pointer flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-emerald-500 to-green-500 group-hover:w-full transition-all duration-300 ease-out"></div>
                <LogIn className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t("login") || "Sign In"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}