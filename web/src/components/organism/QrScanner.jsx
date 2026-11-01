"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
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

  return (
    <div className="text-center max-w-[600px]">
      <div className="mb-2">
        <select
          value={selectedEvent}
          onChange={(event) => setSelectedEvent(event.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select an Event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>
      <p className={`text-3xl font-black mb-4 ${scanResult === "Ticket used successfully" ? "text-green-500" : failed.includes(scanResult) ? "text-red-500" : ""}`}>
        {scanResult ? `"${scanResult}"` : "Scan QR Code"}
      </p>
      {cameraEnabled ? (
        <Scanner onScan={handleScan} onError={() => setCameraEnabled(false)} />
      ) : (
        <p className="text-2xl">Open Your Camera</p>
      )}
    </div>
  );
};

export default QrScanner;
