"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BsKanban, BsQrCodeScan } from "react-icons/bs";
import { FaTicketAlt } from "react-icons/fa";
import { IoLogOut, IoPersonCircleOutline } from "react-icons/io5";
import { RiAdminFill } from "react-icons/ri";
import ProfileAvatar from "@/components/atoms/ProfileAvatar";
import { useAuth } from "@/components/AuthProvider";
import { logOut } from "@/api/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: <RiAdminFill />, roles: ["admin"] },
  { href: "/workspace", label: "Workspace", icon: <BsKanban />, roles: ["ctrl_member"] },
  { href: "/myTickets", label: "My Tickets", icon: <FaTicketAlt />, roles: ["admin", "user"] },
  { href: "/qrScanner", label: "QR Scanner", icon: <BsQrCodeScan />, roles: ["admin", "scanner", "ctrl_member"] },
  { href: "/workspace/profile", label: "Profile", icon: <IoPersonCircleOutline />, roles: ["admin", "ctrl_member"] },
];
const ROLE_LABELS = { admin: "Admin", ctrl_member: "CTRL Member", scanner: "Scanner", user: "Member" };
const itemClass = "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 font-display font-semibold transition-colors";

export default function AccountMenu() {
  const { loading, isLoggedIn, userData, role } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (loading) return <span className="h-11 w-11" aria-hidden="true" />;

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-1 md:gap-2">
        <Link href="/logIn" className="flex min-h-11 items-center rounded-xl px-3 font-display font-semibold text-white/85 transition-colors hover:text-white">Log In</Link>
        <Link href="/signUp" className="btn btn-primary !min-h-11 !px-4 !py-2">Sign Up</Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform active:translate-y-0.5"
      >
        <ProfileAvatar userData={userData} className="h-10 w-10 !rounded-xl text-lg" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+0.6rem)] z-[120] w-64 origin-top-right rounded-2xl border border-sky/25 bg-navy-deep p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="border-b border-sky/15 px-3 pb-3 pt-2">
              <p className="truncate font-display font-semibold">{userData?.name}</p>
              <p className="truncate font-mono text-xs uppercase tracking-[0.1em] text-sky">{userData?.title || ROLE_LABELS[role] || "Member"}</p>
            </div>
            <nav aria-label="Account" className="flex flex-col gap-0.5 pt-2">
              {LINKS.filter((link) => link.roles.includes(role)).map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`${itemClass} text-white/85 hover:bg-white/10 hover:text-white`}>
                  <span className="text-lg text-sky" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <button type="button" onClick={logOut} className={`${itemClass} text-stop hover:bg-stop/10`}>
                <span className="text-lg" aria-hidden="true"><IoLogOut /></span>
                Log Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
