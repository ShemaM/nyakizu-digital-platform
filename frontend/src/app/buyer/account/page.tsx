"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Section } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layouts";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { Mail, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const PREFS_KEY = "nyakizu.buyer.prefs";

interface Prefs {
  emailNewSuppliers: boolean;
  smsDebtReminders: boolean;
}

const DEFAULT_PREFS: Prefs = { emailNewSuppliers: true, smsDebtReminders: true };

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function BuyerAccount() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  function updatePref(key: keyof Prefs, value: boolean) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    router.push("/login");
  }

  if (isLoading || !user) {
    return (
      <DashboardLayout title="My Account">
        <PageSkeleton showKPIs={false} listCount={2} />
      </DashboardLayout>
    );
  }

  const joined = new Date(user.date_joined).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  const businessType = user.buyer_profile?.business_type || "Not set yet";

  return (
    <DashboardLayout title="My Account">
      <Section spacing="md">
        <Container size="md" className="space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
              <CardDescription>Trader since {joined}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-label">Full Name</label>
                  <p className="text-text-primary font-semibold mt-1">{user.full_name}</p>
                </div>
                <div>
                  <label className="text-label">What do you sell?</label>
                  <p className="text-text-primary font-semibold mt-1">{businessType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-role" />
                  <div>
                    <label className="text-label">Email</label>
                    <p className="text-text-primary text-body mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-role" />
                  <div>
                    <label className="text-label">Phone</label>
                    <p className="text-text-primary text-body mt-1">{user.phone_number}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={prefs.emailNewSuppliers}
                  onChange={(e) => updatePref("emailNewSuppliers", e.target.checked)}
                />
                <span className="text-text-primary">Email me when a new supplier joins</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={prefs.smsDebtReminders}
                  onChange={(e) => updatePref("smsDebtReminders", e.target.checked)}
                />
                <span className="text-text-primary">Text me reminders about what I owe</span>
              </label>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card variant="outlined" className="border-error/20">
            <CardHeader>
              <CardTitle className="text-error">Sign Out</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text-primary">Sign Out</p>
                  <p className="text-body text-text-muted">You will be logged out</p>
                </div>
                <Button variant="destructive" size="sm" className="gap-2" onClick={handleSignOut} loading={signingOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </DashboardLayout>
  );
}
