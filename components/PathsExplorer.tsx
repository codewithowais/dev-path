import Link from "next/link";
import { getPath, pathGroups, FOUNDATION_ID } from "@/content/paths";
import { PathCard } from "@/components/PathCard";
import { PathIcon } from "@/components/PathIcon";
import { Reveal } from "@/components/Reveal";

/**
 * The learning tracks, grouped so 17 cards don't read as one overwhelming wall.
 * `foundations` is spotlighted as a full-width "start here" card above the
 * groups; the rest are split into labelled sections, each a mirror of the home
 * Paths header + the existing PathCard grid. Cards "rise" into place per group.
 */
export function PathsExplorer() {
  const foundations = getPath(FOUNDATION_ID);

  return (
    <div className="space-y-12 sm:space-y-14">
      {/* Foundations spotlight — the recommended starting point. */}
      {foundations && (
        <Reveal variant="up">
          <Link
            href={`/paths/${foundations.id}`}
            style={{ ["--accent" as string]: foundations.color }}
            className="dp-lift dp-card group relative flex flex-col gap-4 overflow-hidden rounded-card border border-line p-6 transition-colors hover:border-[color:var(--accent)]/50 sm:flex-row sm:items-center sm:gap-6 sm:p-7"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-[var(--dp-dur)] group-hover:opacity-100"
              style={{ backgroundColor: `${foundations.color}26` }}
            />
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:-rotate-3 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${foundations.color}, color-mix(in srgb, ${foundations.color} 55%, white))`,
              }}
            >
              <PathIcon id={foundations.id} className="h-7 w-7" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="dp-eyebrow flex items-center gap-2 text-[color:var(--accent)]">
                <span aria-hidden="true">★</span> Start here
              </span>
              <span className="mt-1 block font-display text-2xl font-bold tracking-tight text-ink">
                New to all this? Start with the basics
              </span>
              <span className="mt-1.5 block max-w-2xl text-muted">{foundations.blurb}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[color:var(--accent)]">
              Start with the basics
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </Reveal>
      )}

      {/* Grouped tracks. */}
      {pathGroups.map((group) => (
        <section key={group.title} className="scroll-mt-24">
          <header className="max-w-2xl">
            <p className="dp-eyebrow text-primary">{group.eyebrow}</p>
            <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink">
              {group.title}
              <span className="ml-2 align-middle font-mono text-sm font-medium text-muted">
                {group.pathIds.length} paths
              </span>
            </h3>
            <p className="mt-1.5 text-muted">{group.description}</p>
          </header>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.pathIds.map((id, i) => {
              const path = getPath(id);
              if (!path) return null;
              return (
                <Reveal key={id} variant="rise" delay={Math.min(i, 5) * 60} className="h-full">
                  <PathCard path={path} />
                </Reveal>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
