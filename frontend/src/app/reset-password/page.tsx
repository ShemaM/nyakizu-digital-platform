"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { auth, ApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout title="Reset your password" subtitle="Please wait a moment">{null}</AuthLayout>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const missingLink = !uid || !token;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await auth.confirmPasswordReset(uid, token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Choose a new password for your account." alternate>
      <div className="space-y-4">
        {missingLink ? (
          <>
            <Alert variant="error">
              <AlertDescription>This link is missing some information. Open it again from your email.</AlertDescription>
            </Alert>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </>
        ) : success ? (
          <Alert variant="success">
            <AlertDescription>Password reset. Taking you to sign in…</AlertDescription>
          </Alert>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {error && (
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" loading={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </Button>
            </form>
            <p className="text-sm text-text-muted">
              Link expired?{" "}
              <Link href="/forgot-password" className="font-semibold text-role hover:underline">
                Request a new one
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
