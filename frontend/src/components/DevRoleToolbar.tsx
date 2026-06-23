"use client";

import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/dummy-data";

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: "buyer",  label: "Buyer",  color: "bg-blue-600" },
  { value: "seller", label: "Seller", color: "bg-amber-500" },
];

export function DevRoleToolbar() {
  const { role, setRole } = useRole();

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-md px-2 py-1">
      <span className="text-xs text-gray-400 px-1">View as:</span>
      {ROLES.map(({ value, label, color }) => (
        <button
          key={value}
          onClick={() => setRole(value)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            role === value
              ? `${color} text-white shadow-sm`
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
