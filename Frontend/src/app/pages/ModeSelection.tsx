import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Dumbbell, Zap, ArrowRight, ChevronLeft } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useLocation } from "react-router-dom";
import useTitle from "../hooks/useTitle";


const INVESTOR_PERSONALITIES = [
  { id: "aggressive", name: "Aggressive VC", desc: "Tough, challenges burn rate & competition" },
  { id: "friendly", name: "Friendly Angel", desc: "Supportive, clarifying questions" },
  { id: "analytical", name: "Analytical", desc: "Data, metrics, unit economics" },
  { id: "technical", name: "Technical", desc: "Product, tech stack, scalability" },
  { id: "skeptic", name: "Skeptic", desc: "Market size, moat, traction concerns" },
];

const modes = [
  {
    id: "ai-panel",
    title: "AI Investor Panel",
    description:
      "Face a full panel of diverse AI investors with real-time reactions and tough questions",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-[#3B82F6] to-[#06B6D4]",
    link: "/pitch",
  },
  {
    id: "coach",
    title: "Coach Mode",
    description:
      "Get gentle, constructive feedback with tips and suggestions for improvement",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-[#7C3AED] to-[#C026D3]",
    link: "/pitch",
  },
  {
    id: "practice",
    title: "Practice Mode",
    description:
      "Free-form practice with no pressure. Perfect your delivery at your own pace",
    icon: <Dumbbell className="w-8 h-8" />,
    gradient: "from-[#F59E0B] to-[#EF4444]",
    link: "/pitch",
  },
];

export default function ModeSelection() {
    useTitle("Select Mode");
  const location = useLocation();
  const [investorArchetype, setInvestorArchetype] = useState<string>("friendly");

  const { industry, startupType, experience } = location.state || {};
  const { user } = useUser();
  async function handlePitchSelection(modeId: string) {
    localStorage.setItem("selectedMode", modeId);
    const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
    let room = await fetch(`${BaseUrl}/api/room/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        user_id: user?.id,
        industry,
        startup_type: startupType,
        experience_level: experience,
        modeId,
        investor_archetype: investorArchetype,
      }),
    }).then((res) => res.json());
    console.log("Created room:", room);
    localStorage.setItem("roomId", room.room_id);

    // Redirect to pitch page
    window.location.href = "/room/" + room.room_id;
  }
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

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

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* <Link to={mode.link}> */}
              <div
                onClick={() => handlePitchSelection(mode.id)}
                className="group h-full p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-shadow`}
                >
                  {mode.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl mb-3">{mode.title}</h3>
                <p className="text-gray-400 mb-8 min-h-[4rem]">
                  {mode.description}
                </p>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <button
                    className={`px-6 py-3 rounded-xl bg-gradient-to-r ${mode.gradient} hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2`}
                  >
                    Start
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              {/* </Link> */}
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <StatCard label="Total Sessions" value="0" />
          <StatCard label="Avg. Score" value="—" />
          <StatCard label="Practice Time" value="0 min" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className="text-3xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
        {value}
      </div>
    </div>
  );
}
