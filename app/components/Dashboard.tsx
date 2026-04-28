"use client";

import { Calendar, Archive, FileText, Target, Briefcase, Code2, Award, BarChart3, GitCompare, Check, Trash2, Eye, LayoutDashboard } from "lucide-react";
import UserStats from "./UserStats";
import { AnalysisResult, SavedAnalysis } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";

interface DashboardProps {
  analyses: SavedAnalysis[];
  selectedForCompare: string[];
  onToggleCompare: (id: string) => void;
  onStartCompare: () => void;
  onLoadAnalysis: (analysis: AnalysisResult) => void;
  onDeleteAnalysis: (id: string) => void;
}

export default function Dashboard({
  analyses,
  selectedForCompare,
  onToggleCompare,
  onStartCompare,
  onLoadAnalysis,
  onDeleteAnalysis,
}: DashboardProps) {
  const { t, dir } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  
  // كشف حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // حساب الإحصائيات
  const totalAnalyses = analyses.length;
  const averageScore = totalAnalyses > 0 
    ? Math.round(analyses.reduce((acc, a) => acc + a.analysis.ats_score, 0) / totalAnalyses)
    : 0;
  const bestScore = totalAnalyses > 0 
    ? Math.max(...analyses.map(a => a.analysis.ats_score))
    : 0;
  const uniqueSkills = totalAnalyses > 0 
    ? new Set(analyses.flatMap(a => a.analysis.skills)).size
    : 0;

  return (
    <div className="mt-4 sm:mt-8 max-w-7xl mx-auto px-3 sm:px-4" dir={dir}>

      {/* Statistics Section */}
      <div className="mt-4 sm:mt-10">
        <UserStats analyses={analyses} />
      </div>
      
      {/* Section Title with Compare Button - متجاوب */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            {t("your_analyses") || "Your Analyses"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            {t("manage_compare") || "Manage and compare your saved resume analyses"}
          </p>
        </div>
        {selectedForCompare.length >= 2 && (
          <button
            onClick={onStartCompare}
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            <GitCompare className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            {t("compare_selected") || "Compare Selected"} ({selectedForCompare.length})
          </button>
        )}
      </div>

      {/* Analyses Grid - Professional Cards (متصفح) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {analyses.map((analysis, idx) => (
          <div
            key={analysis.id}
            className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 relative"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Card Header with Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400"></div>
            
            <div className="p-3 sm:p-5">
              {/* Top Row - متجاوب */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1 text-sm sm:text-base">
                      {analysis.name}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : t("recent") || "Recent"}
                      </span>
                    </div>
                  </div>
                </div>
                <label className="relative flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedForCompare.includes(analysis.id)}
                    onChange={() => onToggleCompare(analysis.id)}
                    className="peer w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </span>
                </label>
              </div>

              {/* ATS Score Section */}
              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">{t("ats_score") || "ATS Score"}</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-emerald-600">{analysis.analysis.ats_score}%</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                    style={{ width: `${analysis.analysis.ats_score}%` }}
                  />
                </div>
              </div>

              {/* Stats Row - متجاوب */}
              <div className="flex items-center justify-between py-2 sm:py-3 border-t border-b border-gray-100 dark:border-gray-700 mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {analysis.analysis.years_experience} {t("years") || "years"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {analysis.analysis.skills.length} {t("skills") || "skills"}
                  </span>
                </div>
              </div>

              {/* Skills Preview - متجاوب */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                {analysis.analysis.skills.slice(0, isMobile ? 3 : 4).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-none"
                  >
                    {skill}
                  </span>
                ))}
                {analysis.analysis.skills.length > (isMobile ? 3 : 4) && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] sm:text-xs">
                    +{analysis.analysis.skills.length - (isMobile ? 3 : 4)}
                  </span>
                )}
              </div>

              {/* Action Buttons - متجاوب */}
              <div className="flex gap-2">
                <button
                  onClick={() => onLoadAnalysis(analysis.analysis)}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700/70 hover:from-emerald-700 hover:to-green-700/80 text-white text-xs sm:text-sm font-semibold transition-all duration-300"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t("load_analysis") || "Load Analysis"}
                </button>
                <button
                  onClick={() => onDeleteAnalysis(analysis.id)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* رسالة إذا لم توجد تحليلات */}
      {analyses.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Archive className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">{t("no_analyses") || "No analyses yet"}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{t("upload_resume_to_start") || "Upload a resume to get started"}</p>
        </div>
      )}
    </div>
  );
}