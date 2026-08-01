"use client";

import { ReactNode } from "react";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function Dialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  children,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="app-panel relative w-full max-w-sm space-y-4 rounded-lg p-6 shadow-2xl animate-scale-in">
        <div className="absolute left-1/2 top-3 h-1 w-8 -translate-x-1/2 rounded-full bg-slate-200 sm:hidden" />

        <div className="space-y-2 pt-2 sm:pt-0">
          <h2 className="text-base font-black text-slate-950 sm:text-lg">
            {title}
          </h2>
          {message && <p className="text-sm leading-relaxed text-slate-600">{message}</p>}
          {children}
        </div>

        <div className="flex gap-2.5 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant === "primary" ? "default" : variant === "danger" ? "destructive" : variant} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
