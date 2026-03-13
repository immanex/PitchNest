// LivePitchRoom.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Bell,
  Monitor,
  Layout,
  Send,
  MessageSquare,
  X,
  Users,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  TrendingUp,
  Zap,
  BarChart2,
  Clock,
  Radio,
  AlertCircle,
  Volume2,
  VolumeX,
  ScreenShare,
  ScreenShareOff,
  Settings,
  FileText,
  Loader2,
} from "lucide-react";

import { useUser } from "../context/UserContext";
import { usePeer } from "../context/peer";
import { usePitch } from "../context/PitchContext";
import PitchSlides from "../components/SlideViewer";
import useTitle from "../hooks/useTitle";

const INVESTOR_PERSONAS = [
  {
    id: "1",
    name: "Dr. Aris",
    role: "TECH SPECIALIST",
    sentiment: "POSITIVE",
    color: "from-emerald-400 to-teal-500",
    dotColor: "bg-emerald-400",
    width: "90%",
    avatar: "DA",
    avatarBg: "bg-emerald-900",
  },
  {
    id: "2",
    name: "Sarah AI",
    role: "MARKET ANALYSIS",
    sentiment: "NEUTRAL",
    color: "from-amber-400 to-orange-500",
    dotColor: "bg-amber-400",
    width: "60%",
    avatar: "SA",
    avatarBg: "bg-amber-900",
  },
  {
    id: "3",
    name: "Marcus AI",
    role: "FINANCIALS",
    sentiment: "VERY POSITIVE",
    color: "from-blue-400 to-indigo-500",
    dotColor: "bg-blue-400",
    width: "95%",
    avatar: "MA",
    avatarBg: "bg-blue-900",
  },
];

const SENTIMENT_COLORS: Record<string, string> = {
  "VERY POSITIVE": "text-emerald-400",
  POSITIVE: "text-teal-400",
  NEUTRAL: "text-amber-400",
  NEGATIVE: "text-red-400",
};

const TTS_LANG = "en-US";
const TTS_MAX_CHARS = 420;
const TTS_MAX_SENTENCES = 2;
const TTS_STREAM_FLUSH_MS = 650;
const TTS_STREAM_SPEAK_MIN_CHARS = 120;
const INTRO_PITCH_SECONDS = 180; // ~3 minutes before AI starts active questioning
const AI_WELCOME_LINE =
  "Welcome to the PitchNest Room. Please tell us about your business in the next 3 minutes.";

function normalizeWhitespace(text: string) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function trimToSentences(text: string, maxSentences: number) {
  const t = normalizeWhitespace(text);
  if (!t) return "";
  const parts = t.split(/(?<=[.!?])\s+/);
  const picked = parts.slice(0, Math.max(1, maxSentences)).join(" ");
  return picked || t;
}

function limitSpokenText(text: string) {
  const t = trimToSentences(text, TTS_MAX_SENTENCES);
  if (t.length <= TTS_MAX_CHARS) return t;
  return (
    t
      .slice(0, TTS_MAX_CHARS)
      .replace(/\s+\S*$/, "")
      .trimEnd() + "…"
  );
}

export default function LivePitchRoom() {
  useTitle("Live Pitch Room");

  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const pitchId = searchParams.get("pitchId");

  const { token, user } = useUser();
  const { pitch, fetchPitch } = usePitch();

  const peerContext = usePeer();
  const peer = peerContext?.peer;
  const createOffer = peerContext?.createOffer;
  const createAnswer = peerContext?.createAnswer;
  const setRemoteAnswer = peerContext?.setRemoteAnswer;

  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [users, setUsers] = useState<string[]>([]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const [isPdfView, setIsPdfView] = useState(true);
  const [isScreenView, setIsScreenView] = useState(false);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [slideView, setSlideView] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAIExpanded, setIsAIExpanded] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const isVoiceOnRef = useRef(false);
  const ttsStreamBufferRef = useRef<string>("");
  const ttsStreamFlushTimerRef = useRef<number | null>(null);
  const ttsDidStreamSpeakRef = useRef(false);
  const isAiStreamingRef = useRef(false);
  const isIntroPhaseRef = useRef(true);
  const hasPlayedIntroRef = useRef(false);

  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([]);

  const recognitionRef = useRef<any>(null);
  const handleChatRef = useRef<(text?: string) => void>(() => {});

  const [evaluateLoading, setEvalateLoading] = useState(false);

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [scores, setScores] = useState({
    clarity: 94,
    confidence: 88,
    marketFit: 76,
  });
  const [scoreTrend, setScoreTrend] = useState({
    clarity: "up",
    confidence: "up",
    marketFit: "up",
  });
  const [prevScores, setPrevScores] = useState({
    clarity: 94,
    confidence: 88,
    marketFit: 76,
  });
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  // ─── Auto-scroll chat ───
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!isChatOpen && transcript.length > 0) {
      setUnreadCount((p) => p + 1);
    }
  }, [transcript]);

  useEffect(() => {
    if (isChatOpen) setUnreadCount(0);
  }, [isChatOpen]);

  // ─── Show local stream ───
  useEffect(() => {
    if (videoRef.current && myStream) {
      videoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  // ─── Fetch pitch ───
  useEffect(() => {
    if (pitchId) fetchPitch(pitchId);
  }, [pitchId]);

  // ─── Timer ───
  useEffect(() => {
    let startTime = Date.now();

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isIntroPhase && elapsedTime >= INTRO_PITCH_SECONDS) {
      setIsIntroPhase(false);
    }
  }, [elapsedTime, isIntroPhase]);

  useEffect(() => {
    isIntroPhaseRef.current = isIntroPhase;
  }, [isIntroPhase]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${sec
        .toString()
        .padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ─── Score trend tracking ───
  useEffect(() => {
    setScoreTrend({
      clarity: scores.clarity >= prevScores.clarity ? "up" : "down",
      confidence: scores.confidence >= prevScores.confidence ? "up" : "down",
      marketFit: scores.marketFit >= prevScores.marketFit ? "up" : "down",
    });
    setPrevScores(scores);
  }, [scores]);

  useEffect(() => {
    isVoiceOnRef.current = isVoiceOn;
  }, [isVoiceOn]);

  // ─── TTS voice selection (prefer Google voice when available) ───
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const pickPreferredVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      voicesRef.current = voices;

      const isLangMatch = (v: SpeechSynthesisVoice) =>
        (v.lang || "").toLowerCase().startsWith("en");

      const google =
        voices.find(
          (v) =>
            isLangMatch(v) &&
            /google/i.test(v.name || "") &&
            /female|natural|en/i.test(v.name || ""),
        ) ||
        voices.find((v) => isLangMatch(v) && /google/i.test(v.name || "")) ||
        voices.find(
          (v) => (v.lang || "").toLowerCase() === TTS_LANG.toLowerCase(),
        ) ||
        voices.find(isLangMatch) ||
        null;

      preferredVoiceRef.current = google;
    };

    pickPreferredVoice();
    window.speechSynthesis.onvoiceschanged = pickPreferredVoice;
    return () => {
      try {
        if (window.speechSynthesis.onvoiceschanged === pickPreferredVoice) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      } catch {}
    };
  }, []);

  const stopTts = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    speechSynthesisRef.current = null;
    ttsStreamBufferRef.current = "";
    ttsDidStreamSpeakRef.current = false;
    isAiStreamingRef.current = false;
    if (ttsStreamFlushTimerRef.current) {
      window.clearTimeout(ttsStreamFlushTimerRef.current);
      ttsStreamFlushTimerRef.current = null;
    }
  }, []);

  const speakShort = useCallback((rawText: string) => {
    if (!isVoiceOnRef.current) return;
    if (!("speechSynthesis" in window)) return;
    const text = limitSpokenText(rawText);
    if (!text) return;

    try {
      // Keep things snappy: don't allow a long queue to build up.
      // If we're already speaking, cancel so the next segment doesn't get delayed.
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    } catch {}

    const u = new SpeechSynthesisUtterance(text);
    u.lang = TTS_LANG;
    u.rate = 1.02;
    u.pitch = 1;
    if (preferredVoiceRef.current) u.voice = preferredVoiceRef.current;
    speechSynthesisRef.current = u;
    try {
      window.speechSynthesis.speak(u);
    } catch {}
  }, []);

  const flushTtsStreamBuffer = useCallback((): boolean => {
    const buffered = ttsStreamBufferRef.current;
    const segment = normalizeWhitespace(buffered);
    if (!segment) return false;
    ttsStreamBufferRef.current = "";
    ttsDidStreamSpeakRef.current = true;
    speakShort(segment);
    return true;
  }, [speakShort]);

  const handleStartInteractivePhase = useCallback(() => {
    setIsIntroPhase(false);
  }, []);

  //sending voice to ai
  const startVoiceRecognition = () => {
    console.log("entered")
    if (!("webkitSpeechRecognition" in window)) {
      console.warn("Speech recognition not supported");
      return;
    }
    console.log("webkit detected")

    const recognition = new (window as any).webkitSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    console.log("final step")

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];

      if (result.isFinal) {
        const transcript = result[0].transcript;

        socketRef.current?.send(
          JSON.stringify({
            action: "user-message",
            text: transcript,
          }),
        );
      }
    };
    console.log("sended")

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error:", err);
    };

    recognition.start();
  };
  //calling it when voice is enabled
  useEffect(() => {
    if (isVoiceOn) {
      console.log("listening..")
      startVoiceRecognition();
    }
  }, [isVoiceOn]);

  // ─── Camera / stream ───
  const startLocalStream = async (includeAudio = true) => {
    try {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: includeAudio,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peer?.addTrack(track, stream);
      });

      setMyStream(stream);
      setIsVideoOn(true);
      setIsMicOn(includeAudio);

      return stream;
    } catch (err) {
      console.error("Error starting local stream:", err);
      throw err;
    }
  };

  const stopLocalStream = () => {
    if (myStream) {
      myStream.getTracks().forEach((t) => {
        t.stop();
        // ✅ Remove track from peer connection
        const sender = peer?.getSenders().find((s) => s.track === t);
        if (sender) {
          peer?.removeTrack(sender);
        }
      });
    }
    setMyStream(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setIsVideoOn(false);
  };
  const handleCameraToggle = async () => {
    if (isVideoOn) {
      // ✅ STOP CAMERA - Remove tracks from peer
      if (myStream) {
        myStream.getVideoTracks().forEach((track) => {
          track.stop();
          const videoSender = peer
            ?.getSenders()
            .find((s) => s.track?.kind === "video");
          if (videoSender) {
            peer?.removeTrack(videoSender);
          }
        });
      }
      setIsVideoOn(false);

      // ✅ RENEGOTIATE - Send new offer
      try {
        const offer = await createOffer?.();
        if (socketRef.current?.readyState === WebSocket.OPEN && offer) {
          const targetEmail = users.find((u) => u !== user?.email);
          socketRef.current.send(
            JSON.stringify({ action: "call-user", user: targetEmail, offer }),
          );
        }
      } catch (err) {
        console.warn("Camera toggle renegotiation error:", err);
      }
      return;
    }

    // ✅ START CAMERA
    try {
      await startLocalStream(isMicOn);

      // ✅ RENEGOTIATE - Send new offer
      try {
        const offer = await createOffer?.();
        if (socketRef.current?.readyState === WebSocket.OPEN && offer) {
          const targetEmail = users.find((u) => u !== user?.email);
          socketRef.current.send(
            JSON.stringify({ action: "call-user", user: targetEmail, offer }),
          );
        }
      } catch (err) {
        console.warn("Camera toggle renegotiation error:", err);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const handleMicToggle = async () => {
    if (!myStream) {
      // ✅ No stream at all - get audio-only stream
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setMyStream(audioStream);
        setIsMicOn(true);

        // ✅ Add audio track to peer
        audioStream.getTracks().forEach((track) => {
          peer?.addTrack(track, audioStream);
        });

        // ✅ Send offer to renegotiate
        try {
          const offer = await createOffer?.();
          if (socketRef.current?.readyState === WebSocket.OPEN && offer) {
            const targetEmail = users.find((u) => u !== user?.email);
            socketRef.current.send(
              JSON.stringify({ action: "call-user", user: targetEmail, offer }),
            );
          }
        } catch (err) {
          console.warn("Mic toggle renegotiation error:", err);
        }
      } catch (err) {
        console.error("Error getting audio stream:", err);
      }
      return;
    }
    const audioTracks = myStream.getAudioTracks();

    if (audioTracks.length > 0) {
      // Toggle existing audio tracks
      audioTracks.forEach((t) => (t.enabled = !isMicOn));
      setIsMicOn(!isMicOn);
    } else {
      // ✅ No audio track (e.g., video-only stream) - add one
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioTrack = audioStream.getAudioTracks()[0];

        peer?.addTrack(audioTrack, myStream);
        myStream.addTrack(audioTrack);
        setIsMicOn(true);

        // ✅ Send offer to renegotiate
        try {
          const offer = await createOffer?.();
          if (socketRef.current?.readyState === WebSocket.OPEN && offer) {
            const targetEmail = users.find((u) => u !== user?.email);
            socketRef.current.send(
              JSON.stringify({ action: "call-user", user: targetEmail, offer }),
            );
          }
        } catch (err) {
          console.warn("Mic add renegotiation error:", err);
        }
      } catch (err) {
        console.error("Error adding audio track:", err);
      }
    }
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      // ✅ STOP SCREEN - Switch back to camera
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);

      try {
        if (myStream) {
          const cameraTrack = myStream.getVideoTracks()[0];
          const videoSender = peer
            ?.getSenders()
            .find((s) => s.track?.kind === "video");

          if (videoSender && cameraTrack) {
            // ✅ Replace screen track with camera track
            await videoSender.replaceTrack(cameraTrack);
          }
        }
      } catch (err) {
        console.error("Error switching back to camera:", err);
      }

      // ✅ Send offer to renegotiate
      try {
        const offer = await createOffer?.();
        if (socketRef.current?.readyState === WebSocket.OPEN && offer) {
          const targetEmail = users.find((u) => u !== user?.email);
          socketRef.current.send(
            JSON.stringify({ action: "call-user", user: targetEmail, offer }),
          );
        }
      } catch (err) {
        console.warn("Screen share stop renegotiation error:", err);
      }
      return;
    }

    // ✅ START SCREEN SHARE
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      // ✅ Replace video track in peer with screen track
      const screenTrack = stream.getVideoTracks()[0];
      const videoSender = peer
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      if (videoSender && screenTrack) {
        await videoSender.replaceTrack(screenTrack);
      }

      // ✅ Handle user stopping screen from system dialog
      screenTrack.onended = async () => {
        try {
          if (myStream) {
            const cameraTrack = myStream.getVideoTracks()[0];
            if (cameraTrack && videoSender) {
              await videoSender.replaceTrack(cameraTrack);
            }
          }
        } catch (err) {
          console.error("Error switching back to camera:", err);
        }
        setScreenStream(null);
        setIsScreenSharing(false);

        // ✅ Send offer to renegotiate
        try {
          const offer = await createOffer?.();
          if (socketRef.current?.readyState === WebSocket.OPEN && offer) {
            const targetEmail = users.find((u) => u !== user?.email);
            socketRef.current.send(
              JSON.stringify({ action: "call-user", user: targetEmail, offer }),
            );
          }
        } catch (err) {
          console.warn("Screen share end renegotiation error:", err);
        }
      };

      // ✅ Send offer to renegotiate
      try {
        const offer = await createOffer?.();
        if (socketRef.current?.readyState === WebSocket.OPEN && offer) {
          const targetEmail = users.find((u) => u !== user?.email);
          socketRef.current.send(
            JSON.stringify({ action: "call-user", user: targetEmail, offer }),
          );
        }
      } catch (err) {
        console.warn("Screen share start renegotiation error:", err);
      }
    } catch (err) {
      console.warn("Screen share cancelled:", err);
    }
  };

  // ─── Copy room link ───
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ─── Remote stream ───
  useEffect(() => {
    if (!peer) return;
    const handleTrack = (event: RTCTrackEvent) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
    };
    peer.addEventListener?.("track", handleTrack);
    // @ts-ignore
    if (!peer.addEventListener) peer.ontrack = handleTrack;
    return () => {
      try {
        peer.removeEventListener?.("track", handleTrack);
      } catch {}
      // @ts-ignore
      if (peer?.ontrack === handleTrack) peer.ontrack = null;
    };
  }, [peer]);

  useEffect(() => {
    startLocalStream(true);
  }, []);
  // ─── Negotiation ───
  const makingOffer = useRef(false);
  useEffect(() => {
    if (!peer && !createOffer) return;
    const onNegotiation = async () => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        console.warn("Socket not ready, skipping negotiation");
        return;
      }
      try {
        if (makingOffer.current) return;
        const offer = await (createOffer ? createOffer() : peer?.createOffer());
        const targetEmail = users.find((u) => u !== user?.email);
        socketRef.current.send(
          JSON.stringify({ action: "call-user", user: targetEmail, offer }),
        );
      } catch (err) {
        console.warn("Negotiation error:", err);
      } finally {
        makingOffer.current = false;
      }
    };
    peer?.addEventListener?.("negotiationneeded", onNegotiation);
    // @ts-ignore
    if (!peer.addEventListener) peer.onnegotiationneeded = onNegotiation;
    return () => {
      try {
        peer?.removeEventListener?.("negotiationneeded", onNegotiation);
      } catch {}
      // @ts-ignore
      if (peer?.onnegotiationneeded === onNegotiation)
        peer.onnegotiationneeded = null;
    };
  }, [peer, users, createOffer, user?.email]);

  // ─── ICE ───
  useEffect(() => {
    if (!peer || !socketRef.current) return;
    const onIce = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            action: "ice-candidate",
            candidate: event.candidate,
          }),
        );
      }
    };
    peer.addEventListener?.("icecandidate", onIce);
    // @ts-ignore
    if (!peer.addEventListener) peer.onicecandidate = onIce;
    return () => {
      try {
        peer.removeEventListener?.("icecandidate", onIce);
      } catch {}
      // @ts-ignore
      if (peer?.onicecandidate === onIce) peer.onicecandidate = null;
    };
  }, [peer]);

  // ─── Socket ───
  useEffect(() => {
    if (!roomId || !token) return;
    const wsUrl = BaseUrl.startsWith("https")
      ? BaseUrl.replace(/^https/, "wss")
      : BaseUrl.replace(/^http/, "ws");

    const flushIceCandidates = async () => {
      for (const c of iceCandidateBuffer.current) {
        try {
          await peer?.addIceCandidate(new RTCIceCandidate(c));
        } catch (e) {
          console.warn("ICE flush error", e);
        }
      }
      iceCandidateBuffer.current = [];
    };
    const socket = new WebSocket(
      `${wsUrl}/api/room/ws/${roomId}?token=${token}`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus("connected");
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.action === "room-users") setUsers(data.users || []);

        if (data.action === "user-joined") {
          setUsers((prev) => [...new Set([...(prev || []), data.email])]);
        }

        if (data.action === "ai-response-chunk") {
          if (isIntroPhaseRef.current && data.speaker === "AI Judge") {
            // During intro pitch phase the AI silently observes – no spoken or text interruptions.
            return;
          }
          const chunk = data.chunk || "";
          setStreamingMessage((prev) => (prev || "") + chunk);

          // Low-latency TTS: speak incrementally while streaming.
          if (
            isVoiceOnRef.current &&
            data.speaker === "AI Judge" &&
            chunk &&
            "speechSynthesis" in window
          ) {
            if (!isAiStreamingRef.current) {
              // New AI response stream; clear any previous leftovers.
              stopTts();
              ttsDidStreamSpeakRef.current = false;
              isAiStreamingRef.current = true;
            }
            ttsStreamBufferRef.current += chunk;

            const buf = ttsStreamBufferRef.current;
            const hasSentenceEnd =
              /[.!?]\s*$/.test(buf) || /[.!?][)\]"']\s*$/.test(buf);
            const shouldSpeak =
              hasSentenceEnd ||
              normalizeWhitespace(buf).length >= TTS_STREAM_SPEAK_MIN_CHARS;

            if (shouldSpeak) {
              // flush soon to allow a couple more chars to arrive
              if (ttsStreamFlushTimerRef.current) {
                window.clearTimeout(ttsStreamFlushTimerRef.current);
              }
              ttsStreamFlushTimerRef.current = window.setTimeout(() => {
                ttsStreamFlushTimerRef.current = null;
                flushTtsStreamBuffer();
              }, 120);
            } else {
              // don't wait forever for punctuation
              if (!ttsStreamFlushTimerRef.current) {
                ttsStreamFlushTimerRef.current = window.setTimeout(() => {
                  ttsStreamFlushTimerRef.current = null;
                  flushTtsStreamBuffer();
                }, TTS_STREAM_FLUSH_MS);
              }
            }
          }
        }

        if (data.action === "send-message") {
          const isAiJudge = data.speaker === "AI Judge";
          if (isIntroPhaseRef.current && isAiJudge) {
            // Suppress visible AI responses during the intro pitch window.
            return;
          }
          setStreamingMessage(null);
          const text = data.text || data.content;
          // Only end the AI streaming state when the AI Judge's final message arrives.
          // User/other messages can arrive while the AI is still streaming chunks.
          if (data.speaker === "AI Judge") {
            isAiStreamingRef.current = false;
          }
          setTranscript((prev) => [
            ...prev,
            {
              speaker: data.speaker || "Unknown",
              text,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          // TTS: if we already spoke while streaming, just flush the remainder.
          // Otherwise, speak a short version of the final response.
          console.log(text);
          console.log(isVoiceOnRef.current);
          console.log(data.speaker);
          if (isVoiceOnRef.current && data.speaker === "AI Judge" && text) {
            console.log("Speeking");
            if (ttsStreamFlushTimerRef.current) {
              window.clearTimeout(ttsStreamFlushTimerRef.current);
              ttsStreamFlushTimerRef.current = null;
            }

            if (ttsDidStreamSpeakRef.current) {
              const spokeRemainder = flushTtsStreamBuffer();
              // If nothing was left to flush, fall back to speaking a short final summary.
              // This avoids cases where streaming speech occurred but the final message
              // arrives with an empty buffer (e.g. timer flushed earlier).
              if (!spokeRemainder) speakShort(text);
            } else {
              speakShort(text);
            }

            // Reset per-message streaming TTS state once the final AI message is handled.
            ttsDidStreamSpeakRef.current = false;
            ttsStreamBufferRef.current = "";
          }
        }

        if (data.action === "incoming-call") {
          if (createAnswer) {
            try {
              // ✅ Wrap in RTCSessionDescription
              const answer = await createAnswer(data.offer);
              await flushIceCandidates();
              socketRef.current?.send(
                JSON.stringify({
                  action: "call-accepted",
                  to: data.from,
                  answer,
                }),
              );
            } catch (err) {
              console.error("createAnswer error:", err);
            }
          } else {
            try {
              if (peer && typeof peer.setRemoteDescription === "function") {
                // ✅ Wrap in RTCSessionDescription
                await peer.setRemoteDescription(
                  new RTCSessionDescription(data.offer),
                );
                await flushIceCandidates();
                const localAnswer = await peer.createAnswer();
                await peer.setLocalDescription(localAnswer);
                socketRef.current?.send(
                  JSON.stringify({
                    action: "call-accepted",
                    to: data.from,
                    answer: localAnswer,
                  }),
                );
              }
            } catch (err) {
              console.error("Fallback incoming-call failed:", err);
            }
          }
        }

        if (data.action === "call-accepted") {
          if (data.answer && setRemoteAnswer) {
            try {
              // ✅ Wrap in RTCSessionDescription
              await setRemoteAnswer(data.answer);
              await flushIceCandidates();
            } catch (err) {
              console.error("setRemoteAnswer error:", err);
            }
          } else if (data.answer && peer?.setRemoteDescription) {
            try {
              // ✅ Wrap in RTCSessionDescription
              await peer.setRemoteDescription(
                new RTCSessionDescription(data.answer),
              );
              await flushIceCandidates();
            } catch (err) {
              console.error("peer setRemoteDescription error:", err);
            }
          }
        }

        if (data.action === "ice-candidate" && data.candidate) {
          // ✅ Always buffer first
          iceCandidateBuffer.current.push(data.candidate);

          // ✅ If we have remoteDescription, flush immediately
          if (peer?.remoteDescription) {
            const flushIceCandidates = async () => {
              for (const c of iceCandidateBuffer.current) {
                try {
                  await peer?.addIceCandidate(new RTCIceCandidate(c));
                } catch (e) {
                  console.warn("ICE flush error", e);
                }
              }
              iceCandidateBuffer.current = [];
            };
            await flushIceCandidates();
          }
        }

        if (data.type === "SCORE_UPDATE") setScores(data.scores);
      } catch (err) {
        console.error("Socket parse error:", err);
      }
    };

    socket.onclose = () => setConnectionStatus("disconnected");
    socket.onerror = () => setConnectionStatus("disconnected");

    return () => {
      // Ensure TTS is fully cleaned up when leaving/reconnecting rooms.
      stopTts();
      try {
        socket.close();
      } catch {}
      socketRef.current = null;
    };
  }, [roomId, token, BaseUrl, createAnswer, setRemoteAnswer, peer, stopTts]);

  // ─── AI opening line once connected ───
  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      !hasPlayedIntroRef.current &&
      user
    ) {
      hasPlayedIntroRef.current = true;
      const welcomeText = AI_WELCOME_LINE;
      setTranscript((prev) => [
        ...prev,
        {
          speaker: "AI Judge",
          text: welcomeText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      if (isVoiceOnRef.current) {
        speakShort(welcomeText);
      }
    }
  }, [connectionStatus, user, speakShort]);

  // ─── Fetch chat history ───
  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch(`${BaseUrl}/api/room/chats/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const chatData = await res.json();
        setTranscript(
          (chatData || []).map((c: any) => ({
            speaker: c.speaker || "Unknown",
            text: c.content,
            time: c.created_at
              ? new Date(c.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
          })),
        );
      } catch (err) {
        console.error("fetchChats error:", err);
      }
    }
    if (roomId && token) fetchChats();
  }, [roomId, token]);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      if (myStream) myStream.getTracks().forEach((t) => t.stop());
      try {
        socketRef.current?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── End session ───
  async function handleSessionEnd() {
    try {
      setEvalateLoading(true);
      const res = await fetch(`${BaseUrl}/api/room/end/${roomId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.pitch_id) {
        window.location.href = `/pitch-detail?pitch_id=${data.pitch_id}`;
      } else if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        console.error("End session failed:", data);
        alert("Failed to end session. Please try again.");
      }
      setEvalateLoading(false);
    } catch (err) {
      console.error("End session error:", err);
      alert("Failed to end session. Please try again.");
      setEvalateLoading(false);
    }
  }

  // ─── Chat send ───
  const handleChat = useCallback(
    (text?: string) => {
      const msg = (text ?? chatMessage).trim();
      if (!msg || !socketRef.current) return;
      socketRef.current.send(
        JSON.stringify({
          action: "send-message",
          roomId,
          user_id: user?.id,
          text: msg,
          speaker: user?.full_name || user?.email || "You",
        }),
      );
      setChatMessage("");
    },
    [roomId, user?.id, user?.full_name, user?.email, chatMessage],
  );

  useEffect(() => {
    handleChatRef.current = handleChat;
  }, [handleChat]);

  useEffect(() => {
    if (!slideView && !isScreenView && videoRef.current && myStream) {
      videoRef.current.srcObject = myStream;
    }
  }, [slideView, myStream]);

  // ─── Voice input (STT) ───
  const toggleVoiceInput = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      if (last?.isFinal) {
        const t = last[0]?.transcript?.trim();
        if (t) handleChatRef.current?.(t);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Cancel TTS when user sends a message (interruption)
  useEffect(() => {
    if (chatMessage && "speechSynthesis" in window) {
      stopTts();
    }
  }, [chatMessage, stopTts]);
  console.log("voice", isVoiceOn)

  // Stop TTS immediately when toggled off
  useEffect(() => {
    if (!isVoiceOn) stopTts();
  }, [isVoiceOn, stopTts]);

  //handle pdf view

  function handlePdfView() {
    setIsPdfView(true);
    setIsScreenView(false);
  }
  function handleScreenView() {
    setIsScreenView(true);
    setIsPdfView(false);
  }
  const panelSize =
    typeof window !== "undefined"
      ? Math.min(
          INVESTOR_PERSONAS.length,
          Math.max(
            1,
            parseInt(window.localStorage.getItem("panelSize") || "3", 10),
          ),
        )
      : INVESTOR_PERSONAS.length;
  const activeInvestorPersonas = INVESTOR_PERSONAS.slice(0, panelSize);

  const overallScore = Math.round(
    (scores.clarity + scores.confidence + scores.marketFit) / 3,
  );

  const getScoreColor = (val: number) =>
    val >= 85
      ? "text-emerald-400"
      : val >= 65
        ? "text-amber-400"
        : "text-red-400";

  const getScoreRingColor = (val: number) =>
    val >= 85 ? "#34d399" : val >= 65 ? "#fbbf24" : "#f87171";

  // ─── UI ───
  return (
    <div className="h-screen flex flex-col bg-[#0B0F1A] text-white font-['DM_Sans',sans-serif] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff18; border-radius: 4px; }

        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .glass-heavy {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .glow-dot {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px currentColor; }
          50% { opacity: 0.6; box-shadow: 0 0 12px currentColor; }
        }

        .score-bar {
          transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .chat-bubble { animation: slide-in 0.25s ease-out; }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn-control {
          transition: all 0.15s ease;
        }
        .btn-control:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .btn-control:active { transform: scale(0.96); }

        .live-badge {
          animation: live-pulse 1.5s ease-in-out infinite;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .score-ring {
          transform: rotate(-90deg);
          transform-origin: center;
        }
        .score-ring-fill {
          transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* ─── HEADER ─── */}
      <header className="flex items-center justify-between px-6 py-3 glass-heavy border-b border-white/8 z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-['Space_Grotesk'] font-600 text-sm tracking-wide text-white">
              PitchNest
            </span>
          </div>

          <div className="w-px h-4 bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="live-badge flex items-center gap-1.5 text-[11px] font-600 font-['Space_Grotesk'] tracking-widest text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 glow-dot" />
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Clock size={12} />
            <span className="font-mono tabular-nums text-white/70 text-sm">
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Connection status */}
          <div
            className={`flex items-center gap-1.5 text-[11px] font-500 px-2.5 py-1 rounded-full border ${
              connectionStatus === "connected"
                ? "text-emerald-400 bg-emerald-400/8 border-emerald-400/15"
                : connectionStatus === "connecting"
                  ? "text-amber-400 bg-amber-400/8 border-amber-400/15"
                  : "text-red-400 bg-red-400/8 border-red-400/15"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-emerald-400"
                  : connectionStatus === "connecting"
                    ? "bg-amber-400"
                    : "bg-red-400"
              }`}
            />
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "connecting"
                ? "Connecting…"
                : "Disconnected"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Room ID copy */}
          <button
            onClick={handleCopyLink}
            className="btn-control flex items-center gap-1.5 text-white/40 hover:text-white/80 text-xs glass px-3 py-1.5 rounded-lg transition-colors"
          >
            {isCopied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="font-mono">{roomId?.slice(0, 8)}…</span>
              </>
            )}
          </button>

          {/* Participants */}
          <button
            onClick={() => setIsParticipantsOpen((s) => !s)}
            className="btn-control relative flex items-center gap-1.5 text-white/60 hover:text-white glass px-3 py-1.5 rounded-lg transition-colors"
          >
            <Users size={14} />
            <span className="text-xs">{users.length}</span>
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setIsChatOpen((s) => !s)}
            className="btn-control relative flex items-center gap-1.5 text-white/60 hover:text-white glass px-3 py-1.5 rounded-lg transition-colors"
          >
            <MessageSquare size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button className="btn-control text-white/50 hover:text-white glass p-2 rounded-lg">
            <Bell size={14} />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 grid grid-cols-12 p-4 gap-4 overflow-hidden min-h-0">
        {/* ─── LEFT COLUMN ─── */}
        <div className="col-span-9 flex flex-col gap-4 min-h-0">
          {/* Main stage */}
          <div className="flex-1 glass-heavy rounded-2xl overflow-hidden relative group min-h-0">
            {slideView && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <button
                  onClick={handlePdfView}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-200
          ${
            isPdfView
              ? "bg-amber-600/80 border-amber-500/60 text-white"
              : "bg-black/60 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
                >
                  <FileText size={12} />
                  PDF View
                </button>

                {isScreenSharing && (
                  <button
                    onClick={handleScreenView}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-200
            ${
              !isPdfView
                ? "bg-blue-600/80 border-blue-500/60 text-white"
                : "bg-black/60 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
                  >
                    <Monitor size={12} />
                    Screen View
                  </button>
                )}
              </div>
            )}

            {slideView ? (
              isPdfView ? (
                pitch?.pitch_pdf_url ? (
                  <PitchSlides pdfUrl={pitch.pitch_pdf_url} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/30 gap-3">
                    <Monitor size={48} className="opacity-30" />
                    <p className="text-sm">No slides uploaded</p>
                  </div>
                )
              ) : (
                <div className="relative w-full h-full">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${screenStream ? "block" : "hidden"}`}
                  />
                </div>
              )
            ) : isVideoOn ? (
              myStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                "No Stream Available"
              )
            ) : (
              "No camera on"
            )}

            {/* Stage controls overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSlideView(!slideView)}
                  className="btn-control flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10"
                >
                  {slideView ? <Video size={13} /> : <Monitor size={13} />}
                  {slideView ? "Camera View" : "Slide View"}
                </button>

                {!slideView && (
                  <button
                    onClick={() => setIsRemoteMuted((m) => !m)}
                    className="btn-control bg-black/60 backdrop-blur-md text-white p-2 rounded-xl border border-white/10 hover:bg-white/10"
                  >
                    {isRemoteMuted ? (
                      <VolumeX size={13} />
                    ) : (
                      <Volume2 size={13} />
                    )}
                  </button>
                )}
              </div>

              {pitch?.pitch_name && (
                <div className="glass text-white/80 text-xs px-3 py-1.5 rounded-xl">
                  {pitch.pitch_name}
                </div>
              )}
            </div>
          </div>
          {/* ─── TRANSCRIPT ─── */}
          <div
            className="glass-heavy rounded-2xl overflow-hidden"
            style={{ height: "140px" }}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Radio size={12} className="text-violet-400" />
                <span className="text-xs font-500 text-white/60 tracking-wide uppercase">
                  Live Transcript
                </span>
              </div>
              <span className="text-[10px] text-white/30">
                {transcript.length} messages
              </span>
            </div>
            <div
              className="overflow-auto px-4 py-2 space-y-1.5"
              style={{ height: "90px" }}
            >
              {transcript.length === 0 && !streamingMessage ? (
                <p className="text-white/20 text-xs italic">
                  Waiting for messages…
                </p>
              ) : (
                <>
                  {transcript.map((msg, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm chat-bubble"
                    >
                      <span className="text-violet-400 font-600 text-xs whitespace-nowrap mt-0.5">
                        {msg.speaker}
                      </span>
                      <span className="text-white/70 text-xs flex-1">
                        {msg.text}
                      </span>
                      {msg.time && (
                        <span className="text-white/20 text-[10px] shrink-0 mt-0.5">
                          {msg.time}
                        </span>
                      )}
                    </div>
                  ))}
                  {streamingMessage && (
                    <div className="flex items-start gap-2 text-sm chat-bubble">
                      <span className="text-violet-400 font-600 text-xs whitespace-nowrap mt-0.5">
                        AI Judge
                      </span>
                      <span className="text-white/70 text-xs flex-1">
                        {streamingMessage}
                        <span className="inline-block w-2 h-3 ml-0.5 bg-violet-400/60 animate-pulse" />
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="col-span-3 flex flex-col gap-4 min-h-0 overflow-auto">
          {/* Self cam */}
          <div
            className="glass-heavy rounded-2xl overflow-hidden relative"
            style={{ aspectRatio: "16/10" }}
          >
            {isVideoOn && myStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-sm font-600 text-white/60">
                    {(user?.full_name || user?.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-white/30">Camera off</span>
              </div>
            )}

            {/* Name tag */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-[10px] text-white/70 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                {user?.full_name || user?.email || "You"}
              </span>
              {!isMicOn && (
                <span className="bg-red-500/80 p-1 rounded-md">
                  <MicOff size={10} />
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="glass-heavy rounded-2xl p-3">
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={handleCameraToggle}
                className={`btn-control flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-500 transition-all ${
                  isVideoOn
                    ? "bg-white/8 text-white hover:bg-white/12"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {isVideoOn ? <Video size={15} /> : <VideoOff size={15} />}
                {isVideoOn ? "Video" : "Off"}
              </button>

              <button
                onClick={handleMicToggle}
                className={`btn-control flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-500 transition-all ${
                  isMicOn
                    ? "bg-white/8 text-white hover:bg-white/12"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {isMicOn ? <Mic size={15} /> : <MicOff size={15} />}
                {isMicOn ? "Mic" : "Muted"}
              </button>

              <button
                onClick={handleScreenShare}
                className={`btn-control flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-500 transition-all ${
                  isScreenSharing
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    : "bg-white/8 text-white hover:bg-white/12"
                }`}
              >
                {isScreenSharing ? (
                  <ScreenShareOff size={15} />
                ) : (
                  <ScreenShare size={15} />
                )}
                Screen
              </button>

              <button
                onClick={() => setIsVoiceOn((v) => !v)}
                className={`btn-control flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-500 transition-all ${
                  isVoiceOn
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    : "bg-white/8 text-white hover:bg-white/12"
                }`}
                title={
                  isVoiceOn
                    ? "AI voice on"
                    : "AI voice off - click to hear AI speak"
                }
              >
                {isVoiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                Voice
              </button>

              <button
                onClick={() => setShowEndConfirm(true)}
                disabled={evaluateLoading}
                className={`btn-control flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-500 border transition-all
  ${
    evaluateLoading
      ? "bg-red-500/10 text-red-300 border-red-500/20 cursor-not-allowed"
      : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
  }`}
              >
                {evaluateLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Eval...
                  </>
                ) : (
                  <>
                    <X size={15} />
                    End
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ─── OVERALL SCORE RING ─── */}
          <div className="glass-heavy rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke={getScoreRingColor(overallScore)}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - overallScore / 100)}`}
                  className="score-ring score-ring-fill"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`font-['Space_Grotesk'] font-700 text-base ${getScoreColor(overallScore)}`}
                >
                  {overallScore}
                </span>
              </div>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-500">
                Overall Score
              </p>
              <p
                className={`font-['Space_Grotesk'] font-600 text-sm mt-0.5 ${getScoreColor(overallScore)}`}
              >
                {overallScore >= 85
                  ? "Excellent"
                  : overallScore >= 70
                    ? "Good"
                    : "Needs Work"}
              </p>
              <p className="text-white/30 text-[10px] mt-0.5">
                Based on all metrics
              </p>
            </div>
          </div>

          {/* ─── LIVE SCORES ─── */}
          <div className="glass-heavy rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 size={12} className="text-violet-400" />
                <span className="text-[10px] uppercase tracking-widest text-white/50 font-500">
                  Live Metrics
                </span>
              </div>
            </div>

            {[
              { label: "Clarity", key: "clarity", value: scores.clarity },
              {
                label: "Confidence",
                key: "confidence",
                value: scores.confidence,
              },
              {
                label: "Market Fit",
                key: "marketFit",
                value: scores.marketFit,
              },
            ].map(({ label, key, value }) => (
              <div key={key} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-white/60 font-500">
                    {label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {scoreTrend[key as keyof typeof scoreTrend] === "up" ? (
                      <ChevronUp size={10} className="text-emerald-400" />
                    ) : (
                      <ChevronDown size={10} className="text-red-400" />
                    )}
                    <span
                      className={`font-['Space_Grotesk'] font-600 text-xs ${getScoreColor(value)}`}
                    >
                      {value}
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className={`score-bar h-full rounded-full bg-gradient-to-r ${
                      value >= 85
                        ? "from-emerald-500 to-teal-400"
                        : value >= 65
                          ? "from-amber-500 to-yellow-400"
                          : "from-red-500 to-red-400"
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ─── AI INVESTOR PANEL ─── */}
          <div className="glass-heavy rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5"
              onClick={() => setIsAIExpanded((s) => !s)}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={12} className="text-violet-400" />
                <span className="text-[10px] uppercase tracking-widest text-white/50 font-500">
                  AI Investors
                </span>
              </div>
              {isAIExpanded ? (
                <ChevronUp size={12} className="text-white/30" />
              ) : (
                <ChevronDown size={12} className="text-white/30" />
              )}
            </button>

            {isAIExpanded && (
              <div className="p-4 space-y-3">
                {activeInvestorPersonas.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg ${p.avatarBg} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-[9px] font-700 text-white/80 font-['Space_Grotesk']">
                        {p.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-500 text-white/80 truncate">
                          {p.name}
                        </span>
                        <span
                          className={`text-[9px] font-600 font-['Space_Grotesk'] ${
                            SENTIMENT_COLORS[p.sentiment] || "text-white/40"
                          }`}
                        >
                          {p.sentiment}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-white/6 rounded-full overflow-hidden">
                          <div
                            className={`score-bar h-full rounded-full bg-gradient-to-r ${p.color}`}
                            style={{ width: p.width }}
                          />
                        </div>
                        <span className="text-[9px] text-white/30 font-['Space_Grotesk']">
                          {p.width}
                        </span>
                      </div>
                      <span className="text-[9px] text-white/30 uppercase tracking-wide">
                        {p.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── BOTTOM BAR ─── */}
      <div className="glass-heavy border-t border-white/5 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-5 flex-1">
          <div className="flex flex-col text-xs text-white/60 mr-4">
            <span className="font-['Space_Grotesk'] tracking-wide uppercase">
              {isIntroPhase ? "Intro Pitch Phase" : "Interactive Q&A"}
            </span>
            <span className="text-white/40">
              {isIntroPhase
                ? "You have ~3 minutes to pitch. The AI panel is listening and will respond after you finish."
                : "AI investors are now free to ask questions and react in real time."}
            </span>
          </div>
          {[
            {
              label: "Clarity",
              val: scores.clarity,
              trend: scoreTrend.clarity,
            },
            {
              label: "Confidence",
              val: scores.confidence,
              trend: scoreTrend.confidence,
            },
            {
              label: "Market Fit",
              val: scores.marketFit,
              trend: scoreTrend.marketFit,
            },
          ].map(({ label, val, trend }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-white/30 text-xs">{label}</span>
              <span
                className={`font-['Space_Grotesk'] font-600 text-sm ${getScoreColor(val)}`}
              >
                {val}
              </span>
              {trend === "up" ? (
                <ChevronUp size={10} className="text-emerald-400" />
              ) : (
                <ChevronDown size={10} className="text-red-400" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isIntroPhase && (
            <button
              onClick={handleStartInteractivePhase}
              className="btn-control px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs mr-2"
            >
              I'm done pitching – start AI questions
            </button>
          )}
          <button
            onClick={toggleVoiceInput}
            className={`btn-control p-2 rounded-xl transition-colors ${
              isListening
                ? "bg-red-500/30 text-red-400 border border-red-500/50 animate-pulse"
                : "bg-white/8 text-white hover:bg-white/12"
            }`}
            title={
              isListening
                ? "Click to stop listening"
                : "Click to speak (voice input)"
            }
          >
            <Mic size={18} />
          </button>
          <input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleChat();
            }}
            placeholder="Type or hold mic to speak…"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 w-56 transition-colors"
          />
          <button
            onClick={() => handleChat()}
            className="btn-control px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm flex items-center gap-2 transition-colors"
          >
            <Send size={13} />
            Send
          </button>
        </div>
      </div>

      {/* ─── CHAT DRAWER ─── */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-[360px] flex flex-col z-50 glass-heavy border-l border-white/8">
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/6">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-violet-400" />
              <h3 className="font-['Space_Grotesk'] font-600 text-sm text-white">
                Questions & Notes
              </h3>
              <span className="text-[10px] text-white/30 bg-white/6 px-2 py-0.5 rounded-full">
                {transcript.length}
              </span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/30 hover:text-white/80 p-1 rounded-lg hover:bg-white/6 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
            {transcript.length === 0 && !streamingMessage ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/20">
                <MessageSquare size={24} className="opacity-40" />
                <p className="text-xs">No messages yet</p>
              </div>
            ) : (
              <>
                {transcript.map((m, idx) => (
                  <div key={idx} className="chat-bubble">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-600 text-violet-400">
                        {m.speaker}
                      </span>
                      {m.time && (
                        <span className="text-[10px] text-white/20">
                          {m.time}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 bg-white/4 rounded-xl border border-white/5 text-xs text-white/70 leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ))}
                {streamingMessage && (
                  <div className="chat-bubble">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-600 text-violet-400">
                        AI Judge
                      </span>
                    </div>
                    <div className="p-2.5 bg-white/4 rounded-xl border border-violet-500/20 text-xs text-white/70 leading-relaxed">
                      {streamingMessage}
                      <span className="inline-block w-2 h-3 ml-0.5 bg-violet-400/60 animate-pulse" />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-white/6 flex gap-2">
            <button
              onClick={toggleVoiceInput}
              className={`btn-control p-2.5 rounded-xl transition-colors shrink-0 ${
                isListening
                  ? "bg-red-500/30 text-red-400 border border-red-500/50"
                  : "bg-white/8 text-white hover:bg-white/12"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              <Mic size={14} />
            </button>
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChat();
              }}
              className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
              placeholder="Type or click mic to speak…"
            />
            <button
              onClick={() => handleChat()}
              className="btn-control px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─── PARTICIPANTS POPOVER ─── */}
      {isParticipantsOpen && (
        <div className="fixed top-[52px] right-[160px] z-50 w-64 glass-heavy rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
            <span className="text-xs font-600 font-['Space_Grotesk'] text-white/70">
              Participants ({users.length})
            </span>
            <button
              onClick={() => setIsParticipantsOpen(false)}
              className="text-white/30 hover:text-white/80"
            >
              <X size={13} />
            </button>
          </div>
          <div className="p-3 space-y-1.5 max-h-48 overflow-auto">
            {users.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-4">
                No participants
              </p>
            ) : (
              users.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/4"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-700 text-white">
                    {u.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white/70 truncate flex-1">
                    {u}
                  </span>
                  {u === user?.email && (
                    <span className="text-[9px] text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── END SESSION CONFIRM ─── */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-heavy rounded-2xl p-6 w-72 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <div>
                <p className="font-['Space_Grotesk'] font-600 text-sm text-white">
                  End Session?
                </p>
                <p className="text-white/40 text-xs">
                  This will stop the pitch and save analytics.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/6 hover:bg-white/10 text-white/70 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  handleSessionEnd();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-600 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
