"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AuthLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { auth, type RegisterPayload } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterRole = "buyer" | "seller";

interface RoleOption {
  value: RegisterRole;
  label: string;
  description: string;
}

const ROLE_OPTIONS: readonly RoleOption[] = [
  { value: "buyer", label: "Buyer", description: "Mnunuzi" },
  { value: "seller", label: "Seller", description: "Muuzaji" },
];

const MIN_PASSWORD_LENGTH = 6;
const REDIRECT_DELAY_MS = 3000;

interface RegisterFormState {
  role: RegisterRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: string;
  businessType: string;
  shopName: string;
}

const INITIAL_FORM_STATE: RegisterFormState = {
  role: "buyer",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  location: "",
  businessType: "",
  shopName: "",
};

function buildRegisterPayload(form: RegisterFormState): RegisterPayload {
  const base = {
    full_name: form.fullName,
    email: form.email,
    phone: form.phone,
    password: form.password,
    role: form.role,
    location: form.location,
  };

  if (form.role === "buyer") {
    return {
      ...base,
      business_type: form.businessType,
      main_supplier: "",
    };
  }

  return {
    ...base,
    shop_name: form.shopName,
    shop_location: form.location,
    categories: [],
  };
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormState>(INITIAL_FORM_STATE);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending redirect if the component unmounts before it fires
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const updateField = useCallback(
    <K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (form.password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        return;
      }

      setLoading(true);

      try {
        const payload = buildRegisterPayload(form);
        await auth.register(payload);

        setSuccess(
          "Account created! Please check your email to verify your account before signing in."
        );

        redirectTimeoutRef.current = setTimeout(() => {
          router.push("/login");
        }, REDIRECT_DELAY_MS);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [form, router]
  );

  return (
    <AuthLayout title="Join Nyakizu" subtitle="Create your account and start trading" alternate>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <Alert variant="error" role="alert">
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" role="status">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <span className="text-label" id="role-label">
            I am a
          </span>
          <div
            role="radiogroup"
            aria-labelledby="role-label"
            className="grid grid-cols-2 gap-3"
          >
            {ROLE_OPTIONS.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={form.role === value}
                onClick={() => updateField("role", value)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-center ${
                  form.role === value
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
          autoComplete="name"
          placeholder="Your full name"
          value={form.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          placeholder="+254 7XX XXX XXX"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Location"
          type="text"
          autoComplete="address-level2"
          placeholder="Where do you trade?"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          disabled={loading}
          required
        />

        {form.role === "buyer" && (
          <Input
            label="Business Type"
            type="text"
            placeholder="e.g., Reseller, Hawker"
            value={form.businessType}
            onChange={(e) => updateField("businessType", e.target.value)}
            disabled={loading}
            required
          />
        )}

        {form.role === "seller" && (
          <Input
            label="Shop Name"
            type="text"
            placeholder="Your business name"
            value={form.shopName}
            onChange={(e) => updateField("shopName", e.target.value)}
            disabled={loading}
            required
          />
        )}

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
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