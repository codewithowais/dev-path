"use client";

import { useMemo, useState } from "react";
import { titleGuide } from "@/content/career";

export function TitleGuide() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const filtered = useMemo(
    () =>
      searching
        ? titleGuide.filter(
            (qa) =>
              qa.term.toLowerCase().includes(q) ||
              qa.answer.toLowerCase().includes(q)
          )
        : titleGuide,
    [q, searching]
  );

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
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
            placeholder={`Search ${titleGuide.length} job titles…`}
            aria-label="Search job titles"
            className="dp-shadow-sm w-full rounded-pill border border-line bg-card py-3.5 pl-12 pr-4 text-ink outline-none transition-colors focus:border-primary"
          />
        </div>
        <p className="mt-2 px-1 text-sm text-muted" aria-live="polite">
          {searching
            ? `${filtered.length} ${filtered.length === 1 ? "title" : "titles"} match${
                filtered.length === 0 ? " — try another word" : ""
              }`
            : `${titleGuide.length} job titles, in plain words.`}
        </p>
      </div>

      {/* Friendly empty state when a search matches nothing */}
      {searching && filtered.length === 0 ? (
        <div className="dp-card rounded-card p-8 text-center">
          <h3 className="font-display text-xl font-bold text-ink">
            No titles match “{query}”
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Try a broader word — like “senior”, “lead”, “stack”, or “ops”.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 rounded-pill bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Clear search
          </button>
        </div>
      ) : (
        // Masonry columns (not a grid) so opening one card never stretches its
        // neighbour — each card keeps its own height and the column just reflows.
        <div className="gap-4 [column-fill:balance] sm:columns-2 sm:[column-gap:1rem]">
          {filtered.map((qa) => (
            <details
              key={qa.term}
              className="dp-shadow-sm group mb-4 break-inside-avoid rounded-card border border-line bg-card p-5 transition-colors open:border-primary/40 hover:border-primary/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <h3 className="font-display text-base font-bold text-ink">
                  {qa.term}
                </h3>
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-open:rotate-45 group-open:border-primary group-open:bg-primary group-open:text-white"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {qa.answer}
              </p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
