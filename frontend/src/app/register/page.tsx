"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { auth, type RegisterPayload } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type RegisterRole = "buyer" | "seller";

export default function RegisterPage() {
  const [role, setRole] = useState<RegisterRole>("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const payload: RegisterPayload = {
        full_name: fullName,
        email,
        phone,
        password,
        role,
        location,
        ...(role === "buyer" && {
          business_type: businessType,
          main_supplier: "",
        }),
        ...(role === "seller" && {
          shop_name: shopName,
          shop_location: location,
          categories: [],
        }),
      };

      await auth.register(payload);
      await refetch();
      router.push(role === "buyer" ? "/buyer/suppliers" : "/seller/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Join Nyakizu" subtitle="Create your account and start trading" alternate>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error">
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-label">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "buyer" as const, label: "Buyer", description: "Mnunuzi" },
              { value: "seller" as const, label: "Seller", description: "Muuzaji" },
            ].map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  role === value
                    ? "border-brand-gold bg-brand-gold/5"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="font-semibold text-white">{label}</div>
                <div className="text-xs text-slate-400">{description}</div>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Full Name"
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+254 7XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Location"
          type="text"
          placeholder="Where do you trade?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loading}
          required
        />

        {role === "buyer" && (
          <Input
            label="Business Type"
            type="text"
            placeholder="e.g., Reseller, Hawker"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            disabled={loading}
            required
          />
        )}

        {role === "seller" && (
          <Input
            label="Shop Name"
            type="text"
            placeholder="Your business name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            disabled={loading}
            required
          />
        )}

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          required
        />

        <Button type="submit" size="md" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-gold hover:text-brand-gold-light transition-colors">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}