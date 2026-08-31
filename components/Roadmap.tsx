import type { Path } from "@/content/paths";
import { accentText, accentFill } from "@/lib/accent";

type Props = {
  path: Path;
};

/**
 * The signature "wayfinder" roadmap: an ordered, vertical list of waypoints
 * connected by a drawn line. Step 0 is flagged "start here".
 */
export function Roadmap({ path }: Props) {
  return (
    <div
      style={{
        ["--accent" as string]: path.color,
        ["--accent-text" as string]: accentText(path.color),
      }}
    >
      <h2 className="font-display text-2xl font-bold text-ink">
        {path.name} roadmap
      </h2>
      <p className="mt-1 text-muted">Learn top to bottom. One step at a time.</p>

      <style>{`
        @keyframes dp-roadmap-line {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }
      `}</style>

      <ol className="relative mt-8 space-y-6">
        {/* The connecting line runs behind the waypoints, drawing in from the top */}
        <span
          aria-hidden="true"
          className="absolute left-[15px] top-2 bottom-2 w-0.5 origin-top bg-line"
          style={{
            animation: "dp-roadmap-line var(--dp-dur-slow) var(--dp-ease) both",
          }}
        />
        {path.steps.map(([title, description], i) => {
          const isStart = i === 0;
          return (
            <li
              key={`${i}-${title}`}
              className="group relative flex gap-4 pl-0"
              style={{
                animation: "dp-fade-up var(--dp-dur) var(--dp-ease) both",
                // Waypoints cascade in just behind the connector line as it draws.
                animationDelay: `${120 + i * 70}ms`,
              }}
            >
              <span
                aria-hidden="true"
                className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:scale-110 ${
                  isStart
                    ? "border-transparent text-white"
                    : "border-[color:var(--accent)] bg-card text-[color:var(--accent-text)]"
                }`}
                style={isStart ? { backgroundColor: accentFill(path.color) } : undefined}
              >
                {i + 1}
              </span>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-ink">
                    {title}
                  </h3>
                  {isStart && (
                    <span
                      className="rounded-pill px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
                      style={{ backgroundColor: accentFill(path.color) }}
                    >
                      Start here
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
