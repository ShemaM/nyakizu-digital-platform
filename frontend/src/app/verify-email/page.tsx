"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Loading } from "@/components/ui/Loading";
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
        {loading && <Loading size="lg" label="Checking your link…" />}

        {!loading && success && (
          <div className="flex flex-col items-center text-center animate-fade-in-up">
            <span className="flex items-center justify-center w-20 h-20 rounded-full bg-success/12 text-success mb-4">
              <CheckCircle2 size={40} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <p className="text-lg font-black text-text-primary">You’re all set</p>

            <Button asChild className="w-full mt-6">
              <Link href="/login">Go to login</Link>
            </Button>

            <p className="text-sm text-text-muted mt-4">
              Trouble signing in?{" "}
              <Link href="/help" className="font-semibold text-role hover:underline">
                Get help
              </Link>
            </p>
          </div>
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

