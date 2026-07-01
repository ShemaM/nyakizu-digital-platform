import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-dark-primary/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size="sm" inverted />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800/50 bg-dark-secondary py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="sm" inverted />
            <p className="text-sm text-slate-400">
              Digitizing trusted community trade in Nairobi.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-200 transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800/50 pt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 Nyakizu Digital Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}