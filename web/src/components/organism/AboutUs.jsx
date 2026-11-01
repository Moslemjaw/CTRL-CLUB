"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";

const MISSION = "At CTRL, we are committed to empowering students in coding, technology, and robotics by providing an engaging and supportive learning environment.";

const PILLARS = ["Coding", "Technology", "Robotics"];

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity }} className="mr-[0.26em] inline-block">{children}</motion.span>;
}

const AboutUs = () => {
  const reduced = useReducedMotion();
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const still = useMotionValue(1);

  const { scrollYProgress: textScroll } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.45"] });
  const { scrollYProgress: imageScroll } = useScroll({ target: imageRef, offset: ["start end", "end start"] });
  const imageY = useTransform(reduced ? still : imageScroll, [0, 1], ["-10%", "10%"]);
  const words = MISSION.split(" ");

  return (
    <section id="about" className="relative overflow-hidden bg-white px-5 pb-24 pt-24 text-ink lg:pb-36 lg:pt-32">
      <div className="mx-auto max-w-[1300px]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#1747C9]">About Us</p>
        <p ref={textRef} className="mt-6 max-w-5xl font-display text-[1.9rem] font-semibold leading-[1.15] tracking-tight text-navy md:text-5xl xl:text-[4rem]">
          {words.map((word, index) => (
            <Word key={`${word}-${index}`} progress={reduced ? still : textScroll} range={[index / words.length, (index + 1) / words.length]}>{word}</Word>
          ))}
        </p>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          <motion.div
            ref={imageRef}
            initial={reduced ? false : { clipPath: "inset(12% 12% 12% 12% round 28px)", opacity: 0.4 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/3] overflow-hidden rounded-[28px] lg:col-span-5 lg:aspect-[4/5]"
          >
            <motion.img src="/images/about.jpg" alt="A code editor on a monitor above a laptop on a desk" loading="lazy" style={{ y: imageY }} className="absolute inset-0 h-full w-full scale-125 object-cover" />
          </motion.div>

          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="max-w-2xl text-lg leading-relaxed text-ink/75 md:text-xl">
              We believe in fostering innovation, collaboration, and problem-solving to prepare members for success in the ever-evolving tech landscape.
            </p>
            <h2 className="heading mt-12 text-3xl text-navy md:text-4xl">Our Goal and Vision</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-ink/75 md:text-lg">
              Our mission is to inspire and equip students with the skills and confidence to excel in programming and technology. Through hands-on learning, teamwork, and real-world applications, we aim to bridge the gap between education and industry. Our vision is to build a strong community of tech enthusiasts who drive innovation and shape the future of technology.
            </p>
            <ul className="mt-10 flex flex-wrap gap-4">
              {PILLARS.map((pillar, index) => (
                <motion.li
                  key={pillar}
                  initial={reduced ? false : { y: -40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 420, damping: 16, delay: index * 0.12 }}
                  className="relative"
                >
                  <span className="absolute inset-0 translate-x-1 translate-y-1.5 rounded-xl bg-sky" aria-hidden="true" />
                  <span className="relative block rounded-xl border-2 border-ink bg-white px-5 py-3 font-display text-lg font-semibold">{pillar}</span>
                </motion.li>
              ))}
            </ul>
            <p className="mt-10 font-mono text-sm uppercase tracking-[0.12em] text-navy">Current Targeting: CTRL Events</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
