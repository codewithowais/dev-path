"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Backtracking — a "watch it explore" explainer for generating permutations.

   Every ordering of a small set is found by walking a decision tree: pick an
   element for the next slot (choose), recurse to fill the rest (explore), and
   when a slot runs out of options, undo the last pick (backtrack) and try the
   next one. The tree lights up along the current path, completed leaves turn
   green as full permutations, and each is collected below in the exact order
   the search finds them.

   Faithful to the lesson's choose → explore → un-choose loop. The whole
   depth-first search is recorded up front as frames and replayed from a single
   `step` index — deterministic, scrubbable, StrictMode-safe. The only state
   that changes during playback is `step` (a setTimeout functional update) and
   `elapsed` (a setInterval). Motion is disabled under prefers-reduced-motion
   (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type TreeNode = {
  id: number;
  parent: number; // -1 for root
  depth: number;
  value: number | null; // element chosen at this node (null at root)
  pathVals: number[]; // values from root → this node
  childIds: number[];
  x: number; // layout x (leaf units)
};

type Phase = "start" | "choose" | "record" | "backtrack" | "done";
type Frame = {
  current: number | null;
  stack: number[]; // node ids from root → current
  explored: Set<number>; // nodes fully processed
  doneLeaves: Set<number>; // completed permutation leaves
  results: string[];
  phase: Phase;
  caption: string;
};

type Built = { nodes: TreeNode[]; frames: Frame[]; leaves: number; elements: number[] };

function buildTree(elements: number[]): Built {
  const nodes: TreeNode[] = [];
  let idc = 0;
  const make = (parent: number, depth: number, value: number | null, pathVals: number[]): TreeNode => {
    const node: TreeNode = { id: idc++, parent, depth, value, pathVals, childIds: [], x: 0 };
    nodes.push(node);
    return node;
  };
  const root = make(-1, 0, null, []);
  const grow = (node: TreeNode, remaining: number[]) => {
    for (let i = 0; i < remaining.length; i++) {
      const v = remaining[i];
      const child = make(node.id, node.depth + 1, v, [...node.pathVals, v]);
      node.childIds.push(child.id);
      grow(child, remaining.slice(0, i).concat(remaining.slice(i + 1)));
    }
  };
  grow(root, elements);

  // Layout: leaves get sequential x; internal nodes centre over their children.
  let leafCursor = 0;
  const layout = (node: TreeNode) => {
    if (node.childIds.length === 0) {
      node.x = leafCursor++;
      return;
    }
    node.childIds.forEach((cid) => layout(nodes[cid]));
    const xs = node.childIds.map((cid) => nodes[cid].x);
    node.x = xs.reduce((a, b) => a + b, 0) / xs.length;
  };
  layout(root);
  const leaves = leafCursor;

  // Record the depth-first search as frames.
  const frames: Frame[] = [];
  const results: string[] = [];
  const explored = new Set<number>();
  const doneLeaves = new Set<number>();
  const snap = (current: number | null, stack: number[], phase: Phase, caption: string) =>
    frames.push({
      current,
      stack: [...stack],
      explored: new Set(explored),
      doneLeaves: new Set(doneLeaves),
      results: [...results],
      phase,
      caption,
    });

  const visit = (node: TreeNode, stack: number[]) => {
    stack.push(node.id);
    if (node.parent === -1) {
      snap(node.id, stack, "start", "Start with an empty path; every element is still available.");
    } else {
      snap(
        node.id,
        stack,
        "choose",
        `Choose ${node.value} → path so far: ${node.pathVals.join("")}.`,
      );
    }
    if (node.childIds.length === 0) {
      const perm = node.pathVals.join("");
      results.push(perm);
      doneLeaves.add(node.id);
      snap(node.id, stack, "record", `Path is full — record permutation ${perm}.`);
    } else {
      node.childIds.forEach((cid) => visit(nodes[cid], stack));
    }
    stack.pop();
    explored.add(node.id);
    if (node.parent !== -1) {
      snap(
        node.parent,
        stack,
        "backtrack",
        `Undo ${node.value} (the backtrack step) and try the next option.`,
      );
    }
  };
  visit(root, []);
  snap(null, [], "done", `Done. All ${results.length} permutations: ${results.join(" ")}.`);

  return { nodes, frames, leaves, elements };
}

/** Deterministic PRNG (mulberry32) so the demo can pick a stable ordering. */
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

function shuffledElements(seed: number): number[] {
  const arr = [1, 2, 3];
  const rng = makeRng(seed + 7);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SPEEDS = [1000, 680, 460, 280, 150] as const;

export function Backtracking({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(0);

  const elements = useMemo(() => shuffledElements(seed), [seed]);
  const { nodes, frames, leaves } = useMemo(() => buildTree(elements), [elements]);
  const total = frames.length;

  const [step, setStep] = useState(0); // frame index
  const [playing, setPlaying] = useState(false);
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
  const stackSet = new Set(f.stack);

  // Geometry.
  const VB_W = 360;
  const VB_H = 210;
  const PADX = 22;
  const PADY = 20;
  const stepX = leaves > 1 ? (VB_W - PADX * 2) / (leaves - 1) : 0;
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  const stepY = maxDepth > 0 ? (VB_H - PADY * 2) / maxDepth : 0;
  const px = (n: TreeNode) => PADX + n.x * stepX;
  const py = (n: TreeNode) => PADY + n.depth * stepY;

  const nodeState = (n: TreeNode): "current" | "leaf" | "path" | "explored" | "idle" => {
    if (f.doneLeaves.has(n.id)) return "leaf";
    if (f.current === n.id) return "current";
    if (stackSet.has(n.id)) return "path";
    if (f.explored.has(n.id)) return "explored";
    return "idle";
  };

  const fillFor = (s: ReturnType<typeof nodeState>) =>
    s === "leaf"
      ? "var(--color-output)"
      : s === "current"
        ? "var(--accent)"
        : s === "path"
          ? "color-mix(in srgb, var(--accent) 24%, white)"
          : s === "explored"
            ? "color-mix(in srgb, var(--color-muted) 14%, white)"
            : "var(--color-card)";
  const strokeFor = (s: ReturnType<typeof nodeState>) =>
    s === "leaf"
      ? "var(--color-output)"
      : s === "current"
        ? "var(--accent)"
        : s === "path"
          ? "color-mix(in srgb, var(--accent) 55%, white)"
          : "var(--color-line)";
  const solid = (s: ReturnType<typeof nodeState>) => s === "leaf" || s === "current";

  // Path + remaining chips echoing the lesson's "path" and "remaining" lists.
  const currentNode = f.current != null ? nodes[f.current] : null;
  const pathVals = currentNode ? currentNode.pathVals : [];
  const remaining = elements.filter((e) => !pathVals.includes(e));

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it explore</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Backtracking
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          {"{" + elements.join(", ") + "}"}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The decision tree */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="mx-auto block h-52 w-full sm:h-60"
          role="img"
          aria-label={`Permutation decision tree. ${f.caption}`}
        >
          {/* edges */}
          {nodes.map((n) => {
            if (n.parent === -1) return null;
            const p = nodes[n.parent];
            const onPath = stackSet.has(n.id);
            const touched = f.explored.has(n.id) || f.doneLeaves.has(n.id);
            return (
              <line
                key={`e-${n.id}`}
                x1={px(p)}
                y1={py(p)}
                x2={px(n)}
                y2={py(n)}
                stroke={
                  onPath
                    ? "var(--accent)"
                    : touched
                      ? "color-mix(in srgb, var(--color-muted) 30%, white)"
                      : "var(--color-line)"
                }
                strokeWidth={onPath ? 3 : 1.5}
                strokeLinecap="round"
                style={{ transition: "stroke 180ms" }}
              />
            );
          })}

          {/* nodes */}
          {nodes.map((n) => {
            const s = nodeState(n);
            const r = n.parent === -1 ? 11 : 13;
            return (
              <g key={n.id}>
                {s === "current" && (
                  <circle cx={px(n)} cy={py(n)} r={r + 5} fill="none" stroke="var(--accent)" strokeWidth={2} opacity={0.4} />
                )}
                <circle
                  cx={px(n)}
                  cy={py(n)}
                  r={r}
                  fill={fillFor(s)}
                  stroke={strokeFor(s)}
                  strokeWidth={2}
                  style={{ transition: "fill 180ms, stroke 180ms" }}
                />
                <text
                  x={px(n)}
                  y={py(n)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={n.parent === -1 ? 10 : 13}
                  fontWeight={700}
                  fill={solid(s) ? "#fff" : "var(--color-ink)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {n.value == null ? "·" : n.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path + remaining */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ChipRow label="Path (chosen)" values={pathVals} color="var(--accent)" empty="empty" />
        <ChipRow label="Remaining" values={remaining} color="var(--color-muted)" empty="none" muted />
      </div>

      {/* Commentary */}
      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {f.caption}
      </p>

      {/* Collected permutations */}
      <div className="mt-3">
        <div className="dp-eyebrow mb-1.5 text-muted">Permutations found</div>
        <div className="flex flex-wrap gap-1.5">
          {f.results.length === 0 && <span className="text-sm text-muted">—</span>}
          {f.results.map((p, i) => (
            <span
              key={`${p}-${i}`}
              className="flex h-7 items-center justify-center rounded-lg px-2 font-mono text-sm font-bold text-white"
              style={{ background: "var(--color-output)" }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Found" value={`${f.results.length}/${leaves}`} />
        <Stat label="Depth" value={pathVals.length} />
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
          ⤨ New order
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
        <LegendDot color="var(--accent)" label="On the current path" />
        <LegendDot color="var(--color-output)" label="Completed permutation" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 14%, white)" label="Explored & undone" ring />
        <LegendDot color="var(--color-card)" label="Not yet tried" ring />
      </div>
    </div>
  );
}

function ChipRow({
  label,
  values,
  color,
  empty,
  muted,
}: {
  label: string;
  values: number[];
  color: string;
  empty: string;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="dp-eyebrow mb-1.5 text-muted">{label}</div>
      <div className="flex min-h-[28px] flex-wrap gap-1.5">
        {values.length === 0 && <span className="text-sm text-muted">{empty}</span>}
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold"
            style={{
              background: muted
                ? `color-mix(in srgb, ${color} 12%, white)`
                : `color-mix(in srgb, ${color} 18%, white)`,
              color: "var(--color-ink)",
              boxShadow: `inset 0 0 0 1px ${
                muted ? "var(--color-line)" : `color-mix(in srgb, ${color} 45%, white)`
              }`,
            }}
          >
            {v}
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
