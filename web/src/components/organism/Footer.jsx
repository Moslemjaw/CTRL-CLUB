export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-sky/15 bg-navy-deep px-5 pt-12">
      <p aria-hidden="true" className="-mb-[0.03em] select-none text-center font-display text-[34vw] font-bold leading-[0.78] tracking-tight text-sky/[0.1] xl:text-[26rem]">CTRL</p>
      {/* The text sits over the lower end of the word, with the word running behind it. */}
      <div className="absolute inset-x-5 bottom-5 md:bottom-7">
        <div className="mx-auto flex max-w-[1300px] flex-col justify-between gap-1 border-t border-sky/20 pr-16 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/70 md:flex-row md:pr-20 md:text-xs">
          <p>CTRL {new Date().getFullYear()} &copy; All rights reserved.</p>
          <p>AASU Programming Club</p>
        </div>
      </div>
    </footer>
  );
}
