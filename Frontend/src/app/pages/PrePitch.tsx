import { useState } from "react";
import {
  Users,
  Brain,
  User,
  Upload,
  Video,
  Mic,
  Play,
  BarChart3,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Lightbulb,
  Moon,
  Sun,
  ChevronLeft,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
const INVESTOR_PERSONALITIES = [
  {
    id: "aggressive",
    name: "Aggressive VC",
    desc: "Tough, challenges burn rate & competition",
  },
  {
    id: "friendly",
    name: "Friendly Angel",
    desc: "Supportive, clarifying questions",
  },
  {
    id: "analytical",
    name: "Analytical",
    desc: "Data, metrics, unit economics",
  },
  {
    id: "technical",
    name: "Technical",
    desc: "Product, tech stack, scalability",
  },
  {
    id: "skeptic",
    name: "Skeptic",
    desc: "Market size, moat, traction concerns",
  },
];
import { useUser } from "../context/UserContext";

export default function PrePitchSetup() {
  const [mode, setMode] = useState("investor");
  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(true);
  const [aggression, setAggression] = useState(50);
  const [risk, setRisk] = useState(70);
  const location = useLocation();
  const [investorArchetype, setInvestorArchetype] =
    useState<string>("friendly");
  const [industry, setIndustry] = useState<string>("SaaS & Enterprise");
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const { user } = useUser();
  async function handlePitchSelection(modeId: string) {
    console.log("Selected mode:", modeId);
    console.log("User:", user);

    console.log("Investor Archetype:", investorArchetype);

    localStorage.setItem("selectedMode", mode);
    const response = await fetch(`${BaseUrl}/api/room/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        user_id: user?.id ?? null,
        industry: industry,
        startup_type: "SaaS & Enterprise",
        experience_level: "First-time Founder",
        mode: mode,
        investor_archetype: investorArchetype,
      }),
    });

    const room = await response.json();
    console.log("Created room:", room);
    localStorage.setItem("roomId", room.room_id);

    // Redirect to pitch page
    window.location.href = "/room/" + room.room_id;
  }

  return (
    <div className="min-h-screen flex bg-gray-100 text-black dark:bg-[#0D1117] dark:text-white">
      <div className="p-8 bg-gray-100 dark:bg-[#0D1117] min-h-screen text-gray-900 dark:text-white">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pre-Pitch Setup</h1>

          <p className="text-gray-600 dark:text-gray-400">
            Tailor your AI-powered session to match your upcoming real-world
            presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-3 space-y-6">
            {/* MODE SELECTION */}
            <div className="relative z-10 max-w-7xl mx-auto py-12">
              <div className="mb-12">
                <h1 className="text-4xl mb-3">Choose Your Mode</h1>
                <p className="text-gray-400 text-lg">
                  Select how you want to practice your pitch today
                </p>
              </div>

              {/* Investor Personality */}
              <div className="mb-12 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg mb-4">Choose Investor Personality</h3>
                <div className="flex flex-wrap gap-3">
                  {INVESTOR_PERSONALITIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setInvestorArchetype(p.id)}
                      className={`px-4 py-2 rounded-xl border transition-all ${
                        investorArchetype === p.id
                          ? "bg-[#3B82F6]/30 border-[#3B82F6] text-white"
                          : "border-white/10 hover:bg-white/5 text-gray-400"
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="block text-xs opacity-80">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                MODE SELECTION
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <ModeCard
                  active={mode === "investor"}
                  onClick={() => setMode("investor")}
                  icon={<Users />}
                  title="AI Investor Panel"
                  desc="Multi-persona panel simulation"
                />

                <ModeCard
                  active={mode === "coach"}
                  onClick={() => setMode("coach")}
                  icon={<Brain />}
                  title="Coach"
                  desc="Actionable feedback in real-time"
                />

                <ModeCard
                  active={mode === "solo"}
                  onClick={() => setMode("solo")}
                  icon={<User />}
                  title="Solo Practice"
                  desc="No AI interruption"
                />
              </div>
            </div>

            {/* SIMULATION CONFIG */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="font-semibold mb-6 text-lg">
                Simulation Configuration
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Select Industry
                  </label>

                  <select
                   
                    className="w-full mt-1 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5"
                  >
                    <option>SaaS & Enterprise</option>
                    <option>AI / ML</option>
                    <option>Fintech</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Investor Archetype
                  </label>

                  <select className="w-full mt-1 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5">
                    <option>Seed Stage - Venture Capital</option>
                    <option>Angel Investor</option>
                    <option>Corporate VC</option>
                  </select>
                </div>
              </div>

              {/* AGGRESSIVENESS */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Custom Aggressiveness</span>
                  <span className="text-sm text-blue-500">Moderate</span>
                </div>

                <input
                  type="range"
                  value={aggression}
                  onChange={(e) => setAggression(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* RISK */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Risk Appetite</span>
                  <span className="text-sm text-purple-500">
                    Growth Oriented
                  </span>
                </div>

                <input
                  type="range"
                  value={risk}
                  onChange={(e) => setRisk(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* CAMERA + MIC */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Video className="text-green-500" />

                <div>
                  <div className="font-medium">Camera</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    FaceTime HD Camera
                  </div>
                </div>

                <Toggle active={camera} onClick={() => setCamera(!camera)} />
              </div>

              <div className="flex items-center gap-4">
                <Mic className="text-green-500" />

                <div>
                  <div className="font-medium">Microphone</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Built-in Mic
                  </div>
                </div>

                <Toggle active={mic} onClick={() => setMic(!mic)} />
              </div>
            </div>

            {/* START BUTTON */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 flex justify-between items-center">
              <div>
                <div className="font-semibold">
                  Estimated Session: 15-20 mins
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Including 5 mins feedback breakdown
                </div>
              </div>

              <button
                onClick={() => handlePitchSelection("")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center gap-2"
              >
                Start Session
                <Play size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Resources</h3>

              <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-10 text-center">
                <Upload className="mx-auto mb-3 text-gray-400" />

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to upload
                </p>

                <p className="text-xs text-gray-400">PDF or PPTX (Max 25MB)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-xl border transition ${
        active
          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
          : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
      }`}
    >
      <div className="mb-3 text-blue-500">{icon}</div>

      <h4 className="font-semibold mb-1">{title}</h4>

      <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition ${
        active ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
