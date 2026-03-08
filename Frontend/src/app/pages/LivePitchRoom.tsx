import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Bell,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Layout
} from "lucide-react";

import { useUser } from "../context/UserContext";
import { usePeer } from "../context/peer";

/* ---------- AI PANEL DATA ---------- */

const INVESTOR_PERSONAS = [
  { id: "1", name: "Dr. Aris", status: "Listening", role: "TECH SPECIALIST", sentiment: "POSITIVE", color: "bg-emerald-500", width: "90%" },
  { id: "2", name: "Sarah AI", status: "Thinking...", role: "MARKET ANALYSIS", sentiment: "NEUTRAL", color: "bg-orange-400", width: "60%" },
  { id: "3", name: "Marcus AI", status: "Listening", role: "FINANCIALS", sentiment: "VERY POSITIVE", color: "bg-blue-400", width: "95%" },
];

export default function LivePitchRoom() {
  const { roomId } = useParams();

  const { token, user } = useUser();
  const peerContext = usePeer();

  const peer = peerContext?.peer;
  const createOffer = peerContext?.createOffer;
  const createAnswer = peerContext?.createAnswer;
  const setRemoteAnswer = peerContext?.setRemoteAnswer;

  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const socketRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const [slideView, setSlideView] = useState(true); // switch slide <-> video

  /* ---------- TIMER ---------- */

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((p) => p + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  /* ---------- CAMERA ---------- */

  const handleCameraToggle = async () => {
    if (isVideoOn) {
      myStream?.getTracks().forEach((track) => track.stop());
      setMyStream(null);
      setIsVideoOn(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: isMicOn,
    });

    setMyStream(stream);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      peer?.addTrack(track, stream);
    });

    setIsVideoOn(true);

    if (
      createOffer &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      const offer = await createOffer();

      const targetEmail = users.find((u) => u !== user?.email);

      socketRef.current.send(
        JSON.stringify({
          action: "call-user",
          user: targetEmail,
          offer: offer,
        })
      );
    }
  };

  /* ---------- MIC ---------- */

  const handleMicToggle = () => {
    if (!myStream) {
      setIsMicOn(!isMicOn);
      return;
    }

    myStream.getAudioTracks().forEach((track) => {
      track.enabled = !isMicOn;
    });

    setIsMicOn(!isMicOn);
  };

  /* ---------- SOCKET ---------- */

  useEffect(() => {
    if (!roomId || !token) return;

    const socket = new WebSocket(
      `${BaseUrl.replace("https", "wss")}/api/room/ws/${roomId}?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to room", roomId);
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "room-users") setUsers(data.users);

      if (data.action === "user-joined") {
        setUsers((prev) =>
          prev.includes(data.email) ? prev : [...prev, data.email]
        );
      }

      if (data.action === "user-left") {
        setUsers((prev) => prev.filter((u) => u !== data.email));
      }

      if (data.action === "send-message") {
        setTranscript((prev) => [
          ...prev,
          { speaker: data.speaker, text: data.text },
        ]);
      }

      if (data.action === "incoming-call") {
        if (createAnswer) {
          const answer = await createAnswer(data.offer);

          socketRef.current?.send(
            JSON.stringify({
              action: "call-accepted",
              to: data.from,
              answer,
            })
          );
        }
      }

      if (data.action === "call-accepted") {
        if (setRemoteAnswer) await setRemoteAnswer(data.answer);
      }

      if (data.type === "SCORE_UPDATE") {
        setScores(data.scores);
      }
    };

    return () => socket.close();
  }, [roomId, token]);

  /* ---------- FETCH CHATS ---------- */

  useEffect(() => {
    async function fetchChats() {
      const res = await fetch(`${BaseUrl}/api/room/chats/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const formatted = data.map((chat: any) => ({
        speaker: chat.speaker,
        text: chat.content,
      }));

      setTranscript(formatted);
    }

    if (roomId && token) fetchChats();
  }, [roomId, token]);

  /* ---------- END SESSION ---------- */

  async function handleSessionEnd() {
    const res = await fetch(`${BaseUrl}/api/room/end/${roomId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = `/analytics?pitch_id=${data.pitch_id}`;
    }
  }

  /* ---------- UI ---------- */

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-900">

      {/* HEADER */}

      <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200">

        <div className="flex items-center gap-8">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <Layout size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">
              PitchNest
            </span>
          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-red-600 uppercase">
                Live Pitch
              </span>
            </div>

            <div className="text-lg font-medium text-slate-700 tabular-nums">
              {formatTime(elapsedTime)}
              <span className="text-xs text-slate-400 ml-1">
                SESSION TIME
              </span>
            </div>

          </div>
        </div>

        <Bell size={20} />

      </header>

      {/* MAIN */}

      <main className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6">

        {/* LEFT */}

        <div className="col-span-9 flex flex-col gap-6">

          {/* SWITCH VIEW AREA */}

          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl bg-[#1A4D4A]">

            {slideView ? (

              /* SLIDE */

              <div className="h-full flex flex-col justify-end p-12 text-white">

                <h1 className="text-5xl font-bold">
                  Market Opportunity
                </h1>

                <p className="mt-4 text-lg opacity-80 max-w-xl">
                  Targeting a $24B annual recurring market in sustainable
                  home infrastructure with 18% CAGR.
                </p>

                <div className="flex gap-4 mt-6">
                  <MetricCard label="CONFIDENCE" value={scores.confidence} color="text-blue-500" />
                  <MetricCard label="CLARITY" value={scores.clarity} color="text-emerald-500" />
                  <MetricCard label="MARKET SCORE" value={scores.marketFit} color="text-purple-500" />
                </div>

              </div>

            ) : (

              /* VIDEO FULL */

              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

            )}

            {/* SWITCH BUTTON */}

            <button
              onClick={() => setSlideView(!slideView)}
              className="absolute bottom-6 right-6 flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-400/10 px-3 py-2 rounded-lg"
            >
              <Monitor size={14} />
              SWITCH VIEW
            </button>

          </div>

          {/* TRANSCRIPT */}

          <div className="h-44 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-auto">

            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Real-time Transcription
            </span>

            <div className="mt-4 space-y-3">

              {transcript.map((msg, i) => (
                <p key={i} className="text-sm text-slate-600 italic">
                  {msg.speaker === "Alex" && (
                    <span className="font-bold text-slate-800 mr-2">
                      Alex:
                    </span>
                  )}
                  "{msg.text}"
                </p>
              ))}

            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="col-span-3 flex flex-col gap-6">

          {/* VIDEO SMALL */}

          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">

            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <VideoOff />
              </div>
            )}

            <div className="absolute bottom-4 left-4 flex gap-2">

              <button
                onClick={handleCameraToggle}
                className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>

              <button
                onClick={handleMicToggle}
                className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>

            </div>

            <button
              onClick={handleSessionEnd}
              className="absolute bottom-4 right-4 bg-red-500 text-white text-xs px-4 py-2 rounded"
            >
              End Session
            </button>

          </div>

          {/* AI PANEL */}

          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <h3 className="font-bold text-sm mb-4">
              AI Panelists
            </h3>

            <div className="space-y-6">

              {INVESTOR_PERSONAS.map((p) => (

                <div key={p.id}>

                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-emerald-500">{p.sentiment}</span>
                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full">

                    <div
                      className={`h-full ${p.color} rounded-full`}
                      style={{ width: p.width }}
                    />

                  </div>

                </div>

              ))}

            </div>

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
    <div className="bg-white rounded-xl p-4 w-28 shadow-xl">

      <p className="text-[9px] font-bold text-slate-400 uppercase">
        {label}
      </p>

      <div className="flex items-baseline gap-1">

        <span className={`text-2xl font-black ${color}`}>
          {value}
        </span>

        <span className="text-xs text-slate-300">%</span>

      </div>

    </div>
  );
}