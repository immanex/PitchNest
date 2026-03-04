import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Sparkles,
  Play,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  Zap,
  Users,
  ChevronRight,
  Settings,
  Bell,
  Search,
  Lightbulb,
  Award,
  Calendar,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const recentPitches = [
  {
    id: 1,
    title: "Series A Fundraising Pitch",
    date: "2 hours ago",
    mode: "AI Investor Panel",
    score: 82,
    duration: "7:42",
    status: "completed",
  },
  {
    id: 2,
    title: "Product Demo Practice",
    date: "Yesterday",
    mode: "Practice Mode",
    score: 76,
    duration: "5:12",
    status: "completed",
  },
  {
    id: 3,
    title: "Pitch Competition Prep",
    date: "2 days ago",
    mode: "Coach Mode",
    score: 88,
    duration: "8:30",
    status: "completed",
  },
];

const aiRecommendations = [
  {
    title: "Work on Filler Words",
    description:
      'You used "um" and "uh" 23 times in your last session. Try pausing instead.',
    priority: "high",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    title: "Improve Financial Clarity",
    description:
      "Investors asked 4 follow-up questions about your unit economics. Review your metrics.",
    priority: "medium",
    icon: <Target className="w-5 h-5" />,
  },
  {
    title: "Practice Market Sizing",
    description:
      "Your market size explanation needs more supporting data. Add 2-3 data points.",
    priority: "medium",
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

export default function Dashboard() {
  const { user, logout } = useUser();
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#3B82F6] opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#7C3AED] opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 border-b border-white/10 backdrop-blur-sm bg-[#0D1117]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xl font-semibold">PitchNest-Live</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors w-64"
              />
            </div>

            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#3B82F6] rounded-full" />
            </button>

            <Link to="/settings">
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
                {user?.full_name ? user.full_name[0] : "U"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.full_name}! 👋</h1>
          <p className="text-gray-400 text-lg">
            Ready to perfect your pitch today?
          </p>
        </div>

        {/* Performance Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <PerformanceCard
            icon={<Play className="w-6 h-6" />}
            label="Total Sessions"
            value="24"
            change="+3 this week"
            trend="up"
            color="#3B82F6"
          />
          <PerformanceCard
            icon={<Award className="w-6 h-6" />}
            label="Avg. Score"
            value="82"
            change="+8 points"
            trend="up"
            color="#10B981"
          />
          <PerformanceCard
            icon={<Clock className="w-6 h-6" />}
            label="Practice Time"
            value="3.2h"
            change="This week"
            color="#7C3AED"
          />
          <PerformanceCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Improvement"
            value="40%"
            change="vs. first session"
            trend="up"
            color="#F59E0B"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Pitches */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <Link to="/modes">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 border border-[#3B82F6]/30 hover:border-[#3B82F6]/50 transition-all text-left"
                >
                  <Users className="w-8 h-8 text-[#3B82F6] mb-3" />
                  <div className="text-sm text-gray-400">Start New</div>
                  <div className="font-semibold">AI Panel</div>
                </motion.button>
              </Link>

              <Link to="/modes">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#7C3AED]/5 border border-[#7C3AED]/30 hover:border-[#7C3AED]/50 transition-all text-left"
                >
                  <Zap className="w-8 h-8 text-[#7C3AED] mb-3" />
                  <div className="text-sm text-gray-400">Quick</div>
                  <div className="font-semibold">Practice</div>
                </motion.button>
              </Link>

              <Link to="/analytics">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/5 border border-[#10B981]/30 hover:border-[#10B981]/50 transition-all text-left"
                >
                  <BarChart3 className="w-8 h-8 text-[#10B981] mb-3" />
                  <div className="text-sm text-gray-400">View</div>
                  <div className="font-semibold">Analytics</div>
                </motion.button>
              </Link>
            </div>

            {/* Recent Pitches */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Recent Pitches</h2>
                <Link
                  to="/analytics"
                  className="text-sm text-[#3B82F6] hover:text-[#7C3AED] transition-colors flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentPitches.map((pitch) => (
                  <motion.div
                    key={pitch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{pitch.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {pitch.date}
                          </span>
                          <span>•</span>
                          <span>{pitch.mode}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
                          {pitch.score}
                        </div>
                        <div className="text-xs text-gray-400">score</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{pitch.duration}</span>
                      </div>
                      <Link to="/analytics">
                        <button className="px-4 py-2 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30 transition-all text-sm">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - AI Recommendations */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">AI Recommendations</h2>
              </div>

              <div className="space-y-4">
                {aiRecommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border transition-all ${
                      rec.priority === "high"
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-yellow-500/10 border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          rec.priority === "high"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {rec.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-400">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                Take Action
              </button>
            </div>

            {/* Streak Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F59E0B]/20 to-[#EF4444]/20 border border-[#F59E0B]/30">
              <div className="text-4xl mb-2">🔥</div>
              <h3 className="text-2xl font-bold mb-1">7 Day Streak!</h3>
              <p className="text-sm text-gray-300 mb-4">
                You've practiced for 7 days straight. Keep it up!
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className="w-8 h-8 rounded-lg bg-[#F59E0B]/30 border border-[#F59E0B]/50 flex items-center justify-center text-xs"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceCard({
  icon,
  label,
  value,
  change,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend?: "up" | "down";
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${color}20`,
          color: color,
        }}
      >
        {icon}
      </div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div
        className={`text-xs flex items-center gap-1 ${
          trend === "up"
            ? "text-green-400"
            : trend === "down"
              ? "text-red-400"
              : "text-gray-400"
        }`}
      >
        {trend === "up" && <TrendingUp className="w-3 h-3" />}
        {change}
      </div>
    </motion.div>
  );
}
