import { ladder, branches } from "@/content/career";
import { accentFill } from "@/lib/accent";
import { Reveal } from "@/components/Reveal";

// The seniority dimension of the org, alongside the department chart. Everyone
// climbs the same base ladder (Student → Senior); at Senior it splits into the
// IC track (Staff → Principal → Distinguished) and the management track
// (Manager → Director → VP/CTO). Reuses the same `ladder`/`branches` content the
// interactive Grow page uses, rendered here as a compact static reference so the
// full range of titles — including Staff Engineer and the L3–L5 / SDE aka's —
// shows up on the org page.

export function SeniorityLadder() {
  return (
    <div>
      {/* Shared base ladder — everyone starts here. */}
      <Reveal variant="rise">
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ladder.map((rung, i) => (
            <li
              key={rung.id}
              className="dp-card h-full rounded-card border border-line bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: accentFill(rung.color) }}
                >
                  {i + 1}
                </span>
                <span className="font-display text-sm font-bold leading-tight text-ink">
                  {rung.role}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-muted">
                {rung.years}
              </p>
              {rung.aka && rung.aka.length > 0 && (
                <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted">
                  {rung.aka.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Branch point. */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-card px-4 py-1.5 text-sm font-semibold text-ink">
          <span aria-hidden="true">⌄</span>
          At Senior, the path splits into two tracks
        </span>
      </div>

      {/* The two senior tracks and their levels. */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {branches.map((branch, bi) => (
          <Reveal
            key={branch.title}
            variant={bi === 0 ? "left" : "right"}
            className="h-full"
          >
            <section
              className="group dp-card dp-lift h-full rounded-card border border-line bg-card p-5 transition-colors hover:border-[color:var(--accent)]/50"
              style={{ ["--accent" as string]: branch.color }}
            >
              <header>
                <span
                  className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: accentFill(branch.color) }}
                >
                  {branch.title}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {branch.sub}
                </p>
              </header>
              <ol className="relative mt-5 space-y-4">
                <span
                  aria-hidden="true"
                  className="absolute left-[11px] top-2 bottom-2 w-0.5"
                  style={{ backgroundColor: `${branch.color}40` }}
                />
                {branch.roles.map(([title, description], i) => (
                  <li key={`${i}-${title}`} className="relative flex gap-3">
                    <span
                      aria-hidden="true"
                      className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:scale-110"
                      style={{ backgroundColor: accentFill(branch.color) }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-display text-base font-bold text-ink">
                        {title}
                      </h4>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
