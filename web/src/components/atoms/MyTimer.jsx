"use client";

import { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { getClosestEvent } from "@/api/events";

const pad = (value) => String(value).padStart(2, "0");

function Countdown({ expiryTimestamp }) {
  const { seconds, minutes, hours, days } = useTimer({ expiryTimestamp });
  return (
    <span className="tabular-nums text-white" role="timer">
      {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
    </span>
  );
}

// One quiet line under the hero button. It stays hidden when no event is coming up.
export default function MyTimer() {
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    getClosestEvent().then(setNextEvent).catch(() => {});
  }, []);

  if (!nextEvent) return null;

  return (
    <p className="flex max-w-full flex-wrap items-center justify-center gap-x-2 font-mono text-sm text-sky-soft">
      <span className="max-w-[18rem] truncate">Next: {nextEvent.title}</span>
      <span aria-hidden="true">/</span>
      <Countdown expiryTimestamp={new Date(nextEvent.date)} />
    </p>
  );
}
