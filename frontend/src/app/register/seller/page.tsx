"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, Store } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/api";
import { cn } from "@/lib/cn";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

type Step = 1 | 2 | "done";

const initial = {
  name: "",
  email: "",
  phone: "",
  password: "",
  shopName: "",
  shopLocation: "",
  categories: [] as string[],
};

export default function RegisterSellerPage() {
  const uid = useId();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState(initial);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patch = (next: Partial<typeof initial>) => setForm((value) => ({ ...value, ...next }));

  function validateAccount() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!form.email.includes("@")) next.email = "Enter a valid email.";
    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStore() {
    const next: Record<string, string> = {};
    if (!form.shopName.trim()) next.shopName = "Enter your store name.";
    if (!form.shopLocation.trim()) next.shopLocation = "Enter your store location.";
    if (!form.categories.length) next.categories = "Select at least one category.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    setLoading(true);
    setApiErr("");
    try {
      const res = await auth.register({
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "seller",
        shop_name: form.shopName,
        shop_location: form.shopLocation,
        categories: form.categories,
      });

      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seller_verification",
          email: form.email,
          name: form.name,
          shopName: form.shopName,
          token: res.verification_token ?? "",
        }),
      }).catch(() => {});

      setStep("done");
    } catch (err) {
      setApiErr(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Nyakizu home">
            <Logo />
          </Link>
          <Link href="/login" className="text-sm font-black text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="rounded-lg border border-line bg-ink p-6 text-white shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10">
            <Store size={22} />
          </div>
          <h1 className="mt-6 max-w-2xl text-3xl font-black tracking-normal">
            Register a verified wholesale store.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Seller accounts are reviewed before products are shown to buyers.
            This protects the trust-based supplier network.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <Progress active={step === 1} done={step === 2 || step === "done"} label="Account details" />
            <Progress active={step === 2} done={step === "done"} label="Store profile" />
            <Progress active={step === "done"} done={step === "done"} label="Email verification" />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          {step === "done" ? (
            <Done shopName={form.shopName} email={form.email} />
          ) : (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (step === 1 && validateAccount()) setStep(2);
                if (step === 2 && validateStore()) submit();
              }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-brand">
                  Step {step} of 2
                </p>
                <h2 className="mt-1 text-xl font-black text-ink">
                  {step === 1 ? "Your account" : "Your store"}
                </h2>
              </div>

              {apiErr ? <Alert message={apiErr} /> : null}

              {step === 1 ? (
                <>
                  <Input id={`${uid}-name`} label="Full name" value={form.name} onChange={(event) => patch({ name: event.target.value })} error={errors.name} />
                  <Input id={`${uid}-email`} label="Email address" type="email" value={form.email} onChange={(event) => patch({ email: event.target.value })} error={errors.email} hint="A verification link will be sent here." />
                  <Input id={`${uid}-phone`} label="Phone number" type="tel" value={form.phone} onChange={(event) => patch({ phone: event.target.value })} error={errors.phone} />
                  <Input
                    id={`${uid}-password`}
                    label="Password"
                    type={show ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => patch({ password: event.target.value })}
                    error={errors.password}
                    trailing={
                      <button type="button" onClick={() => setShow((value) => !value)} className="text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  <Button type="submit" className="w-full">Continue</Button>
                </>
              ) : (
                <>
                  <Input id={`${uid}-store`} label="Store name" value={form.shopName} onChange={(event) => patch({ shopName: event.target.value })} error={errors.shopName} />
                  <Input id={`${uid}-location`} label="Store location" value={form.shopLocation} onChange={(event) => patch({ shopLocation: event.target.value })} error={errors.shopLocation} />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">Product categories</span>
                      {errors.categories ? <span className="text-xs font-bold text-danger">{errors.categories}</span> : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRODUCT_CATEGORIES.map((category) => {
                        const selected = form.categories.includes(category);
                        return (
                          <button
                            key={category}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              patch({
                                categories: selected
                                  ? form.categories.filter((item) => item !== category)
                                  : [...form.categories, category],
                              })
                            }
                            className={cn(
                              "min-h-11 rounded-md border px-3 text-left text-xs font-bold transition",
                              selected
                                ? "border-brand bg-brand text-white"
                                : "border-line bg-white text-body hover:border-brand hover:text-brand",
                            )}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="grid h-11 w-11 place-items-center rounded-md border border-line bg-white text-body hover:text-ink"
                      aria-label="Back"
                    >
                      <ArrowLeft size={17} />
                    </button>
                    <Button type="submit" loading={loading}>Submit for review</Button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Progress({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("grid h-7 w-7 place-items-center rounded-md border text-xs font-black", done ? "border-teal-200 bg-teal-200 text-ink" : active ? "border-white bg-white text-ink" : "border-white/20 text-slate-400")}>
        {done ? <Check size={14} /> : null}
      </span>
      <span className={cn("font-bold", active || done ? "text-white" : "text-slate-400")}>{label}</span>
    </div>
  );
}

function Done({ shopName, email }: { shopName: string; email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-emerald-50 text-brand">
        <Check size={25} />
      </div>
      <h2 className="mt-5 text-xl font-black text-ink">Application submitted</h2>
      <p className="mt-2 text-sm leading-6 text-body">
        {shopName} has been sent for review. Verify {email}, then wait for admin approval.
      </p>
      <Link href="/login" className="mt-6 inline-flex h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-black text-ink shadow-sm hover:border-brand hover:text-brand">
        Go to sign in
      </Link>
    </div>
  );
}
