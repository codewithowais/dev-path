"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   TopoSort — a "watch it schedule" explainer for topological sort.

   It works the exact 5-task dependency graph from the lesson and produces the
   same order the lesson prints (English Math CS Physics Robotics). It uses the
   in-degree method (Kahn's algorithm), which is the clearest one to animate:
   count each task's prerequisites, then repeatedly take a task with none left,
   output it, and drop one from each task that depended on it. When a task's
   count reaches zero it becomes ready. The order any linear schedule reads out
   is a valid topological order.

   When several tasks are ready at once, this picks the one listed latest, which
   reproduces the lesson's depth-first output exactly. Any ready task would be
   equally valid.

   The whole run is precomputed as a list of frames and played back purely from
   a single `step` index — deterministic, scrubbable, and correct under React
   StrictMode. Motion is disabled under prefers-reduced-motion (globals.css).
   ──────────────────────────────────────────────────────────────────────── */

/** The lesson's dependency graph, verbatim (A → B means "A before B"). */
const ADJ: Record<string, string[]> = {
  Math: ["Physics", "CS"],
  Physics: ["Robotics"],
  CS: ["Robotics"],
  Robotics: [],
  English: [],
};
const NODES = Object.keys(ADJ);
const INDEX = new Map(NODES.map((n, i) => [n, i]));

/** Fixed layout — a DAG top→bottom with the isolated task off to the side, so
 *  no edges cross (viewBox 0 0 360 250). */
const POS: Record<string, { x: number; y: number }> = {
  Math: { x: 110, y: 42 },
  Physics: { x: 60, y: 125 },
  CS: { x: 160, y: 125 },
  Robotics: { x: 110, y: 208 },
  English: { x: 295, y: 125 },
};
const R = 24;

const edgeId = (a: string, b: string) => `${a}->${b}`;

/** Directed edges to draw, from the adjacency list. */
const EDGES: { a: string; b: string }[] = NODES.flatMap((a) =>
  ADJ[a].map((b) => ({ a, b })),
);

function initialIndegree(): Record<string, number> {
  const indeg: Record<string, number> = {};
  for (const n of NODES) indeg[n] = 0;
  for (const a of NODES) for (const b of ADJ[a]) indeg[b] += 1;
  return indeg;
}

type Frame = {
  current: string | null; // task output this step (accent)
  output: string[]; // scheduled order so far (green)
  indeg: Record<string, number>; // remaining prerequisite counts
  ready: string[]; // tasks with 0 remaining prereqs, not yet output (violet)
  picked: string | null; // which ready task we will take next
  activeEdge: string | null; // edge whose target is being decremented
  consumed: string[]; // edges already processed
  justZero: string | null; // task that just became ready (flash)
  caption: string;
};

/** Among ready tasks, take the one listed latest — this reproduces the
 *  lesson's depth-first output. Any ready task would be a valid choice. */
function pickReady(ready: string[]): string {
  return [...ready].sort(
    (a, b) => (INDEX.get(b) as number) - (INDEX.get(a) as number),
  )[0];
}

const readySet = (indeg: Record<string, number>, out: Set<string>) =>
  NODES.filter((n) => !out.has(n) && indeg[n] === 0);

/* Build the full frame timeline by simulating Kahn's algorithm. */
function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  const indeg = initialIndegree();
  const out = new Set<string>();
  const output: string[] = [];
  const consumed: string[] = [];

  const ready0 = readySet(indeg, out);
  frames.push({
    current: null,
    output: [],
    indeg: { ...indeg },
    ready: ready0,
    picked: pickReady(ready0),
    activeEdge: null,
    consumed: [],
    justZero: null,
    caption:
      "Count each task's prerequisites (in-degree). Tasks needing none are ready to schedule.",
  });

  while (output.length < NODES.length) {
    const ready = readySet(indeg, out);
    if (ready.length === 0) break; // a cycle would land here; this graph has none
    const pick = pickReady(ready);
    out.add(pick);
    output.push(pick);

    frames.push({
      current: pick,
      output: [...output],
      indeg: { ...indeg },
      ready: readySet(indeg, out),
      picked: null,
      activeEdge: null,
      consumed: [...consumed],
      justZero: null,
      caption: `${pick} has no prerequisites left — schedule it (#${output.length}).`,
    });

    for (const neighbor of ADJ[pick]) {
      indeg[neighbor] -= 1;
      consumed.push(edgeId(pick, neighbor));
      const nowReady = indeg[neighbor] === 0;
      const readyAfter = readySet(indeg, out);
      frames.push({
        current: pick,
        output: [...output],
        indeg: { ...indeg },
        ready: readyAfter,
        picked: null,
        activeEdge: edgeId(pick, neighbor),
        consumed: [...consumed],
        justZero: nowReady ? neighbor : null,
        caption: nowReady
          ? `Drop ${pick} → ${neighbor}'s prerequisites fall to 0. ${neighbor} is ready.`
          : `Drop ${pick} → ${neighbor}'s prerequisites fall to ${indeg[neighbor]}.`,
      });
    }
  }

  frames.push({
    current: null,
    output: [...output],
    indeg: { ...indeg },
    ready: [],
    picked: null,
    activeEdge: null,
    consumed: [...consumed],
    justZero: null,
    caption: `Done. A valid order: ${output.join(" ")}.`,
  });

  return frames;
}

const SPEEDS = [1000, 700, 450, 280, 150] as const;

/** Trim an edge's endpoints to the node radius so arrowheads sit on the
 *  circle's boundary, not at its centre. */
function trim(a: string, b: string) {
  const p = POS[a];
  const q = POS[b];
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: p.x + ux * (R + 1),
    y1: p.y + uy * (R + 1),
    x2: q.x - ux * (R + 3),
    y2: q.y - uy * (R + 3),
  };
}

export function TopoSort({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const frames = useMemo(() => buildFrames(), []);
  const total = frames.length;

  const [step, setStep] = useState(0); // frame index
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = step >= total - 1;
  const running = playing && !done;

  // Autoplay — pure functional setStep in a timer callback.
  useEffect(() => {
    if (!running) return;
    if (runStartRef.current == null) runStartRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, total - 1));
    }, SPEEDS[speedIdx]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, step, speedIdx, total]);

  // Live elapsed — setState only in the interval callback.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (runStartRef.current != null) {
        setElapsed(performance.now() - runStartRef.current);
      }
    }, 60);
    return () => clearInterval(id);
  }, [running]);

  const togglePlay = () => {
    if (done) {
      setStep(0);
      setElapsed(0);
      runStartRef.current = null;
      requestAnimationFrame(() => setPlaying(true));
      return;
    }
    setPlaying((p) => !p);
  };

  const stepForward = () => {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, total - 1));
  };

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

  const f = frames[Math.min(step, total - 1)];

  const nodeState = (
    n: string,
  ): "current" | "output" | "ready" | "idle" => {
    if (f.current === n) return "current";
    if (f.output.includes(n)) return "output";
    if (f.ready.includes(n)) return "ready";
    return "idle";
  };

  // Ready tasks use the brand violet: for the orange Algorithms accent, a
  // coral/orange highlight would be indistinguishable from the task being
  // scheduled. Violet reads clearly apart from accent and green.
  const READY = "var(--color-primary)";
  const nodeFill = (s: ReturnType<typeof nodeState>) =>
    s === "current"
      ? "var(--accent)"
      : s === "output"
        ? "var(--color-output)"
        : s === "ready"
          ? READY
          : "var(--color-card)";

  const arrowFor = (k: string) =>
    f.activeEdge === k
      ? `url(#${uid}-a-active)`
      : f.consumed.includes(k)
        ? `url(#${uid}-a-done)`
        : `url(#${uid}-a)`;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it schedule</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Topological sort
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          Kahn&apos;s method
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The graph */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox="0 0 360 250"
          className="mx-auto block h-56 w-full sm:h-64"
          role="img"
          aria-label={`Topological sort; scheduled so far: ${
            f.output.join(" ") || "none"
          }`}
        >
          <defs>
            {[
              { id: `${uid}-a`, color: "var(--color-line)" },
              { id: `${uid}-a-active`, color: "var(--accent)" },
              {
                id: `${uid}-a-done`,
                color: "color-mix(in srgb, var(--color-output) 60%, white)",
              },
            ].map((m) => (
              <marker
                key={m.id}
                id={m.id}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" fill={m.color} />
              </marker>
            ))}
          </defs>

          {/* Edges (behind nodes) */}
          {EDGES.map(({ a, b }) => {
            const k = edgeId(a, b);
            const active = f.activeEdge === k;
            const consumed = f.consumed.includes(k);
            const t = trim(a, b);
            return (
              <line
                key={k}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={
                  active
                    ? "var(--accent)"
                    : consumed
                      ? "color-mix(in srgb, var(--color-output) 60%, white)"
                      : "var(--color-line)"
                }
                strokeWidth={active ? 4 : 2}
                strokeLinecap="round"
                markerEnd={arrowFor(k)}
                style={{ transition: "stroke 200ms, stroke-width 200ms" }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const s = nodeState(n);
            const fill = nodeFill(s);
            const isLight = s === "idle";
            const scheduled = s === "output";
            return (
              <g key={n}>
                {s === "current" && (
                  <circle
                    cx={POS[n].x}
                    cy={POS[n].y}
                    r={R + 5}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}
                <circle
                  cx={POS[n].x}
                  cy={POS[n].y}
                  r={R}
                  fill={fill}
                  stroke={isLight ? "var(--color-line)" : fill}
                  strokeWidth={2}
                  style={{ transition: "fill 220ms" }}
                />
                <text
                  x={POS[n].x}
                  y={POS[n].y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={n.length > 6 ? 9 : 10}
                  fontWeight={700}
                  fill={isLight ? "var(--color-ink)" : "#fff"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {n}
                </text>
                {/* In-degree badge (top-right), hidden once scheduled */}
                {!scheduled && (
                  <>
                    <circle
                      cx={POS[n].x + R - 2}
                      cy={POS[n].y - R + 2}
                      r={9}
                      fill="var(--color-paper)"
                      stroke={
                        f.indeg[n] === 0
                          ? READY
                          : "color-mix(in srgb, var(--color-line) 90%, white)"
                      }
                      strokeWidth={1.5}
                    />
                    <text
                      x={POS[n].x + R - 2}
                      y={POS[n].y - R + 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={10}
                      fontWeight={700}
                      fill={
                        f.indeg[n] === 0 ? READY : "var(--color-ink)"
                      }
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      {f.indeg[n]}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Ready set + scheduled order */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="dp-eyebrow mb-1.5 flex items-center gap-2 text-muted">
            Ready (in-degree 0)
            <span className="font-mono text-[10px] normal-case tracking-normal text-muted/80">
              take next ▸
            </span>
          </div>
          <div className="flex min-h-[28px] flex-wrap gap-1.5">
            {f.ready.length === 0 && (
              <span className="text-sm text-muted">empty</span>
            )}
            {f.ready.map((n) => (
              <span
                key={n}
                className="flex h-7 items-center justify-center rounded-lg px-2 font-mono text-[13px] font-bold"
                style={{
                  background: `color-mix(in srgb, ${READY} 16%, white)`,
                  color: "var(--color-ink)",
                  boxShadow:
                    n === f.picked
                      ? `0 0 0 2px ${READY}`
                      : "inset 0 0 0 1px var(--color-line)",
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="dp-eyebrow mb-1.5 text-muted">Scheduled order</div>
          <div className="flex flex-wrap gap-1.5">
            {f.output.length === 0 && (
              <span className="text-sm text-muted">—</span>
            )}
            {f.output.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="flex h-7 items-center justify-center rounded-lg px-2 font-mono text-[13px] font-bold text-white"
                style={{ background: "var(--color-output)" }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Commentary */}
      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {f.caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Scheduled" value={`${f.output.length}/${NODES.length}`} />
        <Stat label="Ready" value={f.ready.length} />
        <Stat label="Step" value={`${step + 1}/${total}`} />
        <Stat label="Time" value={`${(elapsed / 1000).toFixed(1)}s`} />
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className="dp-lift inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          {running ? "⏸ Pause" : done ? "↻ Replay" : "▶ Play"}
        </button>
        <button
          type="button"
          onClick={stepForward}
          disabled={done}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          Step ›
        </button>
        <button
          type="button"
          onClick={restart}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤾ Restart
        </button>

        <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted">
          Speed
          <input
            type="range"
            min={0}
            max={SPEEDS.length - 1}
            value={speedIdx}
            onChange={(e) => setSpeedIdx(Number(e.target.value))}
            className="w-24 accent-[color:var(--accent)]"
            aria-label="Playback speed"
          />
        </label>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Scheduling now" />
        <LegendDot color={READY} label="Ready (in-degree 0)" />
        <LegendDot color="var(--color-output)" label="Scheduled" />
        <LegendDot color="var(--color-card)" label="Blocked" ring />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-2 py-2">
      <div className="font-mono text-base font-bold tabular-nums text-ink sm:text-lg">
        {value}
      </div>
      <div className="dp-eyebrow mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  );
}

function LegendDot({
  color,
  label,
  ring,
}: {
  color: string;
  label: string;
  ring?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: color,
          boxShadow: ring ? "inset 0 0 0 1px var(--color-line)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
