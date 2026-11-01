"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { coverImageUrl } from "@/api/events";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function EventCard({ image, id, title, description, date, location, availableTickets, capacity, homeTickets, handleDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isOpen = availableTickets > 0;
  const taken = capacity > 0 ? Math.round(((capacity - availableTickets) / capacity) * 100) : 100;

  const trackPointer = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
  };

  return (
    <article onPointerMove={trackPointer} className="group relative overflow-hidden rounded-3xl border border-sky/20 bg-navy-panel/90 backdrop-blur transition-colors duration-300 hover:border-sky/60">
      <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(22rem circle at var(--mx) var(--my), rgba(111,203,255,0.13), transparent 70%)" }} />
      <div className="relative grid 2md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.5fr)_15rem]">
        <div className="relative aspect-[16/10] overflow-hidden 2md:aspect-auto 2md:min-h-72">
          <img src={coverImageUrl(image)} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-panel/70 to-transparent 2md:bg-gradient-to-r 2md:from-transparent 2md:to-navy-panel/50" />
        </div>

        <div className="flex flex-col justify-center p-6 lg:p-8">
          <p className="eyebrow mb-3">{formatDate(date)}</p>
          <h3 className="heading mb-3 text-2xl lg:text-3xl">{title}</h3>
          <p className="mb-4 line-clamp-3 leading-relaxed text-white/70">{description}</p>
          <p className="flex items-center gap-2 text-sm text-sky-soft">
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true"><path d="M8 0a5.5 5.5 0 0 0-5.5 5.5C2.5 9.6 8 16 8 16s5.5-6.4 5.5-10.5A5.5 5.5 0 0 0 8 0Zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" /></svg>
            {location}
          </p>
        </div>

        <div className="relative flex flex-col justify-between gap-5 border-t border-dashed border-sky/30 p-6 2md:border-l 2md:border-t-0">
          <span aria-hidden="true" className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-navy-deep 2md:block" />
          <span aria-hidden="true" className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-navy-deep 2md:block" />
          <p className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] ${isOpen ? "text-go" : "text-stop"}`}>
            <span className="led" /> {isOpen ? "Open" : "Closed"}
          </p>
          <div>
            <p className="font-display text-4xl font-semibold tabular-nums">{availableTickets}</p>
            <p className="mb-3 text-sm text-white/65">of {capacity} tickets left</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${taken}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-sky" />
            </div>
          </div>
          {homeTickets === "Home" && (
            <Link href={`/eventDetails?id=${id}`} className="btn btn-primary relative z-20 w-full">Join Event</Link>
          )}
          {homeTickets === "Admin" && (
            <div className="relative z-20 flex gap-2">
              <Link href={`/admin/allEvents/editEvent?id=${id}`} aria-label={`Edit ${title}`} className="btn btn-ghost flex-1 !px-3"><FaEdit /></Link>
              <button type="button" aria-label={`Delete ${title}`} onClick={() => setShowConfirm(true)} className="btn btn-ghost flex-1 !border-stop/50 !px-3 text-stop"><FaTrashAlt /></button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center bg-navy-deep/90 p-6 backdrop-blur">
            <div className="text-center">
              <p className="mb-5 font-display text-xl font-semibold">Are you sure you want to delete this event?</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => { handleDelete(); setShowConfirm(false); }} className="btn bg-stop font-semibold text-ink">Yes, Delete</button>
                <button onClick={() => setShowConfirm(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default EventCard;
