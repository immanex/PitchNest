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
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import PrePitchSetup from "../pages/PrePitch";
import useTitle from "../hooks/useTitle";




interface Pitch {
  id: number;
  title: string;
  date: string;
  score: number;
}

const aiRecommendations = [
  {
    title: "Clarity Check",
    description:
      "Work on your value proposition clarity. The problem statement is slightly too technical for general investors.",
  },
  {
    title: "Objection Handling",
    description:
      "Practice handling skeptical investor questions regarding CAC and customer acquisition.",
  },
  {
    title: "Pacing Tip",
    description:
      "Your delivery speed increased by 15% in the last session. Slow down during financial slides.",
  },
];

export default function Dashboard() {
  useTitle("Dashboard");
   const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
  const { user, rooms } = useUser();

  const [roomList, setRooms] = useState<any[]>([]);
  const [pitches, setPitches] = useState<any[]>([]);

  /* THEME STATE */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setRooms(rooms?.rooms);
  }, [rooms]);

  useEffect(() => {
    async function fetchPitches() {
      let response = await fetch(
        `${BaseUrl}/api/dashboard/pitches/recent`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        let data = await response.json();
        setPitches(data);
      }
    }

    fetchPitches();
  }, [user]);

  return (
    <div className="min-h-screen flex bg-gray-100 text-black dark:bg-[#0D1117] dark:text-white">

      {/* MAIN */}
      <div className="flex-1">
        {/* TOPBAR */}
        

        {/* CONTENT */}
        <div className="p-8">
          {/* HERO */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name}! 🚀
            </h1>

            <p className="opacity-90 mb-4">
              Your last pitch scored in the top 10% of SaaS startups.
            </p>

            <Link to="/pre-pitch">
              <button className="bg-white text-blue-600 px-5 py-2 rounded-lg font-medium">
                + Start New Pitch
              </button>
            </Link>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard title="Average Pitch Score" value="84" />
            <StatCard title="Total Pitches" value={pitches?.length || 0} />
            <StatCard title="Best Score" value="92" />
            <StatCard title="AI Improvements" value="5" />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-3 gap-8">
            {/* RECENT PITCHES */}
            <div className="col-span-2 bg-white dark:bg-white/5 border dark:border-white/10 rounded-xl p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Pitches</h2>

                <Link to="/analytics" className="text-blue-500 text-sm">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {pitches?.length ? (
                  pitches.map((pitch: Pitch) => (
                    <div
                      key={pitch.id}
                      className="flex justify-between items-center border-b dark:border-white/10 pb-4"
                    >
                      <div>
                        <div className="font-medium">
                          {pitch?.title || "None"}
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {pitch?.date || "Unknown"}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-green-500 font-semibold">
                          {pitch?.score || "N/A"}
                        </div>

                        <Link to={`/pitch-detail?pitch_id=${pitch.id}`}>
                          <button className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">
                            ▶
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    No recent pitches
                  </div>
                )}
              </div>
            </div>

            {/* AI INSIGHTS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="text-blue-500" size={18} />
                <h2 className="font-semibold">AI Insights</h2>
              </div>

              {aiRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-white/5 border dark:border-white/10 p-5 rounded-xl border-l-4 border-blue-500"
                >
                  <div className="font-semibold mb-1">{rec.title}</div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {rec.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white dark:bg-white/5 border dark:border-white/10 p-6 rounded-xl">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </div>

      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
