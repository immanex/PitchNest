// LivePitchRoom.tsx
import { useState, useEffect, useRef } from "react";
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

  // separate refs for local preview & remote stream
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [users, setUsers] = useState<string[]>([]);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const [slideView, setSlideView] = useState(true);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [scores, setScores] = useState({
    clarity: 94,
    confidence: 88,
    marketFit: 76,
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  /* ---------- SHOW LOCAL STREAM ---------- */

  useEffect(() => {
    if (videoRef.current && myStream) {
      videoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  /* ---------- FETCH PITCH ---------- */
  useEffect(() => {
    if (pitchId) fetchPitch(pitchId);
  }, [pitchId]);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    const savedStart = localStorage.getItem("stream_start");

    let startTime;

    if (savedStart) {
      startTime = parseInt(savedStart);
    } else {
      startTime = Date.now();
      localStorage.setItem("stream_start", startTime.toString());
    }

    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(seconds);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  /* ---------- CAMERA / LOCAL STREAM ---------- */
  const startLocalStream = async (includeAudio = true) => {
    // request local media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: includeAudio,
      });
      // show local preview
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      // add tracks to peer so they are sent to remote
      stream.getTracks().forEach((track) => {
        try {
          peer?.addTrack(track, stream);
        } catch (err) {
          // some browsers may throw if peer not fully set up; ignore but keep stream
        }
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
      myStream.getTracks().forEach((t) => t.stop());
    }
    setMyStream(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setIsVideoOn(false);
  };

  const handleCameraToggle = async () => {
    // turn off
    if (isVideoOn) {
      stopLocalStream();
      return;
    }

    // turn on
    try {
      const stream = await startLocalStream(isMicOn);
      // create offer and call if connected
      if (
        createOffer &&
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        try {
          const offer = await createOffer();
          const targetEmail = users.find((u) => u !== user?.email);
          socketRef.current.send(
            JSON.stringify({
              action: "call-user",
              user: targetEmail,
              offer,
            }),
          );
        } catch (err) {
          console.warn(
            "Failed to create/send offer after starting stream:",
            err,
          );
        }
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  /* ---------- MIC ---------- */
  const handleMicToggle = () => {
    if (!myStream) {
      // no stream yet — just flip preference so when user starts camera it uses this value
      setIsMicOn(!isMicOn);
      return;
    }
    myStream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn));
    setIsMicOn(!isMicOn);
  };

  /* ---------- REMOTE STREAM ---------- */
  useEffect(() => {
    if (!peer) return;

    // remote tracks handler — use remoteVideoRef
    const handleTrack = (event: RTCTrackEvent) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
    };

    peer.addEventListener?.("track", handleTrack);
    // Also support old API
    // @ts-ignore
    if (!peer.addEventListener) peer.ontrack = handleTrack;

    return () => {
      try {
        peer.removeEventListener?.("track", handleTrack);
      } catch (e) {
        // ignore
      }
      // @ts-ignore
      if (peer && peer.ontrack === handleTrack) peer.ontrack = null;
    };
  }, [peer]);

  /* ---------- NEGOTIATION ---------- */
  useEffect(() => {
    if (!peer) return;

    const onNegotiation = async () => {
      if (!createOffer || !socketRef.current) return;
      try {
        // Some peer wrappers expose createOffer helper; we also attempt direct peer.createOffer fallback
        const offer = await (createOffer ? createOffer() : peer.createOffer());
        const targetEmail = users.find((u) => u !== user?.email);
        socketRef.current.send(
          JSON.stringify({
            action: "call-user",
            user: targetEmail,
            offer,
          }),
        );
      } catch (err) {
        console.warn("Negotiation error:", err);
      }
    };

    peer.addEventListener?.("negotiationneeded", onNegotiation);
    // fallback to onnegotiationneeded
    // @ts-ignore
    if (!peer.addEventListener) peer.onnegotiationneeded = onNegotiation;

    return () => {
      try {
        peer.removeEventListener?.("negotiationneeded", onNegotiation);
      } catch (e) {}
      // @ts-ignore
      if (peer && peer.onnegotiationneeded === onNegotiation)
        peer.onnegotiationneeded = null;
    };
  }, [peer, users, createOffer, user?.email]);

  /* ---------- ICE ---------- */
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
      } catch (e) {}
      // @ts-ignore
      if (peer && peer.onicecandidate === onIce) peer.onicecandidate = null;
    };
  }, [peer]);

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!roomId || !token) return;

    // convert http(s) base -> ws(s)
    const wsUrl = BaseUrl.startsWith("https")
      ? BaseUrl.replace(/^https/, "wss")
      : BaseUrl.replace(/^http/, "ws");
    const socket = new WebSocket(
      `${wsUrl}/api/room/ws/${roomId}?token=${token}`,
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to room:", roomId);
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.debug("socket message:", data);

        if (data.action === "room-users") {
          setUsers(data.users || []);
        }

        if (data.action === "user-joined") {
          setUsers((prev) => {
            // dedupe
            const next = [...new Set([...(prev || []), data.email])];
            return next;
          });
        }

        if (data.action === "send-message") {
          setTranscript((prev) => [
            ...prev,
            {
              speaker: data.speaker || "Unknown",
              text: data.text || data.content,
            },
          ]);
        }

        if (data.action === "incoming-call") {
          // server forwarded an offer; create answer and send back
          if (createAnswer) {
            try {
              const answer = await createAnswer(data.offer);
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
            // fallback: try peer.setRemoteDescription + createAnswer locally (if peer is raw RTCPeerConnection)
            try {
              if (peer && typeof peer.setRemoteDescription === "function") {
                await peer.setRemoteDescription(data.offer);
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
              console.error("Fallback incoming-call handling failed:", err);
            }
          }
        }

        if (data.action === "call-accepted") {
          if (data.answer && setRemoteAnswer) {
            await setRemoteAnswer(data.answer);
          } else if (
            data.answer &&
            peer &&
            typeof peer.setRemoteDescription === "function"
          ) {
            await peer.setRemoteDescription(data.answer);
          }
        }

        if (data.action === "ice-candidate" && data.candidate) {
          try {
            if (peer && typeof peer.addIceCandidate === "function")
              await peer.addIceCandidate(data.candidate);
          } catch (err) {
            console.warn("Failed to add ICE candidate:", err);
          }
        }

        if (data.type === "SCORE_UPDATE") {
          setScores(data.scores);
        }
      } catch (err) {
        console.error("Failed to parse socket message:", err);
      }
    };

    socket.onclose = () => {
      console.log("Socket closed");
    };

    socket.onerror = (e) => {
      console.error("Socket error", e);
    };

    return () => {
      try {
        socket.close();
      } catch (e) {}
      socketRef.current = null;
    };
  }, [roomId, token, createAnswer, setRemoteAnswer, peer]);

  /* ---------- FETCH CHAT HISTORY ---------- */
  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch(`${BaseUrl}/api/room/chats/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.warn("fetchChats non-ok", res.status);
          return;
        }
        const chatData = await res.json();
        const formatted = (chatData || []).map((c: any) => ({
          speaker: c.speaker || "Unknown",
          text: c.content,
        }));
        setTranscript(formatted);
      } catch (err) {
        console.error("fetchChats error:", err);
      }
    }

    if (roomId && token) fetchChats();
  }, [roomId, token]);

  /* ---------- CLEANUP ---------- */
  useEffect(() => {
    return () => {
      if (myStream) myStream.getTracks().forEach((t) => t.stop());
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- END SESSION ---------- */
  async function handleSessionEnd() {
    try {
      const res = await fetch(`${BaseUrl}/api/room/end/${roomId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = `/analytics?pitch_id=${data.pitch_id}`;
      } else {
        console.error("End session failed:", data);
      }
    } catch (err) {
      console.error("End session error:", err);
    }
  }

  /* ---------- CHAT SEND ---------- */
  function handleChat() {
    if (!chatMessage.trim() || !socketRef.current) return;
    const payload = JSON.stringify({
      action: "send-message",
      roomId,
      user_id: user?.id,
      text: chatMessage,
      speaker: user?.full_name || user?.email || "You",
    });
    socketRef.current.send(payload);
    setChatMessage("");
  }



  /* ---------- UI ---------- */
  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-3 bg-white border-b">
        <div className="flex items-center gap-6">
          <Layout size={20} />
          <span className="font-bold">PitchNest</span>
          <span className="text-red-500 text-sm font-bold">LIVE</span>
          <span>{formatTime(elapsedTime)}</span>
        </div>
        <div className="flex items-center gap-4">
          <MessageSquare onClick={() => setIsChatOpen((s) => !s)} />
          <Bell />
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 grid grid-cols-12 p-6 gap-6">
        {/* LEFT */}
        <div className="col-span-9 flex flex-col gap-6">
          <div className="flex-1 rounded-xl overflow-hidden bg-black relative">
            {slideView ? (
              pitch?.pitch_pdf_url ? (
                <PitchSlides pdfUrl={`${BaseUrl}/${pitch.pitch_pdf_url}`} />
              ) : (
                <div className="text-white p-8">No slides uploaded</div>
              )
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            <button
              onClick={() => setSlideView(!slideView)}
              className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded text-xs flex items-center gap-2"
            >
              <Monitor size={14} />
              <span>Switch</span>
            </button>
          </div>

          {/* TRANSCRIPT */}
          <div className="h-40 bg-white rounded-xl p-4 overflow-auto">
            {transcript.map((msg, i) => (
              <p key={i}>
                <b>{msg.speaker}:</b> {msg.text}
              </p>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="aspect-video bg-black rounded-xl relative">
            <div className="aspect-video bg-black rounded-xl relative">
              {isVideoOn && myStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <VideoOff className="text-white" />
                </div>
              )}

              <div className="absolute bottom-3 left-3 flex gap-3">
                <button
                  onClick={handleCameraToggle}
                  className="p-2 bg-white rounded-full text-black shadow"
                >
                  {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>

                <button
                  onClick={handleMicToggle}
                  className="p-2 bg-white rounded-full text-black shadow"
                >
                  {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 flex gap-2">
              <button
                onClick={handleCameraToggle}
                className="p-2 bg-white rounded-full shadow text-black"
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                onClick={handleMicToggle}
                className="p-2 bg-white rounded-full shadow text-black"
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
            </div>

            <button
              onClick={handleSessionEnd}
              className="absolute bottom-3 right-3 bg-red-500 text-white px-3 py-1 rounded"
            >
              End
            </button>
          </div>

          {/* AI PANEL */}
          <div className="bg-white p-4 rounded-xl">
            {INVESTOR_PERSONAS.map((p) => (
              <div key={p.id} className="mb-4">
                <div className="flex justify-between text-xs">
                  <span>{p.name}</span>
                  <span>{p.sentiment}</span>
                </div>

                <div className="h-1 bg-gray-200 rounded">
                  <div
                    className={`${p.color} h-1 rounded`}
                    style={{ width: p.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CHAT + BOTTOM BAR */}
      <div className="px-6 py-4 bg-white border-t flex items-center gap-4">
        <div className="flex-1 text-sm text-gray-700">
          Live Scoring — Clarity {scores.clarity} • Confidence{" "}
          {scores.confidence} • Market Fit {scores.marketFit}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleChat();
            }}
            placeholder="Send a note to room..."
            className="px-3 py-2 rounded border"
          />
          <button
            onClick={handleChat}
            className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-2"
          >
            <Send /> Send
          </button>
        </div>
      </div>

      {/* Chat Drawer (toggleable) */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-white border-l z-50 flex flex-col">
          <div className="p-3 flex items-center justify-between border-b">
            <h3 className="font-semibold">Questions & Notes</h3>
            <button onClick={() => setIsChatOpen(false)}>
              <X />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {transcript.map((m, idx) => (
              <div key={idx}>
                <div className="text-xs text-gray-500">{m.speaker}</div>
                <div className="p-2 bg-gray-100 rounded mt-1">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChat();
              }}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="Type a note..."
            />
            <button
              onClick={handleChat}
              className="px-3 py-2 rounded bg-blue-600 text-white"
            >
              <Send />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
