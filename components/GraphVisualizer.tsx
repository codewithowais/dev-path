"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   GraphVisualizer — a "watch it traverse" explainer for BFS and DFS.

   It walks the exact 6-node graph from the lesson, so the visit order it
   animates matches the lesson's printed output (BFS: A B C D E F · DFS:
   A B D E F C). The payoff is showing the ONE thing that separates the two:
   BFS pulls from a queue (nearest first, level by level), DFS from a stack
   (deepest first, backtracking). Both are drawn — the frontier strip, the
   traversal tree lighting up edge by edge, and the visit-order row filling in.

   Like the sort/search visualizers, the whole run is precomputed as a list of
   frames and played back purely from a single `step` index — deterministic,
   scrubbable, and correct under React StrictMode. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

export type GraphAlgo = "bfs" | "dfs";

const ALGO_LABEL: Record<GraphAlgo, string> = {
  bfs: "Breadth-first search",
  dfs: "Depth-first search",
};

/** The lesson's graph, verbatim, so the animation matches the printed output. */
const GRAPH: Record<string, string[]> = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B", "F"],
  F: ["C", "E"],
};
const START = "A";

/** Fixed layout so edges read cleanly (viewBox 0 0 360 250). */
const POS: Record<string, { x: number; y: number }> = {
  A: { x: 180, y: 32 },
  B: { x: 95, y: 118 },
  C: { x: 265, y: 118 },
  D: { x: 52, y: 210 },
  E: { x: 180, y: 210 },
  F: { x: 288, y: 210 },
};

/** Undirected edge list, de-duplicated (each pair once) for drawing. */
const EDGES: [string, string][] = (() => {
  const seen = new Set<string>();
  const out: [string, string][] = [];
  for (const a of Object.keys(GRAPH)) {
    for (const b of GRAPH[a]) {
      const key = [a, b].sort().join("-");
      if (!seen.has(key)) {
        seen.add(key);
        out.push([a, b]);
      }
    }
  }
  return out;
})();

const edgeKey = (a: string, b: string) => [a, b].sort().join("-");

type Frame = {
  current: string | null; // node being processed right now
  done: string[]; // fully processed (green)
  frontier: string[]; // queue (BFS) or stack (DFS)
  order: string[]; // visit order so far
  treeEdges: string[]; // edges used to discover nodes
  activeEdge: string | null; // edge highlighted this step
  caption: string;
};

/* Build the full frame timeline by simulating the algorithm. */
function buildFrames(algo: GraphAlgo): Frame[] {
  const frames: Frame[] = [];
  const order: string[] = [];
  const treeEdges: string[] = [];

  if (algo === "bfs") {
    const visited = new Set<string>([START]);
    const queue: string[] = [START];
    frames.push({
      current: null,
      done: [],
      frontier: [...queue],
      order: [],
      treeEdges: [],
      activeEdge: null,
      caption: `Start at ${START}: mark it seen and put it in the queue.`,
    });
    while (queue.length > 0) {
      const node = queue.shift() as string;
      order.push(node);
      frames.push({
        current: node,
        done: order.filter((n) => n !== node),
        frontier: [...queue],
        order: [...order],
        treeEdges: [...treeEdges],
        activeEdge: null,
        caption: `Take ${node} from the front of the queue and visit it.`,
      });
      for (const next of GRAPH[node]) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
          treeEdges.push(edgeKey(node, next));
          frames.push({
            current: node,
            done: order.filter((n) => n !== node),
            frontier: [...queue],
            order: [...order],
            treeEdges: [...treeEdges],
            activeEdge: edgeKey(node, next),
            caption: `Discover ${next} from ${node} — add it to the back of the queue.`,
          });
        }
      }
    }
  } else {
    // DFS via explicit recursion; the stack mirrors the call path.
    const visited = new Set<string>();
    const finished: string[] = [];
    const stack: string[] = [];
    const dfs = (node: string, from: string | null) => {
      visited.add(node);
      order.push(node);
      stack.push(node);
      if (from) treeEdges.push(edgeKey(from, node));
      frames.push({
        current: node,
        done: [...finished],
        frontier: [...stack],
        order: [...order],
        treeEdges: [...treeEdges],
        activeEdge: from ? edgeKey(from, node) : null,
        caption: from
          ? `Dive from ${from} into ${node} and keep going deep.`
          : `Start at ${node} and dive in.`,
      });
      for (const next of GRAPH[node]) {
        if (!visited.has(next)) dfs(next, node);
      }
      stack.pop();
      finished.push(node);
      const back = stack.length ? stack[stack.length - 1] : null;
      frames.push({
        current: back,
        done: [...finished],
        frontier: [...stack],
        order: [...order],
        treeEdges: [...treeEdges],
        activeEdge: null,
        caption: back
          ? `${node} has no unvisited neighbors — back up to ${back}.`
          : `Back at ${node} with nothing left — traversal complete.`,
      });
    };
    dfs(START, null);
  }

  // Terminal frame: everything visited, nothing pending.
  frames.push({
    current: null,
    done: [...order],
    frontier: [],
    order: [...order],
    treeEdges: EDGES.map(([a, b]) => edgeKey(a, b)).filter((k) =>
      treeEdges.includes(k),
    ),
    activeEdge: null,
    caption: `Done. Visit order: ${order.join(" ")}.`,
  });

  return frames;
}

const SPEEDS = [1000, 700, 450, 280, 150] as const;

export function GraphVisualizer({
  algo,
  accent,
  complexity,
}: {
  algo: GraphAlgo;
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const frames = useMemo(() => buildFrames(algo), [algo]);
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
  const isQueue = algo === "bfs";
  const structLabel = isQueue ? "Queue (FIFO)" : "Stack (LIFO)";
  // Which end pops next: front of the queue (left) vs top of the stack (right).
  const nextOutIdx = f.frontier.length
    ? isQueue
      ? 0
      : f.frontier.length - 1
    : -1;

  const nodeState = (
    n: string,
  ): "current" | "done" | "frontier" | "idle" => {
    if (f.current === n) return "current";
    if (f.done.includes(n)) return "done";
    if (f.frontier.includes(n)) return "frontier";
    return "idle";
  };

  // Frontier uses the brand violet, not a tint of the accent: for the orange
  // Algorithms accent, a coral/orange frontier would be indistinguishable from
  // the "visiting now" node. Violet reads clearly apart from accent and green.
  const FRONTIER = "var(--color-primary)";
  const nodeFill = (s: ReturnType<typeof nodeState>) =>
    s === "current"
      ? "var(--accent)"
      : s === "done"
        ? "var(--color-output)"
        : s === "frontier"
          ? FRONTIER
          : "var(--color-card)";

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it traverse</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          {ALGO_LABEL[algo]}
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
          className="dp-graph mx-auto block h-56 w-full sm:h-64"
          role="img"
          aria-label={`${ALGO_LABEL[algo]} from ${START}; visited so far: ${
            f.order.join(" ") || "none"
          }`}
        >
          {/* Edges (behind nodes) */}
          {EDGES.map(([a, b]) => {
            const k = edgeKey(a, b);
            const active = f.activeEdge === k;
            const inTree = f.treeEdges.includes(k);
            return (
              <line
                key={k}
                className="dp-edge"
                x1={POS[a].x}
                y1={POS[a].y}
                x2={POS[b].x}
                y2={POS[b].y}
                stroke={
                  active
                    ? "var(--accent)"
                    : inTree
                      ? "color-mix(in srgb, var(--accent) 45%, white)"
                      : "var(--color-line)"
                }
                strokeWidth={active ? 4 : inTree ? 3 : 2}
                strokeLinecap="round"
              />
            );
          })}

          {/* Nodes */}
          {Object.keys(POS).map((n) => {
            const s = nodeState(n);
            const fill = nodeFill(s);
            const isLight = s === "idle";
            return (
              <g key={n} className="dp-node">
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
              </g>
            );
          })}
        </svg>
      </div>

      {/* Frontier (queue/stack) + visit order */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <FrontierStrip
          label={structLabel}
          items={f.frontier}
          nextOutIdx={nextOutIdx}
          color={FRONTIER}
          hint={isQueue ? "next out: front ↤" : "next out: top ↦"}
        />
        <div>
          <div className="dp-eyebrow mb-1.5 text-muted">Visit order</div>
          <div className="flex flex-wrap gap-1.5">
            {f.order.length === 0 && (
              <span className="text-sm text-muted">—</span>
            )}
            {f.order.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold text-white"
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
        <Stat label="Visited" value={`${f.order.length}/6`} />
        <Stat label={isQueue ? "In queue" : "On stack"} value={f.frontier.length} />
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
        <LegendDot color="var(--accent)" label="Visiting now" />
        <LegendDot color={FRONTIER} label={isQueue ? "In queue" : "On stack"} />
        <LegendDot color="var(--color-output)" label="Done" />
        <LegendDot color="var(--color-card)" label="Unvisited" ring />
      </div>
    </div>
  );
}

function FrontierStrip({
  label,
  items,
  nextOutIdx,
  color,
  hint,
}: {
  label: string;
  items: string[];
  nextOutIdx: number;
  color: string;
  hint: string;
}) {
  return (
    <div>
      <div className="dp-eyebrow mb-1.5 flex items-center gap-2 text-muted">
        {label}
        <span className="font-mono text-[10px] normal-case tracking-normal text-muted/80">
          {hint}
        </span>
      </div>
      <div className="flex min-h-[28px] flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-sm text-muted">empty</span>}
        {items.map((n, i) => (
          <span
            key={`${n}-${i}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold"
            style={{
              background: `color-mix(in srgb, ${color} 16%, white)`,
              color: "var(--color-ink)",
              boxShadow:
                i === nextOutIdx
                  ? `0 0 0 2px ${color}`
                  : "inset 0 0 0 1px var(--color-line)",
            }}
          >
            {n}
          </span>
        ))}
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
