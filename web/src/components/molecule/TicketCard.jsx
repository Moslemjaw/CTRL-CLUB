"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import QRCode from "qrcode";

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

function TicketCard({ qrId, eventId, title, date, status, location }) {
  const reduced = useReducedMotion();
  const [qrImage, setQrImage] = useState("");
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const used = status === "used";

  // Same QR content as the emailed ticket.
  useEffect(() => {
    QRCode.toDataURL(`Text: ${qrId}\nEvent ID: ${eventId}`, { width: 400, margin: 1 }).then(setQrImage);
  }, [qrId, eventId]);

  const tilt = (event) => {
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - box.left) / box.width - 0.5) * 12);
    rotateX.set(((event.clientY - box.top) / box.height - 0.5) * -12);
  };
  const level = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      onPointerMove={tilt}
      onPointerLeave={level}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white text-ink"
    >
      <div className="relative bg-white p-5 pb-4">
        {qrImage ? (
          <img src={qrImage} alt={`QR code for ${title}`} className={`mx-auto aspect-square w-full max-w-64 ${used ? "opacity-25" : ""}`} />
        ) : (
          <div className="mx-auto aspect-square w-full max-w-64 animate-pulse rounded-xl bg-navy/10" />
        )}
        {used && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-lg border-4 border-stop bg-white/90 px-4 py-1 font-display text-3xl font-bold uppercase tracking-widest text-[#C81E45]">Used</span>
        )}
      </div>
      <div className="relative border-t-2 border-dashed border-navy/25 bg-navy p-5 text-white">
        <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-navy-deep" />
        <span aria-hidden="true" className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-navy-deep" />
        <p className={`mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] ${used ? "text-stop" : "text-go"}`}>
          <span className="led" /> {used ? "Used" : "Unused"}
        </p>
        <h3 className="heading mb-3 text-2xl">{title}</h3>
        <p className="text-sm text-white/80">{formatDate(date)}</p>
        <p className="mt-1 text-sm text-sky-soft">{location}</p>
      </div>
    </motion.article>
  );
}

export default TicketCard;
