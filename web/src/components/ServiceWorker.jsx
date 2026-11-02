"use client";

import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register(`/sw.js?v=${process.env.NEXT_PUBLIC_BUILD_ID}`, { updateViaCache: "none" })
        .catch(() => {
          /* the site works the same without it */
        });
      return;
    }

    // In next dev, remove any worker left on this port by an earlier next start.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    caches.keys().then((names) => {
      names.filter((name) => name.startsWith("ctrl-")).forEach((name) => caches.delete(name));
    });
  }, []);

  return null;
}
