"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
];

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo + nav, grouped together so nav reads as anchored to the
              brand instead of floating alone in the header's dead centre */}
          <div className="flex items-center gap-8 lg:gap-12 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
              aria-label="Nyakizu Home"
            >
              <Logo size={56} className="w-11 h-11 sm:w-14 sm:h-14 shrink-0" />
              <span className="font-display font-bold text-xl sm:text-2xl text-text-primary tracking-tight whitespace-nowrap">
                Nyakizu Digital
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base text-text-secondary hover:text-text-primary transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary hover:bg-slate-100 text-base" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold shadow-sm border-0 text-base" asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile: Log in is common enough to not bury behind the hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              href="/login"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-text-primary hover:bg-slate-100 transition-colors"
            >
              Log in
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm md:hidden z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile navigation drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden z-50 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <span className="text-sm font-bold text-slate-800">Navigation</span>
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 rounded-xl text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-200 my-3 pt-3 space-y-2">
            <Link
              href="/login"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold bg-brand-gold text-text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative border-t border-dark-accent bg-dark-secondary">
      <span className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-brand-gold/60 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo size="md" />
              <span className="text-xl font-extrabold tracking-tight text-text-primary">
                Nyakizu
              </span>
            </Link>
            <p className="text-base text-text-secondary leading-relaxed max-w-xs">
              &quot;Nyakizu&quot; means a huge building, in Kinyamulenge — the word traders already
              use for the busy wholesale hub where this platform began.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#features" className="text-base text-text-secondary hover:text-brand-gold-dark transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-base text-text-secondary hover:text-brand-gold-dark transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-base text-text-secondary hover:text-brand-gold-dark transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-base text-text-secondary hover:text-brand-gold-dark transition-colors">
                  Help
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-accent flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-base text-text-muted">
            &copy; {new Date().getFullYear()} Nyakizu Digital Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-text-muted">Made with care for the Banyamulenge community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
