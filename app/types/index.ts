export interface AnalysisResult {
  name: string;
  skills: string[];
  years_experience: number;
  education: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  ats_score: number;
  field?: string;
   detected_language?: "ar" | "en";
  job_match?: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
    matchLevel: string;
  };
}

export interface SavedResume {
  id: string;
  name: string;
  analysis: AnalysisResult;
  fileName: string;
  createdAt?: string;
  isLocal?: boolean;
}

// أضف هذا
export interface SavedAnalysis {
  id: string;
  name: string;
  analysis: AnalysisResult;
  createdAt?: string;
}