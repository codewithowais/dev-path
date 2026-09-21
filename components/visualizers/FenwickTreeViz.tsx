"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   FenwickTreeViz — a "hop by powers of two" explainer for the Fenwick Tree
   (Binary Indexed Tree) lesson. A 1-indexed base array sits on top; below it,
   the BIT array, where each cell tree[i] is a "jar" responsible for a range of
   base positions: (i − lowbit(i) + 1 .. i), with lowbit(i) = i & −i.

   It plays the lesson's story:
     • build     — pour each value in with update(pos, value)
     • prefixSum — descend from k with i −= i & −i, adding a handful of jars
     • update    — a point change propagates up with i += i & −i

   Every step lights the current jar (accent), draws its responsibility range
   over the base row, and arcs the index jump. Jars already summed in a query
   stay violet so you watch their ranges tile the prefix exactly.

   Architecture mirrors GraphVisualizer/SortVisualizer: the whole run is
   recorded up front and replayed purely from a single `step` index —
   deterministic, scrubbable and StrictMode-safe. The only state changing
   during playback is `step` (setTimeout functional update) and `elapsed`
   (setInterval); no setState in an effect body. "New input" reshuffles the
   values with a seeded PRNG so server and client first render match. Motion is
   disabled under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

const N = 6;

const lowbit = (i: number) => i & -i;
const rangeLo = (i: number) => i - lowbit(i) + 1;

type Frame = {
  tree: number[]; // BIT snapshot, index 0 unused
  op: "intro" | "build" | "query" | "update" | "done";
  target: number; // base position/boundary of interest (coral); 0 = none
  active: number; // current tree index i (accent); 0 = none
  path: number[]; // ordered tree indices touched so far in this op (arcs)
  visited: number[]; // tree indices already summed/updated (violet)
  sum: number | null; // running sum during a query
  i: number; // current index for the stats tile
  caption: string;
};

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

const BASE_SEED = 5;

type Plan = {
  values: number[]; // 1-indexed base values (index 0 unused)
  queryK: number; // prefix-sum boundary
  updatePos: number; // point-update position (≤ queryK so the change shows)
  updateDelta: number;
};

/** Seed BASE_SEED reproduces the lesson exactly ([5,3,7,9,1,4], prefixSum(3),
 *  update(2,+10)); other seeds vary the values, query and update. */
function makePlan(seed: number): Plan {
  if (seed === BASE_SEED) {
    return { values: [0, 5, 3, 7, 9, 1, 4], queryK: 3, updatePos: 2, updateDelta: 10 };
  }
  const rng = makeRng(seed);
  const values = [0];
  for (let p = 1; p <= N; p++) values.push(1 + Math.floor(rng() * 9));
  const queryK = 3 + Math.floor(rng() * (N - 2)); // 3..N
  const updatePos = 1 + Math.floor(rng() * queryK); // 1..queryK
  const updateDelta = 4 + Math.floor(rng() * 8); // 4..11
  return { values, queryK, updatePos, updateDelta };
}

function buildFrames(plan: Plan): Frame[] {
  const tree = new Array<number>(N + 1).fill(0);
  const frames: Frame[] = [];

  const snap = (
    extra: Omit<Frame, "tree"> & Partial<Pick<Frame, "tree">>,
  ) => {
    frames.push({ ...extra, tree: [...tree] });
  };

  snap({
    op: "intro",
    target: 0,
    active: 0,
    path: [],
    visited: [],
    sum: null,
    i: 0,
    caption:
      "A 1-indexed base array (top) and its Binary Indexed Tree (bottom). Every jar covers a range of positions.",
  });

  // update(pos, delta): climb i += lowbit(i), touching every covering jar.
  const doUpdate = (pos: number, delta: number, op: "build" | "update") => {
    let i = pos;
    const path: number[] = [];
    while (i <= N) {
      tree[i] += delta;
      path.push(i);
      snap({
        op,
        target: pos,
        active: i,
        path: [...path],
        visited: path.slice(0, -1),
        sum: null,
        i,
        caption:
          `${op === "build" ? "Build" : "Update"}: add ${delta >= 0 ? "+" : ""}${delta} to jar[${i}] ` +
          `(covers ${rangeLo(i)}..${i}). Hop i += ${lowbit(i)} → ${i + lowbit(i)}.`,
      });
      i += lowbit(i);
    }
  };

  // Build the tree by pouring in each base value.
  for (let p = 1; p <= N; p++) {
    doUpdate(p, plan.values[p], "build");
  }

  // prefixSum(k): descend i -= lowbit(i), summing a handful of jars.
  const doQuery = (k: number) => {
    let sum = 0;
    let i = k;
    const path: number[] = [];
    const visited: number[] = [];
    while (i > 0) {
      sum += tree[i];
      path.push(i);
      snap({
        op: "query",
        target: k,
        active: i,
        path: [...path],
        visited: [...visited],
        sum,
        i,
        caption:
          `prefixSum(${k}): add jar[${i}]=${tree[i]} (covers ${rangeLo(i)}..${i}). ` +
          `Sum = ${sum}. Hop i −= ${lowbit(i)} → ${i - lowbit(i)}.`,
      });
      visited.push(i);
      i -= lowbit(i);
    }
    snap({
      op: "query",
      target: k,
      active: 0,
      path: [...path],
      visited: [...visited],
      sum,
      i: 0,
      caption: `prefixSum(${k}) = ${sum}. Reached index 0 in just ${path.length} jar${
        path.length === 1 ? "" : "s"
      }.`,
    });
    return sum;
  };

  doQuery(plan.queryK);
  snap({
    op: "update",
    target: plan.updatePos,
    active: 0,
    path: [],
    visited: [],
    sum: null,
    i: 0,
    caption: `Now change position ${plan.updatePos}: add +${plan.updateDelta}. Watch it propagate upward.`,
  });
  doUpdate(plan.updatePos, plan.updateDelta, "update");
  doQuery(plan.queryK);

  snap({
    op: "done",
    target: 0,
    active: 0,
    path: [],
    visited: [],
    sum: null,
    i: 0,
    caption: "Done — updates and prefix sums each touch only O(log n) jars.",
  });

  return frames;
}

/* ───────────────────────────── Geometry ────────────────────────────── */
const COL = 48;
const PAD_L = 26;
const CELL_W = 36;
const BASE_Y = 30;
const TREE_Y = 96;
const CELL_H = 30;
const SVG_H = 176;
const CONTENT_W = PAD_L * 2 + N * COL;
const colX = (c: number) => PAD_L + (c - 1) * COL + COL / 2;

const SPEEDS = [1200, 800, 520, 320, 170] as const;

export function FenwickTreeViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(BASE_SEED);
  const plan = useMemo(() => makePlan(seed), [seed]);
  const frames = useMemo(() => buildFrames(plan), [plan]);
  const total = frames.length;

  const [step, setStep] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(2);
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

  // Range band for a tree index (over the base row).
  const band = (i: number, color: string, key: string) => {
    const lo = rangeLo(i);
    const x1 = colX(lo) - CELL_W / 2 - 3;
    const x2 = colX(i) + CELL_W / 2 + 3;
    return (
      <rect
        key={key}
        x={x1}
        y={BASE_Y - 5}
        width={x2 - x1}
        height={CELL_H + 10}
        rx={8}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.9}
      />
    );
  };

  // Arc between two tree cells to show an index jump.
  const jumpArc = (a: number, b: number, key: string) => {
    const x1 = colX(a);
    const x2 = colX(b);
    const cx = (x1 + x2) / 2;
    const peak = TREE_Y + CELL_H + 12 + Math.min(30, Math.abs(x2 - x1) * 0.28);
    return (
      <path
        key={key}
        d={`M ${x1} ${TREE_Y + CELL_H} Q ${cx} ${peak} ${x2} ${TREE_Y + CELL_H}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        markerEnd="url(#fen-head)"
        opacity={0.85}
      />
    );
  };

  const treeCellColor = (i: number): { fill: string; stroke: string; text: string } => {
    if (f.active === i)
      return { fill: "var(--accent)", stroke: "var(--accent)", text: "#fff" };
    if (f.visited.includes(i))
      return {
        fill: "color-mix(in srgb, var(--color-primary) 60%, white)",
        stroke: "var(--color-primary)",
        text: "#fff",
      };
    return {
      fill: "var(--color-card)",
      stroke: "var(--color-line)",
      text: "var(--color-ink)",
    };
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Hop by powers of two</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Fenwick tree
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* Base array + BIT */}
      <div className="mt-3 overflow-x-auto rounded-xl bg-paper px-1 py-2">
        <svg
          width={CONTENT_W}
          height={SVG_H}
          viewBox={`0 0 ${CONTENT_W} ${SVG_H}`}
          className="mx-auto block"
          role="img"
          aria-label={`Fenwick tree over ${N} positions. ${f.caption}`}
        >
          <defs>
            <marker
              id="fen-head"
              markerWidth="8"
              markerHeight="8"
              refX="6.5"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L8,4 L0,8 Z" style={{ fill: "var(--accent)" }} />
            </marker>
          </defs>

          {/* Row labels */}
          <text
            x={4}
            y={BASE_Y - 10}
            fontSize={9}
            fontWeight={700}
            fill="var(--color-muted)"
            style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" }}
          >
            base
          </text>
          <text
            x={4}
            y={TREE_Y - 8}
            fontSize={9}
            fontWeight={700}
            fill="var(--color-muted)"
            style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" }}
          >
            tree
          </text>

          {/* Responsibility bands (behind base cells) */}
          {f.visited.map((i) =>
            band(i, "color-mix(in srgb, var(--color-primary) 55%, white)", `vb-${i}`),
          )}
          {f.active > 0 && band(f.active, "var(--accent)", `ab-${f.active}`)}

          {/* Base cells */}
          {Array.from({ length: N }, (_, k) => k + 1).map((c) => {
            const isTarget = f.target === c;
            return (
              <g key={`base-${c}`}>
                <text
                  x={colX(c)}
                  y={BASE_Y - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={isTarget ? "var(--color-here)" : "var(--color-muted)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {c}
                </text>
                <rect
                  x={colX(c) - CELL_W / 2}
                  y={BASE_Y}
                  width={CELL_W}
                  height={CELL_H}
                  rx={7}
                  fill={
                    isTarget
                      ? "color-mix(in srgb, var(--color-here) 20%, white)"
                      : "var(--color-card)"
                  }
                  stroke={isTarget ? "var(--color-here)" : "var(--color-line)"}
                  strokeWidth={2}
                />
                <text
                  x={colX(c)}
                  y={BASE_Y + CELL_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={700}
                  fill="var(--color-ink)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {plan.values[c]}
                </text>
              </g>
            );
          })}

          {/* Connector from active tree cell up to its band */}
          {f.active > 0 && (
            <line
              x1={colX(f.active)}
              y1={TREE_Y}
              x2={colX(f.active)}
              y2={BASE_Y + CELL_H + 5}
              stroke="var(--accent)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              opacity={0.7}
            />
          )}

          {/* Jump arcs along the op path */}
          {f.path.slice(0, -1).map((a, idx) =>
            jumpArc(a, f.path[idx + 1], `arc-${a}-${f.path[idx + 1]}`),
          )}

          {/* Tree cells */}
          {Array.from({ length: N }, (_, k) => k + 1).map((c) => {
            const col = treeCellColor(c);
            return (
              <g key={`tree-${c}`}>
                <rect
                  x={colX(c) - CELL_W / 2}
                  y={TREE_Y}
                  width={CELL_W}
                  height={CELL_H}
                  rx={7}
                  fill={col.fill}
                  stroke={col.stroke}
                  strokeWidth={2}
                  style={{ transition: "fill 180ms" }}
                />
                <text
                  x={colX(c)}
                  y={TREE_Y + CELL_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={700}
                  fill={col.text}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {f.tree[c]}
                </text>
                <text
                  x={colX(c)}
                  y={TREE_Y + CELL_H + 12}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight={600}
                  fill="var(--color-muted)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {c}
                </text>
              </g>
            );
          })}
        </svg>
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
        <Stat label="Index i" value={f.i === 0 ? "—" : f.i} />
        <Stat label="Sum" value={f.sum == null ? "—" : f.sum} />
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
        <LegendDot color="var(--accent)" label="Current jar / range" />
        <LegendDot color="var(--color-primary)" label="Summed jar" />
        <LegendDot color="var(--color-here)" label="Position of interest" />
        <LegendDot color="var(--color-card)" label="Idle jar" ring />
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
          background: ring ? "transparent" : color,
          boxShadow: ring ? "inset 0 0 0 1px var(--color-line)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
