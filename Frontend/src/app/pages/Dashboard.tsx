import { Link } from "react-router-dom";
import {
  BarChart3,
  Play,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Lightbulb,
  Moon,
  Sun,
  Target,
  Clock,
  Award,
  ChevronRight,
  Zap,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Mic,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import useTitle from "../hooks/useTitle";

interface Pitch {
  id: number;
  pitch_name: string;
  date: string;
  overall_score: number;
  created_at: string;
}

const aiRecommendations = [
  {
    title: "Clarity Check",
    icon: "🎯",
    color: "from-blue-500 to-cyan-400",
    description:
      "Work on your value proposition clarity. The problem statement is slightly too technical for general investors.",
  },
  {
    title: "Objection Handling",
    icon: "🛡️",
    color: "from-purple-500 to-pink-400",
    description:
      "Practice handling skeptical investor questions regarding CAC and customer acquisition.",
  },
  {
    title: "Pacing Tip",
    icon: "⚡",
    color: "from-amber-500 to-orange-400",
    description:
      "Your delivery speed increased by 15% in the last session. Slow down during financial slides.",
  },
];

const weeklyActivity = [
  { day: "Mon", sessions: 2 },
  { day: "Tue", sessions: 4 },
  { day: "Wed", sessions: 1 },
  { day: "Thu", sessions: 5 },
  { day: "Fri", sessions: 3 },
  { day: "Sat", sessions: 0 },
  { day: "Sun", sessions: 2 },
];

export default function Dashboard() {
  useTitle("Dashboard");
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
  const { user, rooms } = useUser();

  const [roomList, setRooms] = useState<any[]>([]);
  const [pitches, setPitches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  /* THEME STATE */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  /* Greeting based on time */
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setRooms(rooms?.rooms);
  }, [rooms]);

  const fetchPitches = async () => {
    let response = await fetch(`${BaseUrl}/api/dashboard/pitches/recent`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.ok) {
      let data = await response.json();
      setPitches(data);
    }
  };

  useEffect(() => {
    fetchPitches();
  }, [user]);

  // Refetch pitches when window regains focus so dashboard shows live data
  useEffect(() => {
    const onFocus = () => {
      if (user) fetchPitches();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  const filteredPitches = pitches?.filter((p: Pitch) =>
    p?.pitch_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxSessions = Math.max(...weeklyActivity.map((d) => d.sessions));

  return (
    <div className="min-h-screen flex bg-[#F4F6FB] text-gray-900 dark:bg-[#0D1117] dark:text-white transition-colors duration-300">
      <div className="flex-1 overflow-x-hidden">


        {/* ── CONTENT ── */}
        <div className="p-6 md:p-8 space-y-8">

          {/* ── HERO ── */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-8">
            <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 left-1/3 w-36 h-36 rounded-full bg-purple-400/20 blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">
                  {greeting} 👋
                </p>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.full_name || "Pitcher"}!
                </h1>
                <p className="opacity-80 text-sm max-w-md">
                  Your last pitch scored in the{" "}
                  <span className="font-semibold text-white">top 10%</span> of
                  SaaS startups. Keep up the momentum.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to="/pre-pitch">
                  <button className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                    <Mic size={15} />
                    Start New Pitch
                  </button>
                </Link>
                <Link to="/analytics">
                  <button className="flex items-center gap-2 bg-white/15 border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/25 transition-all duration-200">
                    <BarChart3 size={15} />
                    Analytics
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Average Score"
              value="84"
              icon={<TrendingUp size={18} />}
              trend="+3"
              positive
              color="blue"
            />
            <StatCard
              title="Total Pitches"
              value={pitches?.length || 0}
              icon={<Mic size={18} />}
              trend="+2"
              positive
              color="purple"
            />
            <StatCard
              title="Best Score"
              value="92"
              icon={<Award size={18} />}
              trend="+1"
              positive
              color="green"
            />
            <StatCard
              title="AI Improvements"
              value="5"
              icon={<Zap size={18} />}
              trend="+5"
              positive
              color="amber"
            />
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* RECENT PITCHES */}
            <div className="xl:col-span-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold">Recent Pitches</h2>
                <div className="flex items-center gap-2">
                  <Link
                    to="/analytics"
                    className="flex items-center gap-1 text-blue-500 text-sm hover:underline"
                  >
                    View All <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                {filteredPitches?.length ? (
                  filteredPitches.map((pitch: Pitch) => {
                    const score = pitch?.overall_score || 0;
                    const scoreColorBg =
                      score >= 80
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                        : score >= 60
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400";
                    const barColor =
                      score >= 80
                        ? "bg-green-500"
                        : score >= 60
                        ? "bg-amber-500"
                        : "bg-red-400";

                    return (
                      <div
                        key={pitch.id}
                        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${scoreColorBg}`}
                        >
                          {score || "—"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {pitch?.pitch_name || "Untitled Pitch"}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {pitch?.created_at || "Unknown date"}
                          </div>
                        </div>

                        <div className="hidden sm:block w-24">
                          <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>

                        <Link to={`/pitch-detail?pitch_id=${pitch.id}`}>
                          <button className="opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-all">
                            <Play size={12} />
                          </button>
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <Mic size={22} className="text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      {searchQuery
                        ? "No pitches match your search"
                        : "No recent pitches"}
                    </p>
                    {!searchQuery && (
                      <Link to="/pre-pitch">
                        <button className="mt-3 text-blue-500 text-sm hover:underline">
                          Start your first pitch →
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">

              {/* WEEKLY ACTIVITY */}
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold">Weekly Activity</h2>
                  <span className="text-xs text-gray-400">This week</span>
                </div>
                <div className="flex items-end gap-2 h-16">
                  {weeklyActivity.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-blue-500 opacity-80 hover:opacity-100 transition-opacity"
                        style={{
                          height: `${(d.sessions / maxSessions) * 52}px`,
                          minHeight: "4px",
                        }}
                      />
                      <span className="text-[10px] text-gray-400">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI INSIGHTS */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={15} className="text-blue-500" />
                  <h2 className="text-sm font-semibold">AI Insights</h2>
                </div>
                <div className="space-y-3">
                  {aiRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md dark:hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rec.color} flex items-center justify-center text-sm shrink-0`}
                        >
                          {rec.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-1">
                            {rec.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {rec.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Practice Mode",
                      icon: <Mic size={14} />,
                      to: "/pre-pitch",
                      color:
                        "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20",
                    },
                    {
                      label: "View Stats",
                      icon: <BarChart3 size={14} />,
                      to: "/analytics",
                      color:
                        "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20",
                    },
                    {
                      label: "Goals",
                      icon: <Target size={14} />,
                      to: "/goals",
                      color:
                        "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20",
                    },
                    {
                      label: "Settings",
                      icon: <Settings size={14} />,
                      to: "/settings",
                      color:
                        "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15",
                    },
                  ].map((a, i) => (
                    <Link key={i} to={a.to}>
                      <button
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${a.color}`}
                      >
                        {a.icon}
                        {a.label}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  positive,
  color,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  trend?: string;
  positive?: boolean;
  color: "blue" | "purple" | "green" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-500",
    purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-500",
    green: "bg-green-50 dark:bg-green-500/10 text-green-500",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-2xl hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              positive ? "text-green-500" : "text-red-400"
            }`}
          >
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
    </div>
  );
}