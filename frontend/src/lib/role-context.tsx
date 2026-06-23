"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "./dummy-data";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: "buyer",
  setRole: () => {},
});

const ROLE_HOME: Record<Role, string> = {
  buyer: "/buyer/suppliers",
  seller: "/seller/dashboard",
  admin: "/admin/verify",
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("buyer");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("dev_role") as Role | null;
    if (stored) setRoleState(stored);
  }, []);

  function setRole(r: Role) {
    localStorage.setItem("dev_role", r);
    setRoleState(r);
    router.push(ROLE_HOME[r]);
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
