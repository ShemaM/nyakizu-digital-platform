"use client";

import { useRef, useState } from "react";
import { Camera, Mail, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { auth, ApiError, type User } from "@/lib/api";

interface ProfileEditorProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

/**
 * Shared by the buyer and seller account pages: photo, name, email, and
 * phone — the identity info every account has, regardless of role.
 * Role-specific fields (shop details, business type, etc.) live in each
 * page's own section below this one.
 */
export function ProfileEditor({ user, onUserUpdate }: ProfileEditorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone_number);
  const [saving, setSaving] = useState(false);

  const dirty = fullName.trim() !== user.full_name || email.trim() !== user.email || phone.trim() !== user.phone_number;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const updated = await auth.updateProfile({ avatarFile: file });
      onUserUpdate(updated);
      toast("Photo updated.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not update your photo.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const updated = await auth.updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
      });
      onUserUpdate(updated);
      toast("Profile updated.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not save your changes.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar name={user.full_name} imageUrl={user.avatar_url} size="2xl" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 flex items-center justify-center w-9 h-9 rounded-full bg-role-dark text-white border-2 border-white shadow-sm hover:opacity-90 disabled:opacity-60"
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
          <p className="text-body-lg font-bold text-text-primary">{user.full_name}</p>
          {uploadingAvatar && <p className="text-caption text-text-muted mt-0.5">Uploading photo…</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="sm:col-span-2"
        />
        <Input
          label="Email"
          type="email"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Phone number"
          type="tel"
          icon={<Phone size={16} />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={!dirty} loading={saving} className="w-full sm:w-auto">
        Save changes
      </Button>
    </div>
  );
}
