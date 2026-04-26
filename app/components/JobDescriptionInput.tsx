"use client";

import { useState } from "react";
import { Briefcase, ChevronRight, X, Target, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface JobDescriptionInputProps {
  onAnalyze: (jobDescription: string) => void;
  isLoading: boolean;
}

export default function JobDescriptionInput({ onAnalyze, isLoading }: JobDescriptionInputProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { t, dir } = useLanguage();

  const handleSubmit = () => {
    if (jobDescription.trim().length < 20) {
      alert(t("job_desc_alert") || "Please enter a valid job description (minimum 20 characters)");
      return;
    }
    onAnalyze(jobDescription);
  };

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="w-full cursor-pointer mt-4 bg-gradient-to-r from-teal-600 to-[#064e3b]/90 hover:from-teal-700 hover:to-[#064e3b] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
      >
        <Target className="w-5 h-5" />
        {t("add_job_desc") || "Add Job Description for Matching"}
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-teal-200 dark:border-teal-800" dir={dir}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-semibold text-gray-800 dark:text-white">{t("job_description") || "Job Description"}</h3>
        </div>
        <button
          onClick={() => {
            setShowInput(false);
            setJobDescription("");
          }}
          className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder={t("job_desc_placeholder") || `Paste the job description here...
        
Example:
We are looking for a Senior React Developer with 5+ years of experience. 
Required skills: React, TypeScript, Next.js, Node.js, AWS, PostgreSQL.
Responsibilities include leading a team, code reviews, and architecting solutions.`}
        className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 cursor-pointer bg-gradient-to-r from-teal-600 via-teal-600 to-[#064e3b]/80 hover:from-teal-700 hover:to-[#064e3b] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t("analyzing_match") || "Analyzing..."}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {t("analyze_match") || "Analyze Match"}
            </>
          )}
        </button>
        <button
          onClick={() => {
            setShowInput(false);
            setJobDescription("");
          }}
          className="px-4 py-2 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {t("cancel") || "Cancel"}
        </button>
      </div>
      
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {t("job_desc_note") || "The AI will compare your resume skills with the job requirements"}
      </p>
    </div>
  );
}