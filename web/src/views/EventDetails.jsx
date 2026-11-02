"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { toast } from "react-toastify";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";
import Footer from "@/components/organism/Footer";
import BrandMark from "@/components/brand/BrandMark";
import { Loading } from "@/components/Guards";
import { coverImageUrl, getEventById } from "@/api/events";
import { createTicket } from "@/api/tickets";

const EventDetails = () => {
  const eventId = useSearchParams().get("id");
  const reduced = useReducedMotion();
  const [event, setEvent] = useState(null);
  const [missing, setMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 700], [0, reduced ? 0 : 180]);

  const loadEvent = () =>
    getEventById(eventId)
      .then((data) => {
        if (data) setEvent(data);
        else setMissing(true);
      })
      .catch((error) => toast.error(error.message));

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleParticipate = async () => {
    setSubmitting(true);
    try {
      const { emailSent } = await createTicket(eventId);
      if (emailSent) {
        toast.success("Done, Sent Ticket");
      } else {
        toast.warning("You are registered, but the email could not be sent. Your ticket is in My Tickets.");
      }
      await loadEvent();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (missing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-navy-deep px-5 text-center">
        <h1 className="heading text-4xl">Event not found</h1>
        <Link href="/" className="btn btn-primary">Back to Home</Link>
      </main>
    );
  }

  if (!event) return <Loading />;

  const isOpen = event.availableTickets > 0;
  const date = new Date(event.date);

  return (
    <div className="bg-navy-deep">
      <SpeedDialComponent />
      <header className="relative h-[62vh] min-h-96 overflow-hidden">
        {event.coverImage ? (
          <motion.img
            src={coverImageUrl(event.coverImage)}
            alt={event.title}
            style={{ y: imageY }}
            initial={reduced ? false : { scale: 1.25 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-lift/40 pb-24"><BrandMark className="scale-150" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/30 to-navy-deep/40" />
        <Link href="/" className="btn btn-ghost absolute left-5 top-5 !min-h-11 bg-navy-deep/60 backdrop-blur">&larr; Home</Link>
      </header>

      <main className="relative z-10 mx-auto -mt-28 grid max-w-[1200px] gap-8 px-5 pb-24 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <div className="page-enter">
          <p className="eyebrow mb-4">{event.location}</p>
          <h1 className="heading text-5xl md:text-7xl">{event.title}</h1>
          <p className="mt-8 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-white/80">{event.description}</p>
        </div>

        <motion.aside initial={reduced ? false : { y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }} className="panel h-fit lg:sticky lg:top-8">
          <p className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] ${isOpen ? "text-go" : "text-stop"}`}><span className="led" /> {isOpen ? "Open" : "Closed"}</p>
          <dl className="mt-6 grid gap-5">
            <div>
              <dt className="field-label !mb-1">Date</dt>
              <dd className="font-display text-xl font-semibold">{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</dd>
              <dd className="text-white/70">{date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</dd>
            </div>
            <div>
              <dt className="field-label !mb-1">Available Tickets</dt>
              <dd className="font-display text-5xl font-semibold tabular-nums">{event.availableTickets}<span className="ml-2 text-lg font-medium text-white/60">of {event.capacity}</span></dd>
            </div>
          </dl>
          <button onClick={handleParticipate} disabled={submitting || !isOpen} className="btn btn-primary mt-8 w-full">
            {submitting ? "Registering..." : isOpen ? "Register in the Event" : "Not enough tickets available"}
          </button>
        </motion.aside>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;
