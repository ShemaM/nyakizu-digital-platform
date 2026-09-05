"use client";

import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { shareLink } from "@/lib/share";

interface CopyStoreLinkProps {
  url: string;
  /** Customizes the share sheet's message — defaults to a generic "check out my shop" line. */
  shareText?: string;
}

export function CopyStoreLink({ url, shareText }: CopyStoreLinkProps) {
  const { toast } = useToast();

  async function handleShare() {
    const result = await shareLink({
      title: "Nyakizu store",
      text: shareText || "Check out my shop on Nyakizu:",
      url,
    });
    if (result === "fallback") toast("Opening WhatsApp…", "info");
  }

  return (
    <div className="flex min-w-0 w-full flex-1 items-center gap-2">
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
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share store link"
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100"
      >
        <Share2 size={15} />
      </button>
    </div>
  );
}
