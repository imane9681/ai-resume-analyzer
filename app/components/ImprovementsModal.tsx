"use client";

import { useState } from "react";
import { X, Lightbulb, Code2, Trophy, Award, Target, Zap, Copy, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface Improvement {
  category: string;
  title: string;
  description: string;
  suggestions: string[];
  action: string;
}

interface ImprovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  improvements: Improvement[];
  onApply: (suggestion: string) => void;
}

export default function ImprovementsModal({ isOpen, onClose, improvements, onApply }: ImprovementsModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { t, dir } = useLanguage();

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "skills":
        return <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      case "achievements":
        return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      case "leadership":
        return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      case "certifications":
        return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      case "ats":
        return <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      default:
        return <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "skills":
        return "from-blue-500 to-cyan-500";
      case "achievements":
        return "from-yellow-500 to-orange-500";
      case "leadership":
        return "from-orange-500 to-red-500";
      case "certifications":
        return "from-purple-500 to-pink-500";
      case "ats":
        return "from-red-500 to-pink-500";
      default:
        return "from-green-500 to-emerald-500";
    }
  };

  const copySuggestion = (suggestion: string, index: number) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" dir={dir}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-auto animate-in fade-in zoom-in duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 cursor-pointer z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="text-center pt-6 sm:pt-8 px-4 sm:px-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Lightbulb className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{t("improvement_title") || "Resume Improvement Suggestions"}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 px-2">
            {t("improvement_subtitle") || "AI-powered recommendations to enhance your resume"}
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {improvements.slice(0, 4).map((improvement, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${getCategoryColor(improvement.category)} p-3 sm:p-4`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {getCategoryIcon(improvement.category)}
                  <h3 className="font-bold text-white text-sm sm:text-base">{improvement.title}</h3>
                </div>
                <p className="text-white/85 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2">{improvement.description}</p>
              </div>
              
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t("suggestions") || "Suggestions:"}</p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {improvement.suggestions.slice(0, 3).map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span className="flex-1 line-clamp-2">{suggestion}</span>
                        <button
                          onClick={() => copySuggestion(suggestion, idx * 10 + i)}
                          className="text-gray-400 cursor-pointer hover:text-green-500 transition-colors flex-shrink-0"
                        >
                          {copiedIndex === idx * 10 + i ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">
                    <strong>{t("action_item") || "Action item:"}</strong> {improvement.action.length > 80 ? improvement.action.slice(0, 80) + "..." : improvement.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-6 rounded-xl transition-all duration-300 text-sm sm:text-base active:scale-[0.98]"
          >
            {t("got_it") || "Got it! I'll improve my resume"}
          </button>
        </div>
      </div>
    </div>
  );
}