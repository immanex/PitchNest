import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, Bell, Layout } from "lucide-react";

import { useUser } from "../context/UserContext";
import { usePeer } from "../context/peer";
import useTitle from "../hooks/useTitle";
import { usePitch } from "../context/PitchContext";
import PitchSlides from "../components/SlideViewer";

/* ---------- AI PANEL DATA ---------- */
const INVESTOR_PERSONAS = [
  {
    id: "1",
    name: "Dr. Aris",
    role: "TECH SPECIALIST",
    sentiment: "POSITIVE",
    color: "bg-emerald-500",
    width: "90%",
  },
  {
    id: "2",
    name: "Sarah AI",
    role: "MARKET ANALYSIS",
    sentiment: "NEUTRAL",
    color: "bg-orange-400",
    width: "60%",
  },
  {
    id: "3",
    name: "Marcus AI",
    role: "FINANCIALS",
    sentiment: "VERY POSITIVE",
    color: "bg-blue-400",
    width: "95%",
  },
];

export default function LivePitchRoom() {
  useTitle("Live Pitch Room");
  const [searchParams] = useSearchParams();
  const pitchId = searchParams.get("pitchId");
  const { roomId } = useParams();
  const [endLoading, setEndLoding] = useState(false);

  const { pitch, fetchPitch } = usePitch();
  const { token, user } = useUser();
  const peerContext = usePeer();

  // Peer Connection logic
  const peer = peerContext?.peer;
  const createOffer = peerContext?.createOffer;
  const createAnswer = peerContext?.createAnswer;
  const setRemoteAnswer = peerContext?.setRemoteAnswer;

  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const socketRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null); // Separate ref for preview
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // Ref for main stream

  const [users, setUsers] = useState<string[]>([]);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scores, setScores] = useState({
    clarity: 94,
    confidence: 88,
    marketFit: 76,
  });
  const [transcript, setTranscript] = useState<any[]>([]);
  const [slideView, setSlideView] = useState(true);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (pitchId) fetchPitch(pitchId);
  }, [pitchId]);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  /* ---------- WEBRTC HANDLERS ---------- */
  const handleCameraToggle = async () => {
    if (isVideoOn) {
      myStream?.getTracks().forEach((track) => track.stop());
      setMyStream(null);
      setIsVideoOn(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: isMicOn,
      });
      setMyStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setIsVideoOn(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const handleMicToggle = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn));
    }
    setIsMicOn(!isMicOn);
  };

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!roomId || !token) return;

    const wsUrl = BaseUrl.startsWith("https")
      ? BaseUrl.replace("https", "wss")
      : BaseUrl.replace("http", "ws");

    const socket = new WebSocket(
      `${wsUrl}/api/room/ws/${roomId}?token=${token}`,
    );
    socketRef.current = socket;

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "room-users") setUsers(data.users);
      if (data.action === "send-message")
        setTranscript((prev) => [
          ...prev,
          { speaker: data.speaker, text: data.text },
        ]);
      // ... rest of your action logic
    };

    return () => socket.close();
  }, [roomId, token]);
  async function handleEndSession() {
    setEndLoding(true);
    let res = await fetch(`${BaseUrl}/api/room/end/${roomId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    res = await res.json();
    console.log(res);
    if (res) {
      console.log("Successfully Ended");
      window.location.href = "/dashboard";
      setEndLoding(false);
    } else {
      console.log("Error in room ending");
      setEndLoding(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-900">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Layout size={18} />
            </div>
            <span className="font-bold text-xl">PitchNest</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-red-600 uppercase">
                Live
              </span>
            </div>
            <div className="text-lg font-medium tabular-nums">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setSlideView(!slideView)}
            className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold"
          >
            {slideView ? "View Video" : "View Slides"}
          </button>
          <Bell size={20} className="text-slate-400" />
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6">
        <div className="col-span-9 flex flex-col gap-6">
          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl bg-[#0a2624]">
            {slideView ? (
              <div className="relative h-full w-full flex flex-col items-center justify-center">
                <div className="w-full h-full flex items-center justify-center overflow-hidden p-4">
                  {pitch?.pitch_pdf_url && (
                    <PitchSlides
                      pdfUrl={`${BaseUrl}/uploads/${pitch.pitch_pdf_url.replace("uploads/", "")}`}
                    />
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent text-white">
                  <h1 className="text-3xl font-bold">
                    {pitch?.pitch_name || "Pitch Presentation"}
                  </h1>
                  <div className="flex gap-3 mt-4">
                    <MetricCard
                      label="CONFIDENCE"
                      value={scores.confidence}
                      color="text-blue-400"
                    />
                    <MetricCard
                      label="CLARITY"
                      value={scores.clarity}
                      color="text-emerald-400"
                    />
                    <MetricCard
                      label="MARKET"
                      value={scores.marketFit}
                      color="text-purple-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-full h-full object-cover bg-slate-800"
              />
            )}
          </div>

          {/* TRANSCRIPT */}
          <div className="h-44 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Live Transcript
            </span>
            <div className="mt-4 space-y-2">
              {transcript.map((msg, i) => (
                <p key={i} className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800 uppercase text-[10px] mr-2">
                    {msg.speaker}:
                  </span>
                  "{msg.text}"
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <VideoOff className="text-slate-600" />
              </div>
            )}

            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={handleCameraToggle}
                className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md"
              >
                {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
              <button
                onClick={handleMicToggle}
                className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md"
              >
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            </div>
          </div>

          {/* AI PANELISTS */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-6 border-b pb-2">
              AI Investor Panel
            </h3>
            <div className="space-y-6">
              {INVESTOR_PERSONAS.map((p) => (
                <div key={p.id} className="group">
                  <div className="flex justify-between text-[11px] mb-2">
                    <span className="font-bold text-slate-700">
                      {p.name}{" "}
                      <span className="text-slate-400 font-normal">
                        ({p.role})
                      </span>
                    </span>
                    <span className="text-emerald-500 font-bold">
                      {p.sentiment}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} transition-all duration-1000`}
                      style={{ width: p.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleEndSession}
              disabled={endLoading}
              className="w-full mt-8 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {endLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                  Ending Session...
                </>
              ) : (
                "End Session"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 w-28">
      <p className="text-[8px] font-bold text-white/60 uppercase">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-black ${color}`}>{value}</span>
        <span className="text-[10px] text-white/40">%</span>
      </div>
    </div>
  );
}
