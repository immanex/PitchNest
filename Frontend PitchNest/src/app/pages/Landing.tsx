import { BarChart3, Brain, ChevronRight, Sparkles, Users, Video, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-[#3B82F6] opacity-20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-[#7C3AED] opacity-20 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.25, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xl font-semibold">PitchNest-Live</span>
        </div>

        {/* 🔥 UPDATED LOGIN / REGISTER LINKS */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-6 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 mb-6">
            <Brain className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-sm text-gray-300">
              AI-Powered Pitch Simulation
            </span>
          </div>

          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Perfect Your Pitch with{" "}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
              AI Investors
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Practice pitching to AI-powered investor personas. Get real-time
            feedback, improve your delivery, and close deals with confidence.
          </p>

          <Link to="/profile-setup">
            <motion.button
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
              <span className="text-lg">Start Pitching</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <FeatureCard
            icon={<Video className="w-6 h-6" />}
            title="Real-Time Simulation"
            description="Practice with AI investors who respond like real VCs and angels"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Instant Analytics"
            description="Get detailed feedback on clarity, confidence, and market fit"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Multiple Personas"
            description="Face diverse investor types from aggressive VCs to friendly angels"
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#3B82F6]/30 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#7C3AED]/20 flex items-center justify-center text-[#3B82F6] mb-4">
        {icon}
      </div>
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}