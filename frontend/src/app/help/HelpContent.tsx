"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { LandingHeader, LandingFooter, Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { auth, ApiError } from "@/lib/api";

const SUPPORT_EMAIL = "nyakizudigital@gmail.com";

const FAQS = [
  {
    q: "Why do I need to verify my email?",
    a: "It proves the email is really yours, so we can send you order and payment updates that matter.",
  },
  {
    q: "How long does seller approval take?",
    a: "An admin checks every new seller by hand. It is usually quick, but can take a day or two.",
  },
  {
    q: "Is Nyakizu really free?",
    a: "Yes. No monthly fee, no hidden cost — for buyers and for sellers.",
  },
  {
    q: "I am a buyer. Why can't I order from a seller yet?",
    a: "You must ask to join that seller's store first. Once they approve you, you can start ordering.",
  },
  {
    q: "Does Nyakizu work without internet?",
    a: "Yes. Keep using it as normal — your work is saved and sent as soon as you are back online.",
  },
];

export function HelpContent() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage("");
    setError("");
    try {
      const result = await auth.resendVerification(email);
      setMessage(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send the email. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-text-primary">
      <LandingHeader />

      <Section spacing="lg" className="pt-32 sm:pt-40">
        <Container size="sm">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              How can we help?
            </h1>
            <p className="mt-3 text-text-secondary text-xl">
              Answers for signing up, verifying your email, and signing in.
            </p>
          </div>

          {/* Resend verification email */}
          <div className="rounded-2xl border border-dark-accent bg-dark-secondary p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-text-primary">Didn&apos;t get your verification email?</h2>
            <p className="mt-1.5 text-text-secondary leading-relaxed">
              First, check your spam or junk folder — it sometimes lands there. If it is not there, enter your
              email below and we will send you a new link.
            </p>

            {message ? (
              <Alert variant="success" className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleResend} className="mt-4 flex flex-col sm:flex-row gap-3 items-start">
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. amani@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-white w-full"
                  required
                />
                <Button type="submit" loading={sending} className="h-12 sm:w-auto w-full">
                  {sending ? "Sending…" : "Resend email"}
                </Button>
              </form>
            )}
            {error && (
              <Alert variant="error" className="mt-3">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Trouble signing in */}
          <div className="rounded-2xl border border-dark-accent bg-white p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-text-primary">Trouble signing in?</h2>
            <p className="mt-1.5 text-text-secondary leading-relaxed">
              Forgot your password, or your account seems stuck? We do not have an automatic password reset yet.
              Email us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-gold-dark underline underline-offset-2">
                {SUPPORT_EMAIL}
              </a>{" "}
              and we will get you back in.
            </p>
          </div>

          {/* FAQ */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-text-primary mb-4">Common questions</h2>
            <div className="divide-y divide-dark-accent rounded-2xl border border-dark-accent overflow-hidden">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="bg-white p-5 sm:p-6">
                  <p className="font-bold text-text-primary">{q}</p>
                  <p className="mt-1.5 text-text-secondary leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl bg-text-primary p-6 sm:p-8 text-center">
            <h2 className="text-xl font-bold text-white">Still stuck?</h2>
            <p className="mt-1.5 text-white/70">Email us and a real person will help you.</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold px-6 py-3 transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
