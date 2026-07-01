import Link from "next/link";
import { Container, Section } from "@/components/layouts";
import { LandingHeader, LandingFooter } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle2, Lock, TrendingUp, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <LandingHeader />

      {/* Hero Section */}
      <Section spacing="xl" className="bg-dark-primary">
        <Container size="lg">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-2">
                <Badge variant="primary">🚀 Now Live</Badge>
                <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight">
                  Trade Structured.<br />
                  <span className="text-brand-gold">Ledger Trusted.</span>
                </h1>
              </div>

              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                A digital layer for phone accessories traders at RNG Plaza. Manage orders, record payments, and maintain an immutable ledger—all offline-capable.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button size="lg" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>

              <div className="pt-4 space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Works offline • Syncs when connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Your data, your control</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-cta opacity-30 blur-3xl rounded-full" />
              <Card variant="elevated" className="relative backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order #2047</CardTitle>
                    <Badge variant="primary" className="text-xs">Locked</Badge>
                  </div>
                  <CardDescription>Kamau Electronics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {[
                      ["Screen guards (5\")", "×20", "KES 1,200"],
                      ["TPU cases (assorted)", "×12", "KES 720"],
                      ["Battery (4000mAh)", "×10", "KES 4,500"],
                    ].map(([item, qty, price]) => (
                      <div key={item} className="flex justify-between text-slate-300">
                        <span>{item} {qty}</span>
                        <span className="text-brand-gold font-semibold">{price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-700/50 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-brand-gold text-lg">KES 6,420</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section spacing="lg" className="bg-dark-secondary" id="features">
        <Container size="lg">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">Features</Badge>
            <h2 className="text-4xl font-black text-white">Everything traders need</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Built specifically for the RNG Plaza community. Simple, powerful, and designed for how you actually trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Order Locking",
                description: "Freeze orders once packing begins. No more last-minute changes.",
              },
              {
                icon: TrendingUp,
                title: "Immutable Ledger",
                description: "Every transaction recorded permanently. Transparency you can trust.",
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Debt records visible only to buyer and seller. Your data stays private.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardContent className="pt-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Roles Section */}
      <Section spacing="lg" className="bg-dark-primary">
        <Container size="lg">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">For Everyone</Badge>
            <h2 className="text-4xl font-black text-white">Built for your role</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                role: "Mnunuzi (Buyer)",
                description: "Hawker • Reseller",
                features: [
                  "Browse verified suppliers",
                  "Create & manage orders offline",
                  "Track what you owe",
                  "Download order receipts",
                ],
              },
              {
                role: "Muuzaji (Seller)",
                description: "Wholesaler",
                features: [
                  "Manage your product catalog",
                  "Approve trusted buyers",
                  "Lock & track orders",
                  "Record M-Pesa payments",
                ],
              },
            ].map(({ role, description, features }) => (
              <Card key={role} variant="elevated">
                <CardHeader>
                  <CardTitle>{role}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="xl" className="bg-gradient-cta">
        <Container size="sm">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-black text-white">
              Ready to level up?
            </h2>
            <p className="text-lg text-slate-300">
              Join traders in Nairobi who are already using Nyakizu to manage orders, payments, and relationships with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}