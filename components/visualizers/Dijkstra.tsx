"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Dijkstra — a "watch shortest paths settle" explainer.

   It walks the exact 4-node weighted graph from the lesson, so the distances
   it settles match the lesson's printed output (Distances from A: A:0 B:3 C:1
   D:4). The payoff is showing the one idea that makes Dijkstra work: always
   finalize the closest unvisited node next, then RELAX its neighbors — if a
   route through the just-settled node is cheaper, lower their best distance.

   Like the sort/graph visualizers, the whole run is precomputed as a list of
   frames and played back purely from a single `step` index — deterministic,
   scrubbable, and correct under React StrictMode. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

/** The lesson's weighted graph, verbatim, so the settled distances match the
 *  printed output. Neighbours are relaxed in this stored order. */
const ADJ: Record<string, Record<string, number>> = {
  A: { B: 4, C: 1 },
  B: { A: 4, D: 1 },
  C: { A: 1, B: 2, D: 5 },
  D: { B: 1, C: 5 },
};
const NODES = ["A", "B", "C", "D"] as const;
const START = "A";

/** Fixed layout — a diamond, so no edges cross (viewBox 0 0 360 250). */
const POS: Record<string, { x: number; y: number }> = {
  A: { x: 180, y: 34 },
  B: { x: 80, y: 125 },
  C: { x: 280, y: 125 },
  D: { x: 180, y: 216 },
};

const edgeId = (a: string, b: string) => [a, b].sort().join("-");

/** Undirected edges to draw, each with its weight and label position. */
const EDGES: { a: string; b: string; w: number }[] = [
  { a: "A", b: "B", w: 4 },
  { a: "A", b: "C", w: 1 },
  { a: "C", b: "B", w: 2 },
  { a: "B", b: "D", w: 1 },
  { a: "C", b: "D", w: 5 },
];

type Frame = {
  current: string | null; // node being finalized this step (accent)
  finalized: string[]; // settled, in the order they were settled (green)
  dist: Record<string, number>; // best-known distance (Infinity = unknown)
  updated: string | null; // neighbour whose distance just dropped (flash)
  activeEdge: string | null; // edge being relaxed this step
  frontier: string[]; // unvisited nodes with a finite distance (the queue)
  caption: string;
};

const fmt = (d: number) => (Number.isFinite(d) ? String(d) : "∞");

/** Unvisited nodes that already have a finite distance, nearest first — the
 *  priority queue Dijkstra pulls from. */
function frontierOf(dist: Record<string, number>, visited: Set<string>) {
  return NODES.filter((n) => !visited.has(n) && Number.isFinite(dist[n])).sort(
    (a, b) => dist[a] - dist[b],
  );
}

/* Build the full frame timeline by simulating the lesson's algorithm. */
function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  const dist: Record<string, number> = {};
  for (const n of NODES) dist[n] = Infinity;
  dist[START] = 0;
  const visited = new Set<string>();
  const finalized: string[] = [];

  frames.push({
    current: null,
    finalized: [],
    dist: { ...dist },
    updated: START,
    activeEdge: null,
    frontier: frontierOf(dist, visited),
    caption: `Start at ${START}: its distance is 0, every other node is ∞ (unknown).`,
  });

  while (visited.size < NODES.length) {
    // Pick the unvisited node with the smallest known distance.
    let current: string | null = null;
    for (const n of NODES) {
      if (!visited.has(n) && (current === null || dist[n] < dist[current])) {
        current = n;
      }
    }
    if (current === null || !Number.isFinite(dist[current])) break;
    visited.add(current);
    finalized.push(current);

    frames.push({
      current,
      finalized: [...finalized],
      dist: { ...dist },
      updated: null,
      activeEdge: null,
      frontier: frontierOf(dist, visited),
      caption: `${current} has the smallest distance (${dist[current]}) — settle it for good.`,
    });

    for (const [neighbor, w] of Object.entries(ADJ[current])) {
      const nd = dist[current] + w;
      const edge = edgeId(current, neighbor);
      if (nd < dist[neighbor]) {
        const was = dist[neighbor];
        dist[neighbor] = nd;
        frames.push({
          current,
          finalized: [...finalized],
          dist: { ...dist },
          updated: neighbor,
          activeEdge: edge,
          frontier: frontierOf(dist, visited),
          caption: `Relax ${current}→${neighbor}: ${dist[current]}+${w}=${nd} beats ${fmt(
            was,
          )}. Lower ${neighbor} to ${nd}.`,
        });
      } else {
        frames.push({
          current,
          finalized: [...finalized],
          dist: { ...dist },
          updated: null,
          activeEdge: edge,
          frontier: frontierOf(dist, visited),
          caption: `Check ${current}→${neighbor}: ${dist[current]}+${w}=${nd} is no better than ${fmt(
            dist[neighbor],
          )} — keep it.`,
        });
      }
    }
  }

  frames.push({
    current: null,
    finalized: [...finalized],
    dist: { ...dist },
    updated: null,
    activeEdge: null,
    frontier: [],
    caption: `Done. Distances from ${START}: ${NODES.map(
      (n) => `${n}:${dist[n]}`,
    ).join(" ")}.`,
  });

  return frames;
}

const SPEEDS = [1000, 700, 450, 280, 150] as const;

export function Dijkstra({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
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
  ): "current" | "finalized" | "frontier" | "idle" => {
    if (f.current === n) return "current";
    if (f.finalized.includes(n)) return "finalized";
    if (f.frontier.includes(n)) return "frontier";
    return "idle";
  };

  // Frontier / updated nodes use the brand violet: for the orange Algorithms
  // accent, a coral/orange highlight would be indistinguishable from the
  // "settling now" node. Violet reads clearly apart from accent and green.
  const FRONTIER = "var(--color-primary)";
  const nodeFill = (s: ReturnType<typeof nodeState>) =>
    s === "current"
      ? "var(--accent)"
      : s === "finalized"
        ? "var(--color-output)"
        : s === "frontier"
          ? FRONTIER
          : "var(--color-card)";

  const distColor = (n: string) => {
    const s = nodeState(n);
    if (s === "finalized") return "var(--color-output)";
    if (s === "current") return "var(--accent)";
    if (s === "frontier") return FRONTIER;
    return "var(--color-muted)";
  };

  const updates = frames
    .slice(0, step + 1)
    .filter((fr) => fr.updated && fr.activeEdge).length;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it settle</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Dijkstra&apos;s shortest path
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          from&nbsp;{START}
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
          aria-label={`Dijkstra's algorithm from ${START}; current best distances ${NODES.map(
            (n) => `${n} ${fmt(f.dist[n])}`,
          ).join(", ")}`}
        >
          {/* Edges (behind nodes) */}
          {EDGES.map(({ a, b, w }) => {
            const k = edgeId(a, b);
            const active = f.activeEdge === k;
            const settled =
              f.finalized.includes(a) && f.finalized.includes(b);
            const mx = (POS[a].x + POS[b].x) / 2;
            const my = (POS[a].y + POS[b].y) / 2;
            return (
              <g key={k}>
                <line
                  x1={POS[a].x}
                  y1={POS[a].y}
                  x2={POS[b].x}
                  y2={POS[b].y}
                  stroke={
                    active
                      ? "var(--accent)"
                      : settled
                        ? "color-mix(in srgb, var(--color-output) 55%, white)"
                        : "var(--color-line)"
                  }
                  strokeWidth={active ? 4 : 2}
                  strokeLinecap="round"
                  style={{ transition: "stroke 200ms, stroke-width 200ms" }}
                />
                {/* Weight label with a chip behind it for legibility */}
                <rect
                  x={mx - 10}
                  y={my - 9}
                  width={20}
                  height={18}
                  rx={5}
                  fill="var(--color-paper)"
                  stroke={
                    active
                      ? "var(--accent)"
                      : "color-mix(in srgb, var(--color-line) 90%, white)"
                  }
                  strokeWidth={1}
                />
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight={700}
                  fill={active ? "var(--accent)" : "var(--color-ink)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {w}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const s = nodeState(n);
            const fill = nodeFill(s);
            const isLight = s === "idle";
            return (
              <g key={n}>
                {s === "current" && (
                  <circle
                    cx={POS[n].x}
                    cy={POS[n].y}
                    r={24}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}
                <circle
                  cx={POS[n].x}
                  cy={POS[n].y}
                  r={18}
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
                  fontSize={15}
                  fontWeight={700}
                  fill={isLight ? "var(--color-ink)" : "#fff"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {n}
                </text>
                {/* Current best distance, under the node */}
                <text
                  x={POS[n].x}
                  y={POS[n].y + 32}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={700}
                  fill={distColor(n)}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {fmt(f.dist[n])}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Priority queue + settled order */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="dp-eyebrow mb-1.5 flex items-center gap-2 text-muted">
            Priority queue
            <span className="font-mono text-[10px] normal-case tracking-normal text-muted/80">
              nearest out first ↤
            </span>
          </div>
          <div className="flex min-h-[28px] flex-wrap gap-1.5">
            {f.frontier.length === 0 && (
              <span className="text-sm text-muted">empty</span>
            )}
            {f.frontier.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="flex h-7 items-center justify-center rounded-lg px-2 font-mono text-sm font-bold"
                style={{
                  background: `color-mix(in srgb, ${FRONTIER} 16%, white)`,
                  color: "var(--color-ink)",
                  boxShadow:
                    i === 0
                      ? `0 0 0 2px ${FRONTIER}`
                      : "inset 0 0 0 1px var(--color-line)",
                }}
              >
                {n}:{fmt(f.dist[n])}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="dp-eyebrow mb-1.5 text-muted">Settled order</div>
          <div className="flex flex-wrap gap-1.5">
            {f.finalized.length === 0 && (
              <span className="text-sm text-muted">—</span>
            )}
            {f.finalized.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="flex h-7 items-center justify-center rounded-lg px-2 font-mono text-sm font-bold text-white"
                style={{ background: "var(--color-output)" }}
              >
                {n}:{f.dist[n]}
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
        <Stat label="Settled" value={`${f.finalized.length}/${NODES.length}`} />
        <Stat label="In queue" value={f.frontier.length} />
        <Stat label="Updates" value={updates} />
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
        <LegendDot color="var(--accent)" label="Settling now" />
        <LegendDot color={FRONTIER} label="In queue / updated" />
        <LegendDot color="var(--color-output)" label="Finalized" />
        <LegendDot color="var(--color-card)" label="Unreached" ring />
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
