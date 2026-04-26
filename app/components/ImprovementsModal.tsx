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
        return <Code2 className="w-5 h-5 text-white" />;
      case "achievements":
        return <Trophy className="w-5 h-5 text-white" />;
      case "leadership":
        return <Zap className="w-5 h-5 text-white" />;
      case "certifications":
        return <Award className="w-5 h-5 text-white" />;
      case "ats":
        return <Target className="w-5 h-5 text-white" />;
      default:
        return <Lightbulb className="w-5 h-5 text-white" />;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-auto animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-8 px-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t("improvement_title") || "Resume Improvement Suggestions"}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t("improvement_subtitle") || "AI-powered recommendations to enhance your resume"}
          </p>
        </div>

        {/* Improvements List */}
        <div className="p-6 space-y-4">
          {improvements.map((improvement, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${getCategoryColor(improvement.category)} p-4`}>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(improvement.category)}
                  <h3 className="font-bold text-white">{improvement.title}</h3>
                </div>
                <p className="text-white/90 text-sm mt-1">{improvement.description}</p>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("suggestions") || "Suggestions:"}</p>
                  <ul className="space-y-2">
                    {improvement.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span className="flex-1">{suggestion}</span>
                        <button
                          onClick={() => copySuggestion(suggestion, idx * 10 + i)}
                          className="text-gray-400 cursor-pointer hover:text-green-500 transition-colors"
                        >
                          {copiedIndex === idx * 10 + i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>{t("action_item") || "Action item:"}</strong> {improvement.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            {t("got_it") || "Got it! I'll improve my resume"}
          </button>
        </div>
      </div>
    </div>
  );
}