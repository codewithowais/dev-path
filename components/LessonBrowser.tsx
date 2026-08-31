"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Pillar } from "@/content/lessons";
import { pillarColor } from "@/content/lessons";
import { PillarIcon } from "@/components/PillarIcon";
import { PillarProgress, useLessonProgress } from "@/components/LessonProgress";
import { accentText } from "@/lib/accent";

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

/** Accent colour per pillar — shared with the lesson pages via content/lessons. */
const PILLAR_COLOR = pillarColor;

function slug(pillar: string) {
  return pillar
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tile(color: string) {
  return {
    background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, white))`,
  } as React.CSSProperties;
}

export function LessonBrowser({ items, pillars, pillarBlurb }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Per-device completion. Renders a stable 0/total placeholder until `ready`
  // (mounted), so the server and first client paint match — no hydration jump.
  const { count, ready } = useLessonProgress();

  // All lesson ids per pillar (full set — progress ignores the search filter).
  const idsByPillar = useMemo(() => {
    const map = {} as Record<Pillar, string[]>;
    for (const p of pillars) map[p] = [];
    for (const l of items) (map[l.pillar] ??= []).push(l.id);
    return map;
  }, [items, pillars]);

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !pillars.some((p) => slug(p) === id)) return;
    const raf = requestAnimationFrame(() => {
      setOpen((o) => (o.has(id) ? o : new Set(o).add(id)));
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pillars]);

  const filtered = useMemo(
    () =>
      searching
        ? items.filter(
            (l) =>
              l.name.toLowerCase().includes(q) ||
              l.blurb.toLowerCase().includes(q) ||
              l.pillar.toLowerCase().includes(q)
          )
        : items,
    [items, q, searching]
  );

  const shownPillars = pillars.filter((p) => filtered.some((l) => l.pillar === p));
  const isOpen = (p: Pillar) => searching || open.has(slug(p));

  function toggle(p: Pillar) {
    const id = slug(p);
    setOpen((o) => {
      const next = new Set(o);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* Search */}
      <div className="sticky top-16 z-20 -mx-5 mb-4 bg-paper/85 px-5 py-3 backdrop-blur">
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${items.length} lessons…`}
            aria-label="Search lessons"
            className="dp-shadow-sm w-full rounded-pill border border-line bg-card py-3.5 pl-12 pr-4 text-ink outline-none transition-colors focus:border-primary"
          />
        </div>
        {searching && (
          <p className="mt-2 px-1 text-sm text-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "lesson" : "lessons"} match
            {filtered.length === 0 ? " — try another word" : ""}
          </p>
        )}
      </div>

      {!searching && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() =>
              setOpen((o) =>
                o.size === pillars.length ? new Set() : new Set(pillars.map(slug))
              )
            }
            className="min-h-11 inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-ink"
          >
            {open.size === pillars.length ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      {/* Friendly empty state when a search matches nothing */}
      {searching && filtered.length === 0 && (
        <div className="dp-card rounded-card p-8 text-center">
          <h2 className="font-display text-xl font-bold text-ink">
            No lessons match “{query}”
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Try a broader word — like “loop”, “sort”, “tree”, or “database”.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 rounded-pill bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Accordions */}
      <div className="space-y-3">
        {shownPillars.map((pillar) => {
          const list = filtered.filter((l) => l.pillar === pillar);
          const id = slug(pillar);
          const expanded = isOpen(pillar);
          const color = PILLAR_COLOR[pillar];
          return (
            <section
              key={pillar}
              id={id}
              style={{ ["--accent" as string]: color }}
              className={`dp-card scroll-mt-32 overflow-hidden rounded-card border transition-colors ${
                expanded
                  ? "border-[color:var(--accent)]/45"
                  : "border-line hover:border-[color:var(--accent)]/45"
              }`}
            >
              <h2 className="m-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`${id}-panel`}
                  onClick={() => toggle(pillar)}
                  className="group flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:scale-105 group-hover:-rotate-3"
                    style={tile(color)}
                  >
                    <PillarIcon pillar={pillar} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-display text-lg font-bold text-ink sm:text-xl">
                      {pillar}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-sm text-muted">
                      {pillarBlurb[pillar]}
                    </span>
                  </span>
                  {(() => {
                    const ids = idsByPillar[pillar] ?? [];
                    return (
                      <PillarProgress
                        total={ids.length}
                        completed={ready ? count(ids) : 0}
                        color={color}
                        label={pillar}
                        className="hidden shrink-0 md:flex"
                      />
                    );
                  })()}
                  <span
                    className="hidden shrink-0 rounded-pill px-3 py-1 font-mono text-xs font-semibold sm:inline"
                    style={{ backgroundColor: `${color}16`, color: accentText(color) }}
                  >
                    {list.length} lessons
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg transition-all duration-[var(--dp-dur)] ease-[var(--dp-ease)] ${
                      expanded ? "rotate-45 text-white" : "text-muted"
                    }`}
                    style={expanded ? { backgroundColor: color } : { backgroundColor: `${color}12` }}
                  >
                    +
                  </span>
                </button>
              </h2>

              {expanded && (
                <div
                  id={`${id}-panel`}
                  role="region"
                  aria-label={pillar}
                  className="dp-panel px-4 pb-4 sm:px-5"
                >
                  <div className="grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((l, i) => (
                      <Link
                        key={l.id}
                        href={`/learn/${l.id}`}
                        className="dp-lift dp-card group relative flex flex-col overflow-hidden rounded-card border border-line p-4 hover:border-[color:var(--accent)]/50"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold" style={{ color: accentText(color) }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]"
                          >
                            →
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-base font-bold leading-snug text-ink">
                          {l.name}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                          {l.blurb}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
