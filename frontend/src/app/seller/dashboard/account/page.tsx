"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Building2, Camera, Mail, CheckCircle2, LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { auth, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SellerAccountPage() {
  const router = useRouter();
  const { user, isLoading, logout, setSessionUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    router.push("/login");
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const updatedUser = await auth.updateAvatar(file);
      setSessionUser(updatedUser);
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : "Could not update your photo.");
    } finally {
      setUploadingAvatar(false);
    }
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
          <h1 className="text-title font-black text-text-primary tracking-tight">Account</h1>
          <p className="text-caption text-text-muted mt-1">Your shop details and sign-in info.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="relative shrink-0">
              <Avatar name={user.full_name} imageUrl={user.avatar_url} size="2xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex items-center justify-center w-9 h-9 rounded-full bg-role text-white border-2 border-white shadow-sm hover:opacity-90 disabled:opacity-60"
                aria-label="Change profile photo"
              >
                <Camera size={17} strokeWidth={2.5} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-body-lg font-bold text-text-primary">{profile?.store_name || user.full_name}</h2>
                {isVerified && (
                  <span className="flex items-center gap-1 bg-success/12 border border-success/20 text-success text-caption uppercase font-black tracking-wider px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={10} /> Verified Seller
                  </span>
                )}
              </div>
              <p className="text-caption text-text-muted mt-0.5">Trader since {joinedDate}</p>
              {uploadingAvatar && <p className="text-caption text-text-muted mt-0.5">Uploading photo…</p>}
              {avatarError && <p className="text-caption text-error mt-0.5">{avatarError}</p>}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-secondary border border-slate-100 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-text-muted text-caption font-bold uppercase tracking-wider">
                <Mail size={12} /> Your Email
              </div>
              <p className="text-body text-text-primary font-medium">{user.email}</p>
            </div>

            <div className="bg-dark-secondary border border-slate-100 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-text-muted text-caption font-bold uppercase tracking-wider">
                <Building2 size={12} /> What you sell
              </div>
              <p className="text-body text-text-primary font-medium">{whatTheySell}</p>
            </div>
          </div>

          {/* Privacy note */}
          <div className="bg-role-soft border border-role/15 text-text-secondary rounded-xl p-4 text-body">
            Your details are private and only shown to buyers you approve.
          </div>
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
