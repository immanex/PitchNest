import {
  Calendar,
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import useTitle from "../hooks/useTitle";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";

// const pitches = [
//   {
//     id: 1,
//     title: "EcoStream Series A Pitch",
//     date: "May 15, 2024 • 10:30 AM",
//     score: 92,
//     status: "Investor Ready",
//     color: "green",
//     image: "https://images.unsplash.com/photo-1524593119773-6d3a6d3b9c89?w=200",
//   },
//   {
//     id: 2,
//     title: "NeuroLink Seed Funding Round",
//     date: "May 12, 2024 • 04:15 PM",
//     score: 68,
//     status: "Needs Polish",
//     color: "orange",
//     image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
//   },
//   {
//     id: 3,
//     title: "SkyLogistics Partnership Intro",
//     date: "May 08, 2024 • 09:00 AM",
//     score: "--",
//     status: "Draft",
//     color: "gray",
//     image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200",
//   },
//   {
//     id: 4,
//     title: "HealthHero Series B Preview",
//     date: "May 05, 2024 • 02:30 PM",
//     score: 85,
//     status: "Investor Ready",
//     color: "green",
//     image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200",
//   },
// ];

export default function MyPitches() {
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
  const { user, rooms } = useUser();

  const [pitches, setPitches] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    async function fetchPitches() {
      let response = await fetch(`${BaseUrl}/api/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        let data = await response.json();
        console.log(data.total_pitches.length);
        setPitches(data?.total_pitches);
        setTotalScore(data?.average_score);
      }
    }

    fetchPitches();
  }, [user]);
  useTitle("My Pitches");
  return (
    <div className="p-8 bg-gray-100 dark:bg-[#0D1117] min-h-screen">
      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Pitches Completed"
          value={pitches ? pitches.length.toString() : "0"}
          sub="+12% this month"
        />

        <StatCard title="Average Score Trend" value={totalScore.toString()} />

        <StatCard title="Most Recent Verdict" value="Ready" highlight />
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <select className="px-4 py-2 rounded-lg border bg-white dark:bg-white/5 dark:border-white/10">
            <option>All Time</option>
          </select>

          <select className="px-4 py-2 rounded-lg border bg-white dark:bg-white/5 dark:border-white/10">
            <option>Status: All</option>
          </select>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing 42 archived pitches
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {pitches &&
          pitches?.map((pitch) => (
            <div
              key={pitch.id}
              className="flex items-center justify-between bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-xl shadow-sm"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <img
                  src={pitch?.image}
                  className="w-12 h-12 rounded-lg object-cover"
                />

                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {pitch?.pitch_name || "undefined"}
                  </div>

                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(pitch?.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* SCORE */}
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">AI SCORE</div>

                <div
                  className={`font-semibold ${
                    pitch.color === "green"
                      ? "text-green-500"
                      : pitch.color === "orange"
                        ? "text-orange-500"
                        : "text-gray-400"
                  }`}
                >
                  {pitch?.overall_score}
                </div>
              </div>

              {/* STATUS */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    pitch.color === "green"
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : pitch.color === "orange"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                        : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {pitch?.verdict}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3">
                <Link to={`/pitch-detail?pitch_id=${pitch.id}`}>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                    View Report
                  </button>
                </Link>

                <Play size={18} className="cursor-pointer text-gray-500" />

                <Trash2
                  size={18}
                  className="cursor-pointer text-gray-400 hover:text-red-500"
                />
              </div>
            </div>
          ))}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-4 mt-10 text-sm">
        <button className="flex items-center gap-1 text-gray-500">
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="flex gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
            1
          </span>
          <span>2</span>
          <span>3</span>
          <span>...</span>
          <span>12</span>
        </div>

        <button className="flex items-center gap-1 text-gray-500">
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  highlight,
}: {
  title: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-sm">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </div>

      <div
        className={`text-3xl font-bold ${
          highlight ? "text-purple-500" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </div>

      {sub && <div className="text-green-500 text-sm mt-2">{sub}</div>}
    </div>
  );
}
