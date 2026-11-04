import Link from "next/link";
import EclipseHorizon from "./EclipseHorizon";

export default function Hero() {
  return (
    <section
      data-theme="sky"
      aria-labelledby="hero-title"
      className="hero-sky relative -mt-[var(--header-h)] flex min-h-[max(100svh,640px)] flex-col overflow-hidden pt-[var(--header-h)] lg:min-h-[max(100svh,760px)]"
    >
      <EclipseHorizon />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-[var(--gutter)]">
        <div className="pt-[14vh] sm:pt-[18vh] lg:pt-[22vh]">
          <h1
            id="hero-title"
            className="display enter text-[clamp(3.8rem,1.6rem+8.4vw,9.25rem)]"
          >
            T&amp;T Labs
          </h1>
          <p
            className="enter mt-6 max-w-[28ch] text-[clamp(1.15rem,1rem+0.5vw,1.45rem)] leading-snug text-ink/85"
            style={{ ["--i" as string]: 1 }}
          >
            Developer tools, software and games built by an independent team.
          </p>
          <div className="enter mt-10" style={{ ["--i" as string]: 2 }}>
            <Link
              href="#skills"
              data-magnet
              className="group inline-flex h-14 items-center gap-5 rounded-pill bg-ink pl-7 pr-6 text-[1rem] text-paper transition-colors duration-200 hover:bg-[color-mix(in_oklch,var(--ink),var(--copper)_28%)]"
            >
              View projects
              <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden="true">
                <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
