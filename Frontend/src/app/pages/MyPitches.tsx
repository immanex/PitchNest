import {
  Calendar,
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Award,
  Mic,
  ArrowUpRight,
  X,
  AlertTriangle,
  BarChart3,
  Clock,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import useTitle from "../hooks/useTitle";
import { useUser } from "../context/UserContext";
import { useEffect, useState, useMemo } from "react";

const ITEMS_PER_PAGE = 8;

function getScoreColor(score: number | null | undefined) {
  if (score === null || score === undefined) return "text-gray-400 dark:text-gray-500";
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-400";
}

function getScoreBg(score: number | null | undefined) {
  if (score === null || score === undefined) return "bg-gray-100 dark:bg-white/10 text-gray-400";
  if (score >= 80) return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400";
}

function getScoreLabel(score: number | null | undefined) {
  if (score === null || score === undefined) return "Draft";
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Investor Ready";
  if (score >= 60) return "Needs Polish";
  return "Needs Work";
}

function getVerdictStyle(verdict: string | null | undefined) {
  if (!verdict) return "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400";
  const v = verdict.toLowerCase();
  if (v.includes("ready") || v.includes("strong") || v.includes("good"))
    return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (v.includes("polish") || v.includes("improve") || v.includes("needs"))
    return "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400";
}

function getInitials(name: string) {
  if (!name) return "P";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarGradient(id: string | number) {
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-amber-500 to-orange-400",
    "from-emerald-500 to-teal-400",
    "from-indigo-500 to-blue-400",
    "from-rose-500 to-pink-400",
  ];
  const idx = String(id).charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function MyPitches() {
  useTitle("My Pitches");
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
  const { user } = useUser();

  const [pitches, setPitches] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Theme
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch
  useEffect(() => {
    async function fetchPitches() {
      setLoading(true);
      try {
        const response = await fetch(`${BaseUrl}/api/dashboard/summary`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPitches(data?.total_pitches ?? []);
          setTotalScore(data?.average_score ?? 0);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPitches();
  }, [user]);

  // Delete handler
  async function handleDelete(pitch: any) {
    setDeleting(true);
    try {
      const res = await fetch(`${BaseUrl}/api/dashboard/pitches/${pitch.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        setPitches((prev) => prev.filter((p) => p.id !== pitch.id));
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // Filter + sort + paginate
  const filtered = useMemo(() => {
    let list = [...(pitches ?? [])];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.pitch_name?.toLowerCase().includes(q));
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = Date.now();
      const days = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 90;
      list = list.filter(
        (p) => p.created_at && now - new Date(p.created_at).getTime() <= days * 86400000
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((p) => {
        const label = getScoreLabel(p.overall_score).toLowerCase();
        return label.includes(statusFilter.toLowerCase());
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      if (sortBy === "date_asc") return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      if (sortBy === "score_desc") return (b.overall_score ?? 0) - (a.overall_score ?? 0);
      if (sortBy === "score_asc") return (a.overall_score ?? 0) - (b.overall_score ?? 0);
      return 0;
    });

    return list;
  }, [pitches, search, timeFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [search, timeFilter, statusFilter, sortBy]);

  const bestScore = pitches.length ? Math.max(...pitches.map((p) => p.overall_score ?? 0)) : 0;
  const mostRecentVerdict = pitches[0]?.verdict ?? "—";

  return (
    <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#0D1117] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
              <ChevronLeft size={15} /> Dashboard
            </Link>
            <h1 className="text-3xl font-bold">My Pitches</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {pitches.length} total session{pitches.length !== 1 ? "s" : ""} recorded
            </p>
          </div>

          <div className="flex items-center gap-3">
           
            <Link to="/pre-pitch">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-md transition-opacity">
                <Mic size={14} />
                New Pitch
              </button>
            </Link>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Pitches"
            value={loading ? "…" : pitches.length.toString()}
            sub="+12% this month"
            icon={<BarChart3 size={18} />}
            color="blue"
          />
          <StatCard
            title="Average Score"
            value={loading ? "…" : Math.round(totalScore).toString()}
            sub="Overall performance"
            icon={<TrendingUp size={18} />}
            color="purple"
          />
          <StatCard
            title="Best Score"
            value={loading ? "…" : bestScore.toString()}
            sub={mostRecentVerdict}
            icon={<Award size={18} />}
            color="emerald"
            highlight
          />
        </div>

        {/* ── FILTER BAR ── */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search pitches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={13} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" />
                </button>
              )}
            </div>

            {/* Time */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="investor ready">Investor Ready</option>
              <option value="needs polish">Needs Polish</option>
              <option value="exceptional">Exceptional</option>
              <option value="draft">Draft</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="score_desc">Highest Score</option>
              <option value="score_asc">Lowest Score</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>
              {filtered.length === pitches.length
                ? `Showing all ${pitches.length} pitches`
                : `${filtered.length} of ${pitches.length} pitches`}
            </span>
            {(search || timeFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setTimeFilter("all"); setStatusFilter("all"); }}
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                <X size={11} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── PITCH LIST ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Mic size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {search || timeFilter !== "all" || statusFilter !== "all"
                ? "No pitches match your filters"
                : "No pitches yet"}
            </p>
            {!search && (
              <Link to="/pre-pitch">
                <button className="mt-4 text-blue-500 text-sm hover:underline">
                  Record your first pitch →
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((pitch, idx) => (
              <div
                key={pitch.id}
                className="group flex items-center gap-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-2xl hover:shadow-md dark:hover:border-white/20 transition-all"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(pitch.id)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                  {pitch?.image
                    ? <img src={pitch.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    : getInitials(pitch?.pitch_name ?? "P")
                  }
                </div>

                {/* Name + date */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {pitch?.pitch_name || "Untitled Pitch"}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {pitch?.created_at
                      ? new Date(pitch.created_at).toLocaleString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "Unknown date"}
                  </div>
                </div>

                {/* Score bar */}
                <div className="hidden md:flex flex-col items-end gap-1 w-28">
                  <span className="text-xs text-gray-400">AI Score</span>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          (pitch?.overall_score ?? 0) >= 80 ? "bg-emerald-500" :
                          (pitch?.overall_score ?? 0) >= 60 ? "bg-amber-500" : "bg-red-400"
                        }`}
                        style={{ width: `${pitch?.overall_score ?? 0}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${getScoreColor(pitch?.overall_score)}`}>
                      {pitch?.overall_score ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Score badge (mobile) */}
                <div className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${getScoreBg(pitch?.overall_score)}`}>
                  {pitch?.overall_score ?? "—"}
                </div>

                {/* Verdict */}
                <div className="hidden sm:block">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerdictStyle(pitch?.verdict)}`}>
                    {pitch?.verdict ?? getScoreLabel(pitch?.overall_score)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/pitch-detail?pitch_id=${pitch.id}`}>
                    <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
                      <ArrowUpRight size={12} />
                      Report
                    </button>
                  </Link>

                  <button
                    className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all"
                    title="Replay"
                  >
                    <Play size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(pitch)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/15 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                        currentPage === item
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/15 mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Delete Pitch?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                "{deleteTarget?.pitch_name || "Untitled Pitch"}"
              </span>{" "}
              will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
  highlight,
}: {
  title: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  color?: "blue" | "purple" | "emerald";
  highlight?: boolean;
}) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-500",
    purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-500",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500",
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-2xl hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className={`p-2 rounded-xl ${colorMap[color ?? "blue"]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${highlight ? "text-purple-500" : ""}`}>
        {value}
      </div>
      {sub && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
          {sub.includes("+") ? (
            <span className="text-emerald-500">{sub}</span>
          ) : (
            <span>{sub}</span>
          )}
        </div>
      )}
    </div>
  );
}