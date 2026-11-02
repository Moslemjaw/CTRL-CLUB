"use client";

import "./globals.css";
import { useEffect } from "react";
import KeyCap from "@/components/brand/KeyCap";

const RELOAD_KEY = "ctrl-chunk-reload";

export default function GlobalError({ error }) {
  // A page's code failed to load: offline, or this tab predates a deploy. A full
  // reload gets the current version or the offline page. At most once every 10s.
  useEffect(() => {
    if (error?.name !== "ChunkLoadError") return;
    const last = Number(sessionStorage.getItem(RELOAD_KEY));
    if (Date.now() - last < 10000) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-navy px-5 text-center">
          <div>
            <div className="mx-auto mb-10 w-44"><KeyCap label="500" /></div>
            <h1 className="heading text-5xl md:text-6xl">Oops! Something Went Wrong</h1>
            <p className="mb-8 mt-4 text-white/75">Please try again in a moment</p>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
