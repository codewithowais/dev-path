/**
 * codewithowais brand credit. Two sizes:
 *  - "chip"  — a compact inline badge for the hero / page headers
 *  - "block" — a larger signature for the footer
 * The monogram is a </> mark: a nod to "code with owais".
 */

const GH = "https://github.com/codewithowais";

function Monogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#7048E8] font-mono font-bold text-white ${className}`}
    >
      &lt;/&gt;
    </span>
  );
}

export function BrandChip() {
  return (
    <a
      href={GH}
      target="_blank"
      rel="noopener noreferrer"
      className="dp-lift group inline-flex items-center gap-2.5 rounded-pill border border-line bg-card py-1.5 pl-1.5 pr-4 text-sm dp-shadow-sm transition-colors hover:border-primary/40"
    >
      <Monogram className="h-7 w-7 text-[0.7rem]" />
      <span className="leading-tight">
        <span className="block text-[0.7rem] font-medium text-muted">Built by</span>
        <span className="block font-display font-bold text-ink transition-colors group-hover:text-primary">
          codewithowais
        </span>
      </span>
    </a>
  );
}

export function BrandSignature() {
  return (
    <div className="flex items-center gap-3">
      <Monogram className="h-11 w-11 text-sm" />
      <div className="leading-tight">
        <p className="font-display text-base font-bold text-ink">codewithowais</p>
        <a
          href={GH}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted transition-colors hover:text-primary"
        >
          github.com/codewithowais →
        </a>
      </div>
    </div>
  );
}
