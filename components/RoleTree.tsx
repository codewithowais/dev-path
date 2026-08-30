import Link from "next/link";
import { roleTrees } from "@/content/career";

/**
 * Which learning path each role maps to. Clicking a role card takes you to the
 * roadmap that teaches that role. Roles without a dedicated path fall back to
 * the full list of paths.
 */
const ROLE_TO_PATH: Record<string, string> = {
  "frontend-developer": "frontend",
  "backend-developer": "backend",
  "fullstack-developer": "fullstack",
  "mobile-developer": "mobile-developer",
  "devops-sre": "devops",
  "data-analyst-scientist": "data-analyst",
  "ai-ml-engineer": "ai-engineer",
  "qa-sdet": "qa-test-automation",
  cybersecurity: "cybersecurity",
  "cloud-engineer": "cloud-engineer",
  "game-developer": "game-developer",
};

function hrefFor(roleId: string): string {
  const pathId = ROLE_TO_PATH[roleId];
  return pathId ? `/paths/${pathId}` : "/#paths";
}

export function RoleTree() {
  return (
    <div className="dp-stagger grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {roleTrees.map((role) => (
        <section
          key={role.id}
          className="dp-lift relative rounded-card border-2 bg-card p-5 hover:shadow-md hover:shadow-black/5"
          style={{ borderColor: `${role.color}55` }}
        >
          <header>
            {/* Stretched link: the whole card is clickable, but the accessible
                link name is just the role. */}
            <Link
              href={hrefFor(role.id)}
              className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white after:absolute after:inset-0 after:z-20 after:content-['']"
              style={{ backgroundColor: role.color }}
            >
              {role.name}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">{role.sub}</p>
          </header>
          <ol className="relative mt-5 space-y-4">
            <span
              aria-hidden="true"
              className="absolute left-[11px] top-2 bottom-2 w-0.5"
              style={{ backgroundColor: `${role.color}40` }}
            />
            {role.levels.map(([title, description], i) => (
              <li key={title} className="relative flex gap-3">
                <span
                  aria-hidden="true"
                  className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: role.color }}
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
            style={{ color: role.color }}
          >
            {ROLE_TO_PATH[role.id] ? "Explore this path" : "Browse learning paths"}
            <span aria-hidden="true">→</span>
          </span>
        </section>
      ))}
    </div>
  );
}
