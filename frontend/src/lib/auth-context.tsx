"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { auth } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = auth.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      // In a real app, you'd fetch user data from an API
      // For now, we'll simulate with localStorage
      const userData = localStorage.getItem("user_data");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Failed to refetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
    localStorage.removeItem("user_data");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}