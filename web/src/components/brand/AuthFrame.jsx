"use client";

import Link from "next/link";
import { motion } from "motion/react";
import BrandMark from "./BrandMark";
import CircuitRings from "./CircuitRings";
import KeyCap from "./KeyCap";
import SignalField from "./SignalField";
import SpeedDialComponent from "@/components/organism/SpeedDialComponent";

export default function AuthFrame({ title, tagline, heading, children }) {
  return (
    <div className="grid min-h-screen bg-navy-deep 2md:grid-cols-2">
      <SpeedDialComponent />
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-navy px-10 text-center 2md:flex">
        <SignalField opacity={0.8} />
        <div className="relative flex h-[26rem] w-full items-center justify-center">
          <div className="absolute left-1/2 top-1/2 w-[32rem] -translate-x-1/2 -translate-y-1/2">
            <CircuitRings className="h-full w-full" delay={0.2} />
          </div>
          <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15 }} className="relative w-40">
            <KeyCap />
          </motion.div>
        </div>
        <h1 className="heading relative mt-2 text-4xl">{title}</h1>
        <p className="relative mt-4 max-w-md leading-relaxed text-white/75">{tagline}</p>
      </div>

      <div className="page-enter flex flex-col px-5 py-5 md:px-12 lg:px-20">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="CTRL home"><BrandMark /></Link>
          <Link href="/" className="text-sm text-white/70 transition-colors hover:text-sky">Back to Home</Link>
        </div>
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-10">
          <h2 className="heading mb-7 text-4xl">{heading}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
