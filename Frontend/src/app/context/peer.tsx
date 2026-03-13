import React, {
  createContext,
  ReactNode,
  useMemo,
  useContext,
  useState,
  useEffect,
} from "react";

interface PeerContextType {
  peer: RTCPeerConnection;
  isConnected: boolean;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescriptionInit,
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
}

const PeerContext = createContext<PeerContextType | null>(null);

export const PeerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // ✅ FIX: Create peer connection with proper config
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      }),
    [],
  );

  // ✅ FIX: Monitor connection states
  useEffect(() => {
    const onConnectionStateChange = () => {
      console.log("🔗 Connection State:", peer.connectionState);
    };

    const onIceConnectionStateChange = () => {
      console.log("🧊 ICE Connection State:", peer.iceConnectionState);
    };

    const onSignalingStateChange = () => {
      console.log("📡 Signaling State:", peer.signalingState);
    };
    const onIceGatheringStateChange = () => {
      console.log("❄️ ICE Gathering:", peer.iceGatheringState);
    };

    const onTrack = (e: RTCTrackEvent) => {
      console.log("🎥 Track received:", e.track.kind);
    };

    peer.addEventListener("connectionstatechange", onConnectionStateChange);
    peer.addEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChange,
    );
    peer.addEventListener("icegatheringstatechange", onIceGatheringStateChange);
    peer.addEventListener("signalingstatechange", onSignalingStateChange);
    peer.addEventListener("track", onTrack);

    return () => {
      peer.removeEventListener(
        "connectionstatechange",
        onConnectionStateChange,
      );
      peer.removeEventListener(
        "iceconnectionstatechange",
        onIceConnectionStateChange,
      );
      peer.removeEventListener(
        "icegatheringstatechange",
        onIceGatheringStateChange,
      );
      peer.removeEventListener("signalingstatechange", onSignalingStateChange);
      peer.removeEventListener("track", onTrack);
    };
  }, [peer]);

  const [isConnected, setIsConnected] = useState(false);

  // ✅ FIX: Track connection state properly
  useEffect(() => {
    const handleConnectionStateChange = () => {
      setIsConnected(peer.connectionState === "connected");
    };

    peer.addEventListener("connectionstatechange", handleConnectionStateChange);

    return () => {
      peer.removeEventListener(
        "connectionstatechange",
        handleConnectionStateChange,
      );
    };
  }, [peer]);

  // ✅ FIX: Proper offer creation
  async function createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peer.setLocalDescription(offer);

      if (!peer.localDescription) {
        throw new Error("Failed to set local description");
      }

      return peer.localDescription;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  // ✅ FIX: Proper answer creation with RTCSessionDescription wrapper
  async function createAnswer(
    offer: RTCSessionDescriptionInit,
  ): Promise<RTCSessionDescriptionInit> {
    try {
      // ✅ CRITICAL FIX: Wrap in RTCSessionDescription
      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peer.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.setLocalDescription(answer);

      if (!peer.localDescription) {
        throw new Error("Failed to set local description");
      }

      return peer.localDescription;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  }

  // ✅ FIX: Proper answer setting with RTCSessionDescription wrapper
  async function setRemoteAnswer(
    answer: RTCSessionDescriptionInit,
  ): Promise<void> {
    try {
      // ✅ CRITICAL FIX: Wrap in RTCSessionDescription
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error setting remote answer:", error);
      throw error;
    }
  }

  const contextValue: PeerContextType = {
    peer,
    isConnected,
    createOffer,
    createAnswer,
    setRemoteAnswer,
  };

  return (
    <PeerContext.Provider value={contextValue}>{children}</PeerContext.Provider>
  );
};

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within PeerProvider");
  }
  return context;
};
