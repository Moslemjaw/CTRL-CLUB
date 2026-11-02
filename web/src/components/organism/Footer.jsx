export default function Footer() {
  return (
    <footer className="w-full overflow-hidden border-t border-sky/15 bg-navy-deep px-5 pb-5 pt-10 md:pb-12 md:pt-12">
      <div className="relative">
        <p aria-hidden="true" className="select-none text-center font-display text-[38vw] font-bold leading-[0.78] tracking-tight text-sky/[0.1] md:text-[34vw] xl:text-[26rem]">CTRL</p>
        {/* Phones get the text under the word; wider screens overlay it on the word's lower end. */}
        <div className="mt-6 md:absolute md:inset-x-0 md:bottom-6 md:mt-0">
          <div className="mx-auto flex max-w-[1300px] justify-between gap-3 whitespace-nowrap border-t border-sky/20 pt-4 font-mono text-[0.65rem] uppercase tracking-[0.06em] text-white/70 md:gap-1 md:text-xs md:tracking-[0.14em]">
            <p>CTRL {new Date().getFullYear()} &copy;<span className="hidden md:inline"> All rights reserved.</span></p>
            <p>AASU Programming Club</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
