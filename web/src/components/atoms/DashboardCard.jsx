"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

const DashboardCard = ({ title, count }) => {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) {
      setShown(count);
      return;
    }
    const controls = animate(0, count, { duration: 1.2, ease: [0.16, 1, 0.3, 1], onUpdate: (value) => setShown(Math.round(value)) });
    return () => controls.stop();
  }, [count, reduced]);

  return (
    <div className="panel !p-5">
      <p className="eyebrow">{title}</p>
      <p className="mt-3 font-display text-5xl font-semibold tabular-nums">{shown.toString().padStart(2, "0")}</p>
    </div>
  );
};

export default DashboardCard;
