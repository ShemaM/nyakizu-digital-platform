import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Menu } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  title: string;
  headerRight?: ReactNode;
  showLogo?: boolean;
}

export function AppShell({
  children,
  title,
  headerRight,
  showLogo = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-dark-primary/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {showLogo && <Logo size="sm" inverted />}
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {headerRight}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}