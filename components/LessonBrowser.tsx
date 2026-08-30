"use client";

import { useEffect, useMemo, useState } from "react";
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

/** An accent colour + icon per pillar so the list reads as a designed set. */
const PILLAR_META: Record<Pillar, { color: string; icon: string }> = {
  "Programming Basics": { color: "#5B4BEB", icon: "🧱" },
  "Data Structures": { color: "#12B886", icon: "📦" },
  Algorithms: { color: "#FF8A3D", icon: "⚡" },
  Databases: { color: "#1098AD", icon: "🗄️" },
  "Web & Internet": { color: "#4263EB", icon: "🌐" },
  "Design Patterns": { color: "#7048E8", icon: "🧩" },
  "System Design": { color: "#E8590C", icon: "🏗️" },
  Cloud: { color: "#15AABF", icon: "☁️" },
  "Data Science": { color: "#E64980", icon: "📊" },
  "Generative AI": { color: "#0CA678", icon: "✨" },
};

function slug(pillar: string) {
  return pillar
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LessonBrowser({ items, pillars, pillarBlurb }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

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
      <div className="sticky top-16 z-20 -mx-5 mb-4 bg-paper/90 px-5 py-3 backdrop-blur">
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
            className="w-full rounded-pill border border-line bg-card py-3 pl-11 pr-4 text-ink shadow-sm outline-none transition-colors focus:border-primary"
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
            className="text-sm font-semibold text-primary transition-colors hover:text-ink"
          >
            {open.size === pillars.length ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      {/* Accordions */}
      <div className="space-y-2.5">
        {shownPillars.map((pillar) => {
          const list = filtered.filter((l) => l.pillar === pillar);
          const id = slug(pillar);
          const expanded = isOpen(pillar);
          const meta = PILLAR_META[pillar];
          return (
            <section
              key={pillar}
              id={id}
              style={{ ["--accent" as string]: meta.color }}
              className={`scroll-mt-32 overflow-hidden rounded-card border bg-card transition-colors ${
                expanded ? "border-[color:var(--accent)]/40" : "border-line hover:border-[color:var(--accent)]/50"
              }`}
            >
              <h2 className="m-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`${id}-panel`}
                  onClick={() => toggle(pillar)}
                  className="group flex w-full items-center gap-4 px-4 py-3.5 text-left sm:px-5"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:scale-110 group-hover:-rotate-6"
                    style={{ backgroundColor: `${meta.color}1a` }}
                  >
                    {meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-display text-lg font-bold text-ink sm:text-xl">
                      {pillar}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-sm text-muted">
                      {pillarBlurb[pillar]}
                    </span>
                  </span>
                  <span
                    className="hidden shrink-0 rounded-pill px-2.5 py-0.5 font-mono text-xs font-semibold sm:inline"
                    style={{ backgroundColor: `${meta.color}14`, color: meta.color }}
                  >
                    {list.length} lessons
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-lg text-muted transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease)] ${
                      expanded ? "rotate-45" : ""
                    }`}
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
                  <div className="dp-stagger grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((l) => (
                      <Link
                        key={l.id}
                        href={`/learn/${l.id}`}
                        className="dp-lift group flex flex-col rounded-xl border border-line bg-card p-4 hover:border-[color:var(--accent)] hover:shadow-md hover:shadow-black/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base font-bold leading-snug text-ink">
                            {l.name}
                          </h3>
                          <span
                            aria-hidden="true"
                            className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]"
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
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
