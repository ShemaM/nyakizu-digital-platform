"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { API_BASE_URL, auth, ApiError } from "@/lib/api";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLayout title="Verifying your email" subtitle="Please wait a moment">{null}</AuthLayout>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();

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

  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResending(true);
    setResendMessage("");
    setResendError("");
    try {
      const message = await auth.resendVerification(resendEmail);
      setResendMessage(message);
    } catch (err) {
      setResendError(err instanceof ApiError ? err.message : "Could not resend the email. Please try again.");
    } finally {
      setResending(false);
    }
  }

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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-info animate-pulse" />
              <p className="text-text-secondary">Verifying your account...</p>
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
              <Button asChild className="flex-1" loading={false}>
                <Link href="/login">Go to login</Link>
              </Button>
            </div>

            <p className="text-sm text-text-muted">
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

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-text-secondary">
                {errorCode === "missing"
                  ? "Open the verification link again from your email."
                  : "Links expire after a while. Enter your email below and we will send you a new one."}
              </p>
            </div>

            {resendMessage ? (
              <Alert variant="success">
                <AlertDescription>{resendMessage}</AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <Input
                  label="Your email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. amani@gmail.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
                {resendError && (
                  <Alert variant="error">
                    <AlertDescription>{resendError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" loading={resending}>
                  {resending ? "Sending…" : "Send me a new link"}
                </Button>
              </form>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1" variant="secondary">
                <Link href="/login">Back to login</Link>
              </Button>
              <Button asChild className="flex-1" variant="outline">
                <Link href="/help">Get help</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

