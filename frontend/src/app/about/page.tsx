import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, WifiOff, Users, Heart } from "lucide-react";
import { LandingHeader, LandingFooter, Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { SITE_URL } from "@/lib/seo";
import { TAGLINE } from "@/lib/contact";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Nyakizu Digital Market digitizes trusted community trade for phone accessories wholesalers and resellers in Nairobi — built by a trader, for traders.",
  alternates: { canonical: `${SITE_URL}/about` },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust comes first",
    body: "Buyers only see a seller's catalog once that seller lets them in. Stock numbers stay private. Nothing about how traders already work has to change.",
  },
  {
    icon: WifiOff,
    title: "Built for real conditions",
    body: "Many traders work where the internet cuts out often. Orders are saved on the phone and sent the moment the connection is back.",
  },
  {
    icon: Users,
    title: "Made with traders, not just for them",
    body: "Every feature came from watching real wholesalers and resellers work — what slows them down, and what they actually need.",
  },
  {
    icon: Heart,
    title: "Free, always",
    body: "No monthly fee, no hidden cost, for buyers or sellers. This is a community tool, not a product to sell back to the community.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-text-primary">
      <LandingHeader />

      <Section spacing="lg" className="pt-32 sm:pt-40">
        <Container size="md">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-gold-dark">About Nyakizu</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              {TAGLINE}
            </h1>
            <p className="mt-4 text-text-secondary text-xl leading-relaxed max-w-2xl mx-auto">
              Nyakizu Digital Market helps phone accessories wholesalers and resellers in Nairobi
              run their business without giving up the trust they already built with each other.
            </p>
          </div>

          <div className="rounded-2xl border border-dark-accent bg-dark-secondary p-6 sm:p-10 space-y-4 mb-14">
            <h2 className="text-2xl font-bold text-text-primary">Why we built this</h2>
            <p className="text-text-secondary leading-relaxed">
              Most phone accessories trading in Nairobi&apos;s Banyamulenge community still runs on
              WhatsApp messages and paper notebooks. That works fine for a small shop, but it gets
              hard fast once a business has many products, many buyers, and money owed across all
              of them.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Big e-commerce platforms don&apos;t fit either — they are built for open competition and
              show everyone exactly what is in stock. For traders who rely on private relationships
              and careful sourcing, that is the opposite of what they need.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Nyakizu was built by someone who has worked this trade directly, as both a wholesaler
              and a reseller. It exists to fix the real problems traders described — losing track of
              orders and debts, awkward last-minute changes, exposing stock to competitors — without
              asking anyone to trade away their privacy or their relationships to get it.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-text-primary text-center mb-8">What we believe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-dark-accent bg-white p-6">
                <div className="w-11 h-11 rounded-xl bg-brand-gold-subtle flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-gold-dark" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-text-primary">{title}</h3>
                <p className="mt-1.5 text-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-text-primary p-6 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-white">Join the traders going digital</h2>
            <p className="mt-1.5 text-white/70 max-w-md mx-auto">
              Free for buyers and sellers, built around how you already trade.
            </p>
            <Button
              className="mt-5 bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold"
              size="lg"
              asChild
            >
              <Link href="/register">Create your account</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
