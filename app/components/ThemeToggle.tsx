"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  variant?: "default" | "mobile";
}

export default function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // نسخة للهواتف أكبر قليلاً
  if (variant === "mobile") {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-all duration-300"
      >
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
        <div className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm">
          {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </div>
      </button>
    );
  }

  // النسخة الأصلية
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 cursor-pointer rounded-full bg-white/80 dark:bg-gray-800 text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-lg"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}