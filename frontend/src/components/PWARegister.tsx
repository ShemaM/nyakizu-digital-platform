"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

// The actual registration logic — only ever runs in the browser
function PWARegisterInner() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "SYNC_DRAFTS") {
            window.dispatchEvent(new CustomEvent("nyakizu:sync-drafts"));
          }
        });

        window.addEventListener("online", async () => {
          if ("sync" in reg) {
            try {
              await (reg as any).sync.register("sync-draft-orders");
            } catch {
              // Background Sync not supported — app layer handles via online event
            }
          }
          window.dispatchEvent(new CustomEvent("nyakizu:sync-drafts"));
        });
      } catch (err) {
        console.warn("[Nyakizu SW] Registration failed:", err);
      }
    };

    register();
  }, []);

  return null;
}

// dynamic with ssr:false is valid here because this file itself is "use client"
const PWARegister = dynamic(() => Promise.resolve(PWARegisterInner), {
  ssr: false,
});

export { PWARegister };