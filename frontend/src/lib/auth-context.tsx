"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth as authApi, type User } from "./api";


type Role = "buyer" | "seller" | "admin";

const ROLE_HOME: Record<Role, string> = {
  buyer:  "/buyer/suppliers",
  seller: "/seller/dashboard",
  admin:  "/admin/verify",
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  role: null,
  login: async () => {},
  logout: async () => {},
});


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  // Check active session on mount.
  // isInitializing prevents UI from using a fallback role during the first render.
  useEffect(() => {
    setIsInitializing(true);
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => {
        setLoading(false);
        setIsInitializing(false);
      });
  }, []);


  async function login(identifier: string, password: string) {
    const { user } = await authApi.login(identifier, password);
    setUser(user);
    router.push(ROLE_HOME[user.role as Role] ?? "/");
  }

  async function logout() {
    await authApi.logout().catch(() => {});
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || isInitializing,
        isAuthenticated: !!user,
        role: user?.role as Role | null ?? null,
        login,
        logout,
        // isInitializing intentionally not exposed yet; consumers should rely on isLoading
      } as AuthContextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}

/** Backwards-compat alias used by BottomNav and other components. */
export function useRole() {
  const { role } = useAuth();
  return { role: role ?? "buyer" };
}
