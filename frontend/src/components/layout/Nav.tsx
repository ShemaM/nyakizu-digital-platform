"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  LogIn,
  Menu,
  PackageSearch,
  Store,
  UserPlus,
  X,
} from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Market", icon: PackageSearch },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/register/seller", label: "Seller", icon: Store },
  { href: "/register/buyer", label: "Buyer", icon: UserPlus },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Nyakizu home">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-body transition hover:bg-surface hover:text-ink"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="ml-auto hidden h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-bold text-ink shadow-sm transition hover:border-brand hover:text-brand md:inline-flex"
        >
          <LogIn size={15} />
          Sign in
        </Link>

        <button
          type="button"
          className="ml-auto grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-ink md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-white px-4 py-3 md:hidden">
          <nav className="grid gap-1">
            {[...links, { href: "/login", label: "Sign in", icon: LogIn }].map(
              ({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-body hover:bg-surface hover:text-ink"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ),
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
