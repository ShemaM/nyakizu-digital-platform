"use client";

import Link from "next/link";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookCheck, CheckCircle2, Lock, Shield } from "lucide-react";
import TestimonialCarousel, { type Testimonial } from "@/components/TestimonialCarousel";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <LandingHeader />

      {/* Hero Section */}
      <Section spacing="xl" className="bg-dark-primary">
        <Container size="full">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-3">
                <Badge variant="primary">For Traders at RNG Plaza</Badge>
                <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight">
                  Digitizing Community Trade at RNG Plaza
                </h1>
              </div>

              <p className="text-lg text-slate-400 leading-relaxed max-w-none">
                The digital tool for your trusted trade network. Manage orders, credit, and payments with confidence.
              </p>

              {/* CTA hierarchy: primary + secondary */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild>
                  <Link href="/register">Create Free Account</Link>
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
                  <span>Privacy first • Your data stays yours</span>
                </div>
              </div>
            </div>

            {/* Right: Illustration / marketplace scene */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-cta opacity-30 blur-3xl rounded-full" />
              <div className="relative space-y-4">
                <Card variant="elevated" className="backdrop-blur-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Sample Wholesale Order</CardTitle>
                      <Badge variant="primary" className="text-xs">Locked</Badge>
                    </div>
                    <CardDescription>A typical order between a wholesaler and a trusted buyer.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {[
                        ["Screen guards (5\")", "×20", "KES 1,200"],
                        ["TPU cases (assorted)", "×12", "KES 720"],
                        ["Battery (4000mAh)", "×10", "KES 4,500"],
                      ].map(([item, qty, price]) => (
                        <div key={item} className="flex justify-between text-slate-300">
                          <span>
                            {item} <span className="text-slate-500">{qty}</span>
                          </span>
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

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Secure", value: "Locked orders" },
                    { label: "Transparent", value: "Immutable ledger" },
                    { label: "Accessible", value: "Offline-ready" },
                  ].map((x) => (
                    <div key={x.label} className="rounded-xl bg-slate-900/40 border border-slate-800/50 p-3">
                      <div className="text-xs text-slate-400 font-semibold">{x.label}</div>
                      <div className="mt-1 text-sm font-bold text-slate-100">{x.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>


      {/* Features Section */}
      <Section spacing="lg" className="bg-dark-secondary" id="features">
        <Container size="lg">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">Features</Badge>
            <h2 className="text-4xl font-black text-white">Designed for Trust and Real-World Trade</h2>
            <p className="text-slate-400 max-w-none mx-auto text-lg">
              Nyakizu isn't just another app. It's built on principles that respect how you already do business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Locked Orders for Clarity",
                description: "Once packing begins, orders are locked. This prevents confusion and ensures both buyer and seller are on the same page.",
              },
              {
                icon: BookCheck,
                title: "Append-Only Ledger for Trust",
                description: "Track payments and credit on a ledger that can't be silently changed. Corrections are added as new entries, preserving history.",
              },
              {
                icon: Shield,
                title: "Your Business Stays Private",
                description: "Your exact stock levels and customer debt records are confidential and visible only to you and authorized users.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <Card key={title} className="group transition-all hover:-translate-y-0.5 bg-slate-900/30">
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
            <h2 className="text-4xl font-black text-white">Choose your workflow</h2>
            <p className="text-slate-400 max-w-none mx-auto text-lg">
              Clear, action-oriented experiences for buyers and sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="elevated" className="transition-all hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>🛍️ Buyer</CardTitle>
                <CardDescription>Order from trusted suppliers, track your credit, and manage your records.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Browse verified suppliers",
                    "Create & manage orders offline",
                    "Track credit and payment history",
                    "View final invoices from sellers",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" className="transition-all hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>📦 Seller</CardTitle>
                <CardDescription>List products, manage inventory, track payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Manage your product catalog",
                    "Approve trusted buyers",
                    "Lock & track orders",
                    "Record M-Pesa payments",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Social Proof */}
      <Section spacing="lg" className="bg-dark-secondary">
        <Container size="lg">
          <div className="text-center space-y-4 mb-10">
            <Badge variant="outline">Built for Traders</Badge>
            <h2 className="text-4xl font-black text-white">A Tool That Understands Your Work</h2>
            <p className="text-slate-400 max-w-none mx-auto text-lg">
              Nyakizu is designed based on how traders already work, solving real-world problems without disrupting your business.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
              {/* Testimonial carousel */}
              {(() => {
                const testimonials: Testimonial[] = [
                  {
                    quote:
                      "Nyakizu helped me lock orders early. No more confusion—everything is clear for both sides.",
                    name: "Amina",
                    role: "Buyer • RNG Plaza",
                  },
                  {
                    quote:
                      "The ledger is transparent. I can always verify what was recorded and when.",
                    name: "Mutiso",
                    role: "Seller • RNG Plaza",
                  },
                  {
                    quote:
                      "Works offline for us. When the network comes back, syncing is smooth.",
                    name: "Wanjiku",
                    role: "Trader • RNG Plaza",
                  },
                ];

                return (
                  <TestimonialCarousel testimonials={testimonials} />
                );
              })()}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="xl" className="bg-gradient-cta">
        <Container size="full">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-black text-white">Ready to level up?</h2>
            <p className="text-lg text-slate-300 max-w-none">
              Get ready to digitize your trade. Nyakizu is designed for traders at RNG Plaza to manage orders, payments, and relationships with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>


      <LandingFooter />
    </div>
  );
}
