"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Building2, LogOut, Edit2, Check, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  });

  const handleSave = () => {
    // TODO: Implement API call to update profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <AppShell title="Account">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <User size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-800">No user information</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Account" showLogo>
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.07)] mb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-lg">
            {(user.full_name || user.username)?.[0]?.toUpperCase() ?? "?"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold text-gray-900">{user.full_name || user.username}</h2>
              <Badge status={user.role === "buyer" ? "approved" : "pending"} />
            </div>
            <p className="text-sm text-gray-500">@{user.username}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <User size={11} />
              <span className="capitalize">{user.role}</span>
              <span>·</span>
              <span>Member since {new Date(user.date_joined).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? "secondary" : "primary"}
              size="sm"
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              className="gap-1.5"
            >
              {isEditing ? <><X size={14} /> Cancel</> : <><Edit2 size={14} /> Edit</>}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-red-600 hover:text-red-700"
            >
              <LogOut size={14} /> Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <Card>
        <CardSection>
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-gray-400" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Personal Information</h3>
          </div>

          <div className="space-y-4">
            {/* Full name */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-800 font-medium">{user.full_name || "-"}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400 shrink-0" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-800">{user.email}</p>
                )}
                {user.is_email_verified && (
                  <Badge status="approved" />
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400 shrink-0" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-800">{user.phone_number || "-"}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={handleCancel} className="gap-1.5">
                <X size={14} /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Check size={14} /> Save Changes
              </Button>
            </div>
          )}
        </CardSection>

        {/* Account status */}
        <CardSection>
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-gray-400" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Account Status</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Account Type</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{user.role}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Email Verified</span>
              <Badge status={user.is_email_verified ? "approved" : "pending"} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(user.date_joined).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardSection>
      </Card>
    </AppShell>
  );
}