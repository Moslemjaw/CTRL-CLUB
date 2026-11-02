"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { MdEmojiEvents, MdOutlineAddToPhotos } from "react-icons/md";
import { IoClose, IoLogOut, IoMenu, IoPersonCircleOutline } from "react-icons/io5";
import { BiSolidDashboard } from "react-icons/bi";
import { BsCalendar3, BsEnvelope, BsJournalText, BsKanban, BsPencilSquare, BsQrCodeScan } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import BrandMark from "@/components/brand/BrandMark";
import { useAuth } from "@/components/AuthProvider";
import { logOut } from "@/api/auth";
import { getUnreadCount, MESSAGES_CHANGED } from "@/api/messages";
import { ProfileAvatar } from "./EditProfile";

const OVERVIEW = {
  links: [
    { href: "/admin", label: "Dashboard", icon: <BiSolidDashboard /> },
    { href: "/admin/messages", label: "Messages", icon: <BsEnvelope /> },
  ],
};
const QR_SCANNER = { href: "/qrScanner", label: "QR Scanner", icon: <BsQrCodeScan /> };
const EVENTS = {
  title: "Events",
  links: [
    { href: "/admin/allEvents", label: "All Events", icon: <MdEmojiEvents /> },
    { href: "/admin/addEvent", label: "Add Event", icon: <MdOutlineAddToPhotos /> },
    QR_SCANNER,
  ],
};
const WORKSPACE_LINKS = [
  { href: "/workspace/tasks", label: "Tasks", icon: <BsKanban /> },
  { href: "/workspace/calendar", label: "Calendar", icon: <BsCalendar3 /> },
  { href: "/workspace/notes", label: "Notes", icon: <BsJournalText /> },
];
const WORKSPACE = { title: "Workspace", links: WORKSPACE_LINKS };
const MEMBER_WORKSPACE = { title: "Workspace", links: [...WORKSPACE_LINKS, QR_SCANNER] };
const CONTENT = {
  title: "Manage",
  links: [
    { href: "/admin/blogs", label: "Blogs", icon: <BsPencilSquare /> },
    { href: "/admin/addUser", label: "Add User", icon: <IoMdPersonAdd /> },
  ],
};
const PROFILE = { href: "/workspace/profile", label: "Profile", icon: <IoPersonCircleOutline /> };

const rowClass = "flex min-h-11 w-full items-center gap-3 lg:min-h-10 rounded-xl px-3 font-display font-semibold text-white/75 transition-colors hover:bg-white/5 hover:text-white";

function Sidebar({ groups, isActive, activeId, onNavigate, closeButton, unread }) {
  const { userData, role } = useAuth();

  const renderLink = ({ href, label, icon }) => (
    <Link key={href} href={href} onClick={onNavigate} aria-current={isActive(href) ? "page" : undefined} className={`relative ${rowClass} ${isActive(href) ? "!text-ink hover:!bg-transparent" : ""}`}>
      {isActive(href) && <motion.span layoutId={activeId} className="absolute inset-0 rounded-xl bg-white shadow-[0_3px_0_#6FCBFF]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
      <span className="relative text-lg" aria-hidden="true">{icon}</span>
      <span className="relative">{label}</span>
      {href === "/admin/messages" && unread > 0 && (
        <span className="relative ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-sky px-1.5 font-mono text-xs font-medium text-ink" aria-label={`${unread} unread`}>{unread}</span>
      )}
    </Link>
  );

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4 lg:py-3">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="CTRL home" onClick={onNavigate}><BrandMark /></Link>
        {closeButton}
      </div>
      <Link href={PROFILE.href} onClick={onNavigate} aria-label="Open your profile" className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 transition-colors hover:bg-white/10">
        <ProfileAvatar userData={userData} className="h-10 w-10 text-lg" />
        <div className="min-w-0">
          <p className="truncate font-display font-semibold">{userData?.name}</p>
          <p className="truncate font-mono text-xs uppercase tracking-[0.14em] text-sky">{userData?.title || (role === "admin" ? "Admin" : "CTRL Member")}</p>
        </div>
      </Link>
      <nav aria-label="Dashboard Links" className="flex flex-col gap-3">
        {groups.map((group, index) => (
          <div key={group.title ?? index} className="flex flex-col gap-0.5">
            {group.title && <p className="eyebrow px-3 pb-1 !text-[0.68rem]">{group.title}</p>}
            {group.links.map(renderLink)}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-sky/15 pt-2">
        {renderLink(PROFILE)}
        <Link href="/" onClick={onNavigate} className={rowClass}>
          <span className="text-lg" aria-hidden="true"><FaHome /></span>Back to Site
        </Link>
        <button type="button" onClick={logOut} className={`${rowClass} !text-stop hover:!bg-stop/10`}>
          <span className="text-lg" aria-hidden="true"><IoLogOut /></span>Log Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const closeRef = useRef(null);
  const isAdmin = role === "admin";
  const groups = isAdmin ? [OVERVIEW, EVENTS, WORKSPACE, CONTENT] : [MEMBER_WORKSPACE];
  const isActive = (href) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const current = [...groups.flatMap((group) => group.links), PROFILE].find(({ href }) => isActive(href));

  useEffect(() => {
    if (!isAdmin) return;
    const refresh = () => getUnreadCount().then(setUnread).catch(() => {});
    refresh();
    window.addEventListener(MESSAGES_CHANGED, refresh);
    return () => window.removeEventListener(MESSAGES_CHANGED, refresh);
  }, [isAdmin, pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="page-bg min-h-screen">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-sky/15 bg-navy-deep/90 px-4 py-2 backdrop-blur lg:hidden">
        <Link href="/" aria-label="CTRL home"><BrandMark /></Link>
        <p className="min-w-0 truncate font-display font-semibold">{current?.label}</p>
        <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky/30 text-2xl">
          <IoMenu aria-hidden="true" />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sky/15 bg-navy-panel/70 backdrop-blur lg:block">
        <Sidebar groups={groups} isActive={isActive} activeId="sidebar-active" unread={unread} />
      </aside>

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-navy-deep/70" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-sky/15 bg-navy-panel">
              <Sidebar
                groups={groups}
               
                isActive={isActive}
                activeId="drawer-active"
                unread={unread}
                onNavigate={() => setMenuOpen(false)}
                closeButton={
                  <button ref={closeRef} type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky/30 text-2xl">
                    <IoClose aria-hidden="true" />
                  </button>
                }
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <main key={pathname} className="page-enter mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
