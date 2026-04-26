"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";
import { 
  TrendingUp, Award, Calendar, BarChart3, Activity, 
  Target, Code2, Briefcase, Star, Zap, Brain, 
  TrendingDown, Clock, CheckCircle, AlertCircle,
  FileText, Rocket, Shield, Layers, PieChart, LineChart as LineChartIcon,
  GitBranch, Database, Server, Users, Layout
} from "lucide-react";
import { SavedAnalysis } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface UserStatsProps {
  analyses: SavedAnalysis[];
}

export default function UserStats({ analyses }: UserStatsProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [worstScore, setWorstScore] = useState(0);
  const [totalSkills, setTotalSkills] = useState(0);
  const [improvement, setImprovement] = useState(0);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const { t, dir } = useLanguage();

  // إخفاء جميع تحذيرات recharts
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('width(-1) and height(-1)')) return;
  if (message.includes('should be greater than 0')) return;
  if (message.includes('ResponsiveContainer')) return;
  originalError(...args);
};

  useEffect(() => {
    if (analyses.length === 0) return;

    // Prepare timeline data
    const sorted = [...analyses].sort((a, b) => 
      new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
    );
    
    const timeline = sorted.map((item, index) => ({
      name: `R${index + 1}`,
      fullName: `Resume ${index + 1}`,
      score: item.analysis.ats_score,
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Unknown",
      skills: item.analysis.skills.length,
    }));
    setChartData(timeline);

    // Calculate statistics
    const scores = analyses.map(a => a.analysis.ats_score);
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const improvementValue = lastScore - firstScore;
    setImprovement(improvementValue);
    setTrend(improvementValue > 5 ? "up" : improvementValue < -5 ? "down" : "stable");
    setAverageScore(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
    setBestScore(Math.max(...scores));
    setWorstScore(Math.min(...scores));

    // Skill distribution
    const allSkills: string[] = [];
    analyses.forEach(a => {
      a.analysis.skills.forEach(skill => allSkills.push(skill));
    });
    
    const skillCount = new Map<string, number>();
    allSkills.forEach(skill => {
      skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
    });
    
    const topSkills = Array.from(skillCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({ 
        name: name.length > 12 ? name.slice(0, 10) + ".." : name, 
        value, 
        fullName: name,
        order: index
      }));
    
    setSkillDistribution(topSkills);
    setTotalSkills([...new Set(allSkills)].length);

    // Radar data for skill categories
    const categoriesList = ["Frontend", "Backend", "Database", "DevOps", "Soft Skills"];

    const categoryScores = categoriesList.map(cat => {
      let sum = 0;
      let count = 0;
      analyses.forEach(a => {
        a.analysis.skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          
          if (cat === "Frontend" && [
            "react", "next.js", "vue", "angular", "html", "css", "tailwindcss", 
            "javascript", "typescript", "frontend", "ui", "ux", "webpack", 
            "vite", "redux", "zustand", "bootstrap", "material ui", "sass", "less"
          ].some(s => skillLower.includes(s))) {
            sum += a.analysis.ats_score;
            count++;
          }
          else if (cat === "Backend" && [
            "node.js", "python", "java", "express", "django", "php", "go", 
            "ruby", "c#", ".net", "spring", "flask", "fastapi", "nestjs", 
            "backend", "api", "rest", "graphql", "microservices"
          ].some(s => skillLower.includes(s))) {
            sum += a.analysis.ats_score;
            count++;
          }
          else if (cat === "Database" && [
            "mongodb", "postgresql", "mysql", "firebase", "supabase", "redis", 
            "sqlite", "oracle", "sql", "database", "dynamodb", "cassandra", 
            "elasticsearch", "prisma", "sequelize", "typeorm"
          ].some(s => skillLower.includes(s))) {
            sum += a.analysis.ats_score;
            count++;
          }
          else if (cat === "DevOps" && [
            "docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "github actions", 
            "ci/cd", "terraform", "ansible", "gitlab ci", "cloud", "deployment", 
            "vercel", "netlify", "heroku", "linux", "bash", "shell", "nginx", "pm2"
          ].some(s => skillLower.includes(s))) {
            sum += a.analysis.ats_score;
            count++;
          }
          else if (cat === "Soft Skills" && [
            "leadership", "communication", "teamwork", "problem solving", "mentoring", 
            "project management", "agile", "scrum", "collaboration", "presentation", 
            "time management", "critical thinking", "adaptability", "creativity", 
            "conflict resolution", "decision making", "empathy", "team lead", "management"
          ].some(s => skillLower.includes(s))) {
            sum += a.analysis.ats_score;
            count++;
          }
        });
      });
      const score = count > 0 ? Math.round(sum / count) : 0;
      return { category: cat, score: score };
    });
    setRadarData(categoryScores);
  }, [analyses]);

  if (analyses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t("no_data") || "No data yet"}</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          {t("upload_save_resumes") || "Upload and save resumes to see analytics and insights"}
        </p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-white" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-white" />;
    return <Activity className="w-4 h-4 text-white" />;
  };

  const getTrendText = () => {
    if (trend === "up") return `+${improvement}% ${t("from_first_to_last") || "from first to last"}`;
    if (trend === "down") return `${improvement}% ${t("from_first_to_last") || "from first to last"}`;
    return t("stable_across") || "Stable across all analyses";
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl">
          <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{payload[0].payload.fullName || label}</p>
          <p className="text-emerald-600 text-2xl font-bold mt-1">{payload[0].value}%</p>
          <p className="text-gray-400 text-xs mt-1">{t("ats_score") || "ATS Score"}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl">
          <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{payload[0].payload.fullName || label}</p>
          <p className="text-emerald-600 text-2xl font-bold mt-1">{payload[0].value}</p>
          <p className="text-gray-400 text-xs mt-1">{t("times_mentioned") || "times mentioned"}</p>
        </div>
      );
    }
    return null;
  };

  const CustomRadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl">
          <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{label}</p>
          <p className="text-emerald-600 text-2xl font-bold mt-1">{payload[0].value}%</p>
          <p className="text-gray-400 text-xs mt-1">{t("average_ats_score") || "Average ATS Score"}</p>
        </div>
      );
    }
    return null;
  };

  const barColors = [
    "#34D19C",
    "#2EC28F",  
    "#28B382",  
    "#22A475",  
    "#1C9568",  
    "#16865B"
  ];

  // منع تحذيرات recharts من الظهور في Terminal
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('width(-1)') || args[0]?.includes?.('height(-1)')) return;
    originalWarn(...args);
  };
}

  return (
    <div className="space-y-8" dir={dir}>
      {/* Section Header - Modern */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t("analytics_dashboard") || "Analytics Dashboard"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("deep_insights") || "Deep insights from your resume journey"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{analyses.length} {t("analyses_total") || "analyses total"}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Average Score Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-[#34D19C]/80 to-[#2BAF7E]/80">
          <div className={`absolute bottom-[-90px] ${dir === "rtl" ? "left-[-80px]" : "right-[-80px]"} w-[200px] h-[200px] rounded-full bg-white/20`}></div>
          <div className={`absolute bottom-[-45px] ${dir === "rtl" ? "left-[-40px]" : "right-[-40px]"} w-[120px] h-[120px] rounded-full bg-white/10`}></div>
          <div className={`absolute bottom-[-25px] ${dir === "rtl" ? "left-[-22px]" : "right-[-22px]"} w-16 h-16 rounded-full bg-white/5`}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/20 hover:scale-105 transition-all duration-300">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold">{t("average_ats_score") || "Average ATS Score"}</p>
            </div>
            <p className="text-3xl font-bold mb-2">{averageScore}%</p>
            <div className="flex items-center gap-2 text-sm">
              {getTrendIcon()}
              <span className="text-white/80">{getTrendText()}</span>
            </div>
          </div>
        </div>

        {/* Best Score Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-[#EE9C6C]/70 to-[#D4845A]/70">
          <div className={`absolute bottom-[-90px] ${dir === "rtl" ? "left-[-80px]" : "right-[-80px]"} w-[200px] h-[200px] rounded-full bg-white/20`}></div>
          <div className={`absolute bottom-[-45px] ${dir === "rtl" ? "left-[-40px]" : "right-[-40px]"} w-[120px] h-[120px] rounded-full bg-white/10`}></div>
          <div className={`absolute bottom-[-25px] ${dir === "rtl" ? "left-[-22px]" : "right-[-22px]"} w-16 h-16 rounded-full bg-white/5`}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/20 hover:scale-105 transition-all duration-300">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold">{t("best_score") || "Best Score"}</p>
            </div>
            <p className="text-3xl font-bold mb-2">{bestScore}%</p>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4" />
              <span className="text-white/80">{t("highest_achieved") || "Highest achieved"}</span>
            </div>
          </div>
        </div>

        {/* Improvement Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-[#58419C]/70 to-[#47337D]/70">
          <div className={`absolute bottom-[-90px] ${dir === "rtl" ? "left-[-80px]" : "right-[-80px]"} w-[200px] h-[200px] rounded-full bg-white/20`}></div>
          <div className={`absolute bottom-[-45px] ${dir === "rtl" ? "left-[-40px]" : "right-[-40px]"} w-[120px] h-[120px] rounded-full bg-white/10`}></div>
          <div className={`absolute bottom-[-25px] ${dir === "rtl" ? "left-[-22px]" : "right-[-22px]"} w-16 h-16 rounded-full bg-white/5`}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/20 hover:scale-105 transition-all duration-300">
                <Rocket className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold">{t("score_improvement") || "Score Improvement"}</p>
            </div>
            <p className="text-3xl font-bold mb-2">{improvement > 0 ? `+${improvement}` : improvement}%</p>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span className="text-white/80">{t("first_to_last") || "First to last"}</span>
            </div>
          </div>
        </div>

        {/* Unique Skills Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-[#E95F8B]/80 to-[#D14D76]/80">
          <div className={`absolute bottom-[-90px] ${dir === "rtl" ? "left-[-80px]" : "right-[-80px]"} w-[200px] h-[200px] rounded-full bg-white/20`}></div>
          <div className={`absolute bottom-[-45px] ${dir === "rtl" ? "left-[-40px]" : "right-[-40px]"} w-[120px] h-[120px] rounded-full bg-white/10`}></div>
          <div className={`absolute bottom-[-25px] ${dir === "rtl" ? "left-[-22px]" : "right-[-22px]"} w-16 h-16 rounded-full bg-white/5`}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/20 hover:scale-105 transition-all duration-300">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold">{t("unique_skills") || "Unique Skills"}</p>
            </div>
            <p className="text-3xl font-bold mb-2">{totalSkills}</p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="text-white/80">{t("across_resumes") || "Across all resumes"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir="ltr">
        {/* Progress Chart - Area Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-5" dir={dir}>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <LineChartIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t("score_progress") || "Score Progress"}</h3>
            <div className="flex items-center gap-1 ml-auto text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>{t("ats_score") || "ATS Score"}</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  unit="%"
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#22c55e", strokeWidth: 2, strokeDasharray: "4 4" }} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#22c55e" 
                  strokeWidth={2.5} 
                  fill="url(#scoreGradient)"
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Distribution - Horizontal Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-5" dir={dir}>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t("top_skills") || "Top Skills"}</h3>
            <span className="text-[11px] text-gray-400 ml-auto">{t("most_frequent") || "Most frequent"}</span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDistribution} layout="vertical" margin={{ left: 5, right: 10 }}>
                <XAxis 
                  type="number" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={70}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#22c55e", fillOpacity: 0.08 }} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]} 
                  animationDuration={800}
                  animationEasing="ease-out"
                  barSize={24}
                >
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart - Skills Distribution by Category */}
        {radarData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-5" dir={dir}>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t("skills_coverage") || "Skills Coverage"}</h3>
              <span className="text-[11px] text-gray-400 ml-auto">{t("by_category") || "By category"}</span>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                  <Radar 
                    name="Skills" 
                    dataKey="score" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    fill="#22c55e" 
                    fillOpacity={0.15}
                    animationDuration={800}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Timeline Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-5" dir={dir}>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t("analysis_timeline") || "Analysis Timeline"}</h3>
            <span className="text-[11px] text-gray-400 ml-auto">{t("recent_first") || "Recent first"}</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {[...analyses].reverse().slice(0, 6).map((item, idx) => (
              <div 
                key={item.id} 
                className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : t("recent") || "Recent"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-emerald-600">{item.analysis.ats_score}%</p>
                  <p className="text-xs text-gray-500">{item.analysis.skills.length} {t("skills") || "skills"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-800 dark:text-white">{t("ai_insights") || "AI Insights"}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {averageScore >= 80 
                ? t("excellent_work") || "Excellent work! Your resumes are performing exceptionally well. Focus on maintaining this quality."
                : averageScore >= 60 
                ? t("good_progress") || "Good progress! Consider adding more industry keywords and quantifiable achievements to boost your ATS score."
                : t("keep_going") || "Keep going! Your resumes need improvement. Focus on adding relevant skills and certifications to increase your chances."}
            </p>
            {worstScore < 50 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg inline-flex">
                <AlertCircle className="w-3.5 h-3.5" />
                {t("lowest_score_tip") || "Tip: Your lowest scoring resume"} ({worstScore}%) {t("needs_revision") || "needs significant revision. Review the recommendations tab."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}