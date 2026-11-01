"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CircuitVisual, CodeVisual, RobotVisual } from "@/components/brand/PillarVisuals";
import { scrollToId } from "@/lib/scroll";

const HEADLINE = "Where students learn by building.";

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity }} className="inline-block">{children}</motion.span>;
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { y: 44, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const AboutUs = () => {
  const reduced = useReducedMotion();
  const textRef = useRef(null);
  const still = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: textRef, offset: ["start 0.9", "end 0.55"] });
  const words = HEADLINE.split(" ");

  return (
    <section id="about" className="relative overflow-hidden bg-white px-5 pb-20 pt-24 text-ink lg:pb-28 lg:pt-32">
      <div className="mx-auto max-w-[1300px]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#1747C9]">About CTRL</p>
            <h2 ref={textRef} className="mt-5 font-display text-[3rem] font-bold leading-[0.98] tracking-tight text-navy md:text-7xl xl:text-[6.5rem]">
              {words.map((word, index) => (
                <span key={`${word}-${index}`}>
                  <Word progress={reduced ? still : scrollYProgress} range={[index / words.length, (index + 1) / words.length]}>{word}</Word>{" "}
                </span>
              ))}
            </h2>
          </div>
          <Reveal className="lg:col-span-4 lg:pb-3">
            <p className="text-lg leading-relaxed text-ink/75 md:text-xl">
              CTRL is the Coding, Technology and Robotics League at AASU: a student community for learning hands-on, working as a team and solving real problems.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 lg:mt-20 lg:grid-cols-12 lg:grid-rows-2 lg:gap-5">
          <Reveal className="flex flex-col justify-between gap-8 rounded-[28px] bg-navy p-6 text-white md:p-9 lg:col-span-7 lg:row-span-2">
            <div>
              <p className="eyebrow mb-3">01 / Coding</p>
              <h3 className="heading text-4xl md:text-5xl">Write code that works.</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-white/75">Build real programming skills, and the confidence to use them, through hands-on practice.</p>
            </div>
            <CodeVisual />
          </Reveal>

          <Reveal delay={0.08} className="grid items-center gap-5 overflow-hidden rounded-[28px] bg-sky p-6 text-navy md:grid-cols-2 md:p-8 lg:col-span-5">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em]">02 / Technology</p>
              <h3 className="heading text-3xl">Stay ahead of what's next.</h3>
              <p className="mt-3 leading-relaxed text-navy/85">Explore the tools shaping the industry, and learn how to put them to use.</p>
            </div>
            <div className="h-36 md:h-44"><CircuitVisual /></div>
          </Reveal>

          <Reveal delay={0.16} className="grid items-center gap-5 overflow-hidden rounded-[28px] border-2 border-navy bg-white p-6 text-navy md:grid-cols-2 md:p-8 lg:col-span-5">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-[#1747C9]">03 / Robotics</p>
              <h3 className="heading text-3xl">Make your ideas move.</h3>
              <p className="mt-3 leading-relaxed text-ink/75">Take software off the screen by building and programming machines.</p>
            </div>
            <div className="h-40 md:h-44"><RobotVisual /></div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 border-t-2 border-navy pt-10 md:grid-cols-2 lg:mt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-[#1747C9]">Our Mission</h3>
            <p className="mt-4 font-display text-2xl font-semibold leading-snug text-navy">Equip students with the skills and confidence to excel in tech, and bridge the gap between education and industry.</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-[#1747C9]">Our Vision</h3>
            <p className="mt-4 font-display text-2xl font-semibold leading-snug text-navy">A strong community of tech enthusiasts who drive innovation and shape the future of technology.</p>
          </Reveal>
          <Reveal delay={0.16} className="md:col-span-2 lg:col-span-2 lg:text-right">
            <button type="button" onClick={() => scrollToId("events")} className="btn bg-navy text-white shadow-[0_5px_0_#6FCBFF] transition-transform hover:-translate-y-0.5 active:translate-y-[5px] active:shadow-none">See Events</button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
