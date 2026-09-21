"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   BSTViz — a "watch it branch" explainer for a Binary Search Tree.

   It inserts a shuffled sequence of distinct numbers one at a time. For each
   value a cursor starts at the root and descends: smaller than the current
   node → go left, bigger → go right, until it hits an empty spot where the
   new node is planted. After the tree is built it runs a search for one value,
   following the exact same "smaller or bigger?" path to the answer.

   Faithful to the lesson: left < node < right, and each step cuts the search
   in half (O(log n) when balanced, O(n) when the insert order makes a chain).

   Like the sort/graph visualizers, the whole run is precomputed as a list of
   frames and played back purely from a single `step` index — deterministic,
   scrubbable, and correct under React StrictMode. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Dir = "left" | "right";

type BNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  parent: number | null;
  depth: number;
  col: number; // in-order column, filled after the tree is built
  x: number;
  y: number;
};

type Frame = {
  present: number[]; // node ids that exist so far
  cursor: number | null; // node being compared right now
  path: number[]; // nodes already stepped through this descent
  fresh: number | null; // node just planted this frame
  found: number | null; // node matched by the search
  activeEdge: [number, number] | null; // parent → child edge lit this frame
  caption: string;
  comparisons: number;
};

/* Tiny deterministic PRNG (mulberry32) — identical output for a given seed on
   server and client, so the first paint never mismatches. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_VALUES = [50, 25, 75, 15, 35, 60, 85] as const;

function shuffled(seed: number): number[] {
  const arr = [...BASE_VALUES];
  const rng = makeRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Built = { frames: Frame[]; nodes: BNode[]; vbw: number; vbh: number };

function build(seed: number): Built {
  const order = shuffled(seed);
  const nodes: BNode[] = [];
  let root: number | null = null;
  const frames: Frame[] = [];
  let comparisons = 0;

  const snap = (extra: Partial<Frame>): Frame => ({
    present: nodes.map((n) => n.id),
    cursor: null,
    path: [],
    fresh: null,
    found: null,
    activeEdge: null,
    caption: "",
    comparisons,
    ...extra,
  });

  frames.push(snap({ caption: "Empty tree. Insert values one at a time." }));

  // Insert phase.
  order.forEach((value) => {
    const id = nodes.length;
    if (root === null) {
      nodes.push({
        id,
        value,
        left: null,
        right: null,
        parent: null,
        depth: 0,
        col: 0,
        x: 0,
        y: 0,
      });
      root = id;
      frames.push(snap({ fresh: id, caption: `Tree is empty — ${value} becomes the root.` }));
      return;
    }
    const path: number[] = [];
    let cur: number = root;
    for (;;) {
      const node = nodes[cur];
      comparisons++;
      const dir: Dir = value < node.value ? "left" : "right";
      frames.push(
        snap({
          cursor: cur,
          path: [...path],
          caption:
            value < node.value
              ? `${value} < ${node.value} → step left.`
              : `${value} > ${node.value} → step right.`,
        }),
      );
      path.push(cur);
      const nextId = dir === "left" ? node.left : node.right;
      if (nextId === null) {
        const child: BNode = {
          id,
          value,
          left: null,
          right: null,
          parent: cur,
          depth: node.depth + 1,
          col: 0,
          x: 0,
          y: 0,
        };
        nodes.push(child);
        if (dir === "left") node.left = id;
        else node.right = id;
        frames.push(
          snap({
            fresh: id,
            path: [...path],
            activeEdge: [cur, id],
            caption: `Empty ${dir} spot — plant ${value} here.`,
          }),
        );
        break;
      }
      cur = nextId;
    }
  });

  // In-order layout: column by in-order index, row by depth.
  let colCounter = 0;
  let maxDepth = 0;
  const assign = (id: number | null) => {
    if (id === null) return;
    const node = nodes[id];
    assign(node.left);
    node.col = colCounter++;
    if (node.depth > maxDepth) maxDepth = node.depth;
    assign(node.right);
  };
  assign(root);

  const n = nodes.length;
  const vbw = n * 66;
  const vbh = (maxDepth + 1) * 74;
  nodes.forEach((node) => {
    node.x = ((node.col + 0.5) / n) * vbw;
    node.y = ((node.depth + 0.5) / (maxDepth + 1)) * vbh;
  });

  // Search phase: follow the same rule to look up one existing value.
  const rng = makeRng(seed ^ 0x9e3779b9);
  const target = order[Math.floor(rng() * order.length)];
  frames.push(snap({ caption: `Now search for ${target}. Start at the root.` }));
  {
    const path: number[] = [];
    let cur: number | null = root;
    while (cur !== null) {
      const node: BNode = nodes[cur];
      if (node.value === target) {
        frames.push(
          snap({
            found: cur,
            path: [...path],
            caption: `Found ${target}! Reached in ${path.length + 1} step${
              path.length ? "s" : ""
            }.`,
          }),
        );
        break;
      }
      comparisons++;
      frames.push(
        snap({
          cursor: cur,
          path: [...path],
          caption:
            target < node.value
              ? `${target} < ${node.value} → look left.`
              : `${target} > ${node.value} → look right.`,
        }),
      );
      path.push(cur);
      cur = target < node.value ? node.left : node.right;
    }
  }

  return { frames, nodes, vbw, vbh };
}

const SPEEDS = [1100, 750, 480, 300, 160] as const;
const IDLE = "color-mix(in srgb, var(--accent) 18%, white)";

export function BSTViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(1);
  const { frames, nodes, vbw, vbh } = useMemo(() => build(seed), [seed]);
  const total = frames.length;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = step >= total - 1;
  const running = playing && !done;

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

  const newInput = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
    setSeed((s) => s + 1);
  };

  const f = frames[Math.min(step, total - 1)];
  const present = new Set(f.present);
  const pathSet = new Set(f.path);

  const nodeFill = (id: number): string => {
    if (f.found === id) return "var(--color-here)";
    if (f.fresh === id) return "var(--color-here)";
    if (f.cursor === id) return "var(--accent)";
    if (pathSet.has(id)) return "var(--color-primary)";
    return IDLE;
  };
  const nodeColored = (id: number) =>
    f.found === id || f.fresh === id || f.cursor === id || pathSet.has(id);

  const edgeActive = (a: number, b: number) =>
    f.activeEdge != null && f.activeEdge[0] === a && f.activeEdge[1] === b;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it branch</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Binary search tree
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* The tree */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${vbw || 100} ${vbh || 100}`}
          className="mx-auto block h-56 w-full sm:h-64"
          role="img"
          aria-label={`Binary search tree with ${present.size} node${
            present.size === 1 ? "" : "s"
          }; ${f.caption}`}
        >
          {/* Edges (behind nodes) */}
          {nodes.map((node) => {
            const kids = [node.left, node.right].filter(
              (c): c is number => c !== null && present.has(c) && present.has(node.id),
            );
            return kids.map((c) => {
              const active = edgeActive(node.id, c);
              return (
                <line
                  key={`${node.id}-${c}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nodes[c].x}
                  y2={nodes[c].y}
                  stroke={active ? "var(--color-here)" : "var(--color-line)"}
                  strokeWidth={active ? 3.5 : 2}
                  strokeLinecap="round"
                />
              );
            });
          })}

          {/* Nodes */}
          {nodes
            .filter((node) => present.has(node.id))
            .map((node) => {
              const colored = nodeColored(node.id);
              const fill = nodeFill(node.id);
              return (
                <g key={node.id}>
                  {f.cursor === node.id && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={22}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      opacity={0.4}
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={16}
                    fill={fill}
                    stroke={colored ? fill : "var(--color-line)"}
                    strokeWidth={2}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={700}
                    fill={colored ? "#fff" : "var(--color-ink)"}
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {node.value}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {f.caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Nodes" value={present.size} />
        <Stat label="Comparisons" value={f.comparisons} />
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
          onClick={newInput}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤨ New input
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
        <LegendDot color="var(--accent)" label="Comparing" />
        <LegendDot color="var(--color-primary)" label="On the path" />
        <LegendDot color="var(--color-here)" label="Placed / found" />
        <LegendDot color={IDLE} label="Settled" ring />
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

function LegendDot({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
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
