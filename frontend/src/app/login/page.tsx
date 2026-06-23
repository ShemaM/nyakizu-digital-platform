"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/api";
import { API } from "@/lib/constants";

export default function LoginPage() {
  const uid = useId();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErr, setFieldErr] = useState({ phone: "", password: "" });

  function validate() {
    const next = { phone: "", password: "" };
    if (!phone.trim()) next.phone = "Enter your phone number.";
    if (!password.trim()) next.password = "Enter your password.";
    setFieldErr(next);
    return !next.phone && !next.password;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      await auth.login(phone, password);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_27rem]">
      <section className="hidden border-r border-line bg-ink p-8 text-white lg:flex lg:flex-col">
        <Link href="/" aria-label="Nyakizu home">
          <Logo />
        </Link>
        <div className="mt-auto max-w-xl">
          <p className="text-xs font-black uppercase tracking-normal text-teal-200">
            Trade workspace
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal">
            Orders, suppliers, payment references, and credit records in one place.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Sign in to manage the actual records already saved in your Nyakizu
            backend.
          </p>
        </div>
      </section>

      <section className="flex flex-col bg-white">
        <header className="flex h-16 items-center justify-between border-b border-line px-5 lg:hidden">
          <Link href="/" aria-label="Nyakizu home">
            <Logo />
          </Link>
        </header>

        <div className="flex flex-1 items-center px-5 py-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-surface text-brand">
                <ShieldCheck size={21} />
              </div>
              <h1 className="text-2xl font-black tracking-normal text-ink">
                Sign in
              </h1>
              <p className="mt-2 text-sm leading-6 text-body">
                Use your registered phone number and password.
              </p>
            </div>

            <form onSubmit={submit} noValidate className="space-y-4">
              {error ? <Alert message={error} /> : null}

              <Input
                id={`${uid}-phone`}
                label="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone number"
                type="tel"
                autoComplete="tel"
                error={fieldErr.phone}
              />

              <Input
                id={`${uid}-password`}
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                error={fieldErr.password}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShow((value) => !value)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="text-muted hover:text-ink"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              <Button type="submit" loading={loading} className="w-full">
                <LogIn size={16} />
                Sign in
              </Button>
            </form>

            <a
              href={`${API}/accounts/google/login/`}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-line bg-white text-sm font-bold text-ink shadow-sm transition hover:border-brand hover:text-brand"
            >
              Continue with Google
            </a>

            <div className="mt-6 grid gap-2 text-sm text-body">
              <p>
                Need a buyer account?{" "}
                <Link href="/register/buyer" className="font-black text-brand hover:underline">
                  Register buyer
                </Link>
              </p>
              <p>
                Running a store?{" "}
                <Link href="/register/seller" className="font-black text-brand hover:underline">
                  Register seller
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
