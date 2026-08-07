import { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

export interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function DashboardLayout({
  title,
  children,
  headerRight,
}: DashboardLayoutProps) {
  return (
    <AppShell
      title={title}
      headerRight={headerRight}
    >
      {children}
    </AppShell>
  );
}
