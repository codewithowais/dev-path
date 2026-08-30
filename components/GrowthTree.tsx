"use client";

import { useState } from "react";
import { ladder, branches } from "@/content/career";
import { accentFill } from "@/lib/accent";

export function GrowthTree() {
  // Which rung the user has marked as "where I am now". Null = none selected.
  const [hereId, setHereId] = useState<string | null>(null);

  return (
    <div>
      <p className="text-muted">
        Tap the rung where you are now. You climb the ladder from the bottom up.
        Everyone starts at the bottom.
      </p>

      {/* The shared ladder */}
      <ol className="relative mt-8 space-y-4">
        <span
          aria-hidden="true"
          className="absolute left-[19px] top-3 bottom-3 w-1 rounded-full bg-line"
        />
        {/* Rendered top rung first (senior) down to student, so "climbing up" reads bottom→top */}
        {[...ladder].reverse().map((rung) => {
          const isHere = hereId === rung.id;
          return (
            <li key={rung.id} className="relative flex gap-4">
              <span
                aria-hidden="true"
                className="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-paper"
                style={{ backgroundColor: accentFill(rung.color) }}
              >
                <span className="h-3 w-3 rounded-full bg-white/90" />
              </span>
              <button
                type="button"
                onClick={() => setHereId(isHere ? null : rung.id)}
                aria-pressed={isHere}
                className={`dp-card dp-lift flex-1 rounded-card border bg-card p-4 text-left transition-all ${
                  isHere
                    ? "dp-shadow border-here"
                    : "border-line hover:border-here/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-lg font-bold text-ink">
                    {rung.role}
                  </span>
                  {isHere ? (
                    <span
                      className="dp-pulse-here rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                      style={{ backgroundColor: accentFill("#FF8A3D") }}
                    >
                      You are here
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-muted">
                      {rung.years}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {rung.desc}
                </p>
                {!isHere && (
                  <span className="mt-2 inline-block text-xs font-semibold text-here">
                    Tap if this is you
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* The branch point */}
      <div className="mt-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-card px-4 py-1.5 text-sm font-semibold text-ink">
          <span aria-hidden="true">⌄</span>
          At Senior, the path splits in two
        </span>
      </div>

      {/* The two branches */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {branches.map((branch) => (
          <section
            key={branch.title}
            className="dp-card dp-lift rounded-card border border-line bg-card p-5 transition-colors hover:border-[color:var(--accent)]/50"
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
                    className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
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
        ))}
      </div>
    </div>
  );
}
