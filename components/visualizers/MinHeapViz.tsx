"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   MinHeapViz — a "watch it bubble" explainer for an array-backed min-heap.

   A heap is really just a plain array; simple index math (parent = ⌊(i−1)/2⌋,
   children = 2i+1, 2i+2) turns it into a binary tree. This shows both views at
   once — the tree AND the backing array — so you can see them stay in lock-step.

   It inserts a handful of values (each bubbles UP past any bigger parent), then
   extracts the minimum twice: swap the top with the last slot, drop it, and let
   the newcomer sift DOWN past its smaller child. The smallest value is always
   at index 0, reachable in O(1); insert and extract are O(log n).

   The whole run is precomputed as frames and played back from a single `step`
   index — deterministic, scrubbable, StrictMode-safe. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Frame = {
  heap: number[];
  compare: number[]; // accent — indices being compared this step
  swap: [number, number] | null; // violet — indices swapped this step
  special: number | null; // coral — the min / a freshly placed item
  caption: string;
  comparisons: number;
  swaps: number;
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

/** Six distinct values in 1..30, seeded so server and client match. */
function pickValues(seed: number): number[] {
  const pool = Array.from({ length: 30 }, (_, i) => i + 1);
  const rng = makeRng(seed);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 6);
}

function build(seed: number): Frame[] {
  const values = pickValues(seed);
  const heap: number[] = [];
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;

  const snap = (extra: Partial<Frame>): Frame => ({
    heap: [...heap],
    compare: [],
    swap: null,
    special: null,
    caption: "",
    comparisons,
    swaps,
    ...extra,
  });

  frames.push(snap({ caption: "Empty heap. Insert values — each bubbles up." }));

  // Insert phase — sift up.
  for (const v of values) {
    heap.push(v);
    let i = heap.length - 1;
    frames.push(snap({ special: i, caption: `Add ${v} at the end (index ${i}).` }));
    let settled = true;
    while (i > 0) {
      const p = (i - 1) >> 1;
      comparisons++;
      frames.push(
        snap({ compare: [i, p], caption: `Is ${heap[i]} smaller than its parent ${heap[p]}?` }),
      );
      if (heap[p] <= heap[i]) {
        frames.push(
          snap({ special: i, caption: `${heap[p]} ≤ ${heap[i]} — ${heap[i]} is in place.` }),
        );
        settled = false;
        break;
      }
      [heap[p], heap[i]] = [heap[i], heap[p]];
      swaps++;
      frames.push(snap({ swap: [i, p], caption: `Smaller — bubble ${heap[p]} up a level.` }));
      i = p;
    }
    if (settled) {
      frames.push(snap({ special: 0, caption: `${heap[0]} bubbled to the top.` }));
    }
  }

  // Extract-min phase — sift down, twice.
  const extract = () => {
    if (heap.length === 0) return;
    const min = heap[0];
    frames.push(snap({ special: 0, caption: `Smallest is ${min} at the top — extract it.` }));
    const last = heap.length - 1;
    if (last > 0) {
      [heap[0], heap[last]] = [heap[last], heap[0]];
      swaps++;
      frames.push(
        snap({ swap: [0, last], caption: `Swap ${min} with the last item ${heap[0]}.` }),
      );
    }
    heap.pop();
    frames.push(
      snap({
        caption: heap.length
          ? `Remove ${min}. Now ${heap[0]} sits on top — sift it down.`
          : `Remove ${min}. The heap is now empty.`,
      }),
    );
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      const kids: number[] = [];
      if (l < heap.length) kids.push(l);
      if (r < heap.length) kids.push(r);
      if (kids.length === 0) {
        frames.push(snap({ special: i, caption: `${heap[i]} reached the bottom — settled.` }));
        break;
      }
      let s = i;
      for (const k of kids) {
        comparisons++;
        if (heap[k] < heap[s]) s = k;
      }
      frames.push(
        snap({
          compare: [i, ...kids],
          caption: `Compare ${heap[i]} with child${kids.length > 1 ? "ren" : ""} ${kids
            .map((k) => heap[k])
            .join(" & ")}.`,
        }),
      );
      if (s === i) {
        frames.push(snap({ special: i, caption: `${heap[i]} ≤ its children — settled.` }));
        break;
      }
      [heap[i], heap[s]] = [heap[s], heap[i]];
      swaps++;
      frames.push(
        snap({ swap: [i, s], caption: `${heap[i]} rises; ${heap[s]} sinks down.` }),
      );
      i = s;
    }
  };
  extract();
  extract();

  return frames;
}

const SPEEDS = [1100, 750, 480, 300, 160] as const;
const IDLE = "color-mix(in srgb, var(--accent) 18%, white)";

/** Complete-tree layout for a 0-based heap index. */
function nodePos(i: number, maxDepth: number, vbw: number, vbh: number) {
  const d = Math.floor(Math.log2(i + 1));
  const levelStart = (1 << d) - 1;
  const within = i - levelStart;
  const levelCount = 1 << d;
  return {
    x: ((within + 0.5) / levelCount) * vbw,
    y: ((d + 0.5) / (maxDepth + 1)) * vbh,
  };
}

export function MinHeapViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(1);
  const frames = useMemo(() => build(seed), [seed]);
  const total = frames.length;

  const maxLen = useMemo(() => Math.max(1, ...frames.map((f) => f.heap.length)), [frames]);
  const maxDepth = Math.floor(Math.log2(maxLen));
  const vbw = (1 << maxDepth) * 72;
  const vbh = (maxDepth + 1) * 76;

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
  const compareSet = new Set(f.compare);
  const swapSet = new Set(f.swap ?? []);

  const cellState = (i: number): "compare" | "swap" | "special" | "idle" => {
    if (f.swap && swapSet.has(i)) return "swap";
    if (f.special === i) return "special";
    if (compareSet.has(i)) return "compare";
    return "idle";
  };
  const fillFor = (st: ReturnType<typeof cellState>) =>
    st === "compare"
      ? "var(--accent)"
      : st === "swap"
        ? "var(--color-primary)"
        : st === "special"
          ? "var(--color-here)"
          : IDLE;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it bubble</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Min-heap
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* The tree */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${vbw} ${vbh}`}
          className="mx-auto block h-48 w-full sm:h-56"
          role="img"
          aria-label={`Min-heap as a tree with ${f.heap.length} node${
            f.heap.length === 1 ? "" : "s"
          }; ${f.caption}`}
        >
          {/* Edges */}
          {f.heap.map((_, i) => {
            if (i === 0) return null;
            const p = (i - 1) >> 1;
            const a = nodePos(p, maxDepth, vbw, vbh);
            const b = nodePos(i, maxDepth, vbw, vbh);
            return (
              <line
                key={`e-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-line)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {/* Nodes */}
          {f.heap.map((v, i) => {
            const st = cellState(i);
            const fill = fillFor(st);
            const colored = st !== "idle";
            const pos = nodePos(i, maxDepth, vbw, vbh);
            return (
              <g key={`n-${i}`}>
                {st === "compare" && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={21}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={15}
                  fill={fill}
                  stroke={colored ? fill : "var(--color-line)"}
                  strokeWidth={2}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={700}
                  fill={colored ? "#fff" : "var(--color-ink)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {v}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Backing array */}
      <div className="mt-3">
        <div className="dp-eyebrow mb-1.5 text-muted">Backing array</div>
        <div className="flex flex-wrap gap-1.5">
          {f.heap.length === 0 && <span className="text-sm text-muted">empty</span>}
          {f.heap.map((v, i) => {
            const st = cellState(i);
            const fill = fillFor(st);
            const colored = st !== "idle";
            return (
              <div key={`a-${i}`} className="flex flex-col items-center">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-bold"
                  style={{
                    background: fill,
                    color: colored ? "#fff" : "var(--color-ink)",
                    boxShadow: colored ? undefined : "inset 0 0 0 1px var(--color-line)",
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
        <Stat label="Size" value={f.heap.length} />
        <Stat label="Peek (min)" value={f.heap.length ? f.heap[0] : "—"} />
        <Stat label="Swaps" value={f.swaps} />
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
        <LegendDot color="var(--color-primary)" label="Swapping" />
        <LegendDot color="var(--color-here)" label="Min / placed" />
        <LegendDot color={IDLE} label="Resting" ring />
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
