"use client";

import { useEffect, useImperativeHandle, useRef } from "react";

const GRID = 44;
const DIRECTIONS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

function buildTrace(width, height) {
  let x = Math.floor((Math.random() * width) / GRID) * GRID;
  let y = Math.floor((Math.random() * height) / GRID) * GRID;
  let direction = Math.floor(Math.random() * 4) * 2;
  const points = [[x, y]];
  const steps = 5 + Math.floor(Math.random() * 9);
  for (let i = 0; i < steps; i++) {
    const run = 1 + Math.floor(Math.random() * 3);
    x += DIRECTIONS[direction][0] * GRID * run;
    y += DIRECTIONS[direction][1] * GRID * run;
    points.push([x, y]);
    direction = (direction + (Math.random() > 0.5 ? 1 : 7)) % 8;
    if (x < -GRID || y < -GRID || x > width + GRID || y > height + GRID) break;
  }
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  return { points, lengths, total: lengths.reduce((a, b) => a + b, 0) };
}

function pointAlong(trace, distance) {
  let left = distance;
  for (let i = 0; i < trace.lengths.length; i++) {
    if (left <= trace.lengths[i]) {
      const t = left / trace.lengths[i];
      const [ax, ay] = trace.points[i];
      const [bx, by] = trace.points[i + 1];
      return [ax + (bx - ax) * t, ay + (by - ay) * t];
    }
    left -= trace.lengths[i];
  }
  return trace.points[trace.points.length - 1];
}

// A living circuit board: dim traces with pulses of light running along them.
export default function SignalField({ ref, className = "", density = 1, opacity = 1 }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ traces: [], pulses: [] });

  useImperativeHandle(ref, () => ({
    surge() {
      const { traces, pulses } = stateRef.current;
      traces.forEach((trace) => pulses.push({ trace, at: 0, speed: 5 + Math.random() * 5, burst: true }));
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = stateRef.current;
    let board = null;
    let frame = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    let ratio = 1;

    const build = () => {
      const box = canvas.getBoundingClientRect();
      width = box.width;
      height = box.height;
      if (!width || !height) return;
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      const count = Math.round(((width * height) / 26000) * density);
      state.traces = Array.from({ length: Math.min(count, 70) }, () => buildTrace(width, height));
      state.pulses = state.traces
        .filter((_, index) => index % 2 === 0)
        .map((trace) => ({ trace, at: Math.random() * trace.total, speed: 0.7 + Math.random() * 1.4 }));

      board = document.createElement("canvas");
      board.width = canvas.width;
      board.height = canvas.height;
      const b = board.getContext("2d");
      b.scale(ratio, ratio);
      b.strokeStyle = "rgba(111, 203, 255, 0.16)";
      b.fillStyle = "rgba(111, 203, 255, 0.34)";
      b.lineWidth = 1;
      state.traces.forEach(({ points }) => {
        b.beginPath();
        points.forEach(([x, y], index) => (index ? b.lineTo(x, y) : b.moveTo(x, y)));
        b.stroke();
        const [ex, ey] = points[points.length - 1];
        b.beginPath();
        b.arc(ex, ey, 2.5, 0, Math.PI * 2);
        b.fill();
      });
      draw();
    };

    const draw = () => {
      if (!board) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(board, 0, 0);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      state.pulses = state.pulses.filter((pulse) => {
        pulse.at += pulse.speed;
        if (pulse.at > pulse.trace.total) {
          if (pulse.burst) return false;
          pulse.at = 0;
        }
        const [hx, hy] = pointAlong(pulse.trace, pulse.at);
        const [tx, ty] = pointAlong(pulse.trace, Math.max(0, pulse.at - (pulse.burst ? 70 : 34)));
        const gradient = context.createLinearGradient(tx, ty, hx, hy);
        gradient.addColorStop(0, "rgba(111, 203, 255, 0)");
        gradient.addColorStop(1, pulse.burst ? "#fff" : "rgba(189, 230, 255, 0.95)");
        context.strokeStyle = gradient;
        context.lineWidth = pulse.burst ? 2.2 : 1.5;
        context.beginPath();
        context.moveTo(tx, ty);
        context.lineTo(hx, hy);
        context.stroke();
        return true;
      });
    };

    const loop = () => {
      draw();
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame && !reduced) frame = requestAnimationFrame(loop);
    });
    observer.observe(canvas);

    let resizeTimer;
    const resize = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    });
    resize.observe(canvas);

    build();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      observer.disconnect();
      resize.disconnect();
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity }} aria-hidden="true" />;
}
