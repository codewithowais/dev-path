import type { Path } from "@/content/paths";
import { accentText } from "@/lib/accent";

type Props = {
  path: Path;
};

/** The warm "goal" colour the journey resolves to (matches the site's coral). */
const GOAL_COLOR = "#ff8a3d";

/** Linear-interpolate two #rrggbb hexes. t=0 → a, t=1 → b. */
function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const mix = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${mix.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * The signature "wayfinder" roadmap: a clean vertical timeline. Ringed station
 * markers sit on a straight line whose colour flows from the path accent at the
 * start to a warm goal-coral at the flagged finish.
 *
 * Responsiveness: every station and the line segment below it share one flex
 * column, and the connector is `flex-1`, so it stretches to fill whatever height
 * the neighbouring text needs. Station and line stay aligned at any width.
 */
export function Roadmap({ path }: Props) {
  const total = path.steps.length;
  const colorAt = (i: number) =>
    lerpHex(path.color, GOAL_COLOR, total > 1 ? i / (total - 1) : 0);

  return (
    <div className="dp-rm">
      <h2 className="font-display text-2xl font-bold text-ink">
        {path.name} roadmap
      </h2>
      <p className="mt-1 text-muted">Follow the line, from first step to goal.</p>

      <style>{`
        .dp-rm-node {
          position: relative;
          height: 36px;
          width: 36px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 13px;
          line-height: 1;
          color: var(--c-text);
          background: var(--color-card);
          border: 2.5px solid var(--c);
          transition: transform var(--dp-dur) var(--dp-ease-spring);
        }
        .group:hover .dp-rm-node {
          transform: scale(1.08);
        }
        .dp-rm-node--start,
        .dp-rm-node--finish {
          color: #fff;
          background: color-mix(in srgb, var(--c) 84%, #10121f);
          border-color: transparent;
        }
        .dp-rm-node--finish {
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 16%, transparent);
        }

        /* Straight connector, colour flowing into the next stop */
        .dp-rm-line {
          width: 3px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--c), var(--c-next));
        }

        /* Soft pulsing halo behind the Start station */
        .dp-rm-halo {
          position: absolute;
          height: 36px;
          width: 36px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            color-mix(in srgb, var(--c) 42%, transparent) 0%,
            transparent 70%
          );
          animation: dp-roadmap-halo 2.8s var(--dp-ease) infinite;
        }
        @keyframes dp-roadmap-halo {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.85);
            opacity: 0;
          }
        }

        .dp-rm-title {
          transition: color var(--dp-dur) var(--dp-ease);
        }
        .group:hover .dp-rm-title {
          color: var(--c-text);
        }

        @media (prefers-reduced-motion: reduce) {
          .dp-rm-halo {
            animation: none;
          }
          .group:hover .dp-rm-node {
            transform: none;
          }
        }
      `}</style>

      <ol className="relative mt-8">
        {path.steps.map(([title, description], i) => {
          const isStart = i === 0;
          const isLast = i === total - 1;
          const c = colorAt(i);
          const cNext = colorAt(Math.min(i + 1, total - 1));
          const nodeModifier = isStart
            ? " dp-rm-node--start"
            : isLast
              ? " dp-rm-node--finish"
              : "";
          return (
            <li
              key={`${i}-${title}`}
              className="group relative flex gap-4"
              style={{
                ["--c" as string]: c,
                ["--c-text" as string]: accentText(c),
                ["--c-next" as string]: cNext,
                animation: "dp-fade-up var(--dp-dur) var(--dp-ease) both",
                animationDelay: `${100 + i * 60}ms`,
              }}
            >
              {/* Station + straight connector share this column so they align */}
              <div className="flex flex-col items-center self-stretch">
                <span className="relative z-10 flex items-center justify-center">
                  {isStart && <span aria-hidden="true" className="dp-rm-halo" />}
                  <span
                    aria-hidden="true"
                    className={`dp-rm-node${nodeModifier}`}
                  >
                    {isLast ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                </span>

                {!isLast && <span aria-hidden="true" className="dp-rm-line my-1 flex-1" />}
              </div>

              <div className={`flex-1 ${isLast ? "pb-1" : "pb-8"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="dp-rm-title font-display text-base font-bold text-ink">
                    {title}
                  </h3>
                  {isStart && (
                    <span
                      className="rounded-pill px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${c} 84%, #10121f)`,
                      }}
                    >
                      Start
                    </span>
                  )}
                  {isLast && (
                    <span
                      className="rounded-pill px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${c} 84%, #10121f)`,
                      }}
                    >
                      Goal
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
