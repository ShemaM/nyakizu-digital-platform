import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, MessageCircle } from "lucide-react";
import { LandingHeader, LandingFooter, Container, Section } from "@/components/layouts";
import { SITE_URL } from "@/lib/seo";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Nyakizu Digital Market team for questions, account help, or feedback.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-text-primary">
      <LandingHeader />

      <Section spacing="lg" className="pt-32 sm:pt-40">
        <Container size="sm">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              Get in touch
            </h1>
            <p className="mt-3 text-text-secondary text-xl">
              Questions, trouble with your account, or feedback. We want to hear it.
            </p>
          </div>

          <div className="rounded-2xl bg-text-primary p-6 sm:p-10 text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-gold flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-white">Email us</h2>
            <p className="mt-1.5 text-white/70">A real person reads every message.</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold px-6 py-3 transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-dark-accent bg-white p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-gold-subtle flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-brand-gold-dark" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-text-primary">Response time</h3>
              <p className="mt-1.5 text-text-secondary leading-relaxed">
                We usually reply within a day or two. Account and order questions get priority.
              </p>
            </div>
            <div className="rounded-2xl border border-dark-accent bg-white p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-gold-subtle flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-brand-gold-dark" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-text-primary">Common questions first</h3>
              <p className="mt-1.5 text-text-secondary leading-relaxed">
                Signing in, verifying your email, or buyer approval. Check the{" "}
                <Link href="/help" className="font-semibold text-brand-gold-dark underline underline-offset-2">
                  Help page
                </Link>{" "}
                first. It may already have your answer.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
