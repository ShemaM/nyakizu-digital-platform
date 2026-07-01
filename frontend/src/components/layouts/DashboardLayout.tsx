import { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

export interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  showLogo?: boolean;
}

export function DashboardLayout({
  title,
  children,
  headerRight,
  showLogo = false,
}: DashboardLayoutProps) {
  return (
    <AppShell
      title={title}
      headerRight={headerRight}
      showLogo={showLogo}
    >
      {children}
    </AppShell>
  );
}