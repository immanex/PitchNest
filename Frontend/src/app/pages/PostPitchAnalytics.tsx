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
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useUser } from "../context/UserContext";

type Pitch = {
  id: string;
  overall_score: number | null;
  clarity_score: number | null;
  communication_score: number | null;
  market_fit_score: number | null;
  verdict: string | null;
  feedback_summary: string | null;
  recommendations: { id: string; category: string; content: string }[];
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

export default function PostPitchAnalytics() {
  const [searchParams] = useSearchParams();
  const pitchId = searchParams.get("pitch_id");
  const { token } = useUser();
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPitch = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const url = pitchId
          ? `${BaseUrl}/api/dashboard/pitches/${pitchId}`
          : `${BaseUrl}/api/dashboard/pitches/recent?limit=1`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

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

  const strengths =
    pitch?.recommendations
      ?.filter((r) => r.category === "strength")
      .map((r) => r.content) ?? [];

  const weaknesses =
    pitch?.recommendations
      ?.filter((r) => r.category === "weakness")
      .map((r) => r.content) ?? [];

  const suggestions =
    pitch?.recommendations
      ?.filter((r) => r.category === "suggestion")
      .map((r) => r.content) ?? [];

  const overallScore = pitch?.overall_score ?? 78;
  const clarity = pitch?.clarity_score ?? 82;
  const confidence = pitch?.communication_score ?? 85;
  const marketFit = pitch?.market_fit_score ?? 68;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D1117] text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0D1117] text-gray-900 dark:text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>

        <Link
          to="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D1117] text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}

        <div className="flex items-start justify-between mb-10">
          <div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft size={18} />
              Back to Dashboard
            </Link>

            <h1 className="text-4xl font-bold mt-3">
              Session Complete 🎉
            </h1>

            <p className="text-gray-500 dark:text-gray-400">
              Here's how you performed
            </p>
          </div>

          <div className="flex gap-3">

            <button className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20">
              <Play size={18} />
              Replay
            </button>

            <button className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Download size={18} />
              Export PDF
            </button>

          </div>
        </div>

        {/* OVERALL SCORE */}

        <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-8">

          <div className="flex justify-between items-center">

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Overall Score
              </div>

              <div className="text-6xl font-bold text-blue-500">
                {Math.round(overallScore)}
                <span className="text-xl text-gray-500 ml-2">/100</span>
              </div>
            </div>

            <div className="flex gap-8">
              <ScoreBadge label="Clarity" score={clarity} />
              <ScoreBadge label="Communication" score={confidence} />
              <ScoreBadge label="Market Fit" score={marketFit} />
            </div>

          </div>

        </div>

        {/* STRENGTHS / WEAKNESSES */}

        {pitch && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">

            <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">

              <h3 className="font-semibold mb-4">Panel Verdict</h3>

              <p className="text-gray-700 dark:text-gray-300">
                {pitch.verdict ?? "—"}
              </p>

              {pitch.feedback_summary && (
                <>
                  <h4 className="mt-6 font-semibold">
                    AI Feedback
                  </h4>

                  <p className="text-gray-600 dark:text-gray-400">
                    {pitch.feedback_summary}
                  </p>
                </>
              )}
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">

              {strengths.length > 0 && (
                <div className="mb-6">

                  <h3 className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="text-green-500" size={18} />
                    Strengths
                  </h3>

                  {strengths.map((s, i) => (
                    <p key={i} className="text-gray-600 dark:text-gray-400">
                      • {s}
                    </p>
                  ))}

                </div>
              )}

              {weaknesses.length > 0 && (
                <div className="mb-6">

                  <h3 className="flex items-center gap-2 mb-3">
                    <XCircle className="text-yellow-500" size={18} />
                    Weaknesses
                  </h3>

                  {weaknesses.map((w, i) => (
                    <p key={i} className="text-gray-600 dark:text-gray-400">
                      • {w}
                    </p>
                  ))}

                </div>
              )}

              {suggestions.length > 0 && (
                <div>

                  <h3 className="flex items-center gap-2 mb-3">
                    <Lightbulb className="text-blue-500" size={18} />
                    Suggestions
                  </h3>

                  {suggestions.map((s, i) => (
                    <p key={i} className="text-gray-600 dark:text-gray-400">
                      • {s}
                    </p>
                  ))}

                </div>
              )}

            </div>

          </div>
        )}

        {/* CONFIDENCE CHART */}

        <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-8">

          <h3 className="mb-4 font-semibold">Confidence Trend</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={defaultConfidenceData}>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis dataKey="time" stroke="#9ca3af" />

              <YAxis stroke="#9ca3af" domain={[0, 100]} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#3B82F6"
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-4 gap-6">

          <StatCard icon={<Clock />} label="Duration" value="7:42" />
          <StatCard icon={<MessageSquare />} label="Words" value="842" />
          <StatCard icon={<AlertCircle />} label="Filler Words" value="41" />
          <StatCard icon={<Award />} label="Questions" value="8" />

        </div>

      </div>
    </div>
  );
}

/* SCORE BADGE */

function ScoreBadge({ label, score }: any) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-500">
        {Math.round(score)}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {label}
      </p>
    </div>
  );
}

/* STAT CARD */

function StatCard({ icon, label, value }: any) {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">

      <div className="text-blue-500 mb-3">{icon}</div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="text-2xl font-bold">{value}</p>

    </div>
  );
}