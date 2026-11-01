"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import BrandMark from "@/components/brand/BrandMark";
import { useAuth } from "@/components/AuthProvider";
import { scrollToId } from "@/lib/scroll";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "events", label: "Events" },
  { id: "contact", label: "Contact Us" },
];

function Navbar() {
  const { isLoggedIn, role } = useAuth();
  const [openNav, setOpenNav] = useState(false);
  const account = !isLoggedIn
    ? { href: "/logIn", label: "Log In" }
    : role === "ctrl_member"
      ? { href: "/workspace", label: "Workspace" }
      : { href: "/myTickets", label: "My Tickets" };
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    // Whichever section crosses the middle of the screen is the active one.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const goTo = (id) => {
    setOpenNav(false);
    scrollToId(id);
  };

  return (
    <motion.div initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 1.25, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 md:px-5 md:pt-4">
      <header className="relative mx-auto flex max-w-[1300px] items-center justify-between rounded-2xl border border-sky/20 bg-navy-deep/75 py-2 pl-4 pr-2 backdrop-blur-xl">
        <Link href="/" aria-label="CTRL home"><BrandMark /></Link>

        <nav className="hidden items-center gap-1 slg:flex" aria-label="Sections">
          {SECTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => goTo(id)} className={`relative rounded-xl px-4 py-2.5 font-display font-semibold transition-colors ${activeSection === id ? "text-ink" : "text-white/75 hover:text-white"}`}>
              {activeSection === id && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-white shadow-[0_3px_0_#6FCBFF]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
          <Link href="/blog" className="rounded-xl px-4 py-2.5 font-display font-semibold text-white/75 transition-colors hover:text-white">Blog</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={account.href} className="btn btn-primary hidden !min-h-11 !py-2 md:inline-flex">{account.label}</Link>
          <button type="button" aria-label={openNav ? "Close menu" : "Open menu"} aria-expanded={openNav} onClick={() => setOpenNav(!openNav)} className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-sky/30 slg:hidden">
            <motion.span animate={openNav ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="h-0.5 w-5 bg-white" />
            <motion.span animate={openNav ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} className="h-0.5 w-5 bg-white" />
          </button>
        </div>

        <AnimatePresence>
          {openNav && (
            <motion.nav
              aria-label="Sections"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-2xl border border-sky/20 bg-navy-deep/95 p-3 backdrop-blur-xl slg:hidden"
            >
              {SECTIONS.map(({ id, label }) => (
                <button key={id} onClick={() => goTo(id)} className={`block w-full rounded-xl px-4 py-3 text-left font-display text-lg font-semibold ${activeSection === id ? "bg-white text-ink" : "text-white"}`}>{label}</button>
              ))}
              <Link href="/blog" className="block w-full rounded-xl px-4 py-3 text-left font-display text-lg font-semibold text-white">Blog</Link>
              <Link href={account.href} className="btn btn-ghost mt-2 w-full md:hidden">{account.label}</Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </motion.div>
  );
}

export default Navbar;
