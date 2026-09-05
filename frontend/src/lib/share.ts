"use client";

/**
 * Shares a link the way whichever device actually supports: the native
 * share sheet on mobile (WhatsApp is usually the first option there, and
 * this is a WhatsApp-heavy market), falling back to a WhatsApp web/deep
 * link on desktop where `navigator.share` doesn't exist. Deliberately not
 * a real Facebook/Instagram API integration — those need OAuth app review
 * and business verification for a payoff most sellers here would just get
 * from sharing a WhatsApp link anyway.
 *
 * Returns "shared" | "cancelled" | "fallback" — cancelled means the user
 * dismissed the native share sheet, which callers should treat as a
 * no-op, not an error.
 */
export async function shareLink(params: { title: string; text: string; url: string }): Promise<"shared" | "cancelled" | "fallback"> {
  const { title, text, url } = params;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (err) {
      // AbortError = the user closed the share sheet without picking
      // anything — not a failure worth surfacing.
      if (err instanceof Error && err.name === "AbortError") return "cancelled";
      // Any other failure (e.g. a browser that half-implements the API)
      // falls through to the WhatsApp link below instead of erroring out.
    }
  }

  // Same-tab navigation, not window.open: a popup opened *after* an
  // awaited (and rejected) navigator.share() call can lose the browser's
  // "recent user gesture" state and get silently blocked, with no error to
  // catch — this way there's nothing for a popup blocker to block. On
  // mobile, wa.me still hands off to the WhatsApp app via its own redirect;
  // on desktop it lands on web.whatsapp.com in the same tab.
  const whatsappText = `${text} ${url}`;
  window.location.href = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
  return "fallback";
}
