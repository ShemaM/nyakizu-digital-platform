"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/lib/api";
import { cn } from "@/lib/cn";

const ACCOUNT_HREF_BY_ROLE: Record<string, string | undefined> = {
  buyer: "/buyer/account",
  seller: "/seller/dashboard/account",
};

interface ProfileMenuProps {
  user: User;
  onLogout: () => void;
}

export function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const displayName = user.full_name || user.username;
  const accountHref = ACCOUNT_HREF_BY_ROLE[user.role];

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Avatar name={displayName} imageUrl={user.avatar_url} size="xl" />
        <ChevronDown
          size={14}
          className={cn("text-text-muted transition-transform duration-150", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white shadow-2xl z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
            <Avatar name={displayName} imageUrl={user.avatar_url} size="xl" />
            <div className="min-w-0">
              <p className="text-body font-bold text-text-primary truncate">{displayName}</p>
              <p className="text-caption text-text-muted truncate">{user.email}</p>
            </div>
          </div>

          <div className="py-1.5">
            {accountHref && (
              <Link
                href={accountHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-body font-medium text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-colors"
              >
                <UserIcon size={16} aria-hidden="true" /> Account details
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-body font-medium text-error hover:bg-error/5 transition-colors cursor-pointer"
            >
              <LogOut size={16} aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
