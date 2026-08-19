"use client";

import { auth } from "@/lib/api";

/**
 * Web Push works like a real OS notification (lock screen, sound,
 * tap-to-open) on Android/Chrome and desktop browsers. On iPhone it only
 * works at all once the user has added the app to their home screen
 * (iOS 16.4+) — a platform restriction, not something fixable here. Every
 * function below checks for support first and quietly does nothing where
 * it isn't available, rather than showing an error for a browser limit
 * nobody can change.
 */

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function pushPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

/** Asks the browser for notification permission, then registers a subscription with the backend. Call only from a direct user tap — browsers penalize unprompted permission requests. */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });

  await auth.subscribeToPush(subscription.toJSON());
  return true;
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await auth.unsubscribeFromPush(endpoint);
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== "granted") return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription != null;
}

/** Best-effort app-icon badge — only Chrome/Edge (desktop + installed Android PWA) implement this; everywhere else it's silently a no-op. */
export function setAppBadge(count: number): void {
  if (typeof navigator === "undefined" || !("setAppBadge" in navigator)) return;
  if (count > 0) {
    (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(count).catch(() => {});
  } else {
    (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge?.().catch(() => {});
  }
}
