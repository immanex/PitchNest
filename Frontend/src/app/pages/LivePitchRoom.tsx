import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Pause,
  Play,
  MessageSquare,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const investors = [
  {
    id: "aggressive",
    name: "The Aggressive VC",
    avatar: "💼",
    status: "active",
    color: "#EF4444",
  },
  {
    id: "friendly",
    name: "The Friendly Angel",
    avatar: "😊",
    status: "active",
    color: "#10B981",
  },
  {
    id: "skeptic",
    name: "The Skeptic",
    avatar: "🤔",
    status: "active",
    color: "#F59E0B",
  },
];

const mockTranscript = [
  { speaker: "You", text: "Hello everyone, today I'd like to present..." },
  { speaker: "The Skeptic", text: "What's your customer acquisition cost?" },
];

export default function LivePitchRoom() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [chatMessage, setChatMessage] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState(mockTranscript);
  const { token, user } = useUser();

  const { roomId: roomId } = useParams();
  const socketRef = useRef<WebSocket | null>(null);

  // Simulated live scores
  const [scores, setScores] = useState({
    clarity: 72,
    confidence: 68,
    marketFit: 85,
  });

  // Timer
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  // Simulate score changes
  useEffect(() => {
    const interval = setInterval(() => {
      setScores((prev) => ({
        clarity: Math.min(100, prev.clarity + Math.floor(Math.random() * 3)),
        confidence: Math.min(
          100,
          prev.confidence + Math.floor(Math.random() * 2),
        ),
        marketFit: Math.min(
          100,
          prev.marketFit + Math.floor(Math.random() * 2),
        ),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  // 1. Update the useEffect to handle incoming data
  useEffect(() => {
    if (!roomId || !token) return;

    const socket = new WebSocket(
      `ws://localhost:8000/api/room/ws/${roomId}?token=${token}`,
    );

    socket.onopen = () => console.log("Connected to room:", roomId);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        // Listen for the "send-message" action broadcasted by the server
        if (data.action === "send-message") {
          setTranscript((prev) => [
            ...prev,
            { speaker: data.speaker, text: data.text },
          ]);
        }

        // Pro Tip: You can also update scores in real-time here
        if (data.type === "SCORE_UPDATE") {
          setScores(data.scores);
        }
      } catch (err) {
        console.error("Failed to parse socket message:", err);
      }
    };

    socket.onclose = () => console.log("Disconnected");
    socketRef.current = socket;

    return () => socket.close();
  }, [roomId, token]);

  useEffect(() => {
    async function fetchChats() {
      const res = await fetch(
        `http://localhost:8000/api/room/chats/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const chatData = await res.json();

      const formattedChats = chatData.map((chat: any) => ({
        speaker: chat.speaker || "Unknown",
        text: chat.content,
      }));

      setTranscript(formattedChats);
    }

    if (roomId && token) {
      fetchChats();
    }
  }, [roomId, token]);
  // 2. Clean up handleChat
  function handleChat() {
    if (chatMessage.trim() && socketRef.current) {
      const payload = JSON.stringify({
        action: "send-message",
        roomId: roomId,
        user_id: user?.id,
        text: chatMessage,
        speaker: user?.full_name || "You",
      });

      socketRef.current.send(payload);
      setChatMessage("");
    }
  }

  return (
    <div className="h-screen bg-[#0D1117] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between backdrop-blur-sm bg-[#0D1117]/80">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg">AI Investor Panel</h2>
            <div className="text-sm text-gray-400">
              Session Time: {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Controls */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-xl transition-all ${
              isVideoOn
                ? "bg-white/10 hover:bg-white/20"
                : "bg-red-500/20 border border-red-500/50"
            }`}
          >
            {isVideoOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5 text-red-500" />
            )}
          </button>

          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 rounded-xl transition-all ${
              isMicOn
                ? "bg-white/10 hover:bg-white/20"
                : "bg-red-500/20 border border-red-500/50"
            }`}
          >
            {isMicOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5 text-red-500" />
            )}
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-3 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/50 hover:bg-[#3B82F6]/30 transition-all flex items-center gap-2"
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
            {isPaused ? "Resume" : "Pause"}
          </button>

          <Link
            to="/analytics"
            className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-all"
          >
            End Session
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Video & Slides */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* User Video Feed */}
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0D1117] border border-white/10 overflow-hidden relative">
            {isVideoOn ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] mx-auto mb-4 flex items-center justify-center text-4xl">
                    👤
                  </div>
                  <div className="text-gray-400">Your camera feed</div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <VideoOff className="w-16 h-16 mx-auto mb-4" />
                  Camera is off
                </div>
              </div>
            )}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-sm">
              You
            </div>
          </div>

          {/* Slide Viewer */}
          <div className="aspect-video rounded-2xl bg-white border border-white/10 overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <div className="text-6xl text-gray-400 mb-4">📊</div>
                <div className="text-2xl text-gray-700 mb-2">
                  Slide {currentSlide} of 10
                </div>
                <div className="text-gray-500">
                  Your pitch deck appears here
                </div>
              </div>
            </div>

            {/* Slide Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
                disabled={currentSlide === 1}
                className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm">
                {currentSlide} / 10
              </div>
              <button
                onClick={() => setCurrentSlide(Math.min(10, currentSlide + 1))}
                disabled={currentSlide === 10}
                className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Investors & Scores */}
        <div className="w-[400px] border-l border-white/10 flex flex-col">
          {/* AI Investor Avatars */}
          <div className="p-6 space-y-4 border-b border-white/10">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">
              Investor Panel
            </h3>
            {investors.map((investor) => (
              <motion.div
                key={investor.id}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                animate={{
                  borderColor: [
                    "rgba(255,255,255,0.1)",
                    `${investor.color}40`,
                    "rgba(255,255,255,0.1)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{investor.avatar}</div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">{investor.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-gray-400">Listening</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Scores */}
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-6">
              Live Scoring
            </h3>
            <div className="space-y-6">
              <ScoreCircle
                label="Clarity"
                score={scores.clarity}
                color="#3B82F6"
              />
              <ScoreCircle
                label="Confidence"
                score={scores.confidence}
                color="#7C3AED"
              />
              <ScoreCircle
                label="Market Fit"
                score={scores.marketFit}
                color="#10B981"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Transcription */}
      <div className="px-6 py-4 border-t border-white/10 backdrop-blur-sm bg-[#0D1117]/80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Live Transcription
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm text-gray-300">
                "...and that's why our solution is uniquely positioned to
                capture this market opportunity..."
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all relative"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-[#0D1117]" />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0D1117] border-l border-white/10 flex flex-col z-50"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg">Questions & Notes</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {transcript.map((msg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-xs text-gray-400">{msg.speaker}</div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a note..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleChat}
                  className="p-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreCircle({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl">
          {score}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm mb-1">{label}</div>
        <div className="text-xs text-gray-400">
          {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs work"}
        </div>
      </div>
    </div>
  );
}
