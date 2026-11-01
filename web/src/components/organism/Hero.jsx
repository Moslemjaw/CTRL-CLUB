"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import KeyCap from "@/components/brand/KeyCap";
import CircuitRings from "@/components/brand/CircuitRings";
import SignalField from "@/components/brand/SignalField";
import MyTimer from "@/components/atoms/MyTimer";
import ButtonComponent from "@/components/atoms/ButtonComponent";
import { useAuth } from "@/components/AuthProvider";

const EASE = [0.16, 1, 0.3, 1];
const rise = (delay) => ({
  initial: { y: 36, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 1, delay, ease: EASE },
});

export default function Hero() {
  const { isLoggedIn, role } = useAuth();
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const fieldRef = useRef(null);
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const still = useMotionValue(0);
  const progress = reduced ? still : scrollYProgress;

  // Scroll dives through the key: it grows until its white face becomes the next section.
  const keyScale = useTransform(progress, [0.12, 0.92], [1, 11], { ease: (t) => t * t * t });
  const wordOpacity = useTransform(progress, [0.14, 0.34], [1, 0]);
  const ringScale = useTransform(progress, [0, 0.7], [1, 2.6]);
  const ringOpacity = useTransform(progress, [0.1, 0.55], [1, 0]);
  const copyOpacity = useTransform(progress, [0, 0.18], [1, 0]);
  const copyY = useTransform(progress, [0, 0.18], [0, -50]);
  const whiteout = useTransform(progress, [0.82, 0.96], [0, 1]);
  const pointerEvents = useTransform(progress, (value) => (value > 0.16 ? "none" : "auto"));

  const press = () => {
    setPressed(true);
    setFlash((value) => value + 1);
    fieldRef.current?.surge();
  };
  const release = () => setPressed(false);

  // The opening shot: the key lands, clacks, and powers up the board.
  useEffect(() => {
    if (reduced) return;
    const down = setTimeout(press, 760);
    const up = setTimeout(release, 930);
    return () => {
      clearTimeout(down);
      clearTimeout(up);
    };
  }, [reduced]);

  // The real Ctrl key presses the key on screen. It never blocks browser shortcuts.
  useEffect(() => {
    const onDown = (event) => {
      if (event.key === "Control" && !event.repeat) press();
    };
    const onUp = (event) => {
      if (event.key === "Control") release();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return (
    <section id="home" ref={sectionRef} className={`relative ${reduced ? "" : "h-[260vh]"}`}>
      <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden bg-navy">
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 50% 40%, #101A7A 0%, #000650 55%, #00032E 100%)" }} />
        <SignalField ref={fieldRef} />

        {/* Rings and key share a center, slightly above the middle of the screen. */}
        <div className="absolute inset-x-0 top-[34%] flex justify-center lg:top-[40%]">
          <motion.div style={{ scale: ringScale, opacity: ringOpacity, x: "-50%", y: "-50%" }} className="absolute left-1/2 top-1/2 w-[min(150vw,100vh)]">
            <CircuitRings className="h-full w-full" />
          </motion.div>

          {flash > 0 && (
            <motion.div
              key={flash}
              aria-hidden="true"
              initial={{ opacity: 0.85, scale: 0.4, x: "-50%", y: "-50%" }}
              animate={{ opacity: 0, scale: 2.2, x: "-50%", y: "-50%" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(111,203,255,0.75), transparent 65%)" }}
            />
          )}

          <motion.div style={{ scale: keyScale, x: "-50%", y: "-50%" }} className="absolute left-1/2 top-1/2 w-[clamp(180px,27vw,380px)] will-change-transform">
            <motion.button
              type="button"
              aria-label="Press the CTRL key"
              onPointerDown={press}
              onPointerUp={release}
              onPointerLeave={release}
              initial={reduced ? false : { y: "-120vh", rotate: -7 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ duration: 0.75, ease: [0.5, 0, 0.2, 1] }}
              className="block w-full cursor-pointer rounded-[13%]"
            >
              <KeyPicture pressed={pressed} wordOpacity={wordOpacity} />
            </motion.button>
          </motion.div>
        </div>

        <motion.div style={{ opacity: copyOpacity, y: copyY, pointerEvents }} className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1300px] flex-col gap-7 px-5 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pb-12">
          <div className="max-w-xl">
            <motion.p {...rise(1.05)} className="eyebrow mb-3 md:mb-4">Welcome to CTRL Club</motion.p>
            <motion.h1 {...rise(1.15)} className="heading text-[2.35rem] md:text-5xl xl:text-[4.25rem]">Discover Our Next Big Event</motion.h1>
            <motion.div {...rise(1.3)} className="mt-6 flex flex-wrap gap-3">
              {!isLoggedIn ? (
                <>
                  <ButtonComponent text="Sign Up" path="/signUp" />
                  <ButtonComponent text="Log In" path="/logIn" variant="ghost" />
                </>
              ) : role === "ctrl_member" ? (
                <ButtonComponent text="Workspace" path="/workspace" />
              ) : role !== "scanner" ? (
                <ButtonComponent text="My Tickets" path="/myTickets" />
              ) : (
                <ButtonComponent text="QR Scanner" path="/qrScanner" />
              )}
            </motion.div>
          </div>
          <motion.div {...rise(1.4)}>
            <MyTimer />
          </motion.div>
        </motion.div>

        <motion.div style={{ opacity: whiteout }} className="pointer-events-none absolute inset-0 z-20 bg-white" />
      </div>
    </section>
  );
}

function KeyPicture({ pressed, wordOpacity }) {
  return (
    <motion.div style={{ "--word": wordOpacity }} className="[&_.keycap-word]:opacity-[var(--word)]">
      <KeyCap pressed={pressed} />
    </motion.div>
  );
}
