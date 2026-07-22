"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { API_BASE_URL } from "@/lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";

  const endpoint = useMemo(() => {
    // Backend route is GET /api/accounts/verify-email/?token=<token>
    // Use explicit absolute URL to avoid any proxy/host mismatches.
    return `${API_BASE_URL}/accounts/verify-email/`;
  }, []);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [errorCode, setErrorCode] = useState<"invalid" | "missing" | "unknown">("unknown");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      setLoading(true);
      setError("");
      setSuccess(false);

      if (!token) {
        setErrorCode("missing");
        setError("Missing verification token.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${endpoint}?token=${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErrorCode("invalid");
          setError(data?.error || "Invalid or expired verification link.");
          setLoading(false);
          return;
        }

        if (!cancelled) {
          setSuccess(true);
          setError("");
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErrorCode("unknown");
          setError("Verification failed. Please try again.");
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [endpoint, token]);

  const title = success ? "Email verified" : "Verify your email";
  const subtitle = success
    ? "Your Nyakizu account is now ready to use."
    : "We’ll confirm your verification link.";

  return (
    <AuthLayout title={title} subtitle={subtitle} alternate>
      <div className="space-y-4">
        {loading && (
          <div className="rounded-lg border border-slate-800 bg-dark-primary/50 p-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-brand-gold animate-pulse" />
              <p className="text-slate-200">Verifying your account...</p>
            </div>
          </div>
        )}

        {!loading && success && (
          <>
            <Alert variant="success">
              <AlertDescription>
                Your email has been verified successfully. You can now sign in.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="md" className="flex-1" loading={false}>
                <Link href="/login">Go to login</Link>
              </Button>
            </div>

            <p className="text-sm text-slate-400">
              If you can’t access your account, contact support.
            </p>
          </>
        )}

        {!loading && !success && (
          <>
            <Alert variant="error">
              <AlertDescription>
                {error || "Invalid or expired verification link."}
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border border-slate-800 bg-dark-primary/50 p-4">
              <p className="text-sm text-slate-400">
                {errorCode === "missing"
                  ? "Open the verification link again from your email."
                  : "Request a new verification email to get a fresh link."}
              </p>
            </div>

            {/*
              No backend endpoint for requesting a new verification email was found in the provided code.
              Keep UX: redirect to register to start a fresh registration flow.
            */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="md"
                className="flex-1"
                variant="outline"
                onClick={() => router.push("/register")}
              >
                Request new email
              </Button>
              <Button asChild size="md" className="flex-1" variant="secondary">
                <Link href="/login">Back to login</Link>
              </Button>
            </div>

            <p className="text-sm text-slate-400">
              For security, tokens expire after a short period.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

