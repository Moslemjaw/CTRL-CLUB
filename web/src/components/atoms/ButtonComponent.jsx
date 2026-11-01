import Link from "next/link";

export default function ButtonComponent({ text, path, variant = "primary" }) {
  return (
    <Link href={path} className={`btn btn-${variant} group`}>
      {text}
      <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M1 8h13M9 3l5 5-5 5" />
      </svg>
    </Link>
  );
}
