"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Pillar } from "@/content/lessons";

export type LessonItem = {
  id: string;
  name: string;
  pillar: Pillar;
  blurb: string;
  big?: string;
};

type Props = {
  items: LessonItem[];
  pillars: Pillar[];
  pillarBlurb: Record<Pillar, string>;
};

function slug(pillar: string) {
  return pillar
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LessonBrowser({ items, pillars, pillarBlurb }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      q
        ? items.filter(
            (l) =>
              l.name.toLowerCase().includes(q) ||
              l.blurb.toLowerCase().includes(q) ||
              l.pillar.toLowerCase().includes(q)
          )
        : items,
    [items, q]
  );

  const activePillars = pillars.filter((p) => filtered.some((l) => l.pillar === p));

  return (
    <div>
      {/* Search */}
      <div className="sticky top-16 z-20 -mx-5 mb-2 bg-paper/90 px-5 py-3 backdrop-blur">
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          >
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${items.length} lessons…`}
            aria-label="Search lessons"
            className="w-full rounded-pill border border-line bg-card py-3 pl-11 pr-4 text-ink outline-none transition-colors focus:border-primary"
          />
        </div>
        {q && (
          <p className="mt-2 px-1 text-sm text-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "lesson" : "lessons"} match
            {filtered.length === 0 ? " — try another word" : ""}
          </p>
        )}
      </div>

      {/* Jump nav (hidden while searching) */}
      {!q && (
        <nav aria-label="Lesson categories" className="mb-8 flex flex-wrap gap-2">
          {pillars.map((pillar) => (
            <a
              key={pillar}
              href={`#${slug(pillar)}`}
              className="rounded-pill border border-line bg-card px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-primary/50"
            >
              {pillar}
            </a>
          ))}
        </nav>
      )}

      {activePillars.map((pillar) => {
        const list = filtered.filter((l) => l.pillar === pillar);
        return (
          <section
            key={pillar}
            id={slug(pillar)}
            aria-labelledby={`${slug(pillar)}-heading`}
            className="scroll-mt-32 pb-10"
          >
            <header className="border-b border-line pb-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2
                  id={`${slug(pillar)}-heading`}
                  className="font-display text-2xl font-bold text-ink"
                >
                  {pillar}
                </h2>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {list.length}
                </span>
              </div>
              {!q && <p className="mt-1 text-sm text-muted">{pillarBlurb[pillar]}</p>}
            </header>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((l) => (
                <Link
                  key={l.id}
                  href={`/learn/${l.id}`}
                  className="dp-lift group flex flex-col rounded-card border border-line bg-card p-4 hover:border-primary/50 hover:shadow-md hover:shadow-black/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold leading-snug text-ink">
                      {l.name}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    >
                      →
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                    {l.blurb}
                  </p>
                  {l.big && (
                    <span className="mt-3 font-mono text-[11px] text-muted">
                      {l.big.split("·")[0].trim()}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
