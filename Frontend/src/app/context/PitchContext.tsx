import React, { createContext, useContext, useState, useEffect } from "react";

type Pitch = {
  id: string;
  pitch_name: string;
  pitch_pdf_url?: string;
  industry?: string;
  startup_type?: string;
  experience_level?: string;
  mode?: string;
  investor_archetype?: string;
};

type PitchContextType = {
  pitch: Pitch | null;
  loading: boolean;
  fetchPitch: (roomId: string) => Promise<void>;
};

const PitchContext = createContext<PitchContextType | null>(null);

export const PitchProvider = ({ children }: { children: React.ReactNode }) => {
  const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPitch = async (pitchId: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${BaseUrl}/api/dashboard/pitches/${pitchId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log(data)

      setPitch(data);

    } catch (error) {
      console.error("Error fetching pitch:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PitchContext.Provider value={{ pitch, loading, fetchPitch }}>
      {children}
    </PitchContext.Provider>
  );
};

export const usePitch = () => {
  const context = useContext(PitchContext);

  if (!context) {
    throw new Error("usePitch must be used within PitchProvider");
  }

  return context;
};