"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { FaHome, FaTicketAlt } from "react-icons/fa";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { BsKanban, BsPencilSquare, BsQrCodeScan } from "react-icons/bs";
import { IoMdPersonAdd } from "react-icons/io";
import { RiAdminFill } from "react-icons/ri";
import { logOut } from "@/api/auth";
import { useAuth } from "../AuthProvider";

const itemClass = "group relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-sky/40 bg-navy-deep/95 text-xl text-white backdrop-blur transition-colors hover:bg-white hover:text-ink";

function Tip({ children }) {
  return <span className="pointer-events-none absolute right-[64px] whitespace-nowrap rounded-lg bg-white px-3 py-1.5 font-display text-sm font-semibold text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{children}</span>;
}

const SpeedDialComponent = () => {
  const { isLoggedIn, role } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [{ href: "/", label: "Home", icon: <FaHome /> }, { href: "/blog", label: "Blog", icon: <BsPencilSquare /> }];
  if (role === "admin") links.push({ href: "/admin", label: "Admin", icon: <RiAdminFill /> });
  if (role === "admin" || role === "ctrl_member") links.push({ href: "/workspace", label: "Workspace", icon: <BsKanban /> });
  if (role === "admin" || role === "scanner" || role === "ctrl_member") links.push({ href: "/qrScanner", label: "QR Scanner", icon: <BsQrCodeScan /> });
  if (isLoggedIn && role !== "scanner" && role !== "ctrl_member") links.push({ href: "/myTickets", label: "My Tickets", icon: <FaTicketAlt /> });
  if (!isLoggedIn) {
    links.push({ href: "/signUp", label: "Sign Up", icon: <IoMdPersonAdd /> });
    links.push({ href: "/logIn", label: "Log In", icon: <IoLogIn /> });
  }

  const pop = (index) => ({
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.8 },
    transition: { type: "spring", stiffness: 500, damping: 28, delay: index * 0.04 },
  });

  return (
    <div className="fixed bottom-5 right-4 z-[300] flex flex-col items-end md:bottom-8 md:right-7">
      <AnimatePresence>
        {open && (
          <nav aria-label="Quick actions" className="mb-3 flex flex-col gap-2">
            {isLoggedIn && (
              <motion.button key="logout" {...pop(links.length)} type="button" onClick={logOut} aria-label="Log Out" className={`${itemClass} !border-stop/60 text-stop hover:!bg-stop hover:!text-ink`}>
                <IoLogOut /><Tip>Log Out</Tip>
              </motion.button>
            )}
            {links.map((link, index) => (
              <motion.div key={link.href} {...pop(links.length - 1 - index)}>
                <Link href={link.href} aria-label={link.label} onClick={() => setOpen(false)} className={itemClass}>
                  {link.icon}<Tip>{link.label}</Tip>
                </Link>
              </motion.div>
            ))}
          </nav>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open actions menu"
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-white text-ink shadow-[0_5px_0_#6FCBFF] transition-all active:translate-y-[5px] active:shadow-none"
      >
        <motion.svg animate={{ rotate: open ? 45 : 0 }} viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M10 2v16M2 10h16" /></motion.svg>
      </button>
    </div>
  );
};

export default SpeedDialComponent;
