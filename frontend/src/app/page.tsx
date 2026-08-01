import Link from "next/link";
import { Lock, BookCheck, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Container, Section } from "@/components/layouts";
import CommunityActivity from "@/components/landing/CommunityActivity";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-background text-slate-100 selection:bg-brand-gold/30">
      
      {/* Header / Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-dark-background/80 backdrop-blur-md">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider text-brand-gold">
              NYAKIZU DIGITAL
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-brand-gold transition-colors">
              What It Does
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-brand-gold transition-colors">
              How It Works
            </Link>
          </nav>
        </Container>
      </header>

      {/* Hero Section */}
      <Section spacing="xl" className="relative overflow-hidden pt-20 pb-16">
        <Container size="lg" className="relative z-10">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Badge variant="outline" className="border-brand-gold/30 text-brand-gold px-3 py-1">
              For Phone Accessory Traders
            </Badge>
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
              Digitize Your Trusted Community Trade
            </h1>
            <p className="text-xl text-slate-400 max-w-none mx-auto leading-relaxed">
              Nyakizu puts your phone business records into a simple mobile app. Place orders easily, keep your stock private, and track your debts safely without changing how you do business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="font-bold text-base px-8 py-6 bg-brand-gold text-dark-background hover:bg-brand-gold/90 transition-all shadow-lg" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="font-bold text-base px-8 py-6 border-slate-700 hover:bg-slate-800 transition-all text-white" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section spacing="lg" className="bg-dark-secondary border-y border-slate-900" id="features">
        <Container size="lg">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">How We Digitize Your Trade</Badge>
            <h2 className="text-4xl font-black text-white">Replacing Paper Notebooks with Smart Records</h2>
            <p className="text-slate-400 max-w-none mx-auto text-lg">
              Nyakizu takes what you already do manually on loose papers or WhatsApp chats and makes it faster and clearer for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookCheck,
                title: "Digital Catalogues & Stock",
                description: "Stop searching through old WhatsApp photos. Sellers can list all phone accessories nicely. Buyers can see right away if an item is available without making many calls.",
              },
              {
                icon: Lock,
                title: "Locked Order Lists",
                description: "Instead of writing orders on loose papers, lists are made digitally. Once a seller starts packing the items, the list is locked so no one can change items or prices last minute.",
              },
              {
                icon: Shield,
                title: "Clear Credit & Debt Book",
                description: "Replaces old paper notebooks that get lost or faded. Every debt and M-Pesa installment is written on a safe ledger that cannot be erased, stopping arguments entirely.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <Card key={title} className="group transition-all hover:-translate-y-0.5 bg-slate-900/30 border-slate-800">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{title}</h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Roles Section */}
      <Section spacing="lg" className="bg-dark-primary" id="how-it-works">
        <Container size="lg">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">How It Works</Badge>
            <h2 className="text-4xl font-black text-white">Choose Your Side</h2>
            <p className="text-slate-400 max-w-none mx-auto text-lg">
              The app looks different depending on if you are buying or selling phone accessories. Everything is built to keep your secrets safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="elevated" className="transition-all hover:-translate-y-0.5 bg-slate-900/20 border-slate-800">
              <CardHeader>
                <CardTitle className="text-2xl text-white">🛍️ Buyer (Hawker)</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Make orders from sellers you know and check what you owe.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "See items only from wholesalers who accept you",
                    "Make your order lists even when the network is down",
                    "Add clear notes if you need items missing from the list",
                    "See your total debt balance and all past entries clearly",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" className="transition-all hover:-translate-y-0.5 bg-slate-900/20 border-slate-800">
              <CardHeader>
                <CardTitle className="text-2xl text-white">📦 Seller (Wholesaler)</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Add your accessories, lock orders, and manage debt records.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "List phone items without showing the exact stock numbers",
                    "Accept buyers you trust before they see your hidden store",
                    "Lock the order permanently when you start packing items",
                    "Write down M-Pesa payments by hand to clear the debt book",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Community Updates Log */}
      <CommunityActivity />

      {/* CTA Section */}
      <Section spacing="xl" className="bg-gradient-to-b from-slate-900 to-dark-background border-t border-slate-900">
        <Container size="lg">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-white">Ready to change how you trade?</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Get ready to move your trade online. Nyakizu is made for phone accessory traders to manage orders, track debts, and protect community business with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="font-bold text-base px-8 py-6 bg-brand-gold text-dark-background hover:bg-brand-gold/90 transition-all shadow-lg" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}