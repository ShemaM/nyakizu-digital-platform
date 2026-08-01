"use client";

import { useState, useEffect } from "react";
import { User, Shield, Building2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export default function SellerAccountPage() {
  const [profile, setProfile] = useState({
    name: "Nairobi Wholesale Trader",
    email: "shemanzabakamira@gmail.com",
    role: "Verified Seller",
    joinedDate: "August 2026",
    businessType: "Structured Ledger Enterprise",
  });

  return (
    <AppShell title="My Account" showLogo>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header segment */}
        <div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight">Account Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your enterprise identities, security badges, and ledger configurations.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800/60">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center font-black text-xl">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{profile.name}</h2>
                <span className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={10} /> {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Member since {profile.joinedDate}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Mail size={12} className="text-slate-500" /> Registered Email
              </div>
              <p className="text-sm text-slate-200 font-medium">{profile.email}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Building2 size={12} className="text-slate-500" /> Business Classification
              </div>
              <p className="text-sm text-slate-200 font-medium">{profile.businessType}</p>
            </div>
          </div>

          {/* Security Alert Banner */}
          <div className="bg-amber-500/5 border border-amber-500/10 text-amber-400/90 rounded-xl p-4 text-xs font-medium flex items-start gap-2.5">
            <Shield size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-bold text-slate-200">Ledger Security Active</p>
              <p className="text-slate-400 mt-0.5">Your trading node is fully cryptographically signed. To update critical bank parameters or settlement protocols, please contact your systems auditor.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
