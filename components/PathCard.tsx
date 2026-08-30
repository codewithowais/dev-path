import Link from "next/link";
import type { Path } from "@/content/paths";

type Props = {
  path: Path;
};

/** A learning track card. Clicking it opens that path's full roadmap page. */
export function PathCard({ path }: Props) {
  return (
    <Link
      href={`/paths/${path.id}`}
      className="group dp-lift flex h-full flex-col rounded-card border-2 border-line bg-card p-5 text-left hover:border-[color:var(--accent)] hover:shadow-md hover:shadow-black/5"
      style={{ ["--accent" as string]: path.color }}
    >
      <span
        className="inline-flex w-fit items-center rounded-pill px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${path.color}1a`, color: path.color }}
      >
        {path.tag}
      </span>
      <h3 className="mt-3 font-display text-xl font-bold text-ink">{path.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{path.blurb}</p>
      <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-ink">
        {path.steps.length} steps
        <span
          aria-hidden="true"
          className="text-[color:var(--accent)] transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </Link>
  );
}
