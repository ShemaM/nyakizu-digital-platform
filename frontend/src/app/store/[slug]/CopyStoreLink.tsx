"use client";

import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function CopyStoreLink({ url }: { url: string }) {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(url);
        toast("Store link copied.", "success");
      }}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-100"
    >
      <p className="min-w-0 flex-1 truncate font-mono text-caption text-slate-500">{url}</p>
      <Copy size={14} className="shrink-0 text-slate-400" />
    </button>
  );
}
