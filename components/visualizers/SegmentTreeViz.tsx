"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SegmentTreeViz — a "watch it total up" explainer for a range-sum segment
   tree over a small array.

   Each leaf holds one array value; each parent holds the sum of its two
   children; the root holds the grand total. First the tree is built bottom-up.
   Then a range-sum query for [l, r) descends from the root, and instead of
   touching every leaf it stops at the handful of segments that exactly cover
   the range — skipping whole subtrees that fall outside it. build is O(n) once,
   a range query is O(log n).

   The run is precomputed as frames and replayed from a single `step` index —
   deterministic, scrubbable, StrictMode-safe. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type SNode = {
  id: number;
  lo: number;
  hi: number; // half-open range [lo, hi)
  sum: number;
  left: number | null;
  right: number | null;
  depth: number;
  x: number;
  y: number;
};

type Frame = {
  sums: (number | null)[]; // per node; null until computed (drives reveal)
  visit: number | null; // accent — node being examined
  recompute: number | null; // violet — node whose sum was just set
  children: number[]; // accent — the two children feeding a combine
  coveredIds: number[]; // coral — segments that cover the query range
  outsideIds: number[]; // dim — segments skipped as out of range
  runningSum: number;
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

const N = 8; // power of two → a clean, full binary tree

function build(seed: number): {
  frames: Frame[];
  nodes: SNode[];
  vbw: number;
  vbh: number;
  values: number[];
  l: number;
  r: number;
} {
  const rng = makeRng(seed);
  const values = Array.from({ length: N }, () => 1 + Math.floor(rng() * 9));

  const nodes: SNode[] = [];
  let idc = 0;
  const make = (lo: number, hi: number, depth: number): number => {
    const id = idc++;
    nodes[id] = { id, lo, hi, sum: 0, left: null, right: null, depth, x: 0, y: 0 };
    if (hi - lo === 1) {
      nodes[id].sum = values[lo];
    } else {
      const mid = (lo + hi) >> 1;
      const L = make(lo, mid, depth + 1);
      const R = make(mid, hi, depth + 1);
      nodes[id].left = L;
      nodes[id].right = R;
      nodes[id].sum = nodes[L].sum + nodes[R].sum;
    }
    return id;
  };
  const root = make(0, N, 0);

  const maxDepth = Math.log2(N);
  const vbw = N * 48;
  const vbh = (maxDepth + 1) * 74;
  nodes.forEach((nd) => {
    nd.x = (((nd.lo + nd.hi) / 2) / N) * vbw;
    nd.y = ((nd.depth + 0.5) / (maxDepth + 1)) * vbh;
  });

  // Shared mutable state closed over by snap().
  const cur: (number | null)[] = nodes.map(() => null);
  let covered: number[] = [];
  let outside: number[] = [];
  let runningSum = 0;

  const frames: Frame[] = [];
  const snap = (extra: Partial<Frame>): Frame => ({
    sums: [...cur],
    visit: null,
    recompute: null,
    children: [],
    coveredIds: [...covered],
    outsideIds: [...outside],
    runningSum,
    caption: "",
    ...extra,
  });

  frames.push(snap({ caption: "Build bottom-up: each parent = sum of its two children." }));

  // Build phase — post-order so children compute before parents.
  const rec = (id: number) => {
    const nd = nodes[id];
    const L = nd.left;
    const R = nd.right;
    if (L === null || R === null) {
      cur[id] = nd.sum;
      frames.push(snap({ recompute: id, caption: `Leaf [${nd.lo},${nd.hi}) holds ${nd.sum}.` }));
      return;
    }
    rec(L);
    rec(R);
    cur[id] = nd.sum;
    frames.push(
      snap({
        recompute: id,
        children: [L, R],
        caption: `[${nd.lo},${nd.hi}) = ${cur[L]} + ${cur[R]} = ${nd.sum}.`,
      }),
    );
  };
  rec(root);
  frames.push(snap({ caption: `Built. The root holds the grand total ${nodes[root].sum}.` }));

  // Query phase — pick an interior range and descend.
  const l = 1 + Math.floor(rng() * 3); // 1..3
  const len = 2 + Math.floor(rng() * 3); // 2..4
  const r = Math.min(N, l + len); // exclusive
  frames.push(
    snap({ caption: `Query sum of [${l},${r}). Take only the segments that cover it.` }),
  );
  const q = (id: number): number => {
    const nd = nodes[id];
    if (nd.hi <= l || nd.lo >= r) {
      outside = [...outside, id];
      frames.push(
        snap({ caption: `[${nd.lo},${nd.hi}) is outside [${l},${r}) — skip it.` }),
      );
      return 0;
    }
    if (l <= nd.lo && nd.hi <= r) {
      covered = [...covered, id];
      runningSum += nd.sum;
      frames.push(
        snap({
          caption: `[${nd.lo},${nd.hi}) sits fully inside — add ${nd.sum} (running total ${runningSum}).`,
        }),
      );
      return nd.sum;
    }
    frames.push(
      snap({ visit: id, caption: `[${nd.lo},${nd.hi}) only partly overlaps — split into children.` }),
    );
    return q(nd.left as number) + q(nd.right as number);
  };
  q(root);
  frames.push(
    snap({
      caption: `Answer: sum of [${l},${r}) = ${runningSum}, from ${covered.length} covering segment${
        covered.length === 1 ? "" : "s"
      }.`,
    }),
  );

  return { frames, nodes, vbw, vbh, values, l, r };
}

const SPEEDS = [1100, 750, 480, 300, 160] as const;
const IDLE = "color-mix(in srgb, var(--accent) 18%, white)";

export function SegmentTreeViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(1);
  const { frames, nodes, vbw, vbh, values, l, r } = useMemo(() => build(seed), [seed]);
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
  const present = (id: number) => f.sums[id] !== null;
  const coveredSet = new Set(f.coveredIds);
  const outsideSet = new Set(f.outsideIds);
  const childSet = new Set(f.children);

  type St = "recompute" | "visit" | "covered" | "child" | "outside" | "idle";
  const stateOf = (id: number): St => {
    if (f.recompute === id) return "recompute";
    if (f.visit === id) return "visit";
    if (coveredSet.has(id)) return "covered";
    if (childSet.has(id)) return "child";
    if (outsideSet.has(id)) return "outside";
    return "idle";
  };
  const fillFor = (st: St) =>
    st === "recompute"
      ? "var(--color-primary)"
      : st === "visit" || st === "child"
        ? "var(--accent)"
        : st === "covered"
          ? "var(--color-here)"
          : st === "outside"
            ? "color-mix(in srgb, var(--color-muted) 22%, white)"
            : IDLE;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it total up</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Segment tree
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          sum&nbsp;[{l},{r})
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* The tree */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${vbw} ${vbh}`}
          className="mx-auto block h-52 w-full sm:h-60"
          role="img"
          aria-label={`Range-sum segment tree; ${f.caption}`}
        >
          {/* Edges */}
          {nodes.map((nd) =>
            [nd.left, nd.right]
              .filter((c): c is number => c !== null && present(c) && present(nd.id))
              .map((c) => {
                const lit = f.children.includes(c) && f.recompute === nd.id;
                return (
                  <line
                    key={`${nd.id}-${c}`}
                    x1={nd.x}
                    y1={nd.y}
                    x2={nodes[c].x}
                    y2={nodes[c].y}
                    stroke={lit ? "var(--accent)" : "var(--color-line)"}
                    strokeWidth={lit ? 3 : 1.75}
                    strokeLinecap="round"
                  />
                );
              }),
          )}

          {/* Nodes: sum on top, range underneath */}
          {nodes.map((nd) => {
            if (!present(nd.id)) return null;
            const st = stateOf(nd.id);
            const fill = fillFor(st);
            const colored = st !== "idle" && st !== "outside";
            const dim = st === "outside";
            return (
              <g key={nd.id} opacity={dim ? 0.55 : 1}>
                {st === "visit" && (
                  <circle
                    cx={nd.x}
                    cy={nd.y}
                    r={20}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}
                <circle
                  cx={nd.x}
                  cy={nd.y}
                  r={14}
                  fill={fill}
                  stroke={colored ? fill : "var(--color-line)"}
                  strokeWidth={2}
                />
                <text
                  x={nd.x}
                  y={nd.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={700}
                  fill={colored ? "#fff" : "var(--color-ink)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {f.sums[nd.id]}
                </text>
                <text
                  x={nd.x}
                  y={nd.y + 24}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8.5}
                  fill="var(--color-muted)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  [{nd.lo},{nd.hi})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Backing array with the query range marked */}
      <div className="mt-3">
        <div className="dp-eyebrow mb-1.5 text-muted">Array (query range shaded)</div>
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => {
            const inRange = i >= l && i < r;
            return (
              <div key={i} className="flex flex-col items-center">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-bold"
                  style={{
                    background: inRange
                      ? "color-mix(in srgb, var(--color-here) 18%, white)"
                      : "var(--color-card)",
                    color: "var(--color-ink)",
                    boxShadow: inRange
                      ? "inset 0 0 0 1.5px color-mix(in srgb, var(--color-here) 55%, white)"
                      : "inset 0 0 0 1px var(--color-line)",
                  }}
                >
                  {v}
                </span>
                <span className="mt-0.5 font-mono text-[10px] text-muted">{i}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {f.caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Range" value={`[${l},${r})`} />
        <Stat label="Running sum" value={f.runningSum} />
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
        <LegendDot color="var(--color-primary)" label="Building sum" />
        <LegendDot color="var(--accent)" label="Examining" />
        <LegendDot color="var(--color-here)" label="Covers range" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 22%, white)" label="Skipped" ring />
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
