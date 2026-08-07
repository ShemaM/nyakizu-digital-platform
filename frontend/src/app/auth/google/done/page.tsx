"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/lib/auth-context";
import { DJANGO_ADMIN_URL } from "@/lib/api";

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
      if (user.role === "admin") {
        // Different origin — a client-side router.replace can't take them there.
        window.location.href = DJANGO_ADMIN_URL;
        return;
      }
      const home = user.role === "seller" ? "/seller/dashboard" : "/buyer";
      router.replace(home);
    });
  }, [refetch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-primary">
      <LoadingScreen />
    </div>
  );
}
