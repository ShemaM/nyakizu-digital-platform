"use client";

import { Suspense, useEffect, useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { auth, DJANGO_ADMIN_URL } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function LoginContent() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Sign in" subtitle="Access your Nyakizu account." footnote="Your information is safe with us" hidePanel>
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
  const [takingLonger, setTakingLonger] = useState(false);
  const searchParams = useSearchParams();
  const { user, setSessionUser } = useAuth();

  const nextUrl = searchParams.get("next") || "";
  // "/" alone isn't enough — "//evil.example" and "/\evil.example" both pass
  // that check yet browsers treat them as off-site (protocol-relative) URLs.
  const isSafeRedirect = (path: string) =>
    path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");

  // If already logged in, navigate straight to their role dashboard
  useEffect(() => {
    if (user) {
      const roleHome = user.role === "seller" ? "/seller/dashboard" : user.role === "admin" ? DJANGO_ADMIN_URL : "/buyer";
      const redirectTo = isSafeRedirect(nextUrl) ? nextUrl : roleHome;
      window.location.href = redirectTo;
    }
  }, [user, nextUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTakingLonger(false);

    // If the backend is waking up (e.g. Render free-tier cold start), reassure the user
    const timer = setTimeout(() => {
      setTakingLonger(true);
    }, 2500);

    try {
      const loggedInUser = await auth.login(identifier, password);
      clearTimeout(timer);
      setSessionUser(loggedInUser);

      if (loggedInUser.role === "admin") {
        window.location.href = DJANGO_ADMIN_URL;
        return;
      }

      const roleHome = loggedInUser.role === "seller" ? "/seller/dashboard" : "/buyer";
      const redirectTo = isSafeRedirect(nextUrl) ? nextUrl : roleHome;

      // Direct document navigation guarantees the newly minted session cookie is
      // attached, avoids stale Next.js client router cache from unauthenticated prefetch,
      // and completely prevents soft-navigation freezes.
      window.location.href = redirectTo;
    } catch (err) {
      clearTimeout(timer);
      setTakingLonger(false);
      setError(err instanceof Error ? err.message : "Sign in did not work. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Access your Nyakizu account." footnote="Secure sign in · Your data stays private" hidePanel>
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

        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-xs font-bold uppercase tracking-wide text-text-muted hover:text-text-primary"
          >
            Forgot password?
          </Link>
        </div>

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
        {loading && takingLonger && (
          <p className="text-center text-xs text-text-muted animate-pulse pt-1">
            Connecting to server, please hold on…
          </p>
        )}
      </form>

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
        Need help?{" "}
        <Link href="/help" className="font-semibold text-brand-gold-dark hover:text-brand-gold underline underline-offset-4 decoration-dotted">
          Get help
        </Link>
      </p>
    </AuthLayout>
  );
}
