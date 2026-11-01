"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTimer } from "react-timer-hook";
import { getClosestEvent } from "@/api/events";

function TimeKey({ value, label }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="w-[4.1rem] md:w-[5.2rem]">
      <div className="relative">
        <div className="absolute inset-0 translate-y-1 rounded-xl bg-sky" />
        <div className="relative h-16 overflow-hidden rounded-xl border-2 border-ink bg-white md:h-[5.2rem]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={text}
              initial={{ y: "-70%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "70%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center font-display text-3xl font-semibold tabular-nums text-ink md:text-[2.5rem]"
            >
              {text}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sky-soft">{label}</p>
    </div>
  );
}

function Countdown({ expiryTimestamp }) {
  const { seconds, minutes, hours, days } = useTimer({ expiryTimestamp });

  return (
    <div className="flex gap-2 md:gap-3" role="timer">
      <TimeKey value={days} label="Days" />
      <TimeKey value={hours} label="Hours" />
      <TimeKey value={minutes} label="Min" />
      <TimeKey value={seconds} label="Sec" />
    </div>
  );
}

export default function MyTimer() {
  const [nextEvent, setNextEvent] = useState(null);
  const [noEventsMessage, setNoEventsMessage] = useState("");

  useEffect(() => {
    getClosestEvent()
      .then((event) => {
        if (event) setNextEvent(event);
        else setNoEventsMessage("There are no upcoming events.");
      })
      .catch(() => setNoEventsMessage("Server Error"));
  }, []);

  if (noEventsMessage) {
    return (
      <div className="rounded-2xl border border-sky/25 bg-navy-deep/60 px-5 py-4 backdrop-blur">
        <p className="eyebrow mb-1 flex items-center gap-2 !text-sky-soft"><span className="led text-sky" /> Standing by</p>
        <p className="font-display text-lg font-semibold">{noEventsMessage}</p>
      </div>
    );
  }

  if (!nextEvent) {
    return <p className="eyebrow">Loading...</p>;
  }

  return (
    <div>
      <p className="eyebrow mb-4 max-w-sm truncate">Next up: {nextEvent.title}</p>
      <Countdown expiryTimestamp={new Date(nextEvent.date)} />
    </div>
  );
}
