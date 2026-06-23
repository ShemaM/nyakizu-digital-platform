"use client";

import { useRole } from "@/lib/role-context";
import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = useRole();

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <ShieldOff size={24} className="text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Access restricted</h1>
          <p className="text-sm text-gray-500">
            This area is only accessible to platform administrators.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 text-sm font-medium text-blue-600 hover:underline"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
