import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/layouts";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
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
            <h1 className="text-4xl font-black text-white">404</h1>
            <p className="text-lg text-slate-400">
              Page not found
            </p>
            <p className="text-slate-500">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <Button size="lg" asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </Container>
      </Section>
    </div>
  );
}