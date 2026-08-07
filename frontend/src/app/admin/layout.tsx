"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-primary">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-primary px-6">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <ShieldOff size={24} className="text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-text-primary">Access restricted</h1>
          <p className="text-sm text-text-muted">
            Only admin staff can see this page.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 text-sm font-medium text-info hover:underline"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
