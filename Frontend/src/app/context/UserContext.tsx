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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [rooms, setRooms] = useState<any | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched user:", data);
          let rooms = await fetch("http://localhost:8000/api/room/rooms", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          rooms = await rooms.json();
          console.log("Fetched rooms:", rooms);
          setRooms(rooms);
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();
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
    <UserContext.Provider value={{ user, token, login, logout, rooms }}>
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
