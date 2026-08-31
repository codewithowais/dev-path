import Link from "next/link";
import { roleTrees, type RoleTree } from "@/content/career";
import { accentText, accentFill } from "@/lib/accent";

// Clicking a role card takes you to the roadmap that teaches that role. The
// mapping is data-driven: each role declares its own `pathId` (or none, in
// which case we fall back to the Foundations path).
function hrefFor(role: RoleTree): string {
  return role.pathId ? `/paths/${role.pathId}` : "/paths/foundations";
}

export function RoleTree() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {roleTrees.map((role) => (
        <section
          key={role.id}
          className="dp-card dp-lift relative rounded-card border border-line bg-card p-5 transition-colors hover:border-[color:var(--accent)]/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--accent)]"
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
                  className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
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
            <span aria-hidden="true">→</span>
          </span>
        </section>
      ))}
    </div>
  );
}
