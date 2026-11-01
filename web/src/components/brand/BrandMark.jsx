import KeyCap from "./KeyCap";

const TRACES = [
  "M0 8H34",
  "M0 16L8 26H42",
  "M0 34H30",
  "M0 44H22L34 58H46",
  "M0 58H22L34 44H46",
];
const NODES = [[34, 8], [42, 26], [30, 34], [46, 44], [46, 58]];

// The logo redrawn as vectors: the key with traces running out of its right edge.
export default function BrandMark({ className = "" }) {
  return (
    <span className={`inline-flex items-center ${className}`} aria-label="CTRL">
      <span className="relative z-10 block w-[3.7rem]">
        <KeyCap />
      </span>
      <svg viewBox="0 0 50 66" className="-ml-1 h-10 w-auto" fill="none" aria-hidden="true">
        {TRACES.map((d) => (
          <path key={d} d={d} stroke="#6FCBFF" strokeWidth="2" />
        ))}
        {NODES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" fill="#6FCBFF" />
        ))}
      </svg>
    </span>
  );
}
