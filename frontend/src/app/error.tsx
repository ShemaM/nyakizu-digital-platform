"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/layouts";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-primary flex items-center">
      <Section spacing="xl" className="w-full">
        <Container size="sm" className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-display font-black text-text-primary">Something went wrong</h1>
            <p className="text-body-lg text-text-secondary">
              An unexpected error occurred. Please try again.
            </p>
            {process.env.NODE_ENV === "development" && error.message ? (
              // Raw error text can carry internal details (query params, stack
              // hints) — fine for local debugging, not for a production user.
              <p className="text-body text-text-muted font-mono bg-dark-secondary p-3 rounded-lg">
                {error.message}
              </p>
            ) : error.digest ? (
              <p className="text-caption text-text-muted">
                Reference: <span className="font-mono">{error.digest}</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" onClick={reset}>
              Try again
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}