"use client";

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
            <h1 className="text-4xl font-black text-white">Something went wrong</h1>
            <p className="text-lg text-slate-400">
              An unexpected error occurred. Please try again.
            </p>
            {error.message && (
              <p className="text-sm text-slate-500 font-mono bg-slate-900/50 p-3 rounded-lg">
                {error.message}
              </p>
            )}
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