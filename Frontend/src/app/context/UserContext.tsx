/// <reference types="vite/client" />
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type User = {
  id: string;
  email: string;
  full_name?: string;
};

type UserContextType = {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  rooms: any | null;
  refetch: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [rooms, setRooms] = useState<any | null>(null);
 const BaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

  const fetchUserAndRooms = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BaseUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        let roomsRes = await fetch(`${BaseUrl}/api/room/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        roomsRes = await roomsRes.json();
        setRooms(roomsRes);
        setUser(data);
      } else {
        if (response.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
        }
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUserAndRooms();
  }, [token]);

  // Refetch user and rooms when window regains focus so pages show live data
  useEffect(() => {
    const onFocus = () => {
      if (token) fetchUserAndRooms();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [token]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, rooms, refetch: fetchUserAndRooms }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};
