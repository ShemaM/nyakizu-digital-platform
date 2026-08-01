"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Store, Package, MapPin, BadgeCheck, Sparkles } from "lucide-react";
import { community, type CommunityActivityData } from "@/lib/api";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

function formatJoined(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatCardSkeleton() {
  return (
    <Card className="bg-slate-900/30 animate-pulse">
      <CardContent className="pt-6 space-y-3">
        <div className="h-8 w-8 rounded-lg bg-dark-accent/50" />
        <div className="h-7 w-16 rounded bg-dark-accent/50" />
        <div className="h-4 w-24 rounded bg-dark-accent/30" />
      </CardContent>
    </Card>
  );
}

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30 border border-dark-accent/30 animate-pulse">
      <div className="h-11 w-11 rounded-full bg-dark-accent/50 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded bg-dark-accent/50" />
        <div className="h-3 w-1/3 rounded bg-dark-accent/30" />
      </div>
    </div>
  );
}

export default function CommunityActivity() {
  const [data, setData] = useState<CommunityActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    community
      .activity()
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setData(result);
        } else {
          setHasError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fail quietly — this is a marketing section, not critical path.
  if (hasError) return null;

  const stats = [
    { icon: Users, label: "Community Members", value: data?.stats.members },
    { icon: Store, label: "Registered Stores", value: data?.stats.stores },
    { icon: Package, label: "Products Listed", value: data?.stats.products },
    { icon: MapPin, label: "Cities Represented", value: data?.stats.cities },
  ];

  const isEmpty = !isLoading && (!data || data.recent_members.length === 0);

  return (
    <Section spacing="lg" className="bg-dark-secondary">
      <Container size="lg">
        <div className="text-center space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gold-light">
            <Sparkles className="w-3.5 h-3.5" />
            Growing Every Day
          </span>
          <h2 className="text-4xl font-black text-white">Join a Trusted Trading Community</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Real buyers and sellers at RNG Plaza, building their businesses on Nyakizu.
          </p>
        </div>

        {isEmpty ? (
          <Card variant="elevated" className="max-w-xl mx-auto text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <h3 className="text-2xl font-bold text-white">You&apos;re Among the First</h3>
              <p className="text-slate-400">
                Nyakizu is just getting started. Join now and help shape the marketplace from day one.
              </p>
              <Button size="lg" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                : stats.map((stat) => (
                    <Card key={stat.label} className="bg-slate-900/30">
                      <CardContent className="pt-6 space-y-2">
                        <stat.icon className="w-8 h-8 text-brand-gold-light" />
                        <div className="text-3xl font-black text-white">
                          {stat.value?.toLocaleString() ?? "—"}
                        </div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <MemberRowSkeleton key={i} />)
                : data?.recent_members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30 border border-dark-accent/30 hover:border-brand-gold/40 transition-colors"
                    >
                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          member.role === "Seller"
                            ? "bg-brand-gold/15 text-brand-gold-light"
                            : "bg-slate-700/50 text-slate-300"
                        }`}
                        aria-hidden="true"
                      >
                        {initials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-white truncate">{member.name}</p>
                          {member.verified && (
                            <BadgeCheck className="w-4 h-4 text-info shrink-0" aria-label="Verified seller" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>{member.role}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {member.location}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{formatJoined(member.joined)}</p>
                      </div>
                    </div>
                  ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" asChild>
                <Link href="/register">Join the Community</Link>
              </Button>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
