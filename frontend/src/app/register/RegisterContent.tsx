"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { Receipt, Package, Mail, Phone, MapPin, Briefcase, Store, AtSign } from "lucide-react";
import { AuthLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { auth, type RegisterPayload } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type RegisterRole = "buyer" | "seller";

const MIN_PASSWORD_LENGTH = 8;

interface RegisterFormState {
  role: RegisterRole | null;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: string;
  businessType: string;
  shopName: string;
}

const INITIAL_FORM_STATE: RegisterFormState = {
  role: null,
  fullName: "",
  username: "",
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
    username: form.username,
    email: form.email,
    phone: form.phone,
    password: form.password,
    role: form.role as RegisterRole,
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

export function RegisterContent() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          title="Join Nyakizu"
          subtitle="Make an account in a few easy steps."
          footnote="Your information is safe with us"
          hidePanel
        >
          {null}
        </AuthLayout>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role") === "seller" ? "seller" : searchParams.get("role") === "buyer" ? "buyer" : null;

  const [form, setForm] = useState<RegisterFormState>({
    ...INITIAL_FORM_STATE,
    role: preselectedRole,
  });
  const [step, setStep] = useState(preselectedRole ? 2 : 1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = useCallback(
    <K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Buyers only need "your details" then one wrap-up step. Sellers get an
  // extra dedicated step for their shop info before setting a password.
  const totalSteps = form.role === "seller" ? 4 : form.role === "buyer" ? 3 : 4;

  const chooseRole = (role: RegisterRole) => {
    updateField("role", role);
    setError("");
    setStep(2);
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const continueFromDetails = () => {
    if (!form.fullName || !form.username || !form.email || !form.phone) {
      setError("Please fill in every box.");
      return;
    }
    if (!/^[\w.@+-]+$/.test(form.username)) {
      setError("Username can only have letters, numbers, and . _ - @ +");
      return;
    }
    setError("");
    setStep(3);
  };

  const continueFromShop = () => {
    if (!form.shopName || !form.location) {
      setError("Please fill in your shop name and location.");
      return;
    }
    setError("");
    setStep(4);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (form.role === "buyer" && (!form.location || !form.businessType)) {
        setError("Please fill in your location and business type.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }

      if (form.password.length < MIN_PASSWORD_LENGTH) {
        setError(`Your password must have at least ${MIN_PASSWORD_LENGTH} letters or numbers.`);
        return;
      }

      setLoading(true);

      try {
        const payload = buildRegisterPayload(form);
        await auth.register(payload);
        setSuccess("Your account is ready! Open your email and tap the link. Then sign in.");
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not make your account. Please try again.");
        setLoading(false);
      }
    },
    [form]
  );

  const stepLabel = useMemo(() => {
    if (step === 1) return "Who are you?";
    if (step === 2) return "Your details";
    if (step === 3 && form.role === "seller") return "Your shop";
    return "Set a password";
  }, [step, form.role]);

  if (success) {
    return (
      <AuthLayout
        title="Join Nyakizu"
        subtitle="Make an account in a few easy steps."
        hidePanel
      >
        <Alert variant="success" role="status">
          <AlertTitle>Almost done!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
        <Button className="w-full mt-4" size="lg" asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join Nyakizu"
      subtitle="Make an account in a few easy steps."
      hidePanel
    >
      {/* Progress bar + step label */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-brand-gold" : "bg-dark-secondary"}`}
            />
          ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Step {step} of {totalSteps} &mdash; {stepLabel}
        </p>
      </div>

      {error && (
        <Alert variant="error" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1 — role */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-gold/20 bg-brand-gold-subtle p-4 text-sm text-text-secondary">
            First, tell us who you are.
          </div>

          <button
            type="button"
            onClick={() => chooseRole("buyer")}
            className="w-full text-left rounded-xl border border-dark-accent p-5 hover:border-brand-gold hover:bg-brand-gold-subtle/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Receipt className="w-5 h-5 text-brand-gold-dark shrink-0" aria-hidden="true" />
              <span className="font-bold text-text-primary">I am a Buyer</span>
              <span className="ml-auto text-xs font-bold uppercase tracking-wide text-brand-gold-dark border border-brand-gold/40 rounded-full px-2 py-0.5 shrink-0">
                2 steps
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              I buy things to sell in my own shop.
            </p>
          </button>

          <button
            type="button"
            onClick={() => chooseRole("seller")}
            className="w-full text-left rounded-xl border border-dark-accent p-5 hover:border-brand-gold hover:bg-brand-gold-subtle/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Package className="w-5 h-5 text-brand-gold-dark shrink-0" aria-hidden="true" />
              <span className="font-bold text-text-primary">I am a Seller</span>
              <span className="ml-auto text-xs font-bold uppercase tracking-wide text-brand-gold-dark border border-brand-gold/40 rounded-full px-2 py-0.5 shrink-0">
                3 steps
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              I sell many things to buyers. I track my orders and my money.
            </p>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-accent" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white font-bold uppercase tracking-widest text-text-muted">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <GoogleButton label="Sign up with Google" />
            <p className="text-center text-xs text-text-muted">
              Google sign up makes a buyer account. To sell, tap &quot;I am a Seller&quot; above.
            </p>
          </div>
        </div>
      )}

      {/* Step 2 — your details (both roles) */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Tell us about you.</p>

          <Input
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Amani Uwimana"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />
          <Input
            label="Username"
            type="text"
            autoComplete="username"
            endAdornment={<AtSign className="w-4 h-4" />}
            placeholder="e.g. amani_uwimana"
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            endAdornment={<Mail className="w-4 h-4" />}
            placeholder="e.g. amani@gmail.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            endAdornment={<Phone className="w-4 h-4" />}
            placeholder="e.g. +254 712 345 678"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="border-2 border-text-primary text-text-primary font-bold" onClick={goBack}>
              Back
            </Button>
            <Button
              type="button"
              className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold"
              size="lg"
              onClick={continueFromDetails}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 (seller) — shop info */}
      {step === 3 && form.role === "seller" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Tell us about your shop.</p>

          <Input
            label="Shop Name"
            type="text"
            endAdornment={<Store className="w-4 h-4" />}
            placeholder="e.g. Amani Phone Accessories"
            value={form.shopName}
            onChange={(e) => updateField("shopName", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />
          <Input
            label="Location"
            type="text"
            autoComplete="address-level2"
            endAdornment={<MapPin className="w-4 h-4" />}
            placeholder="e.g. Nairobi, Shop B12"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="border-2 border-text-primary text-text-primary font-bold" onClick={goBack}>
              Back
            </Button>
            <Button
              type="button"
              className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold"
              size="lg"
              onClick={continueFromShop}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Final step — buyer: business info + password. seller: password only. */}
      {((step === 3 && form.role === "buyer") || (step === 4 && form.role === "seller")) && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <p className="text-sm text-text-secondary">
            {form.role === "buyer" ? "Tell us about your business. Then make a password." : "Last step. Make a password to keep your account safe."}
          </p>

          {form.role === "buyer" && (
            <>
              <Input
                label="Location"
                type="text"
                autoComplete="address-level2"
                endAdornment={<MapPin className="w-4 h-4" />}
                placeholder="e.g. Nairobi"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="h-12 bg-dark-secondary border-dark-accent text-base"
                required
              />
              <Input
                label="Business Type"
                type="text"
                endAdornment={<Briefcase className="w-4 h-4" />}
                placeholder="e.g. Phone accessories reseller"
                value={form.businessType}
                onChange={(e) => updateField("businessType", e.target.value)}
                className="h-12 bg-dark-secondary border-dark-accent text-base"
                required
              />
            </>
          )}

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
            placeholder={`At least ${MIN_PASSWORD_LENGTH} letters or numbers`}
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="pointer-events-auto text-xs font-bold uppercase tracking-wide text-text-muted hover:text-text-primary"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            }
            placeholder="Type your password again"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            className="h-12 bg-dark-secondary border-dark-accent text-base"
            required
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="border-2 border-text-primary text-text-primary font-bold" onClick={goBack} disabled={loading}>
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold"
              size="lg"
              loading={loading}
            >
              {loading ? "Creating account…" : "Create my account"}
            </Button>
          </div>
        </form>
      )}

      <div className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-gold-dark hover:text-brand-gold underline underline-offset-4 decoration-dotted">
          Sign in
        </Link>
      </div>
      <p className="text-center text-sm text-text-muted">
        Need help?{" "}
        <Link href="/help" className="font-semibold text-brand-gold-dark hover:text-brand-gold underline underline-offset-4 decoration-dotted">
          Get help
        </Link>
      </p>
    </AuthLayout>
  );
}
