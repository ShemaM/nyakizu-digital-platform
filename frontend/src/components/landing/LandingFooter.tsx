"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#features", label: "Features" },
  { href: "/#community", label: "Community Feed" }
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark-deepest/90 backdrop-blur-xl border-b border-slate-800/40 shadow-lg"
          : "bg-dark-deepest/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="Nyakizu Home"
          >
            <Logo size="sm" inverted />
            <span className="hidden sm:inline text-sm font-bold text-slate-100 tracking-tight">
              Nyakizu
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile navigation drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-dark-secondary border-l border-slate-800/50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden z-50 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800/30">
          <span className="text-sm font-bold text-slate-200">Navigation</span>
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
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
              className="block px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-800/30 my-3 pt-3 space-y-2">
            <Link
              href="/login"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium bg-brand-gold text-dark-primary hover:bg-brand-gold-light transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Create Account
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800/30 bg-dark-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <Logo size="sm" inverted />
              <span className="text-sm font-bold text-slate-100">Nyakizu</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              A digital marketplace connecting the Banyamulenge business community — built for trust, simplicity, and real trade.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#features" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#about" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#community" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Nyakizu Digital Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-600">Made with care for the Banyamulenge community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
