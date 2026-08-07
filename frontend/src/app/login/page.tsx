"use client";

import { Suspense, useEffect, useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { auth } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Welcome back" subtitle="Sign in to manage your trades." footnote="Secure sign in · Your data stays private">
          {null}
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSessionUser } = useAuth();

  const nextUrl = searchParams.get("next") || "";

  // Set when the Google callback page couldn't find a signed-in session.
  useEffect(() => {
    if (searchParams.get("error") === "google") {
      setError("Google sign-in did not finish. Please try again.");
    }
  }, [searchParams]);

  // Warm up the likely post-login destinations so the redirect after a
  // successful sign-in doesn't sit on a fresh route compile/fetch — most of
  // the perceived "slowness" here is that hop, not the login request itself.
  useEffect(() => {
    router.prefetch("/buyer");
    router.prefetch("/seller/dashboard");
    router.prefetch("/admin/verify");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await auth.login(identifier, password);
      setSessionUser(user);

      const roleHome =
        user.role === "seller"
          ? "/seller/dashboard"
          : user.role === "admin"
          ? "/admin/verify"
          : "/buyer";

      const redirectTo =
        nextUrl && nextUrl.startsWith("/") ? nextUrl : roleHome;

      router.push(redirectTo);
      // Deliberately leave `loading` true here — we're navigating away, and
      // keeping the button in its loading state avoids a flash of "Sign In"
      // re-enabling for the moment before the next route finishes rendering.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your trades." footnote="Secure sign in · Your data stays private">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          label="Username or Email"
          type="text"
          endAdornment={<Mail className="w-4 h-4" />}
          placeholder="e.g. amani.phones"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
          required
          className="h-12 bg-dark-secondary border-dark-accent text-base"
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="pointer-events-auto text-xs font-bold uppercase tracking-wide text-text-muted hover:text-text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          className="h-12 bg-dark-secondary border-dark-accent text-base"
        />

        <Button
          type="submit"
          className="w-full bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold"
          size="lg"
          loading={loading}
        >
          {loading ? (
            "Signing in…"
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-accent" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white font-bold uppercase tracking-widest text-text-muted">or</span>
        </div>
      </div>

      <GoogleButton label="Sign in with Google" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-accent" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white font-bold uppercase tracking-widest text-brand-gold-dark">New to Nyakizu?</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-2 border-text-primary text-text-primary font-bold hover:bg-dark-secondary"
        asChild
      >
        <Link href="/register">Create an account</Link>
      </Button>

      <p className="text-center text-sm text-text-muted">
        Trouble signing in?{" "}
        <Link href="/help" className="font-semibold text-brand-gold-dark hover:text-brand-gold underline underline-offset-4 decoration-dotted">
          Get help
        </Link>
      </p>
    </AuthLayout>
  );
}
