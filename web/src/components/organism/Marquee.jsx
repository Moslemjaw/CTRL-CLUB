"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";

const LINE = "Coding / Technology / Robotics / League / ";

// Moves with the page scroll, so it reads as part of the camera move.
export default function Marquee() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const still = useMotionValue(0);
  const x = useTransform(reduced ? still : scrollYProgress, [0, 1], ["0%", "-45%"]);

  return (
    <div className="overflow-hidden bg-white pb-10" aria-hidden="true">
      <motion.p style={{ x }} className="marquee-text whitespace-nowrap font-display text-6xl font-bold uppercase md:text-8xl xl:text-[9rem]">
        {LINE.repeat(5)}
      </motion.p>
    </div>
  );
}
