"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ChevronDown, UserPlus, LogIn, Mail, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SUPPORT_EMAIL, TAGLINE } from "@/lib/contact";

/** Header's only interactive element besides the logo on desktop — a single "Get
    Started" pill that opens account or sign-in */
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
        className="flex items-center gap-1.5 rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-bold shadow-sm h-10 px-4 sm:px-5 text-sm sm:text-base transition-colors"
      >
        Get Started
        <ChevronDown size={15} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-dark-accent bg-dark-card shadow-2xl overflow-hidden animate-scale-in z-50 text-text-primary">
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3.5 text-sm font-bold text-text-primary hover:bg-dark-tertiary transition-colors border-b border-dark-accent"
          >
            <UserPlus size={16} className="text-brand-gold" aria-hidden="true" /> Create Account
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3.5 text-sm font-semibold text-text-secondary hover:bg-dark-tertiary hover:text-text-primary transition-colors"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 bg-dark-secondary/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "border-b border-dark-accent shadow-md" : "border-b border-dark-accent/60"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity shrink-0 min-w-0"
            aria-label="Nyakizu Home"
          >
            <Logo size={42} className="w-8 h-8 sm:w-11 sm:h-11 shrink-0" />
            <span className="font-display font-bold text-base sm:text-xl text-text-primary tracking-tight truncate">
              Nyakizu Digital
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/pricing"
              className="text-sm font-bold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-full hover:bg-dark-tertiary transition-colors"
            >
              Pricing
            </Link>
            <ThemeToggle />
            <GetStartedMenu />
          </div>

          {/* Mobile Navigation (Clean, Spacious, Uncrowded) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-bold h-8 px-3.5 text-xs shadow-sm transition-transform active:scale-95"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-dark-accent bg-dark-tertiary text-text-primary hover:text-brand-gold transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-accent bg-dark-secondary/98 backdrop-blur-xl px-4 py-4 space-y-3 animate-fade-in shadow-2xl">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-gold text-slate-950 font-bold py-2.5 text-xs shadow-sm"
            >
              <UserPlus size={15} /> Create Account
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-dark-accent bg-dark-tertiary text-text-primary font-bold py-2.5 text-xs hover:bg-dark-accent"
            >
              <LogIn size={15} /> Log In
            </Link>
          </div>

          <div className="pt-2 border-t border-dark-accent/60 space-y-1">
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-text-primary hover:bg-dark-tertiary transition-colors"
            >
              <span>Pricing & Fee Calculator</span>
              <span className="text-xs font-bold text-brand-gold">KSh 50–100 / order</span>
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-dark-tertiary transition-colors"
            >
              <span>Features & Wholesaler Tools</span>
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-dark-tertiary transition-colors"
            >
              <span>How Nyakizu Works</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-dark-accent/60 flex items-center justify-between px-3 py-1">
            <span className="text-xs font-bold text-text-muted">Display Theme</span>
            <ThemeToggle size="sm" />
          </div>
        </div>
      )}
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
  { href: "/pricing", label: "Pricing & Fees" },
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
