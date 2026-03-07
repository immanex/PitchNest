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
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
}

const PeerContext = createContext<PeerContextType | null>(null);

export const PeerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const peer = useMemo(() => new RTCPeerConnection(), []);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    peer.onconnectionstatechange = () => {
      setIsConnected(peer.connectionState === "connected");
    };
  }, [peer]);

  async function createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return peer.localDescription!;
  }

  async function createAnswer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    return peer.localDescription!;
  }

  async function setRemoteAnswer(
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  }

  const contextValue: PeerContextType = {
    peer,
    isConnected,
    createOffer,
    createAnswer,
    setRemoteAnswer,
  };

  return (
    <PeerContext.Provider value={contextValue}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => useContext(PeerContext);