import { roleTrees } from "@/content/career";

export function RoleTree() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {roleTrees.map((role) => (
        <section
          key={role.id}
          className="rounded-card border-2 bg-card p-5"
          style={{ borderColor: `${role.color}55` }}
        >
          <header>
            <span
              className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: role.color }}
            >
              {role.name}
            </span>
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
        </section>
      ))}
    </div>
  );
}
