"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const SKY = "text-sky";
const SOFT = "text-sky-soft";
const WHITE = "text-white";
const GO = "text-go";

const CODE = [
  [["const ", SKY], ["club", WHITE], [" = ", SOFT], ['"CTRL"', GO], [";", SOFT]],
  [],
  [["function ", SKY], ["build", WHITE], ["(idea) {", SOFT]],
  [["  const ", SKY], ["skills", WHITE], [" = ", SOFT], ["learn", WHITE], ["(idea);", SOFT]],
  [["  return ", SKY], ["skills", WHITE], [".", SOFT], ["ship", WHITE], ["();", SOFT]],
  ["}"].map((text) => [text, SOFT]),
  [],
  [["build", WHITE], ["(", SOFT], ['"your first robot"', GO], [");", SOFT]],
];
const TOTAL = CODE.flat().reduce((sum, [text]) => sum + text.length, 0);

// A small editor that types its program whenever it's on screen, then starts over.
export function CodeVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const shown = reduced ? TOTAL : typed;

  useEffect(() => {
    if (reduced || !inView) return;
    const timer = setInterval(() => {
      setTyped((value) => (value >= TOTAL + 60 ? 0 : value + 1));
    }, 45);
    return () => clearInterval(timer);
  }, [inView, reduced]);

  let left = shown;
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-sky/25 bg-navy-deep" aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-sky/15 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-sky" />
        <span className="h-2.5 w-2.5 rounded-full bg-sky/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-sky/25" />
        <span className="ml-2 font-mono text-xs text-white/55">ctrl.js</span>
      </div>
      <pre className="h-60 overflow-hidden p-4 font-mono text-[0.8rem] leading-relaxed md:h-64 md:p-5 md:text-[0.95rem]">
        {CODE.map((line, row) => (
          <div key={row} className="min-h-[1.6em]">
            {line.map(([text, color], index) => {
              const visible = text.slice(0, Math.max(0, left));
              left -= text.length;
              return <span key={index} className={color}>{visible}</span>;
            })}
          </div>
        ))}
      </pre>
    </div>
  );
}

const TRACES = [
  "M0 40H90L120 70H160",
  "M0 110H160",
  "M0 180H90L120 150H160",
  "M400 40H310L280 70H240",
  "M400 110H240",
  "M400 180H310L280 150H240",
];
const NODES = [[0, 40], [0, 110], [0, 180], [400, 40], [400, 110], [400, 180]];

// A chip powering up, drawn in the same style as the logo's traces.
export function CircuitVisual() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" fill="none" aria-hidden="true">
      {TRACES.map((d, index) => (
        <g key={d}>
          <path d={d} stroke="#000650" strokeWidth="3" />
          <path d={d} pathLength="1" stroke="#fff" strokeWidth="4" strokeLinecap="round" className="trace-pulse" style={{ "--run": `${2.6 + (index % 3) * 0.7}s`, "--delay": `${-index * 0.6}s` }} />
        </g>
      ))}
      {NODES.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx === 0 ? 8 : 392} cy={cy} r="7" fill="#000650" />)}
      <rect x="160" y="50" width="80" height="120" rx="14" fill="#000650" />
      <rect x="176" y="72" width="48" height="76" rx="7" fill="#fff" className="chip-pulse" />
    </svg>
  );
}

// A robot arm holding up the CTRL key.
export function RobotVisual() {
  return (
    <svg viewBox="115 30 225 205" className="h-full w-full" fill="none" aria-hidden="true">
      <path d="M125 226H330" stroke="#6FCBFF" strokeWidth="4" strokeLinecap="round" />
      <rect x="150" y="196" width="100" height="30" rx="8" fill="#000650" />
      <g className="arm-shoulder">
        <path d="M200 196L200 112" stroke="#000650" strokeWidth="20" strokeLinecap="round" />
        <circle cx="200" cy="196" r="17" fill="#6FCBFF" stroke="#000650" strokeWidth="5" />
        <g className="arm-elbow">
          <path d="M200 112L282 92" stroke="#000650" strokeWidth="15" strokeLinecap="round" />
          <circle cx="200" cy="112" r="14" fill="#6FCBFF" stroke="#000650" strokeWidth="5" />
          <g className="arm-wrist">
            <circle cx="282" cy="92" r="9" fill="#6FCBFF" stroke="#000650" strokeWidth="4" />
            <path d="M282 100V112M266 112H298M266 112V124M298 112V124" stroke="#000650" strokeWidth="5" strokeLinecap="round" />
            <rect x="247" y="124" width="76" height="46" rx="10" fill="#6FCBFF" transform="translate(4 5)" />
            <rect x="247" y="124" width="76" height="46" rx="10" fill="#fff" stroke="#05072A" strokeWidth="3" />
            <text x="285" y="155" textAnchor="middle" fontSize="23" fontWeight="600" fill="#05072A" style={{ fontFamily: "var(--font-display)", letterSpacing: "1px" }}>CTRL</text>
          </g>
        </g>
      </g>
    </svg>
  );
}
