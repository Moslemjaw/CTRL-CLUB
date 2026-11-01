"use client";

import { useId } from "react";
import { motion } from "motion/react";

export default function FilterKeys({ label, options, value, onChange }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full gap-1 rounded-2xl border border-sky/20 bg-navy-deep/70 p-1.5 backdrop-blur">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative min-h-11 rounded-xl px-3 font-display text-sm font-semibold transition-colors md:px-5 md:text-base ${active ? "text-ink" : "text-white/70 hover:text-white"}`}
          >
            {active && (
              <motion.span layoutId={`filter-${id}`} className="absolute inset-0 rounded-xl bg-white shadow-[0_3px_0_#6FCBFF]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
