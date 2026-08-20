"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, CheckCircle2, LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { ProfileEditor } from "@/components/account/ProfileEditor";
import { PaymentInfoEditor } from "@/components/account/PaymentInfoEditor";
import { PushNotificationToggle } from "@/components/account/PushNotificationToggle";
import { useAuth } from "@/lib/auth-context";

export default function SellerAccountPage() {
  const router = useRouter();
  const { user, isLoading, logout, setSessionUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    router.push("/login");
  }

  if (isLoading || !user) {
    return (
      <AppShell title="My Account">
        <PageSkeleton showKPIs={false} listCount={2} />
      </AppShell>
    );
  }

  const profile = user.seller_profile;
  const joinedDate = new Date(user.date_joined).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  const isVerified = profile?.approval_status === "approved";
  const whatTheySell = profile?.categories?.length ? profile.categories.join(", ") : "Not set yet";

  return (
    <AppShell title="My Account">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header segment */}
        <div>
          <h2 className="text-title font-black text-text-primary tracking-tight">Account</h2>
          <p className="text-caption text-text-muted mt-1">Your shop details and sign-in info.</p>
        </div>

        {/* Store identity — trader since, verified badge, what they sell */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-body-lg font-bold text-text-primary">{profile?.store_name || user.full_name}</h2>
          {isVerified && (
            <span className="flex items-center gap-1 bg-success/12 border border-success/20 text-success text-caption uppercase font-black tracking-wider px-2 py-0.5 rounded-md">
              <CheckCircle2 size={10} /> Verified Seller
            </span>
          )}
          <span className="text-caption text-text-muted">Trader since {joinedDate}</span>
        </div>

        <ProfileEditor user={user} onUserUpdate={setSessionUser} />

        <PaymentInfoEditor user={user} onUserUpdate={setSessionUser} />

        <PushNotificationToggle />

        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-1">
          <div className="flex items-center gap-2 text-text-muted text-caption font-bold uppercase tracking-wider">
            <Building2 size={12} /> What you sell
          </div>
          <p className="text-body text-text-primary font-medium">{whatTheySell}</p>
        </div>

        {/* Privacy note */}
        <div className="bg-role-soft border border-role/15 text-text-secondary rounded-xl p-4 text-body">
          Your details are private and only shown to buyers you approve.
        </div>

        <div className="bg-white border border-error/20 shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-text-primary">Sign Out</p>
            <p className="text-body text-text-muted">Log out of your account</p>
          </div>
          <Button variant="destructive" size="sm" className="gap-2" onClick={handleSignOut} loading={signingOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
