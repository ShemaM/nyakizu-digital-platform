"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

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
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Added w-full and min-w-0 to the root container below
  return (
    <div className="min-h-screen w-full min-w-0 bg-dark-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/50 bg-dark-primary/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {showLogo && <Logo size="sm" inverted />}
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {headerRight}
            {user && (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-slate-400">
                  <User className="w-4 h-4 inline mr-1" />
                  {user.full_name || user.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with added w-full and min-w-0 */}
      <main className="flex-1 w-full min-w-0 overflow-auto">
        <div className="min-w-0 w-full">{children}</div>
      </main>
    </div>
  );
}