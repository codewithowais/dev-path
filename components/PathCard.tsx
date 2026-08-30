import Link from "next/link";
import type { Path } from "@/content/paths";
import { PathIcon } from "@/components/PathIcon";

type Props = {
  path: Path;
};

/** A learning track card. Clicking it opens that path's full roadmap page. */
export function PathCard({ path }: Props) {
  return (
    <Link
      href={`/paths/${path.id}`}
      className="group dp-lift dp-card relative flex h-full flex-col overflow-hidden rounded-card border border-line p-5 text-left transition-colors hover:border-[color:var(--accent)]/50"
      style={{ ["--accent" as string]: path.color }}
    >
      {/* accent wash that warms up on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-[var(--dp-dur)] group-hover:opacity-100"
        style={{ backgroundColor: `${path.color}26` }}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:-rotate-3 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${path.color}, color-mix(in srgb, ${path.color} 55%, white))`,
          }}
        >
          <PathIcon id={path.id} className="h-6 w-6" />
        </span>
        <span
          className="rounded-pill px-2.5 py-1 font-mono text-[0.7rem] font-semibold"
          style={{ backgroundColor: `${path.color}14`, color: path.color }}
        >
          {path.steps.length} steps
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
        {path.name}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{path.blurb}</p>

      <span className="mt-5 flex items-center gap-2 border-t border-line/80 pt-4 text-sm font-semibold text-ink">
        {/* waypoint dots — the wayfinder motif */}
        <span aria-hidden="true" className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125"
              style={{ backgroundColor: path.color, opacity: 1 - i * 0.28 }}
            />
          ))}
        </span>
        See the roadmap
        <span
          aria-hidden="true"
          className="ml-auto text-[color:var(--accent)] transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
