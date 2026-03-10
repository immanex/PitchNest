import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import useTitle from "../hooks/useTitle";
import { useUser } from "../context/UserContext";

type PitchSummary = {
  id: string;
  pitch_name?: string | null;
  overall_score?: number | null;
  verdict?: string | null;
  created_at: string;
};

type DashboardSummary = {
  total_pitches: PitchSummary[];
  average_score: number | null;
  recent_pitches: PitchSummary[];
};

export default function Analytics() {
  useTitle("Analytics");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pitchIdParam = searchParams.get("pitch_id");
  const { token } = useUser();
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect legacy /analytics?pitch_id=X to pitch-detail
  useEffect(() => {
    if (pitchIdParam) {
      navigate(`/pitch-detail?pitch_id=${pitchIdParam}`, { replace: true });
      return;
    }
  }, [pitchIdParam, navigate]);

  useEffect(() => {
    if (pitchIdParam) return; // Redirecting to pitch-detail, skip fetch
    const fetchSummary = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BaseUrl}/api/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch {
        // Fallback to empty
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token, BaseUrl, pitchIdParam]);

  const totalCount = summary?.total_pitches?.length ?? 0;
  const avgScore = summary?.average_score;
  const recentPitches = summary?.recent_pitches ?? [];
  const scoreTrend = recentPitches.length >= 2
    ? (recentPitches[0].overall_score ?? 0) - (recentPitches[recentPitches.length - 1].overall_score ?? 0)
    : 0;

  return (
    <div className="p-8 bg-gray-100 dark:bg-[#0D1117] min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Deep Dive
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive review of your pitching performance and investor readiness.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Avg. Investment Readiness"
          value={loading ? "—" : `${Math.round(avgScore ?? 0)}/100`}
          subtitle={!loading && scoreTrend !== 0 ? (scoreTrend > 0 ? `+${Math.round(scoreTrend)} vs last` : `${Math.round(scoreTrend)} vs last`) : undefined}
        />
        <StatCard
          title="Total Pitches"
          value={loading ? "—" : String(totalCount)}
          subtitle={totalCount > 0 ? "sessions completed" : undefined}
        />
        <StatCard
          title="Recent Pitches"
          value={loading ? "—" : String(recentPitches.length)}
          subtitle="Click below to view details"
        />
      </div>

      {/* RECENT PITCHES - Links to real AI analysis */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Recent Pitch Sessions
        </h2>
        {loading ? (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-xl text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : recentPitches.length === 0 ? (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-xl text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No pitch sessions yet.</p>
            <Link
              to="/pre-pitch"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Start a pitch <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPitches.map((p) => (
              <Link
                key={p.id}
                to={`/pitch-detail?pitch_id=${p.id}`}
                className="block bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {p.pitch_name || "Untitled Pitch"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("en-US", {
                            dateStyle: "medium",
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.overall_score != null && (
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          (p.overall_score ?? 0) >= 80
                            ? "bg-emerald-500/20 text-emerald-500"
                            : (p.overall_score ?? 0) >= 60
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {Math.round(p.overall_score)}/100
                      </span>
                    )}
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* AI INSIGHTS */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-purple-500" size={18} />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            AI Insights & Trends
          </h2>
        </div>
        <Insight
          tag="VOCAL CLARITY"
          text="End your pitch session to receive AI-powered feedback on clarity and delivery."
        />
        <Insight
          tag="PITCH ANALYSIS"
          text="Each completed session gets a full breakdown: scores, strengths, weaknesses, and suggestions."
        />
        <Insight
          tag="CONTINUOUS IMPROVEMENT"
          text="Track your scores across sessions to see improvement over time."
        />
      </div>
    </div>
  );
}

/* COMPONENTS */

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>

      {subtitle && (
        <div className="text-sm text-green-500 mt-2">
          {subtitle}
        </div>
      )}

    </div>
  );
}

function Insight({
  tag,
  text,
}: {
  tag: string;
  text: string;
}) {
  return (
    <div className="mb-6">

      <div className="text-xs font-semibold text-purple-500 mb-2">
        {tag}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300">
        {text}
      </p>

    </div>
  );
}

function MetricCard({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl">

      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="flex gap-3 items-end h-32">

        {[20, 30, 60, 40, 50].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="flex-1 bg-purple-500/70 rounded-t"
          />
        ))}

      </div>

    </div>
  );
}