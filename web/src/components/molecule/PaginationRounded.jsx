"use client";

const pagesToShow = (count, page) => {
  const pages = [];
  for (let i = 1; i <= count; i++) {
    if (i === 1 || i === count || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }
  return pages;
};

const keyClass = "flex h-11 min-w-11 items-center justify-center rounded-xl border px-2 font-display font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30";

export default function PaginationRounded({ count = 1, page, onChange }) {
  if (count <= 1) return null;
  const go = (event, value) => onChange?.(event, value);

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2">
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={(e) => go(e, page - 1)} className={`${keyClass} border-sky/30 text-white hover:border-sky`}>&larr;</button>
      {pagesToShow(count, page).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="flex h-11 items-center px-1 text-white/50">...</span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={(e) => go(e, item)}
            className={`${keyClass} ${item === page ? "border-white bg-white text-ink shadow-[0_3px_0_#6FCBFF]" : "border-sky/30 text-white hover:border-sky"}`}
          >
            {item}
          </button>
        )
      )}
      <button type="button" aria-label="Next page" disabled={page >= count} onClick={(e) => go(e, page + 1)} className={`${keyClass} border-sky/30 text-white hover:border-sky`}>&rarr;</button>
    </nav>
  );
}
