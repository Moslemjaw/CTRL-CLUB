export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-sky/15 bg-navy-deep px-5 pt-8">
      <div className="mx-auto flex max-w-[1300px] flex-col justify-between gap-2 font-mono text-xs uppercase tracking-[0.14em] text-white/65 md:flex-row">
        <p>CTRL {new Date().getFullYear()} &copy; All rights reserved.</p>
        <p>AASU Programming Club</p>
      </div>
      <p aria-hidden="true" className="mt-4 select-none text-center font-display text-[30vw] font-bold leading-[0.78] tracking-tight text-sky/[0.08] xl:text-[24rem]">CTRL</p>
    </footer>
  );
}
