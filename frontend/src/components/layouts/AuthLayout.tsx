import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  alternate?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  alternate = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Branding & Message */}
      <div className={`flex-1 flex flex-col justify-between p-6 sm:p-12 ${alternate ? "order-2" : "order-1"} bg-gradient-dark`}>
        <Link href="/" className="inline-flex w-fit hover:opacity-80 transition-opacity">
          <Logo size="md" inverted />
        </Link>

        <div className="hidden lg:block space-y-4 max-w-md">
          <h1 className="text-4xl font-extrabold text-white">
            Structured trade, trusted ledger.
          </h1>
          <p className="text-lg text-slate-300">
            Join traders in Nairobi managing orders, payments, and relationships with clarity.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-gold" />
          <span>Offline-capable • Privacy-first • Community-built</span>
        </div>
      </div>

      {/* Right: Form */}
      <div className={`flex-1 flex items-center justify-center p-6 sm:p-12 ${alternate ? "order-1" : "order-2"} bg-dark-primary`}>
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-slate-400">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}