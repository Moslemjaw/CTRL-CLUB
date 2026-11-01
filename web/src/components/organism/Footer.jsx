export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-sky/15 bg-navy-deep px-5 pt-10 md:pt-12">
      <p aria-hidden="true" className="select-none text-center font-display text-[38vw] font-bold leading-[0.78] tracking-tight text-sky/[0.1] md:-mb-[0.03em] md:text-[34vw] xl:text-[26rem]">CTRL</p>
      {/* Phones get the text under the word; wider screens overlay it on the word's lower end. */}
      <div className="mt-6 pb-7 md:absolute md:inset-x-5 md:bottom-7 md:mt-0 md:pb-0">
        <div className="mx-auto flex max-w-[1300px] flex-col justify-between gap-1.5 border-t border-sky/20 pr-20 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-white/70 md:flex-row md:gap-1 md:text-xs md:tracking-[0.14em]">
          <p>CTRL {new Date().getFullYear()} &copy; All rights reserved.</p>
          <p>AASU Programming Club</p>
        </div>
      </div>
    </footer>
  );
}
