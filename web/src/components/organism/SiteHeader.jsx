"use client";

import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";
import AccountMenu from "./AccountMenu";

// The simple top bar for pages outside the home page.
export default function SiteHeader({ className = "sticky top-0" }) {
  return (
    <header className={`${className} z-50 flex items-center justify-between gap-3 border-b border-sky/15 bg-navy-deep/85 px-4 py-2 backdrop-blur-xl md:px-6`}>
      <Link href="/" aria-label="CTRL home"><BrandMark /></Link>
      <AccountMenu />
    </header>
  );
}
