"use client";

import { useState } from "react";
import Link from "next/link";
import {
  roleTrees,
  roleCategories,
  type RoleTree,
} from "@/content/career";
import { accentText, accentFill } from "@/lib/accent";
import { Reveal } from "@/components/Reveal";

// The 28 role trees are grouped into a few families (see `roleCategories` in
// content/career.ts). A tab bar switches between families so the section reads
// as a browsable menu — one focused group at a time, full trees on show — instead
// of one 17-screen scroll. Every card stays a stretched link to the roadmap that
// teaches that role; the whole card is clickable.
function hrefFor(role: RoleTree): string {
  return role.pathId ? `/paths/${role.pathId}` : "/paths/foundations";
}

const byId = new Map(roleTrees.map((r) => [r.id, r]));

// Surface any role that isn't placed in a category (would otherwise vanish from
// the page). Cheap, runs once at module load, dev-only noise.
if (process.env.NODE_ENV !== "production") {
  const placed = new Set(roleCategories.flatMap((c) => c.roleIds));
  const orphans = roleTrees.filter((r) => !placed.has(r.id)).map((r) => r.id);
  if (orphans.length) {
    console.warn("[RoleTree] roles missing from roleCategories:", orphans);
  }
}

function RoleCard({ role }: { role: RoleTree }) {
  return (
    <section
      className="group dp-card dp-lift relative h-full rounded-card border border-line bg-card p-5 transition-colors hover:border-[color:var(--accent)]/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--accent)]"
      style={{ ["--accent" as string]: role.color }}
    >
      <header>
        {/* Stretched link: the whole card is clickable, but the accessible
            link name is just the role. */}
        <h3>
          <Link
            href={hrefFor(role)}
            className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white after:absolute after:inset-0 after:z-20 after:content-['']"
            style={{ backgroundColor: accentFill(role.color) }}
          >
            {role.name}
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{role.sub}</p>
      </header>
      <ol className="relative mt-5 space-y-4">
        <span
          aria-hidden="true"
          className="absolute left-[11px] top-2 bottom-2 w-0.5"
          style={{ backgroundColor: `${role.color}40` }}
        />
        {role.levels.map(([title, description], i) => (
          <li key={`${i}-${title}`} className="relative flex gap-3">
            <span
              aria-hidden="true"
              className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:scale-110"
              style={{ backgroundColor: accentFill(role.color) }}
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
      <span
        className="relative z-10 mt-5 flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: accentText(role.color) }}
      >
        {role.pathId
          ? "Explore this path"
          : "No dedicated path yet — start with Foundations"}
        <span
          aria-hidden="true"
          className="transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </section>
  );
}

export function RoleTree() {
  const [active, setActive] = useState(roleCategories[0].id);
  const current =
    roleCategories.find((c) => c.id === active) ?? roleCategories[0];
  const roles = current.roleIds
    .map((id) => byId.get(id))
    .filter((r): r is RoleTree => Boolean(r));

  return (
    <div>
      {/* Family tabs — pick a group to browse. */}
      <div
        role="tablist"
        aria-label="Role families"
        className="-mx-1 flex flex-wrap gap-2 px-1"
      >
        {roleCategories.map((cat) => {
          const isActive = cat.id === active;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="role-grid"
              onClick={() => setActive(cat.id)}
              className={`inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary bg-primary text-white shadow-[0_10px_24px_-12px_rgba(91,75,235,0.7)]"
                  : "border-line bg-card text-muted hover:border-primary/50 hover:text-ink"
              }`}
            >
              {cat.label}
              <span
                className={`rounded-full px-1.5 text-xs font-bold tabular-nums ${
                  isActive ? "bg-white/20 text-white" : "bg-paper text-muted"
                }`}
              >
                {cat.roleIds.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="role-grid"
        role="tabpanel"
        className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {roles.map((role, ri) => (
          // key includes the active tab so cards re-run their entrance animation
          // when you switch families.
          <Reveal
            key={`${active}-${role.id}`}
            variant="rise"
            delay={Math.min(ri, 5) * 50}
            className="h-full"
          >
            <RoleCard role={role} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
