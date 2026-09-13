import Link from "next/link";
import {
  roleCategories,
  roleTrees,
  orgLeadership,
  type RoleTree,
} from "@/content/career";
import { accentFill, accentText } from "@/lib/accent";
import { Reveal } from "@/components/Reveal";

// A generic org chart for a typical software development organization: one
// leadership node at the top, then the functional departments (the same role
// families used on /grow) fanning out below, each listing its roles as chips
// that link to the learning path that teaches them. Structural and educational —
// no real people. Presentation only, so this stays a server component.

const byId = new Map(roleTrees.map((r) => [r.id, r]));

function hrefFor(role: RoleTree): string {
  return role.pathId ? `/paths/${role.pathId}` : "/paths/foundations";
}

function DepartmentCard({
  category,
}: {
  category: (typeof roleCategories)[number];
}) {
  const roles = category.roleIds
    .map((id) => byId.get(id))
    .filter((r): r is RoleTree => Boolean(r));

  return (
    <section
      className="group dp-card dp-lift h-full rounded-card border border-line bg-card p-5 transition-colors hover:border-[color:var(--accent)]/50"
      style={{ ["--accent" as string]: category.color }}
    >
      <header>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: accentFill(category.color) }}
          >
            {category.label}
          </span>
          <span className="text-xs font-semibold text-muted tabular-nums">
            {roles.length} {roles.length === 1 ? "role" : "roles"}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {category.blurb}
        </p>
      </header>

      <ul className="mt-4 flex flex-wrap gap-2">
        {roles.map((role) => (
          <li key={role.id}>
            <Link
              href={hrefFor(role)}
              className="inline-flex rounded-pill border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent-text)]"
              style={{
                ["--accent-text" as string]: accentText(category.color),
              }}
            >
              {role.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OrgChart() {
  return (
    <div>
      {/* Tier 1 — the leadership node everything reports into. */}
      <Reveal variant="rise">
        <div className="mx-auto max-w-md">
          <div className="dp-card dp-shadow rounded-card border border-line bg-card p-5 text-center">
            <span
              className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: accentFill("#191C33") }}
            >
              {orgLeadership.title}
            </span>
            <p className="mt-3 font-display text-lg font-bold text-ink">
              {orgLeadership.role}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {orgLeadership.sub}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Connector between leadership and the departments. */}
      <div aria-hidden="true" className="flex flex-col items-center">
        <span className="dp-draw-y h-8 w-0.5 bg-line" />
      </div>
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-card px-4 py-1.5 text-sm font-semibold text-ink">
          <span aria-hidden="true">⌄</span>
          {roleCategories.length} departments report into engineering leadership
        </span>
      </div>

      {/* Tier 2 — the departments and their roles. */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {roleCategories.map((category, ci) => (
          <Reveal
            key={category.id}
            variant="rise"
            delay={Math.min(ci, 5) * 60}
            className="h-full"
          >
            <DepartmentCard category={category} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
