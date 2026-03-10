import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Play,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
  AlertCircle,
  Award,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sun,
  Moon,
  Share2,
  RefreshCw,
  Target,
  Zap,
  BarChart2,
  Mic,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";

import { useUser } from "../context/UserContext";
import useTitle from "../hooks/useTitle";

type Recommendation = {
  id: string;
  category: string;
  content: string;
};

type Pitch = {
  id: string;
  pitch_name?: string;
  overall_score: number | null;
  clarity_score: number | null;
  communication_score: number | null;
  market_fit_score: number | null;
  verdict: string | null;
  feedback_summary: string | null;
  recommendations: Recommendation[];
  duration_seconds?: number | null;
  word_count?: number | null;
  filler_word_count?: number | null;
  question_count?: number | null;
  created_at?: string | null;
  confidence_timeline?: { time: string; confidence: number }[] | null;
};

const defaultConfidenceData = [
  { time: "0:00", confidence: 45 },
  { time: "1:00", confidence: 52 },
  { time: "2:00", confidence: 68 },
  { time: "3:00", confidence: 71 },
  { time: "4:00", confidence: 65 },
  { time: "5:00", confidence: 78 },
  { time: "6:00", confidence: 82 },
  { time: "7:00", confidence: 85 },
];

const defaultFillerWords = [
  { word: "um", count: 12 },
  { word: "uh", count: 8 },
  { word: "like", count: 15 },
  { word: "you know", count: 6 },
];

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/15 dark:bg-emerald-500/20";
  if (score >= 60) return "bg-amber-500/15 dark:bg-amber-500/20";
  return "bg-red-400/15 dark:bg-red-400/20";
}

function getScoreBar(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-400";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Developing";
  return "Needs Work";
}

export default function PostPitchAnalytics() {
  useTitle("Pitch Details");
  const [searchParams] = useSearchParams();
  const pitchId = searchParams.get("pitch_id");
  const { token } = useUser();
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown" | "tips">("overview");
  const [expandedSection, setExpandedSection] = useState<string | null>("strengths");
  const [copied, setCopied] = useState(false);

  /* THEME */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* FETCH */
  useEffect(() => {
    const fetchPitch = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const url = pitchId
          ? `${BaseUrl}/api/dashboard/pitches/${pitchId}`
          : `${BaseUrl}/api/dashboard/pitches/recent?limit=1`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load pitch");
        const data = await res.json();
        const p = Array.isArray(data) ? data[0] : data;
        setPitch(p || null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchPitch();
  }, [token, pitchId]);

  const strengths = pitch?.recommendations?.filter((r) => r.category === "strength").map((r) => r.content) ?? [];
  const weaknesses = pitch?.recommendations?.filter((r) => r.category === "weakness").map((r) => r.content) ?? [];
  const suggestions = pitch?.recommendations?.filter((r) => r.category === "suggestion").map((r) => r.content) ?? [];

  const overallScore = pitch?.overall_score ?? 78;
  const clarity = pitch?.clarity_score ?? 82;
  const communication = pitch?.communication_score ?? 85;
  const marketFit = pitch?.market_fit_score ?? 68;

  const confidenceData = pitch?.confidence_timeline ?? defaultConfidenceData;

  const radarData = [
    { subject: "Clarity", score: clarity, fullMark: 100 },
    { subject: "Communication", score: communication, fullMark: 100 },
    { subject: "Market Fit", score: marketFit, fullMark: 100 },
    { subject: "Structure", score: Math.round((clarity + communication) / 2), fullMark: 100 },
    { subject: "Confidence", score: Math.round((communication + marketFit) / 2), fullMark: 100 },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#0D1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  /* ERROR */
  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#0D1117] text-gray-900 dark:text-white flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
          <XCircle className="text-red-500" size={24} />
        </div>
        <p className="text-red-500 font-medium">{error}</p>
        <Link to="/dashboard" className="text-blue-500 hover:underline text-sm flex items-center gap-1">
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#0D1117] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* ── TOPBAR ── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
            >
              <ChevronLeft size={15} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">
              {pitch?.pitch_name ? `${pitch.pitch_name}` : "Session Complete"}{" "}
              <span className="animate-bounce inline-block">🎉</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {pitch?.created_at
                ? new Date(pitch.created_at).toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })
                : "Here's a detailed breakdown of your performance"}
            </p>
          </div>

          <div className="flex items-center gap-2">
           

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-sm font-medium transition-all"
            >
              <Share2 size={15} />
              {copied ? "Copied!" : "Share"}
            </button>

            {/* Replay */}
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-sm font-medium transition-all">
              <Play size={15} />
              Replay
            </button>

            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md">
              <Download size={15} />
              Export PDF
            </button>
          </div>
        </div>

        {/* ── HERO SCORE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white"
        >
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-8 left-1/4 w-40 h-40 rounded-full bg-purple-400/20 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            {/* Big score */}
            <div className="flex items-end gap-3">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Overall Score</p>
                <div className="text-7xl font-black leading-none">
                  {Math.round(overallScore)}
                </div>
                <p className="text-blue-200 text-sm mt-1">out of 100</p>
              </div>
              <div className="mb-2">
                <span className="inline-block bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-sm font-semibold">
                  {getScoreLabel(overallScore)}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-24 bg-white/20" />

            {/* Sub scores */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Clarity", score: clarity },
                { label: "Communication", score: communication },
                { label: "Market Fit", score: marketFit },
              ].map(({ label, score }) => (
                <div key={label}>
                  <p className="text-blue-200 text-xs mb-2">{label}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm">{Math.round(score)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── QUICK STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Clock size={18} />, label: "Duration", value: formatDuration(pitch?.duration_seconds), color: "blue" },
            { icon: <MessageSquare size={18} />, label: "Words Spoken", value: pitch?.word_count ?? "842", color: "purple" },
            { icon: <AlertCircle size={18} />, label: "Filler Words", value: pitch?.filler_word_count ?? "41", color: "amber" },
            { icon: <Award size={18} />, label: "Questions", value: pitch?.question_count ?? "8", color: "green" },
          ].map(({ icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                color === "blue" ? "bg-blue-50 dark:bg-blue-500/15 text-blue-500" :
                color === "purple" ? "bg-purple-50 dark:bg-purple-500/15 text-purple-500" :
                color === "amber" ? "bg-amber-50 dark:bg-amber-500/15 text-amber-500" :
                "bg-green-50 dark:bg-green-500/15 text-green-500"
              }`}>
                {icon}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 mb-8 w-fit">
          {(["overview", "breakdown", "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Verdict + Feedback */}
              {pitch && (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
                >
                  <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                    <Target size={16} className="text-blue-500" />
                    Panel Verdict
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {pitch.verdict ?? "No verdict available for this session."}
                  </p>

                  {pitch.feedback_summary && (
                    <>
                      <div className="my-4 border-t border-gray-100 dark:border-white/10" />
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Zap size={14} className="text-purple-500" />
                        AI Feedback Summary
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {pitch.feedback_summary}
                      </p>
                    </>
                  )}

                  {/* Feedback reaction */}
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center gap-3">
                    <p className="text-xs text-gray-400">Was this feedback helpful?</p>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-green-100 dark:hover:bg-green-500/20 text-xs text-gray-500 hover:text-green-600 transition-all">
                      <ThumbsUp size={12} /> Yes
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs text-gray-500 hover:text-red-500 transition-all">
                      <ThumbsDown size={12} /> No
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Score breakdown visual */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
              >
                <h3 className="font-semibold text-base mb-5 flex items-center gap-2">
                  <BarChart2 size={16} className="text-blue-500" />
                  Score Breakdown
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Clarity", score: clarity },
                    { label: "Communication", score: communication },
                    { label: "Market Fit", score: marketFit },
                  ].map(({ label, score }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{label}</span>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {Math.round(score)} — {getScoreLabel(score)}
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.9, delay: 0.2 }}
                          className={`h-full rounded-full ${getScoreBar(score)}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Confidence chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" />
                  Confidence Trend
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-lg">
                  Over session duration
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={confidenceData}>
                  <defs>
                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-white/10" />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#confGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}

        {/* ── TAB: BREAKDOWN ── */}
        {activeTab === "breakdown" && (
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Target size={16} className="text-purple-500" />
                Skills Radar
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={theme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e7eb"} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: theme === "dark" ? "#9ca3af" : "#6b7280" }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Filler words */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Mic size={16} className="text-amber-500" />
                Filler Word Analysis
              </h3>
              <div className="space-y-3">
                {defaultFillerWords.map(({ word, count }) => {
                  const maxCount = Math.max(...defaultFillerWords.map((f) => f.count));
                  return (
                    <div key={word}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize">"{word}"</span>
                        <span className="text-gray-500 dark:text-gray-400">{count}×</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxCount) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.1 }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl">
                💡 Aim for fewer than 5 filler words per minute for a polished delivery.
              </p>
            </motion.div>
          </div>
        )}

        {/* ── TAB: TIPS ── */}
        {activeTab === "tips" && pitch && (
          <div className="space-y-4">
            {[
              { key: "strengths", label: "Strengths", icon: <CheckCircle2 size={16} className="text-emerald-500" />, items: strengths, bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
              { key: "weaknesses", label: "Areas to Improve", icon: <XCircle size={16} className="text-amber-500" />, items: weaknesses, bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20" },
              { key: "suggestions", label: "AI Suggestions", icon: <Lightbulb size={16} className="text-blue-500" />, items: suggestions, bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
            ].filter(({ items }) => items.length > 0).map(({ key, label, icon, items, bg, border }) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden`}
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  {expandedSection === key ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {expandedSection === key && (
                  <div className={`px-5 pb-5 pt-0 ${bg} border-t ${border}`}>
                    <div className="space-y-2 pt-4">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <span className="mt-1 text-gray-400">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Practice again CTA */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Ready to improve?</h3>
                  <p className="text-blue-100 text-sm">Apply these tips in your next session.</p>
                </div>
                <Link to="/pre-pitch">
                  <button className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-transform shadow-lg">
                    <RefreshCw size={14} />
                    Practice Again
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty tips state */}
        {activeTab === "tips" && !pitch && (
          <div className="text-center py-16 text-gray-400">
            <Lightbulb size={32} className="mx-auto mb-3 opacity-40" />
            <p>No recommendations available for this session.</p>
          </div>
        )}

      </div>
    </div>
  );
}