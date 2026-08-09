"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Store, Package, MapPin, Sparkles } from "lucide-react";
import { community, type CommunityActivityData } from "@/lib/api";

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6 space-y-3">
        <div className="h-8 w-8 rounded-lg bg-blue-100" />
        <div className="h-7 w-16 rounded bg-slate-200" />
        <div className="h-4 w-24 rounded bg-slate-100" />
      </CardContent>
    </Card>
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

  const isEmpty = !isLoading && (!data || (data.stats.members === 0 && data.stats.stores === 0));

  return (
    <Section spacing="lg" className="bg-white" id="community">
      <Container size="lg">
        <div className="text-center space-y-4 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Pilot phase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">You would not be the first</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Real buyers and sellers already building their businesses on Nyakizu.
          </p>
        </div>

        {isEmpty ? (
          <Card variant="elevated" className="max-w-xl mx-auto text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">You&apos;re Among the First</h3>
              <p className="text-slate-600">
                Nyakizu is just getting started. Join now and help shape the marketplace from day one.
              </p>
              <Button size="lg" className="bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold border-0" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-center text-caption text-text-muted mb-6">
              These are real, live numbers from a small pilot — not projections.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                : stats.map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="pt-6 space-y-2">
                        <stat.icon className="w-8 h-8 text-brand-gold-dark" aria-hidden="true" />
                        <div className="text-3xl font-black text-text-primary">
                          {stat.value?.toLocaleString() ?? "—"}
                        </div>
                        <div className="text-sm text-text-muted">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
