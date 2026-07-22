"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { auth, type User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await auth.me();
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      // ignore logout errors
    }
    setUser(null);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, refetch, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
