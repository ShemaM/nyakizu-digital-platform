"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/api";
import { cn } from "@/lib/cn";
import { BUSINESS_TYPES } from "@/lib/constants";

const initial = {
  name: "",
  email: "",
  phone: "",
  password: "",
  location: "",
  bizType: "",
  supplier: "",
};

export default function RegisterBuyerPage() {
  const uid = useId();
  const [form, setForm] = useState(initial);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patch = (next: Partial<typeof initial>) => setForm((value) => ({ ...value, ...next }));

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!form.email.includes("@")) next.email = "Enter a valid email.";
    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (!form.location.trim()) next.location = "Enter where you trade from.";
    if (!form.bizType) next.bizType = "Choose your business type.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiErr("");

    try {
      const res = await auth.register({
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "buyer",
        location: form.location,
        business_type: form.bizType,
        main_supplier: form.supplier,
      });

      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "buyer_verification",
          email: form.email,
          name: form.name,
          token: res.verification_token ?? "",
        }),
      }).catch(() => {});

      setDone(true);
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
        <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-brand">
            <ShoppingBag size={22} />
          </div>
          <h1 className="mt-6 max-w-2xl text-3xl font-black tracking-normal text-ink">
            Create a buyer account for trusted supplier ordering.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
            Buyer accounts can request access to verified sellers, place
            structured orders, and track balances once records exist.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          {done ? (
            <Done email={form.email} />
          ) : (
            <form noValidate onSubmit={submit} className="space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-brand">Buyer registration</p>
                <h2 className="mt-1 text-xl font-black text-ink">Your details</h2>
              </div>

              {apiErr ? <Alert message={apiErr} /> : null}

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
              <Input id={`${uid}-location`} label="Trading location" value={form.location} onChange={(event) => patch({ location: event.target.value })} error={errors.location} />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">Business type</span>
                  {errors.bizType ? <span className="text-xs font-bold text-danger">{errors.bizType}</span> : null}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map((type) => {
                    const selected = form.bizType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => patch({ bizType: type })}
                        className={cn(
                          "h-11 rounded-md border px-3 text-left text-xs font-bold transition",
                          selected
                            ? "border-brand bg-brand text-white"
                            : "border-line bg-white text-body hover:border-brand hover:text-brand",
                        )}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input id={`${uid}-supplier`} label="Usual supplier" value={form.supplier} onChange={(event) => patch({ supplier: event.target.value })} optional />
              <Button type="submit" loading={loading} className="w-full">Create buyer account</Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Done({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-emerald-50 text-brand">
        <Check size={25} />
      </div>
      <h2 className="mt-5 text-xl font-black text-ink">Account created</h2>
      <p className="mt-2 text-sm leading-6 text-body">
        Verify {email}, then sign in to start connecting with real supplier records.
      </p>
      <Link href="/login" className="mt-6 inline-flex h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-black text-ink shadow-sm hover:border-brand hover:text-brand">
        Go to sign in
      </Link>
    </div>
  );
}
