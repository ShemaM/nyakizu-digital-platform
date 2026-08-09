"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { auth, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const msg = await auth.requestPasswordReset(email);
      setMessage(msg);
    } catch (err) {
      // The backend always returns a generic success message regardless of
      // whether the email exists (prevents account enumeration) — an error
      // here means something actually went wrong (rate limit, network).
      setError(err instanceof ApiError ? err.message : "Could not send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      alternate
    >
      <div className="space-y-4">
        {message ? (
          <>
            <Alert variant="success">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <p className="text-sm text-text-muted">
              The link expires in 30 minutes. Didn&apos;t get it? Check your spam folder, or try again.
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your email"
              type="email"
              autoComplete="email"
              placeholder="e.g. amani@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Sending…" : "Send reset link"}
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
      </div>
    </AuthLayout>
  );
}
