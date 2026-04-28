"use client";

import { useState } from "react";
import {
  Target, Briefcase, GraduationCap, Code2, Award, Star,
  BarChart3, Brain, ChevronRight, Layers,
  TrendingUp, AlertCircle, CheckCircle, Lightbulb, X,
  ShieldCheck, Sparkles, Medal, UserCheck, PieChart,
  ArrowLeft, Zap
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface CompareData {
  name: string;
  skills: string[];
  years_experience: number;
  education: string;
  strengths: string[];
  weaknesses: string[];
  ats_score: number;
  job_match?: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
    matchLevel: string;
  };
}

interface CompareViewProps {
  resumes: CompareData[];
  onBack: () => void;
}

export default function CompareView({ resumes, onBack }: CompareViewProps) {
  const { t, dir } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartAnalysis, setSmartAnalysis] = useState<any>(null);

  if (resumes.length < 2) return null;

  const getSmartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/compare-smart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumes }),
      });
      const data = await response.json();
      if (response.ok && data.analysis) {
        setSmartAnalysis(data.analysis);
      } else {
        alert(t("smart_analysis_failed") || "Failed to generate smart analysis");
      }
    } catch (error) {
      console.error("Smart analysis error:", error);
      alert(t("smart_analysis_error") || "Failed to generate smart analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="mt-4 sm:mt-8 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8" dir={dir}>
      
      {/* رأس الصفحة - متجاوب */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {t("resume_comparison") || "مقارنة السير الذاتية"}
            <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 mr-1 sm:mr-2">({resumes.length})</span>
          </h2>
        </div>
        <button
          onClick={onBack}
          className="w-full sm:w-auto cursor-pointer border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ChevronRight className="w-4 h-4" />
          {t("back_to_saved") || "العودة إلى المحفوظات"}
        </button>
      </div>

      {/* زر التحليل الذكي - متجاوب */}
      <div className="flex justify-center mb-6 sm:mb-10">
        <button
          onClick={getSmartAnalysis}
          disabled={isAnalyzing}
          className="w-full sm:w-auto group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-sm sm:text-base"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
          <span className="relative z-10">
            {isAnalyzing
              ? (t("analyzing") || "جاري التحليل الذكي...")
              : (t("smart_compare") || "تحليل ذكي متقدم")
          }
          </span>
          {!isAnalyzing && <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />}
        </button>
      </div>

      {/* نتائج التحليل الذكي - متجاوبة */}
      {smartAnalysis && (
        <div className="mb-6 sm:mb-10 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl shadow-md">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 dark:from-emerald-300 dark:to-emerald-300 bg-clip-text text-transparent">
                {t("smart_analysis_title") || "التحليل الذكي للمقارنة"}
              </h3>
            </div>
            <button
              onClick={() => setSmartAnalysis(null)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Summary */}
            <div className="p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{smartAnalysis.summary}</p>
              </div>
            </div>

            {/* Best Candidate Card */}
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-6 shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                  <h4 className="font-semibold text-emerald-50 uppercase tracking-wide text-xs sm:text-sm">{t("best_candidate") || "أفضل مرشح"}</h4>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">{smartAnalysis.best_candidate?.name}</p>
                <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed">{smartAnalysis.best_candidate?.reason}</p>
              </div>
            </div>

            {/* Comparison Table - متجاوب مع تمرير أفقي */}
            <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-xs sm:text-sm min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-start py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">{t("criterion") || "المعيار"}</th>
                    <th className="text-start py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">{t("best") || "الأفضل"}</th>
                    <th className="text-start py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">{t("analysis") || "التحليل"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {smartAnalysis.comparison_table?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{item.criterion}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] sm:text-xs whitespace-nowrap">
                          <Star className="w-2 h-2 sm:w-3 sm:h-3" />
                          {item.winner}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{item.analysis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recommendations Card */}
            <div className="p-3 sm:p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                <div className="p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">{t("recommendations") || "توصيات استراتيجية"}</h4>
              </div>
              <ul className="space-y-1 sm:space-y-2">
                {smartAnalysis.recommendations?.slice(0, 4).map((rec: string, idx: number) => (
                  <li key={idx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1 sm:gap-2">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verdict */}
            <div className="p-3 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg sm:rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed text-center">
                {smartAnalysis.verdict}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* بطاقات المقارنة - متجاوبة */}
      <div className={`grid gap-4 sm:gap-6 ${
        resumes.length === 2 
          ? "grid-cols-1 md:grid-cols-2" 
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}>
        {resumes.map((resume, index) => {
          const colors = [
            "from-green-600 to-emerald-600",
            "from-teal-600 to-cyan-600",
            "from-amber-600 to-orange-600"
          ];
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden hover:shadow-xl transition-all active:scale-[0.99] sm:hover:-translate-y-1">
              <div className={`bg-gradient-to-r ${colors[index]} text-white p-4 sm:p-5`}>
                <h3 className="text-base sm:text-xl font-bold truncate">{resume.name}</h3>
                <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 opacity-90" />
                  <p className="opacity-90 text-xs sm:text-sm">{t("ats_score") || "ATS Score"}: {resume.ats_score}%</p>
                </div>
              </div>
              
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${colors[index]}`} style={{ width: `${resume.ats_score}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-green-600 mb-0.5 sm:mb-1" />
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{resume.years_experience}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600">{t("years") || "سنوات"}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-emerald-600 mb-0.5 sm:mb-1" />
                    <p className="text-[10px] sm:text-xs font-bold text-emerald-600 truncate">{resume.education.split(' ')[0]}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                    <Code2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{t("top_skills") || "أفضل المهارات"}</h4>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {resume.skills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-none">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <h4 className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">{t("strengths") || "نقاط القوة"}</h4>
                  </div>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {resume.strengths.slice(0, 2).map((s, i) => (
                      <li key={i} className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-start gap-0.5 sm:gap-1">
                        <Star className="w-2 h-2 sm:w-3 sm:h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {resume.job_match && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-[10px] sm:text-xs font-semibold text-teal-600">{t("job_match") || "مطابقة الوظيفة"}</span>
                      <span className="text-xs sm:text-sm font-bold text-teal-600">{resume.job_match.score}%</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${resume.job_match.score}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}