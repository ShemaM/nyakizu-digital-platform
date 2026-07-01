"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { auth } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.login(identifier, password);
      await refetch();
      router.push("/buyer/suppliers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your trades">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          label="Username or Email"
          type="text"
          placeholder="Enter your username or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <div className="text-right">
          <Link
            href="#"
            className="text-sm text-brand-gold hover:text-brand-gold-light transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="md" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-dark-primary text-slate-400">New to Nyakizu?</span>
        </div>
      </div>

      <Button variant="outline" size="md" className="w-full" asChild>
        <Link href="/register">Create an account</Link>
      </Button>
    </AuthLayout>
  );
}