import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  apiKey: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  createApiKey: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("buiry_token"),
  );
  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem("buiry_api_key"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user);
          else {
            localStorage.removeItem("buiry_token");
            localStorage.removeItem("buiry_api_key");
            setToken(null);
            setApiKey(null);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Login failed");
    const data = await res.json();
    localStorage.setItem("buiry_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Signup failed");
    const data = await res.json();
    localStorage.setItem("buiry_token", data.token);
    if (data.api_key) {
      localStorage.setItem("buiry_api_key", data.api_key);
      setApiKey(data.api_key);
    }
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("buiry_token");
    localStorage.removeItem("buiry_api_key");
    setToken(null);
    setApiKey(null);
    setUser(null);
  };

  const createApiKey = async (): Promise<string | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/api/auth/key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.api_key) {
        localStorage.setItem("buiry_api_key", data.api_key);
        setApiKey(data.api_key);
        return data.api_key;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, apiKey, loading, login, signup, logout, createApiKey }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
