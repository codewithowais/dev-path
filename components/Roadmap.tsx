import type { Path } from "@/content/paths";

type Props = {
  path: Path;
};

/**
 * The signature "wayfinder" roadmap: an ordered, vertical list of waypoints
 * connected by a drawn line. Step 0 is flagged "start here".
 */
export function Roadmap({ path }: Props) {
  return (
    <div style={{ ["--accent" as string]: path.color }}>
      <h3 className="font-display text-2xl font-bold text-ink">
        {path.name} roadmap
      </h3>
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
            <li key={title} className="relative flex gap-4 pl-0">
              <span
                aria-hidden="true"
                className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  isStart
                    ? "border-transparent text-white"
                    : "border-[color:var(--accent)] bg-card text-[color:var(--accent)]"
                }`}
                style={isStart ? { backgroundColor: path.color } : undefined}
              >
                {i + 1}
              </span>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-display text-base font-bold text-ink">
                    {title}
                  </h4>
                  {isStart && (
                    <span
                      className="rounded-pill px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
                      style={{ backgroundColor: path.color }}
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
