"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSupabaseClient } from "./lib/supabase/client";
import { 
  Bot, Wrench, CheckCircle, AlertTriangle, Lightbulb, 
  TrendingUp, GraduationCap, FileText, GitCompare, Plus, 
  X, Save, Trash2, Star, Award, Briefcase, Code2, 
  LayoutDashboard, Sparkles, ChevronRight, Target,
  BarChart3, PieChart, Zap, Shield, Crown, Layers,
  Upload, Share2,  Archive,
  Database,
  HardDrive,
  Cloud,
  Calendar,
  Check,
  Play,
  CheckSquare
} from "lucide-react";
import ResumeDropzone from "./components/ResumeDropzone";
import JobDescriptionInput from "./components/JobDescriptionInput";
import AuthModal from "./components/AuthModal";
import ShareModal from "./components/ShareModal";
import ImprovementsModal from "./components/ImprovementsModal";
import Navbar from "./components/Navbar";
import { AnalysisResult, SavedResume } from "./types";
import Dashboard from "./components/Dashboard";
import { useLanguage } from "./context/LanguageContext";
import CompareView from "./components/CompareView";


export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isJobAnalyzing, setIsJobAnalyzing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedResume[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isImprovementsModalOpen, setIsImprovementsModalOpen] = useState(false);
  const [improvements, setImprovements] = useState<any[]>([]);
  const { t, dir } = useLanguage();

  // Check if user is logged in (run first)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to check user:", error);
        setUser(null);
      }
    };
    checkUser();
  }, []);

  // Load data based on user state
  useEffect(() => {
    if (user) {
      loadSavedAnalyses();
      setSavedResumes([]);
    } else {
      const localSaved = localStorage.getItem("savedResumes");
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          setSavedResumes(parsed);
        } catch (e) {
          console.error("Failed to load local saves", e);
          setSavedResumes([]);
        }
      } else {
        setSavedResumes([]);
      }
      setSavedAnalyses([]);
    }
  }, [user]);

// Supabase Auth Listener for Google Login - using singleton client
useEffect(() => {
  const supabase = getSupabaseClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Supabase auth event:", event);
    
    // Only for SIGNED_IN events, not INITIAL_SESSION
    if (event === 'SIGNED_IN' && session?.user && !user) {
      try {
        const response = await fetch("/api/auth/google-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            supabase_id: session.user.id
          }),
        });
        
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          toast.success(`Welcome, ${data.user.name}!`);
        }
      } catch (error) {
        console.error("Sync error:", error);
      }
    } else if (event === 'SIGNED_OUT') {
      // Do nothing, handled manually
    }
  });
  
  return () => {
    subscription.unsubscribe();
  };
}, [user]);

  const loadSavedAnalyses = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/get-analyses");
      const data = await response.json();
      
      if (response.ok && data.analyses) {
        const formatted = data.analyses.map((item: any) => ({
          id: item.id,
          name: item.analysis_data.name,
          analysis: item.analysis_data,
          fileName: item.resume_name,
          createdAt: item.created_at,
          isLocal: false,
        }));
        setSavedAnalyses(formatted);
        setSavedResumes(formatted);
      } else {
        setSavedAnalyses([]);
        setSavedResumes([]);
      }
    } catch (error) {
      console.error("Failed to load analyses:", error);
      setSavedAnalyses([]);
      setSavedResumes([]);
    }
  };

  const deleteAnalysis = async (id: string, isLocal: boolean = false) => {
    if (isLocal) {
      const updated = savedResumes.filter(r => r.id !== id);
      setSavedResumes(updated);
      localStorage.setItem("savedResumes", JSON.stringify(updated));
      if (selectedForCompare.includes(id)) {
        setSelectedForCompare(selectedForCompare.filter(s => s !== id));
      }
      toast.success(t("deleted_local") || "Removed from local saves");
    } else if (user) {
      if (!confirm(t("confirm_delete") || "Are you sure you want to delete this analysis?")) return;
      
      try {
        const response = await fetch("/api/delete-analysis", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success(t("deleted_cloud") || "Analysis deleted successfully!");
          
          const updatedAnalyses = savedAnalyses.filter(a => a.id !== id);
          setSavedAnalyses(updatedAnalyses);
          setSavedResumes(updatedAnalyses);
          
          if (selectedForCompare.includes(id)) {
            setSelectedForCompare(selectedForCompare.filter(s => s !== id));
          }
        } else {
          toast.error(data.error || "Failed to delete");
        }
      } catch (error) {
        toast.error("Failed to delete analysis");
      }
    } else {
      toast.error("Cannot delete cloud saves without login");
    }
  };

  const saveToDatabase = async () => {
    if (!user || !currentAnalysis) {
      toast.error(t("login_first") || "Please login and analyze a resume first");
      return;
    }
    
    try {
      const response = await fetch("/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: currentAnalysis,
          resumeName: currentAnalysis.name,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(t("saved_cloud") || "Analysis saved to your account!");
        await loadSavedAnalyses();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save analysis");
    }
  };

  const shareAnalysis = async () => {
    if (!currentAnalysis) {
      toast.error(t("no_analysis") || "No analysis to share");
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch("/api/share-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: currentAnalysis,
          name: currentAnalysis.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShareUrl(data.shareUrl);
        setIsShareModalOpen(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  };

  const getImprovements = async () => {
    if (!currentAnalysis) {
      toast.error(t("no_analysis") || "No analysis to improve");
      return;
    }

    setIsImproving(true);
    try {
      const response = await fetch("/api/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: currentAnalysis,
          resumeText: currentAnalysis.skills.join(", "),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setImprovements(data.improvements);
        setIsImprovementsModalOpen(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to generate improvements");
    } finally {
      setIsImproving(false);
    }
  };

  const handleLogout = async () => {
  try {
    // تسجيل الخروج من النظام المحلي
    await fetch("/api/auth/logout", { method: "POST" });
    
    // تسجيل الخروج من Supabase أيضاً - using singleton client
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    
    setUser(null);
    setSavedAnalyses([]);
    setSavedResumes([]);
    setCurrentAnalysis(null);
    setShowDashboard(false);
    setShowCompare(false);
    setSelectedForCompare([]);
    
    // تحميل البيانات المحلية بعد تسجيل الخروج
    const localSaved = localStorage.getItem("savedResumes");
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        setSavedResumes(parsed);
      } catch (e) {
        setSavedResumes([]);
      }
    }
    toast.success(t("logged_out") || "Logged out successfully");
  } catch (error) {
    toast.error("Failed to logout");
  }
};

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setCurrentAnalysis(null);
    setShowCompare(false);
    setShowDashboard(false);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setCurrentAnalysis(data.analysis);
      toast.success(t("analyzed") || "Resume analyzed successfully!");
      
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJobMatch = async (jobDescription: string) => {
    if (!currentAnalysis) {
      toast.error(t("analyze_first") || "Please analyze a resume first");
      return;
    }
    
    setIsJobAnalyzing(true);
    
    try {
      const response = await fetch("/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: currentAnalysis.skills.join(", ") + " " + currentAnalysis.strengths.join(" "),
          jobDescription: jobDescription
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCurrentAnalysis({
          ...currentAnalysis,
          job_match: data.match
        });
        toast.success(`Job match: ${data.match.score}% - ${data.match.matchLevel}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze job match");
    } finally {
      setIsJobAnalyzing(false);
    }
  };

  const saveCurrentResumeLocal = () => {
    if (!currentAnalysis) {
      toast.error(t("no_analysis") || "No resume to save");
      return;
    }

    if (user) {
      toast(t("use_cloud") || "Please use 'Save to Cloud' for permanent storage", {
        icon: '☁️',
        duration: 3000,
      });
      return;
    }

    const newSaved: SavedResume = {
      id: `local_${Date.now()}`,
      name: currentAnalysis.name,
      analysis: currentAnalysis,
      fileName: `Resume - ${currentAnalysis.name}`,
      isLocal: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedResumes, newSaved];
    setSavedResumes(updated);
    localStorage.setItem("savedResumes", JSON.stringify(updated));
    toast.success(t("saved_local") || "Resume saved locally!");
  };

  const toggleCompareSelection = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(s => s !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        toast.error(t("max_compare") || "You can compare up to 3 resumes at once");
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const startComparison = () => {
    if (selectedForCompare.length < 2) {
      toast.error(t("select_two") || "Please select at least 2 resumes to compare");
      return;
    }
    setShowCompare(true);
    setShowDashboard(false);
  };

  const getComparisonData = () => {
    return savedResumes
      .filter(r => selectedForCompare.includes(r.id))
      .map(r => r.analysis);
  };

  const clearComparison = () => {
    setShowCompare(false);
    setSelectedForCompare([]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-emerald-600 dark:text-emerald-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-emerald-500";
    return "text-orange-500";
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20" dir={dir}>
      <Toaster position="top-center" />
      
      <Navbar
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onDashboardClick={() => {
          setShowDashboard(!showDashboard);
          setShowCompare(false);
          setCurrentAnalysis(null);
        }}
        showDashboard={showDashboard}
      />
      
      <div className="max-w-7xl mx-auto mt-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse-glow"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-2xl animate-float">
                <Bot className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
        
        <div className="mb-8 max-w-4xl mx-auto">
          <ResumeDropzone 
            onFileAccepted={handleFileUpload}
            isLoading={isLoading}
          />
        </div>

        {isLoading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">{t("analyzing")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("please_wait")}</p>
          </div>
        )}

        {showDashboard && user && savedAnalyses.length > 0 && !showCompare && (
          <Dashboard
            analyses={savedAnalyses}
            selectedForCompare={selectedForCompare}
            onToggleCompare={toggleCompareSelection}
            onStartCompare={startComparison}
            onLoadAnalysis={(analysis) => {
              setCurrentAnalysis(analysis);
              setShowDashboard(false);
              toast.success(`${t("loaded")} ${analysis.name}!`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDeleteAnalysis={(id) => deleteAnalysis(id, false)}
          />
        )}

        {currentAnalysis && !showCompare && !showDashboard && (
          <div className="mt-8 max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={saveCurrentResumeLocal}
                  className="flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>{t("save_local")}</span>
                </button>
                
                {user && (
                  <button
                    onClick={saveToDatabase}
                    className="flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t("save_cloud")}</span>
                  </button>
                )}
                
                <button
                  onClick={shareAnalysis}
                  disabled={isSharing}
                  className="flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800/80 to-green-700/80 hover:from-emerald-800/90 hover:to-green-700/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isSharing ? t("creating") : t("share")}</span>
                </button>

                <button
                  onClick={getImprovements}
                  disabled={isImproving}
                  className="flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/70 to-orange-500/60 hover:from-amber-600/80 hover:to-orange-500/70 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{isImproving ? t("generating") : t("improve")}</span>
                </button>
              </div>
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 rounded-full text-xs text-gray-400 bg-white dark:bg-gray-800">{t("analysis_tools")}</span>
                </div>
              </div>
            </div>

            <JobDescriptionInput 
              onAnalyze={analyzeJobMatch}
              isLoading={isJobAnalyzing}
            />

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-green-100 dark:border-green-900/30 mt-6">
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{t("analysis_report")}</h2>
                    <p className="opacity-90 mt-1">{t("generated_by")}</p>
                  </div>
                  <Sparkles className="w-8 h-8 opacity-80" />
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                <div className="border-b-2 border-green-100 dark:border-green-900/30 pb-6">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">{t("candidate")}</span>
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">{currentAnalysis.name}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t("ats_score")}</h3>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - currentAnalysis.ats_score / 100)}`} className={`${getScoreRingColor(currentAnalysis.ats_score)} transition-all duration-1000`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(currentAnalysis.ats_score)}`}>{currentAnalysis.ats_score}%</span>
                        <span className="text-xs text-gray-500">{t("score")}</span>
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            currentAnalysis.ats_score >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                            currentAnalysis.ats_score >= 60 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                            "bg-gradient-to-r from-orange-500 to-amber-500"
                          }`}
                          style={{ width: `${currentAnalysis.ats_score}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {currentAnalysis.ats_score >= 80 ? (
                          <>
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{t("excellent")}</span>
                          </>
                        ) : currentAnalysis.ats_score >= 60 ? (
                          <>
                            <Zap className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{t("good")}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{t("needs_improvement")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field / Industry */}
                {currentAnalysis.field && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t("job_field")}</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentAnalysis.field}</p>
                  </div>
                )}

                {currentAnalysis.job_match && (
                  <div className="bg-gradient-to-br from-teal-50 to-amber-50 dark:from-teal-900/20 dark:to-amber-900/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t("job_match")}</h3>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200 dark:text-gray-700" />
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - currentAnalysis.job_match.score / 100)}`} className="text-teal-500 transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{currentAnalysis.job_match.score}%</span>
                          <span className="text-xs text-gray-500">{currentAnalysis.job_match.matchLevel}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full" style={{ width: `${currentAnalysis.job_match.score}%` }} />
                        </div>
                        
                        <div className="mt-4">
                          {currentAnalysis.job_match.matchedSkills.length > 0 && (
                            <>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {t("matched_skills")} ({currentAnalysis.job_match.matchedSkills.length})
                              </p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {currentAnalysis.job_match.matchedSkills.slice(0, 8).map((skill, i) => (
                                  <span key={i} className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                          
                          {currentAnalysis.job_match.missingSkills.length > 0 && (
                            <>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                {t("missing_skills")} ({currentAnalysis.job_match.missingSkills.length})
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {currentAnalysis.job_match.missingSkills.slice(0, 8).map((skill, i) => (
                                  <span key={i} className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-5 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">{currentAnalysis.years_experience}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("years_experience")}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 rounded-xl p-5 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{currentAnalysis.education}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("education")}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t("skills")}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.skills.map((skill, i) => (
                      <span key={i} className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium border border-green-200 dark:border-green-800 hover:scale-105 transition-transform cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-800 dark:text-white">{t("strengths")}</h3>
                    </div>
                    <ul className="space-y-2">
                      {currentAnalysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-800 dark:text-white">{t("weaknesses")}</h3>
                    </div>
                    <ul className="space-y-2">
                      {currentAnalysis.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t("recommendations")}</h3>
                  </div>
                  <ul className="space-y-3">
                    {currentAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="bg-purple-600 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <LayoutDashboard className="w-3 h-3 inline mr-1" />
                  {t("generated_by")} • {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {savedResumes.length > 0 && !showCompare && !showDashboard && (
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <Archive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t("saved_resumes")}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user ? t("cloud_saved") : t("local_saved")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedForCompare.length >= 2 && (
                  <button
                    onClick={startComparison}
                    className="group flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <GitCompare className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    {t("compare")} ({selectedForCompare.length})
                  </button>
                )}
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Database className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                    {savedResumes.length} {t("saved")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedResumes.map((resume, idx) => (
                <div 
                  key={resume.id} 
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700"></div>
                  
                  <div className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-700 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1">
                            {resume.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {resume.isLocal ? (
                              <>
                                <HardDrive className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] text-gray-400">{t("local")}</span>
                              </>
                            ) : (
                              <>
                                <Cloud className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] text-blue-400">{t("cloud")}</span>
                              </>
                            )}
                            <span className="text-[10px] text-gray-400">•</span>
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] text-gray-400">
                              {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : t("recent")}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(resume.id)}
                          onChange={() => toggleCompareSelection(resume.id)}
                          className="peer w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t("ats_score")}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{resume.analysis.ats_score}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-700 transition-all duration-500"
                        style={{ width: `${resume.analysis.ats_score}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {resume.analysis.years_experience} {t("years")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {resume.analysis.skills.length} {t("skills")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {resume.analysis.skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-medium">
                          {skill}
                        </span>
                      ))}
                      {resume.analysis.skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px]">
                          +{resume.analysis.skills.length - 4}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentAnalysis(resume.analysis);
                          toast.success(`${t("loaded")} ${resume.name}!`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl bg-gradient-to-r from-[#064e3b]/70 to-emerald-500 hover:from-[#064e3b]/80 hover:to-emerald-600 text-white text-xs font-semibold transition-all duration-300"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {t("load_analysis")}
                      </button>
                      
                      <button
                        onClick={() => deleteAnalysis(resume.id, resume.isLocal || false)}
                        className="px-3 py-2 rounded-xl cursor-pointer bg-red-100 dark:bg-red-900/30 text-red-600/50 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedForCompare.length < 2 && savedResumes.length >= 2 && (
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
                  <CheckSquare className="w-3.5 h-3.5" />
                  {t("select_two_to_compare")}
                </div>
              </div>
            )}
            
            {!user && savedResumes.length > 0 && (
              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {t("local_storage_warning")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("signup_prompt")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {t("signup_free")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
{showCompare && (
  <CompareView 
    resumes={getComparisonData()} 
    onBack={clearComparison} 
  />
)}

        {savedResumes.length === 0 && !currentAnalysis && !showCompare && !showDashboard && (
          <div className="mt-8 text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl max-w-2xl mx-auto">
            <Save className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t("no_saved_resumes")}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {t("upload_and_save")}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {user ? t("saved_in_account") : t("saving_locally")}
            </p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(userData) => {
          setUser(userData);
          toast.success(`Welcome, ${userData.name}!`);
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        title={`Resume Analysis - ${currentAnalysis?.name || "Report"}`}
      />

      <ImprovementsModal
        isOpen={isImprovementsModalOpen}
        onClose={() => setIsImprovementsModalOpen(false)}
        improvements={improvements}
        onApply={(suggestion) => {
          navigator.clipboard.writeText(suggestion);
          toast.success("Suggestion copied to clipboard!");
        }}
      />
    </div>
  );
}