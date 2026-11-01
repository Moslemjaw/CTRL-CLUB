"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { MdEmojiEvents, MdOutlineAddToPhotos } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { BiSolidDashboard } from "react-icons/bi";
import { BsCalendar3, BsJournalText, BsKanban, BsQrCodeScan } from "react-icons/bs";
import { IoMdPersonAdd } from "react-icons/io";
import BrandMark from "@/components/brand/BrandMark";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";
import { useAuth } from "@/components/AuthProvider";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: <BiSolidDashboard /> },
  { href: "/admin/addUser", label: "Add User", icon: <IoMdPersonAdd /> },
  { href: "/admin/allEvents", label: "All Events", icon: <MdEmojiEvents /> },
  { href: "/admin/addEvent", label: "Add Event", icon: <MdOutlineAddToPhotos /> },
  { href: "/admin/settings", label: "Settings", icon: <IoSettingsSharp /> },
];

const TEAM_LINKS = [
  { href: "/workspace/tasks", label: "Tasks", icon: <BsKanban /> },
  { href: "/workspace/calendar", label: "Calendar", icon: <BsCalendar3 /> },
  { href: "/workspace/notes", label: "Notes", icon: <BsJournalText /> },
  { href: "/qrScanner", label: "QR Scanner", icon: <BsQrCodeScan /> },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { userData, role } = useAuth();
  const links = role === "admin" ? [...ADMIN_LINKS, ...TEAM_LINKS] : TEAM_LINKS;
  const isActive = (href) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="page-bg min-h-screen">
      <SpeedDialComponent />
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 lg:px-6 lg:py-6">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="flex h-full flex-col gap-5 rounded-2xl border border-sky/15 bg-navy-panel/70 p-4 backdrop-blur">
            <Link href="/" aria-label="CTRL home"><BrandMark /></Link>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-display text-xl font-bold text-ink shadow-[0_3px_0_#6FCBFF]">{userData?.name?.[0]?.toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold">{userData?.name}</p>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-sky">{role === "admin" ? "Admin" : "CTRL Member"}</p>
              </div>
            </div>
            <nav aria-label="Dashboard Links" className="flex gap-1 overflow-x-auto lg:flex-col">
              {links.map(({ href, label, icon }) => (
                <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={`relative flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 font-display font-semibold transition-colors ${isActive(href) ? "text-ink" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
                  {isActive(href) && <motion.span layoutId="admin-active" className="absolute inset-0 rounded-xl bg-white shadow-[0_3px_0_#6FCBFF]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative text-lg" aria-hidden="true">{icon}</span>
                  <span className="relative">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main key={pathname} className="page-enter min-w-0 pb-20">{children}</main>
      </div>
    </div>
  );
}
