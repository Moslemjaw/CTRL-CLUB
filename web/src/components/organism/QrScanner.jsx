"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import { scanTicket } from "@/api/tickets";
import { getAllEventsForScanner } from "@/api/events";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

const QrScanner = () => {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const selectedEventRef = useRef("");

  useEffect(() => {
    selectedEventRef.current = selectedEvent;
  }, [selectedEvent]);

  useEffect(() => {
    getAllEventsForScanner()
      .then(setEvents)
      .catch((error) => toast.error(`Error fetching events: ${error.message}`));
  }, []);

  const handleScan = async (result) => {
    if (!result?.length) return;
    setCameraEnabled(false);
    try {
      const currentSelectedEvent = selectedEventRef.current;
      const text = result[0].rawValue.match(/Text:\s*([^\n]+)/)?.[1];

      if (!currentSelectedEvent) {
        setScanResult("Select the event you want to scan.");
      } else if (!text) {
        setScanResult("Ticket not found");
      } else {
        setScanResult(await scanTicket(text, currentSelectedEvent));
      }
    } catch (error) {
      setScanResult("Error scanning the ticket: " + error.message);
    } finally {
      setTimeout(() => setCameraEnabled(true), 1000);
    }
  };

  const failed = ["Ticket already used", "Ticket not found", "This ticket is not available for this event."];
  const tone = scanResult === "Ticket used successfully" ? "go" : failed.includes(scanResult) ? "stop" : "idle";
  const toneClass = {
    go: "border-go bg-go text-ink",
    stop: "border-stop bg-stop text-ink",
    idle: "border-sky/30 bg-navy-panel text-white",
  }[tone];

  return (
    <div className="w-full text-center">
      <label htmlFor="scanner-event" className="field-label text-left">Event</label>
      <select id="scanner-event" value={selectedEvent} onChange={(event) => setSelectedEvent(event.target.value)} className="field">
        <option value="">Select an Event</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        ))}
      </select>

      <div className="relative mt-5 aspect-square overflow-hidden rounded-3xl border border-sky/30 bg-black">
        {cameraEnabled ? (
          <Scanner onScan={handleScan} onError={() => setCameraEnabled(false)} components={{ finder: false }} />
        ) : (
          <p className="flex h-full items-center justify-center p-6 font-display text-2xl font-semibold">Open Your Camera</p>
        )}
        <div className="pointer-events-none absolute inset-[9%]" aria-hidden="true">
          {["left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"].map((corner) => (
            <span key={corner} className={`absolute h-12 w-12 border-sky ${corner}`} />
          ))}
          {cameraEnabled && <span className="scan-laser absolute inset-x-2 h-0.5 bg-sky shadow-[0_0_18px_4px_rgba(111,203,255,0.8)]" />}
        </div>
      </div>

      <motion.p
        key={scanResult ?? "idle"}
        role="status"
        initial={{ scale: 0.92, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={`mt-5 rounded-2xl border-2 px-5 py-4 font-display text-xl font-bold md:text-2xl ${toneClass}`}
      >
        {scanResult ?? "Scan QR Code"}
      </motion.p>
    </div>
  );
};

export default QrScanner;
