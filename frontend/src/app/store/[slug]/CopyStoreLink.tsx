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
        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-dark-accent bg-dark-deepest px-3 py-2 text-left transition hover:border-brand-gold/40 hover:bg-dark-tertiary"
      >
        <p className="min-w-0 flex-1 truncate font-mono text-caption text-text-secondary">{url}</p>
        <Copy size={14} className="shrink-0 text-text-muted" />
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share store link"
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-dark-accent bg-dark-deepest text-text-secondary transition hover:border-brand-gold/40 hover:bg-dark-tertiary hover:text-text-primary"
      >
        <Share2 size={15} />
      </button>
    </div>
  );
}
