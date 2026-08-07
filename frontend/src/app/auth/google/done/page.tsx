"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/lib/auth-context";

/**
 * Where Django's LOGIN_REDIRECT_URL lands after a Google sign-in.
 * The session cookie is already set on the backend origin — we just look up
 * who signed in and send them to the right dashboard.
 */
export default function GoogleDonePage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // StrictMode double-mount guard
    startedRef.current = true;

    refetch().then((user) => {
      if (!user) {
        router.replace("/login?error=google");
        return;
      }
      const home =
        user.role === "seller"
          ? "/seller/dashboard"
          : user.role === "admin"
          ? "/admin/verify"
          : "/buyer";
      router.replace(home);
    });
  }, [refetch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-primary">
      <LoadingScreen />
    </div>
  );
}
