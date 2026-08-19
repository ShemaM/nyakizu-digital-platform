"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ChevronDown, UserPlus, LogIn, Mail } from "lucide-react";
import { SUPPORT_EMAIL, TAGLINE } from "@/lib/contact";

/** Header's only interactive element besides the logo — a single "Get
    Started" pill that opens the two real choices (account or sign-in)
    instead of a nav bar with pages this app doesn't have yet. */
function GetStartedMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Get started"
        className="flex items-center gap-1.5 rounded-full bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold shadow-sm h-9 sm:h-11 px-4 sm:px-5 text-sm sm:text-base transition-colors"
      >
        Get Started
        <ChevronDown size={15} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden animate-scale-in z-50">
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3.5 text-sm font-bold text-text-primary hover:bg-slate-50 transition-colors border-b border-slate-100"
          >
            <UserPlus size={16} className="text-brand-gold-dark" aria-hidden="true" /> Create Account
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3.5 text-sm font-semibold text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-colors"
          >
            <LogIn size={16} aria-hidden="true" /> Log In
          </Link>
        </div>
      )}
    </div>
  );
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for glassmorphism intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      // Solid background always — the previous bg-white/60 (unscrolled)
      // sat translucent over the hero's imagery, so text contrast varied
      // with whatever was behind it and became hard to read on mobile.
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "border-b border-slate-200 shadow-sm" : "border-b border-slate-100"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-24">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity shrink-0 min-w-0"
            aria-label="Nyakizu Home"
          >
            <Logo size={56} className="w-9 h-9 sm:w-14 sm:h-14 shrink-0" />
            <span className="font-display font-bold text-base sm:text-2xl text-text-primary tracking-tight truncate">
              Nyakizu Digital
            </span>
          </Link>

          <GetStartedMenu />
        </div>
      </div>
    </header>
  );
}

interface FooterLink {
  href: string;
  label: string;
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-base text-text-secondary hover:text-brand-gold-dark transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PLATFORM_LINKS: FooterLink[] = [
  { href: "/#features", label: "Features" },
  { href: "/register", label: "Sign Up" },
  { href: "/login", label: "Sign In" },
  { href: "/help", label: "Help" },
];

const COMPANY_LINKS: FooterLink[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-dark-accent bg-dark-secondary">
      <span className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-brand-gold/60 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo size="md" />
              <span className="text-xl font-extrabold tracking-tight text-text-primary">
                Nyakizu
              </span>
            </Link>
            <p className="text-base font-semibold text-brand-gold-dark max-w-xs">
              {TAGLINE}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-gold-dark transition-colors"
            >
              <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
              {SUPPORT_EMAIL}
            </a>
          </div>

          <FooterColumn title="Platform" links={PLATFORM_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 pt-8 border-t border-dark-accent">
          <p className="text-base text-text-muted text-center sm:text-left">
            &copy; {new Date().getFullYear()} Nyakizu Digital Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
