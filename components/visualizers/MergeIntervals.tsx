"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   MergeIntervals — a "watch busy time collapse" explainer for merging
   overlapping intervals (think overlapping meetings on a calendar).

   Intervals are drawn as horizontal bars on a shared timeline. First we sort
   them by start time, then we sweep left to right keeping one "current merged"
   interval: if the next interval starts at or before the current one's end we
   stretch the current bar to cover both; otherwise we close the current block
   out and open a new one. Sorted order is what makes the single pass correct.

   Same engine as SortVisualizer: the whole run is recorded up front, then
   replayed purely from a `step` counter. No setState in any effect body;
   motion is disabled globally under prefers-reduced-motion.
   ──────────────────────────────────────────────────────────────────────── */

type Interval = { start: number; end: number };

type Op =
  | { t: "open"; i: number } // start a fresh current-merged block from sorted[i]
  | { t: "extend"; i: number; end: number } // sorted[i] overlaps → stretch current
  | { t: "close" } // no overlap → commit the current block
  | { t: "done" };

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

function lessonSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

const T_MAX = 20; // timeline runs 0..20
const COUNT = 6;

function buildIntervals(seed: number): Interval[] {
  const rng = makeRng(seed);
  const out: Interval[] = [];
  for (let i = 0; i < COUNT; i++) {
    const start = Math.floor(rng() * (T_MAX - 4));
    const len = 2 + Math.floor(rng() * 5); // length 2..6
    out.push({ start, end: Math.min(T_MAX, start + len) });
  }
  return out;
}

/** Record the sort-then-sweep. Returns the sorted intervals (display order)
 *  and the op list. */
function record(intervals: Interval[]): { sorted: Interval[]; ops: Op[] } {
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const ops: Op[] = [];
  if (sorted.length === 0) {
    ops.push({ t: "done" });
    return { sorted, ops };
  }
  let curEnd = sorted[0].end;
  ops.push({ t: "open", i: 0 });
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start <= curEnd) {
      curEnd = Math.max(curEnd, sorted[i].end);
      ops.push({ t: "extend", i, end: curEnd });
    } else {
      ops.push({ t: "close" });
      ops.push({ t: "open", i });
      curEnd = sorted[i].end;
    }
  }
  ops.push({ t: "close" });
  ops.push({ t: "done" });
  return { sorted, ops };
}

const SPEEDS = [1000, 660, 420, 240, 120] as const;

export function MergeIntervals({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("merge-intervals"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const intervals = useMemo(() => buildIntervals(seed), [seed]);
  const { sorted, ops } = useMemo(() => record(intervals), [intervals]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const merged: Interval[] = []; // committed blocks
    let current: Interval | null = null;
    let active: number | null = null; // sorted index under consideration
    let overlapped = false;
    let considered = 0; // how many sorted intervals absorbed so far
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      active = null;
      overlapped = false;
      switch (op.t) {
        case "open":
          current = { ...sorted[op.i] };
          active = op.i;
          considered = op.i + 1;
          break;
        case "extend":
          if (current) current = { start: current.start, end: op.end };
          active = op.i;
          overlapped = true;
          considered = op.i + 1;
          break;
        case "close":
          if (current) merged.push(current);
          current = null;
          break;
        case "done":
          break;
      }
    }
    return { merged, current, active, overlapped, considered };
  }, [ops, sorted, step]);

  const { merged, current, active, overlapped, considered } = frame;

  useEffect(() => {
    if (!running) return;
    if (runStartRef.current == null) runStartRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, total));
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

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

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
    setStep((s) => Math.min(s + 1, total));
  };

  const newIntervals = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const currentOp = step > 0 ? ops[step - 1] : undefined;

  const caption = (() => {
    if (!currentOp) return "Sorted by start time. Press play to sweep left-to-right and merge overlaps.";
    switch (currentOp.t) {
      case "open": {
        const iv = sorted[currentOp.i];
        return `Open a new block at ${iv.start}–${iv.end}.`;
      }
      case "extend": {
        const iv = sorted[currentOp.i];
        return `${iv.start}–${iv.end} starts before the current end → overlap. Stretch the block to end at ${currentOp.end}.`;
      }
      case "close":
        return "The next interval starts after the current end — no overlap. Commit this block and move on.";
      case "done":
        return `Done. ${intervals.length} intervals collapsed into ${merged.length} non-overlapping block(s).`;
    }
  })();

  const pct = (v: number) => `${(v / T_MAX) * 100}%`;

  // A bar for a sorted interval: its state depends on whether it's been
  // absorbed (part of a committed/current block), is the active one, etc.
  const barTone = (idx: number): { bg: string; label: string } => {
    if (active === idx) {
      return overlapped
        ? { bg: "var(--color-primary)", label: "overlapping" }
        : { bg: "var(--accent)", label: "new block" };
    }
    if (idx < considered) {
      return { bg: "color-mix(in srgb, var(--color-muted) 20%, white)", label: "absorbed" };
    }
    return { bg: "color-mix(in srgb, var(--accent) 24%, white)", label: "waiting" };
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it merge</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Merge intervals
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <p className="mt-2 text-xs text-muted">
        Sorted by start time first — the single-pass sweep only works in order.
      </p>

      <div
        className="mt-3 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Merging ${intervals.length} intervals on a 0 to ${T_MAX} timeline; ${
          done ? `${merged.length} merged blocks` : `step ${step} of ${total}`
        }`}
      >
        {/* Sorted input intervals, one per row */}
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Intervals (sorted by start)</div>
        <div className="flex flex-col gap-1.5">
          {sorted.map((iv, idx) => {
            const tone = barTone(idx);
            return (
              <div key={idx} className="relative h-6 w-full rounded-md" style={{ background: "color-mix(in srgb, var(--color-muted) 8%, white)" }}>
                <div
                  className="dp-bar absolute inset-y-0 flex items-center justify-center rounded-md font-mono text-[10px] font-bold"
                  style={{
                    left: pct(iv.start),
                    width: pct(iv.end - iv.start),
                    background: tone.bg,
                    color: active === idx ? "white" : "var(--color-ink)",
                    minWidth: "26px",
                  }}
                >
                  {iv.start}–{iv.end}
                </div>
              </div>
            );
          })}
        </div>

        {/* Merged result track */}
        <div className="dp-eyebrow mb-2 mt-4 text-[10px] text-muted">Merged result</div>
        <div className="relative h-7 w-full rounded-md" style={{ background: "color-mix(in srgb, var(--color-muted) 8%, white)" }}>
          {merged.map((iv, idx) => (
            <div
              key={idx}
              className="absolute inset-y-0 flex items-center justify-center rounded-md font-mono text-[10px] font-bold text-white"
              style={{
                left: pct(iv.start),
                width: pct(iv.end - iv.start),
                background: "var(--color-output)",
                minWidth: "26px",
              }}
            >
              {iv.start}–{iv.end}
            </div>
          ))}
          {current && (
            <div
              className="absolute inset-y-0 flex items-center justify-center rounded-md font-mono text-[10px] font-bold text-white"
              style={{
                left: pct(current.start),
                width: pct(current.end - current.start),
                background: "var(--accent)",
                outline: "2px dashed var(--color-ink)",
                outlineOffset: "-2px",
                minWidth: "26px",
              }}
            >
              {current.start}–{current.end}
            </div>
          )}
        </div>

        {/* Timeline ruler */}
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted">
          <span>0</span>
          <span>{T_MAX / 2}</span>
          <span>{T_MAX}</span>
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Intervals" value={intervals.length} />
        <Stat label="Merged" value={merged.length + (current ? 1 : 0)} />
        <Stat label="Considered" value={`${considered}/${sorted.length}`} />
        <Stat label="Step" value={`${step}/${total}`} />
      </div>

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
          onClick={newIntervals}
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

        <span className="font-mono text-[11px] text-muted">
          {(elapsed / 1000).toFixed(1)}s
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Current block" />
        <LegendDot color="var(--color-primary)" label="Overlapping" />
        <LegendDot color="var(--color-output)" label="Committed" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 20%, white)" label="Absorbed" />
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
