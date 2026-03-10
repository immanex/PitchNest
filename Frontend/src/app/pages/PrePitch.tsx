import { useState, useRef } from "react";
import {
  Users,
  Brain,
  User,
  Upload,
  Video,
  Mic,
  Play,
  ChevronRight,
  FileText,
  Zap,
  Target,
  Shield,
  TrendingUp,
  X,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useTitle from "../hooks/useTitle";
import { useUser } from "../context/UserContext";

const INVESTOR_PERSONALITIES = [
  {
    id: "aggressive",
    name: "Aggressive VC",
    desc: "Tough, challenges burn rate & competition",
    icon: "⚡",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/40",
    accent: "text-red-400",
  },
  {
    id: "friendly",
    name: "Friendly Angel",
    desc: "Supportive, clarifying questions",
    icon: "🤝",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/40",
    accent: "text-emerald-400",
  },
  {
    id: "analytical",
    name: "Analytical",
    desc: "Data, metrics, unit economics",
    icon: "📊",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/40",
    accent: "text-blue-400",
  },
  {
    id: "technical",
    name: "Technical",
    desc: "Product, tech stack, scalability",
    icon: "⚙️",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/40",
    accent: "text-violet-400",
  },
  {
    id: "skeptic",
    name: "Skeptic",
    desc: "Market size, moat, traction",
    icon: "🔍",
    color: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/40",
    accent: "text-amber-400",
  },
];

const MODES = [
  {
    id: "investor",
    icon: Users,
    title: "AI Investor Panel",
    desc: "Multi-persona panel simulation",
    tag: "Most Realistic",
    gradient: "from-blue-600 to-indigo-600",
    glow: "shadow-blue-500/25",
  },
  {
    id: "coach",
    icon: Brain,
    title: "Coach Mode",
    desc: "Actionable feedback in real-time",
    tag: "Most Helpful",
    gradient: "from-violet-600 to-purple-600",
    glow: "shadow-violet-500/25",
  },
  {
    id: "solo",
    icon: User,
    title: "Solo Practice",
    desc: "No AI interruption, free flow",
    tag: "Low Pressure",
    gradient: "from-emerald-600 to-teal-600",
    glow: "shadow-emerald-500/25",
  },
];

const INDUSTRIES = [
  "SaaS & Enterprise",
  "AI / ML",
  "Fintech",
  "Healthtech",
  "Consumer",
  "Deep Tech",
  "Climate",
  "Web3",
];

const ARCHETYPES = [
  "Seed Stage - Venture Capital",
  "Angel Investor",
  "Corporate VC",
  "Growth Equity",
  "Family Office",
];

const EXPERIENCE_LEVELS = [
  "First-time Founder",
  "Serial Entrepreneur",
  "Ex-Operator",
  "Technical Founder",
];

export default function PrePitchSetup() {
  useTitle("Pre-Pitch Setup");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("investor");
  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(true);
  const [aggression, setAggression] = useState(50);
  const [risk, setRisk] = useState(70);
  const [investorArchetype, setInvestorArchetype] = useState<string>("friendly");
  const [industry, setIndustry] = useState<string>("SaaS & Enterprise");
  const [startupType, setStartupType] = useState<string>("SaaS & Enterprise");
  const [experienceLevel, setExperienceLevel] = useState<string>("First-time Founder");
  const [investorType, setInvestorType] = useState<string>("Seed Stage - Venture Capital");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── THEME ── */
  const [theme, setTheme] = useState<"dark" | "light">(
    (localStorage.getItem("theme") as "dark" | "light") || "dark"
  );
  const isDark = theme === "dark";
  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    // also keep html class in sync for pages that use Tailwind dark:
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
  const { user } = useUser();

  const aggressionLabel =
    aggression < 30 ? "Gentle" : aggression < 60 ? "Moderate" : aggression < 85 ? "Aggressive" : "Brutal";
  const riskLabel =
    risk < 30 ? "Conservative" : risk < 60 ? "Balanced" : risk < 85 ? "Growth Oriented" : "High Risk";

  async function handlePitchSelection() {
    
    const formData = new FormData();
    if(!file) return alert("Plese Add Pitch deck, {right side of screen }")
    setLoading(true);
    if (file) formData.append("file", file);
    formData.append("pitch_name", title || "Untitled Pitch");
    formData.append("description", description);
    formData.append("industry", industry);
    formData.append("startup_type", startupType);
    formData.append("experience_level", experienceLevel);
    formData.append("investor_type", investorType);
    formData.append("modeId", mode);
    formData.append("investor_archetype", investorArchetype);
    formData.append("aggression_level", String(aggression));
    formData.append("risk_appetite", String(risk));
    formData.append("camera_enabled", String(camera));
    formData.append("mic_enabled", String(mic));

    localStorage.setItem("selectedMode", mode);
    console.log(formData)


    try {
      const response = await fetch(`${BaseUrl}/api/room/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const room = await response.json();
      localStorage.setItem("roomId", room.room_id);
      if (!response.ok) {
        alert("Failed to create room. Please try again.");
        return;
      }
      window.location.href = "/room/" + room.room_id + "?pitchId=" + room.pitch_id;
    } catch (e) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ─────────────────────────────────────────
     CSS custom-property tokens – swapped by theme
  ───────────────────────────────────────── */
  const tokens = isDark
    ? {
        rootBg: "#050810",
        bodyColor: "#e2e8f0",
        cardBg: "rgba(255,255,255,0.03)",
        cardBorder: "rgba(255,255,255,0.07)",
        cardBorderHover: "rgba(255,255,255,0.12)",
        inputBg: "rgba(255,255,255,0.04)",
        inputBorder: "rgba(255,255,255,0.08)",
        inputFocusBorder: "rgba(59,130,246,0.5)",
        inputFocusBg: "rgba(59,130,246,0.05)",
        inputFocusShadow: "rgba(59,130,246,0.08)",
        inputColor: "#e2e8f0",
        inputPlaceholder: "#334155",
        selectOptionBg: "#0f1729",
        labelColor: "#64748b",
        cardTitleColor: "#475569",
        cardTitleLine: "rgba(255,255,255,0.06)",
        subtitleColor: "#475569",
        modeTitleColor: "#e2e8f0",
        modeDescColor: "#475569",
        sliderLabelColor: "#94a3b8",
        sliderTrackColor: "rgba(255,255,255,0.06)",
        sliderTickColor: "#334155",
        mediaLabelColor: "#e2e8f0",
        mediaSubColor: "#475569",
        mediaItemBg: "rgba(255,255,255,0.02)",
        mediaItemBorder: "rgba(255,255,255,0.07)",
        toggleOffBg: "rgba(255,255,255,0.1)",
        uploadBorder: "rgba(255,255,255,0.1)",
        uploadTitleColor: "#e2e8f0",
        uploadSubColor: "#475569",
        formatBadgeBg: "rgba(255,255,255,0.05)",
        formatBadgeBorder: "rgba(255,255,255,0.08)",
        formatBadgeColor: "#64748b",
        summaryItemBorder: "rgba(255,255,255,0.05)",
        summaryKeyColor: "#475569",
        summaryValColor: "#94a3b8",
        startSectionBg: "rgba(255,255,255,0.02)",
        startSectionBorder: "rgba(255,255,255,0.07)",
        startTitleColor: "#e2e8f0",
        startSubColor: "#475569",
        tipTextColor: "#64748b",
        tipStrongColor: "#94a3b8",
        tipItemBorder: "rgba(255,255,255,0.05)",
        pNameColor: "#e2e8f0",
        pDescColor: "#475569",
        personalityBg: "rgba(255,255,255,0.02)",
        personalityBorder: "rgba(255,255,255,0.07)",
        personalityHoverBg: "rgba(255,255,255,0.05)",
        personalityHoverBorder: "rgba(255,255,255,0.14)",
        personalityActiveBg: "rgba(59,130,246,0.08)",
        personalityActiveBorder: "rgba(59,130,246,0.5)",
        sessionBadgeBg: "rgba(255,255,255,0.03)",
        sessionBadgeBorder: "rgba(255,255,255,0.08)",
        sessionBadgeColor: "#64748b",
        backBtnColor: "#64748b",
        backBtnHover: "#94a3b8",
        pageTitleGradient: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
        meshColors: `
          radial-gradient(ellipse 80% 50% at 20% -10%, rgba(59,130,246,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 110%, rgba(139,92,246,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 60% 50%, rgba(16,185,129,0.05) 0%, transparent 50%)
        `,
        gridLineColor: "rgba(255,255,255,0.025)",
        toggleBtnBg: "rgba(255,255,255,0.06)",
        toggleBtnBorder: "rgba(255,255,255,0.1)",
        toggleBtnColor: "#f59e0b",
      }
    : {
        rootBg: "#f0f4f8",
        bodyColor: "#1e293b",
        cardBg: "#ffffff",
        cardBorder: "rgba(0,0,0,0.07)",
        cardBorderHover: "rgba(0,0,0,0.13)",
        inputBg: "#f8fafc",
        inputBorder: "rgba(0,0,0,0.1)",
        inputFocusBorder: "rgba(59,130,246,0.6)",
        inputFocusBg: "rgba(59,130,246,0.04)",
        inputFocusShadow: "rgba(59,130,246,0.1)",
        inputColor: "#1e293b",
        inputPlaceholder: "#94a3b8",
        selectOptionBg: "#ffffff",
        labelColor: "#64748b",
        cardTitleColor: "#94a3b8",
        cardTitleLine: "rgba(0,0,0,0.07)",
        subtitleColor: "#64748b",
        modeTitleColor: "#1e293b",
        modeDescColor: "#64748b",
        sliderLabelColor: "#475569",
        sliderTrackColor: "rgba(0,0,0,0.08)",
        sliderTickColor: "#94a3b8",
        mediaLabelColor: "#1e293b",
        mediaSubColor: "#94a3b8",
        mediaItemBg: "#f8fafc",
        mediaItemBorder: "rgba(0,0,0,0.08)",
        toggleOffBg: "rgba(0,0,0,0.15)",
        uploadBorder: "rgba(0,0,0,0.12)",
        uploadTitleColor: "#1e293b",
        uploadSubColor: "#64748b",
        formatBadgeBg: "#f1f5f9",
        formatBadgeBorder: "rgba(0,0,0,0.08)",
        formatBadgeColor: "#64748b",
        summaryItemBorder: "rgba(0,0,0,0.06)",
        summaryKeyColor: "#64748b",
        summaryValColor: "#475569",
        startSectionBg: "#ffffff",
        startSectionBorder: "rgba(0,0,0,0.07)",
        startTitleColor: "#1e293b",
        startSubColor: "#64748b",
        tipTextColor: "#475569",
        tipStrongColor: "#1e293b",
        tipItemBorder: "rgba(0,0,0,0.06)",
        pNameColor: "#1e293b",
        pDescColor: "#64748b",
        personalityBg: "#f8fafc",
        personalityBorder: "rgba(0,0,0,0.08)",
        personalityHoverBg: "#f1f5f9",
        personalityHoverBorder: "rgba(0,0,0,0.14)",
        personalityActiveBg: "rgba(59,130,246,0.07)",
        personalityActiveBorder: "rgba(59,130,246,0.45)",
        sessionBadgeBg: "#ffffff",
        sessionBadgeBorder: "rgba(0,0,0,0.08)",
        sessionBadgeColor: "#64748b",
        backBtnColor: "#94a3b8",
        backBtnHover: "#475569",
        pageTitleGradient: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
        meshColors: `
          radial-gradient(ellipse 80% 50% at 20% -10%, rgba(59,130,246,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 110%, rgba(139,92,246,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 60% 50%, rgba(16,185,129,0.04) 0%, transparent 50%)
        `,
        gridLineColor: "rgba(0,0,0,0.04)",
        toggleBtnBg: "#ffffff",
        toggleBtnBorder: "rgba(0,0,0,0.1)",
        toggleBtnColor: "#6366f1",
      };

  const t = tokens;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .setup-root {
          font-family: 'DM Sans', sans-serif;
          background: ${t.rootBg};
          min-height: 100vh;
          color: ${t.bodyColor};
          transition: background 0.3s, color 0.3s;
        }

        .setup-root * { box-sizing: border-box; }

        h1, h2, h3, .heading-font { font-family: 'Syne', sans-serif; }

        .mesh-bg {
          position: fixed;
          inset: 0;
          background: ${t.meshColors};
          pointer-events: none;
          z-index: 0;
          transition: background 0.4s;
        }

        .grid-lines {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(${t.gridLineColor} 1px, transparent 1px),
            linear-gradient(90deg, ${t.gridLineColor} 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          z-index: 0;
          transition: background-image 0.3s;
        }

        .content-wrap {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 48px 32px;
        }

        @media (max-width: 768px) {
          .content-wrap { padding: 24px 16px; }
        }

        /* HEADER */
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 48px;
          gap: 16px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: ${t.backBtnColor};
          text-decoration: none;
          transition: color 0.2s;
          margin-bottom: 8px;
        }
        .back-btn:hover { color: ${t.backBtnHover}; }

        .page-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          background: ${t.pageTitleGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .page-subtitle {
          font-size: 15px;
          color: ${t.subtitleColor};
          margin-top: 8px;
          max-width: 480px;
          transition: color 0.3s;
        }

        .session-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 100px;
          border: 1px solid ${t.sessionBadgeBorder};
          background: ${t.sessionBadgeBg};
          font-size: 13px;
          color: ${t.sessionBadgeColor};
          white-space: nowrap;
          transition: all 0.3s;
        }

        .session-badge .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse-green 2s infinite;
        }

        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        /* THEME TOGGLE BUTTON */
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid ${t.toggleBtnBorder};
          background: ${t.toggleBtnBg};
          color: ${t.toggleBtnColor};
          cursor: pointer;
          transition: all 0.25s;
          flex-shrink: 0;
        }
        .theme-toggle-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        /* LAYOUT */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .main-grid { grid-template-columns: 1fr; }
        }

        .left-col { display: flex; flex-direction: column; gap: 20px; }
        .right-col { display: flex; flex-direction: column; gap: 20px; }

        /* CARDS */
        .card {
          background: ${t.cardBg};
          border: 1px solid ${t.cardBorder};
          border-radius: 20px;
          padding: 28px;
          backdrop-filter: blur(12px);
          transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
          box-shadow: ${isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)"};
        }

        .card:hover { border-color: ${t.cardBorderHover}; }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.cardTitleColor};
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.3s;
        }

        .card-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: ${t.cardTitleLine};
        }

        /* PITCH INFO */
        .pitch-inputs { display: flex; flex-direction: column; gap: 16px; }

        .input-group { display: flex; flex-direction: column; gap: 6px; }

        .input-label {
          font-size: 12px;
          font-weight: 500;
          color: ${t.labelColor};
          letter-spacing: 0.04em;
          transition: color 0.3s;
        }

        .styled-input {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid ${t.inputBorder};
          border-radius: 12px;
          background: ${t.inputBg};
          color: ${t.inputColor};
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
        }

        .styled-input::placeholder { color: ${t.inputPlaceholder}; }

        .styled-input:focus {
          border-color: ${t.inputFocusBorder};
          background: ${t.inputFocusBg};
          box-shadow: 0 0 0 3px ${t.inputFocusShadow};
        }

        textarea.styled-input {
          resize: vertical;
          min-height: 80px;
        }

        /* MODE CARDS */
        .modes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        @media (max-width: 640px) {
          .modes-grid { grid-template-columns: 1fr; }
        }

        .mode-card {
          position: relative;
          cursor: pointer;
          padding: 22px 18px;
          border-radius: 16px;
          border: 1px solid ${t.cardBorder};
          background: ${isDark ? "rgba(255,255,255,0.02)" : "#f8fafc"};
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          user-select: none;
        }

        .mode-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .mode-card.active-investor::before {
          background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1));
          opacity: 1;
        }
        .mode-card.active-coach::before {
          background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.1));
          opacity: 1;
        }
        .mode-card.active-solo::before {
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.1));
          opacity: 1;
        }

        .mode-card.active-investor {
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 8px 32px rgba(59,130,246,0.15);
        }
        .mode-card.active-coach {
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 8px 32px rgba(139,92,246,0.15);
        }
        .mode-card.active-solo {
          border-color: rgba(16,185,129,0.5);
          box-shadow: 0 8px 32px rgba(16,185,129,0.15);
        }

        .mode-card:not(.active-investor):not(.active-coach):not(.active-solo):hover {
          border-color: ${t.cardBorderHover};
          background: ${isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"};
          transform: translateY(-2px);
        }

        .mode-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 100px;
          margin-bottom: 14px;
        }

        .tag-investor { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .tag-coach { background: rgba(139,92,246,0.2); color: #a78bfa; }
        .tag-solo { background: rgba(16,185,129,0.2); color: #34d399; }

        .mode-icon-wrap {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }

        .icon-investor { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .icon-coach { background: rgba(139,92,246,0.2); color: #a78bfa; }
        .icon-solo { background: rgba(16,185,129,0.2); color: #34d399; }

        .mode-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: ${t.modeTitleColor};
          margin-bottom: 5px;
          transition: color 0.3s;
        }

        .mode-desc {
          font-size: 12px;
          color: ${t.modeDescColor};
          line-height: 1.4;
          transition: color 0.3s;
        }

        .check-icon {
          position: absolute;
          top: 14px; right: 14px;
          width: 20px; height: 20px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .mode-card[class*="active-"] .check-icon { opacity: 1; }

        /* PERSONALITY PILLS */
        .personalities-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .personality-btn {
          position: relative;
          cursor: pointer;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid ${t.personalityBorder};
          background: ${t.personalityBg};
          transition: all 0.2s;
          text-align: left;
        }

        .personality-btn:hover {
          border-color: ${t.personalityHoverBorder};
          background: ${t.personalityHoverBg};
        }

        .personality-btn.active {
          border-color: ${t.personalityActiveBorder};
          background: ${t.personalityActiveBg};
        }

        .p-emoji { font-size: 18px; margin-bottom: 4px; display: block; }
        .p-name { font-size: 13px; font-weight: 600; color: ${t.pNameColor}; transition: color 0.3s; }
        .p-desc { font-size: 11px; color: ${t.pDescColor}; margin-top: 2px; max-width: 120px; transition: color 0.3s; }

        /* CONFIG GRID */
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 640px) {
          .config-grid { grid-template-columns: 1fr; }
        }

        .styled-select {
          width: 100%;
          padding: 13px 16px;
          border: 1px solid ${t.inputBorder};
          border-radius: 12px;
          background: ${t.inputBg};
          color: ${t.inputColor};
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 12px;
          padding-right: 36px;
          transition: all 0.2s;
        }

        .styled-select:focus {
          border-color: ${t.inputFocusBorder};
          box-shadow: 0 0 0 3px ${t.inputFocusShadow};
        }

        .styled-select option { background: ${t.selectOptionBg}; color: ${t.inputColor}; }

        /* SLIDERS */
        .slider-wrap { margin-bottom: 20px; }
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .slider-label { font-size: 13px; color: ${t.sliderLabelColor}; transition: color 0.3s; }
        .slider-value {
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 100px;
          letter-spacing: 0.04em;
        }

        .slider-value.aggr { background: rgba(239,68,68,0.15); color: #f87171; }
        .slider-value.risk { background: rgba(139,92,246,0.15); color: #a78bfa; }

        .slider-track {
          position: relative;
          height: 6px;
          border-radius: 100px;
          background: ${t.sliderTrackColor};
          cursor: pointer;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 100px;
          outline: none;
          cursor: pointer;
          background: transparent;
          position: relative;
          z-index: 2;
        }

        input[type="range"].aggr-range {
          background: linear-gradient(to right, #ef4444 0%, #ef4444 var(--val, 50%), ${t.sliderTrackColor} var(--val, 50%));
        }

        input[type="range"].risk-range {
          background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 var(--val, 70%), ${t.sliderTrackColor} var(--val, 70%));
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: transform 0.15s;
          border: 2px solid ${isDark ? "transparent" : "#e2e8f0"};
        }

        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }

        /* MEDIA TOGGLES */
        .media-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .media-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-radius: 14px;
          border: 1px solid ${t.mediaItemBorder};
          background: ${t.mediaItemBg};
          transition: all 0.2s;
        }

        .media-item.active-media {
          border-color: rgba(34,197,94,0.3);
          background: rgba(34,197,94,0.05);
        }

        .media-left { display: flex; align-items: center; gap: 12px; }

        .media-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .media-icon.on { background: rgba(34,197,94,0.15); color: #22c55e; }
        .media-icon.off { background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}; color: ${t.labelColor}; }

        .media-label { font-size: 13px; font-weight: 500; color: ${t.mediaLabelColor}; transition: color 0.3s; }
        .media-sub { font-size: 11px; color: ${t.mediaSubColor}; transition: color 0.3s; }

        .toggle-btn {
          position: relative;
          width: 44px; height: 24px;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: background 0.25s;
          flex-shrink: 0;
          padding: 0;
        }

        .toggle-btn.on { background: #22c55e; }
        .toggle-btn.off { background: ${t.toggleOffBg}; }

        .toggle-knob {
          position: absolute;
          top: 3px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }

        .toggle-btn.on .toggle-knob { left: 23px; }
        .toggle-btn.off .toggle-knob { left: 3px; }

        /* RIGHT PANEL */
        .upload-zone {
          border: 2px dashed ${t.uploadBorder};
          border-radius: 16px;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .upload-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(59,130,246,0.06), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .upload-zone:hover {
          border-color: rgba(59,130,246,0.4);
        }

        .upload-zone:hover::before { opacity: 1; }

        .upload-icon-wrap {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: rgba(59,130,246,0.1);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          color: #3b82f6;
        }

        .upload-title { font-size: 14px; font-weight: 600; color: ${t.uploadTitleColor}; margin-bottom: 4px; transition: color 0.3s; }
        .upload-sub { font-size: 12px; color: ${t.uploadSubColor}; transition: color 0.3s; }
        .upload-formats {
          margin-top: 12px;
          display: flex;
          gap: 6px;
          justify-content: center;
        }

        .format-badge {
          padding: 3px 8px;
          border-radius: 6px;
          background: ${t.formatBadgeBg};
          border: 1px solid ${t.formatBadgeBorder};
          font-size: 10px;
          color: ${t.formatBadgeColor};
          font-weight: 500;
          transition: all 0.3s;
        }

        .file-attached {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.25);
          margin-top: 12px;
        }

        .file-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(59,130,246,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa;
          flex-shrink: 0;
        }

        .file-name { font-size: 13px; font-weight: 500; color: ${t.inputColor}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .file-size { font-size: 11px; color: ${t.labelColor}; }

        .remove-file {
          margin-left: auto;
          background: none;
          border: none;
          color: ${t.labelColor};
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .remove-file:hover { color: #ef4444; }

        /* SUMMARY CARD */
        .summary-card {
          background: ${t.cardBg};
          border: 1px solid ${t.cardBorder};
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid ${t.summaryItemBorder};
        }

        .summary-item:last-child { border-bottom: none; }

        .summary-key { font-size: 12px; color: ${t.summaryKeyColor}; transition: color 0.3s; }
        .summary-val { font-size: 12px; font-weight: 500; color: ${t.summaryValColor}; text-align: right; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.3s; }

        /* START BUTTON */
        .start-section {
          margin-top: 8px;
          padding: 24px;
          background: ${t.startSectionBg};
          border: 1px solid ${t.startSectionBorder};
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: all 0.3s;
          box-shadow: ${isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)"};
        }

        .start-info .s-title { font-size: 15px; font-weight: 600; color: ${t.startTitleColor}; margin-bottom: 4px; transition: color 0.3s; }
        .start-info .s-sub { font-size: 13px; color: ${t.startSubColor}; transition: color 0.3s; }

        .start-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(59,130,246,0.25);
        }

        .start-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          opacity: 0;
          transition: opacity 0.25s;
        }

        .start-btn:hover::before { opacity: 1; }
        .start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,0.35); }
        .start-btn:active { transform: translateY(0); }

        .start-btn span, .start-btn svg { position: relative; z-index: 1; }

        .start-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: relative;
          z-index: 1;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* TIPS CARD */
        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid ${t.tipItemBorder};
        }
        .tip-item:last-child { border-bottom: none; }
        .tip-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tip-text { font-size: 12px; color: ${t.tipTextColor}; line-height: 1.5; transition: color 0.3s; }
        .tip-text strong { color: ${t.tipStrongColor}; display: block; margin-bottom: 2px; transition: color 0.3s; }
      `}</style>

      <div className="setup-root">
        <div className="mesh-bg" />
        <div className="grid-lines" />

        <div className="content-wrap">
          {/* PAGE HEADER */}
          <div className="page-header">
            <div>
              <Link to="/dashboard" className="back-btn">
                <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
                Back to Dashboard
              </Link>
              <h1 className="page-title">Pre-Pitch Setup</h1>
              <p className="page-subtitle">
                Tailor your AI-powered session to match your upcoming real-world presentation.
              </p>
            </div>
            <div className="header-right">
              {/* ── THEME TOGGLE ── */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark
                  ? <Sun size={17} />
                  : <Moon size={17} />
                }
              </button>

              <div className="session-badge">
                <span className="dot" />
                15–20 min session
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="main-grid">
            {/* LEFT COL */}
            <div className="left-col">

              {/* PITCH INFO */}
              <div className="card">
                <div className="card-title">Pitch Information</div>
                <div className="pitch-inputs">
                  <div className="config-grid">
                    <div className="input-group">
                      <label className="input-label">Pitch Title *</label>
                      <input
                        className="styled-input"
                        type="text"
                        placeholder="e.g. Series A — Q2 2025"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Experience Level</label>
                      <select
                        className="styled-select"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                      >
                        {EXPERIENCE_LEVELS.map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Short Description</label>
                    <textarea
                      className="styled-input"
                      placeholder="Briefly describe your startup and what you're pitching…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* MODE SELECTION */}
              <div className="card">
                <div className="card-title">Session Mode</div>
                <div className="modes-grid">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    const isActive = mode === m.id;
                    const tagClass = `tag-${m.id}`;
                    const iconClass = `icon-${m.id}`;
                    const activeClass = isActive ? `active-${m.id}` : "";
                    return (
                      <div
                        key={m.id}
                        className={`mode-card ${activeClass}`}
                        onClick={() => setMode(m.id)}
                      >
                        {isActive && (
                          <CheckCircle2
                            size={18}
                            className="check-icon"
                            style={{ color: "#60a5fa", position: "absolute", top: 14, right: 14, opacity: 1 }}
                          />
                        )}
                        <span className={`mode-tag ${tagClass}`}>{m.tag}</span>
                        <div className={`mode-icon-wrap ${iconClass}`}>
                          <Icon size={18} />
                        </div>
                        <div className="mode-title">{m.title}</div>
                        <div className="mode-desc">{m.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INVESTOR PERSONALITY */}
              <div className="card">
                <div className="card-title">Investor Personality</div>
                <div className="personalities-wrap">
                  {INVESTOR_PERSONALITIES.map((p) => (
                    <button
                      key={p.id}
                      className={`personality-btn ${investorArchetype === p.id ? "active" : ""}`}
                      onClick={() => setInvestorArchetype(p.id)}
                    >
                      <span className="p-emoji">{p.icon}</span>
                      <div className="p-name">{p.name}</div>
                      <div className="p-desc">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SIMULATION CONFIG */}
              <div className="card">
                <div className="card-title">Simulation Configuration</div>

                <div className="config-grid">
                  <div className="input-group">
                    <label className="input-label">Industry</label>
                    <select
                      className="styled-select"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Startup Type</label>
                    <select
                      className="styled-select"
                      value={startupType}
                      onChange={(e) => setStartupType(e.target.value)}
                    >
                      {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Investor Type</label>
                    <select
                      className="styled-select"
                      value={investorType}
                      onChange={(e) => setInvestorType(e.target.value)}
                    >
                      {ARCHETYPES.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Sliders */}
                <div className="slider-wrap">
                  <div className="slider-header">
                    <span className="slider-label">Custom Aggressiveness</span>
                    <span className="slider-value aggr">{aggressionLabel}</span>
                  </div>
                  <input
                    type="range"
                    className="aggr-range"
                    min={0} max={100}
                    value={aggression}
                    style={{ "--val": `${aggression}%` } as React.CSSProperties}
                    onChange={(e) => setAggression(Number(e.target.value))}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: t.sliderTickColor }}>Gentle</span>
                    <span style={{ fontSize: 10, color: t.sliderTickColor }}>Brutal</span>
                  </div>
                </div>

                <div className="slider-wrap" style={{ marginBottom: 0 }}>
                  <div className="slider-header">
                    <span className="slider-label">Risk Appetite</span>
                    <span className="slider-value risk">{riskLabel}</span>
                  </div>
                  <input
                    type="range"
                    className="risk-range"
                    min={0} max={100}
                    value={risk}
                    style={{ "--val": `${risk}%` } as React.CSSProperties}
                    onChange={(e) => setRisk(Number(e.target.value))}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: t.sliderTickColor }}>Conservative</span>
                    <span style={{ fontSize: 10, color: t.sliderTickColor }}>High Risk</span>
                  </div>
                </div>
              </div>

              {/* CAMERA + MIC */}
              <div className="card">
                <div className="card-title">Media Devices</div>
                <div className="media-row">
                  <div className={`media-item ${camera ? "active-media" : ""}`}>
                    <div className="media-left">
                      <div className={`media-icon ${camera ? "on" : "off"}`}>
                        <Video size={16} />
                      </div>
                      <div>
                        <div className="media-label">Camera</div>
                        <div className="media-sub">FaceTime HD</div>
                      </div>
                    </div>
                    <button
                      className={`toggle-btn ${camera ? "on" : "off"}`}
                      onClick={() => setCamera(!camera)}
                    >
                      <div className="toggle-knob" />
                    </button>
                  </div>

                  <div className={`media-item ${mic ? "active-media" : ""}`}>
                    <div className="media-left">
                      <div className={`media-icon ${mic ? "on" : "off"}`}>
                        <Mic size={16} />
                      </div>
                      <div>
                        <div className="media-label">Microphone</div>
                        <div className="media-sub">Built-in Mic</div>
                      </div>
                    </div>
                    <button
                      className={`toggle-btn ${mic ? "on" : "off"}`}
                      onClick={() => setMic(!mic)}
                    >
                      <div className="toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>

              {/* START SESSION */}
              <div className="start-section">
                <div className="start-info">
                  <div className="s-title">Ready to pitch?</div>
                  <div className="s-sub">Estimated 15–20 mins · Includes feedback breakdown</div>
                </div>
                <button
                  className={`start-btn ${loading ? "loading" : ""}`}
                  onClick={handlePitchSelection}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      <span>Launching…</span>
                    </>
                  ) : (
                    <>
                      <span>Start Session</span>
                      <Play size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT COL */}
            <div className="right-col">

              {/* UPLOAD */}
              <div className="card">
                <div className="card-title">Pitch Deck</div>
                <label className="upload-zone" style={{ display: "block" }}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    style={{ display: "none" }}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="upload-icon-wrap">
                    <Upload size={24} />
                  </div>
                  <div className="upload-title">Upload your deck</div>
                  <div className="upload-sub">Drag & drop or click to browse</div>
                  <div className="upload-formats">
                    <span className="format-badge">PDF</span>
                    <span className="format-badge">PPT</span>
                    <span className="format-badge">PPTX</span>
                    <span className="format-badge">Max 25MB</span>
                  </div>
                </label>

                {file && (
                  <div className="file-attached">
                    <div className="file-icon">
                      <FileText size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button
                      className="remove-file"
                      onClick={(e) => { e.preventDefault(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* SUMMARY */}
              <div className="card">
                <div className="card-title">Session Summary</div>
                <div>
                  {[
                    { key: "Mode", val: MODES.find(m => m.id === mode)?.title ?? mode },
                    { key: "Investor", val: INVESTOR_PERSONALITIES.find(p => p.id === investorArchetype)?.name ?? investorArchetype },
                    { key: "Industry", val: industry },
                    { key: "Startup Type", val: startupType },
                    { key: "Experience", val: experienceLevel },
                    { key: "Investor Type", val: investorType },
                    { key: "Aggressiveness", val: `${aggressionLabel} (${aggression}%)` },
                    { key: "Risk", val: `${riskLabel} (${risk}%)` },
                    { key: "Camera", val: camera ? "Enabled" : "Disabled" },
                    { key: "Mic", val: mic ? "Enabled" : "Disabled" },
                  ].map((item) => (
                    <div key={item.key} className="summary-item">
                      <span className="summary-key">{item.key}</span>
                      <span className="summary-val">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIPS */}
              <div className="card">
                <div className="card-title">Quick Tips</div>
                <div>
                  {[
                    { icon: <Zap size={14} />, bg: "rgba(245,158,11,0.15)", color: "#f59e0b", title: "Be concise", text: "Investors decide in the first 2 minutes" },
                    { icon: <Target size={14} />, bg: "rgba(59,130,246,0.15)", color: "#60a5fa", title: "Lead with problem", text: "Define the pain before the solution" },
                    { icon: <TrendingUp size={14} />, bg: "rgba(16,185,129,0.15)", color: "#34d399", title: "Show traction", text: "Numbers speak louder than claims" },
                    { icon: <Shield size={14} />, bg: "rgba(139,92,246,0.15)", color: "#a78bfa", title: "Know your moat", text: "Clearly articulate your defensibility" },
                  ].map((tip) => (
                    <div key={tip.title} className="tip-item">
                      <div className="tip-icon" style={{ background: tip.bg, color: tip.color }}>
                        {tip.icon}
                      </div>
                      <div className="tip-text">
                        <strong>{tip.title}</strong>
                        {tip.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}