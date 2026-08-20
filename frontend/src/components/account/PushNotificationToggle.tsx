"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { isPushSupported, isPushSubscribed, pushPermission, subscribeToPush, unsubscribeFromPush } from "@/lib/push";

/**
 * Real OS-level notifications (lock screen, sound, tap-to-open) instead of
 * only the in-app bell — but only Android/Chrome and desktop browsers
 * support this the way a native app would; on iPhone it needs the app
 * added to the home screen first (an Apple platform rule, not something
 * this button can change). Renders nothing where the browser has no
 * support at all, and never auto-prompts — permission is only ever
 * requested from this direct tap.
 */
export function PushNotificationToggle() {
  const { toast } = useToast();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
    setDenied(pushPermission() === "denied");
    isPushSubscribed().then((v) => {
      setSubscribed(v);
      setChecked(true);
    });
  }, []);

  async function handleToggle() {
    setBusy(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
        toast("Notifications turned off.", "success");
      } else {
        const ok = await subscribeToPush();
        setSubscribed(ok);
        setDenied(pushPermission() === "denied");
        if (ok) toast("Notifications are on.", "success");
        else toast("Could not turn on notifications.", "error");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!supported || !checked) return null;

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-role-soft text-role-dark shrink-0">
          {subscribed ? <BellRing size={18} /> : <Bell size={18} />}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary">Notifications on this phone</p>
          <p className="text-body text-text-muted">
            {denied
              ? "Blocked in your browser settings. Turn them on there to use this."
              : subscribed
              ? "You'll get a notification here, like a real app."
              : "Get notified here, like a real app, not just email."}
          </p>
        </div>
      </div>
      {!denied && (
        <Button
          variant={subscribed ? "outline" : "role"}
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={handleToggle}
          loading={busy}
        >
          {subscribed ? <BellOff size={14} /> : <Bell size={14} />}
          {subscribed ? "Turn off" : "Turn on"}
        </Button>
      )}
    </div>
  );
}
