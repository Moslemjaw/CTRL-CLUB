"use client";

import { motion, useReducedMotion } from "motion/react";

const round = (value) => Math.round(value * 100) / 100;

const point = (radius, degrees) => {
  const angle = ((degrees - 90) * Math.PI) / 180;
  return [round(radius * Math.cos(angle)), round(radius * Math.sin(angle))];
};

// An arc that can jog to another radius partway, like the traces in the logo's emblem.
function buildTrace({ radius, from, to, jog }) {
  const arc = (r, a, b) => {
    const [x, y] = point(r, b);
    return `A${r} ${r} 0 ${Math.abs(b - a) > 180 ? 1 : 0} 1 ${x} ${y}`;
  };
  const [sx, sy] = point(radius, from);
  if (!jog) return { d: `M${sx} ${sy}${arc(radius, from, to)}`, start: [sx, sy], end: point(radius, to) };
  const middle = (from + to) / 2;
  const [jx, jy] = point(radius + jog, middle + 4);
  return {
    d: `M${sx} ${sy}${arc(radius, from, middle)}L${jx} ${jy}${arc(radius + jog, middle + 4, to)}`,
    start: [sx, sy],
    end: point(radius + jog, to),
  };
}

const INNER = [
  { radius: 235, from: 300, to: 395 },
  { radius: 235, from: 60, to: 150, jog: -16 },
  { radius: 235, from: 175, to: 270 },
  { radius: 262, from: 325, to: 430, jog: 14 },
  { radius: 262, from: 100, to: 205 },
  { radius: 262, from: 225, to: 305, jog: -12 },
].map(buildTrace);

const OUTER = [
  { radius: 300, from: 350, to: 475, jog: 16 },
  { radius: 300, from: 145, to: 250 },
  { radius: 332, from: 280, to: 375 },
  { radius: 332, from: 60, to: 180, jog: -14 },
  { radius: 362, from: 5, to: 85 },
  { radius: 362, from: 195, to: 330, jog: 16 },
  { radius: 400, from: 120, to: 215 },
  { radius: 400, from: 300, to: 410 },
].map(buildTrace);

function Traces({ traces, baseDelay, animate, className }) {
  return (
    <g className={className} style={{ transformBox: "view-box" }}>
      {traces.map((trace, index) => {
        const delay = baseDelay + index * 0.07;
        return (
          <g key={trace.d}>
            <motion.path
              d={trace.d}
              stroke="#6FCBFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
              initial={animate ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
            />
            <path
              d={trace.d}
              pathLength="1"
              stroke="#fff"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className="trace-pulse"
              style={{ "--run": `${5 + (index % 4) * 1.7}s`, "--delay": `${-index * 1.3}s` }}
            />
            {[trace.start, trace.end].map(([cx, cy]) => (
              <motion.circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="6.5"
                fill="#6FCBFF"
                initial={animate ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.55 }}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

export default function CircuitRings({ className = "", delay = 0.75 }) {
  const animate = !useReducedMotion();
  return (
    <svg viewBox="-440 -440 880 880" className={className} aria-hidden="true">
      <Traces traces={INNER} baseDelay={delay} animate={animate} className="spin-slow" />
      <Traces traces={OUTER} baseDelay={delay + 0.25} animate={animate} className="spin-rev" />
    </svg>
  );
}
