"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { auth, primeCsrf, type User } from "@/lib/api";
import { offlineDB } from "@/lib/offline-db";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSessionUser: (user: User) => void;
  refetch: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSessionUser = useCallback((userData: User) => {
    setUser(userData);
    setIsLoading(false);
  }, []);

  const refetch = useCallback(async () => {
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
    setIsLoading(true);
    try {
      await auth.logout();
    } catch {
      // ignore runtime logout errors safely
    } finally {
      try {
        await offlineDB.clearAll();
      } catch {
        // best-effort — IndexedDB can be unavailable (private browsing, etc.)
      }
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fire-and-forget: primes the csrftoken cookie so it's already present
    // by the time the user submits anything that mutates state (login,
    // order actions, ...). Independent of refetch()'s own session check.
    void primeCsrf();
    refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, setSessionUser, refetch, logout }}
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
