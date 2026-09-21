"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Quickselect — a "watch it find the k-th smallest" explainer.

   Quickselect partitions the array around a pivot exactly like quicksort:
   everything smaller than the pivot moves left, everything larger stays right,
   and the pivot lands in its final sorted position p. The twist is what
   happens next — instead of recursing into BOTH sides, it keeps only the side
   that still contains the target index k and discards the other entirely. That
   is why it averages O(n) instead of sorting the whole array.

   Same engine as SortVisualizer: the run (with its swaps) is recorded up
   front, then replayed purely from a `step` counter. No setState in any effect
   body; motion is disabled globally under prefers-reduced-motion.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "pivot"; pivotIdx: number; lo: number; hi: number } // choose pivot = a[hi]
  | { t: "compare"; j: number; i: number; pivotIdx: number; lo: number; hi: number }
  | { t: "swap"; i: number; j: number; lo: number; hi: number } // a[j] < pivot
  | { t: "place"; from: number; to: number; lo: number; hi: number } // pivot to final spot
  | { t: "narrow"; lo: number; hi: number; keep: "left" | "right"; pivotPos: number }
  | { t: "found"; idx: number };

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

const N = 11;

function buildInput(seed: number): number[] {
  // Distinct values 1..N, seeded-shuffled — distinct keeps the partition clean.
  const arr = Array.from({ length: N }, (_, i) => i + 1);
  const rng = makeRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Record a Lomuto-partition quickselect for the target 0-based index. */
function record(input: number[], target: number): { ops: Op[]; swaps: [number, number][] } {
  const a = [...input];
  const ops: Op[] = [];
  const swaps: [number, number][] = [];
  const pushSwap = (i: number, j: number) => {
    swaps.push([i, j]);
    [a[i], a[j]] = [a[j], a[i]];
  };
  const noSwap = () => swaps.push([0, 0]);

  let lo = 0;
  let hi = a.length - 1;

  for (;;) {
    if (lo === hi) {
      ops.push({ t: "found", idx: lo });
      noSwap();
      break;
    }
    const pivotVal = a[hi];
    ops.push({ t: "pivot", pivotIdx: hi, lo, hi });
    noSwap();
    let i = lo;
    for (let j = lo; j < hi; j++) {
      ops.push({ t: "compare", j, i, pivotIdx: hi, lo, hi });
      noSwap();
      if (a[j] < pivotVal) {
        if (i !== j) {
          ops.push({ t: "swap", i, j, lo, hi });
          pushSwap(i, j);
        }
        i++;
      }
    }
    ops.push({ t: "place", from: hi, to: i, lo, hi });
    if (i !== hi) pushSwap(i, hi);
    else noSwap();
    const p = i;
    if (p === target) {
      ops.push({ t: "found", idx: p });
      noSwap();
      break;
    } else if (target < p) {
      ops.push({ t: "narrow", lo, hi: p - 1, keep: "left", pivotPos: p });
      noSwap();
      hi = p - 1;
    } else {
      ops.push({ t: "narrow", lo: p + 1, hi, keep: "right", pivotPos: p });
      noSwap();
      lo = p + 1;
    }
  }
  return { ops, swaps };
}

const SPEEDS = [900, 560, 340, 190, 90] as const;

export function Quickselect({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("quickselect"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const input = useMemo(() => buildInput(seed), [seed]);
  // Target k (0-based). A separate seed stream keeps it independent of shuffle.
  const target = useMemo(() => Math.floor(makeRng(seed + 555)() * input.length), [seed, input.length]);

  const { ops, swaps } = useMemo(() => record(input, target), [input, target]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const view = [...input];
    let lo = 0;
    let hi = input.length - 1;
    let pivotIdx: number | null = null;
    let iPtr: number | null = null;
    let compareJ: number | null = null;
    let foundIdx: number | null = null;
    let comparisons = 0;
    for (let k = 0; k < step; k++) {
      const [si, sj] = swaps[k];
      if (si !== sj) [view[si], view[sj]] = [view[sj], view[si]];
      const op = ops[k];
      compareJ = null;
      switch (op.t) {
        case "pivot":
          pivotIdx = op.pivotIdx;
          iPtr = op.lo;
          lo = op.lo;
          hi = op.hi;
          break;
        case "compare":
          compareJ = op.j;
          iPtr = op.i;
          comparisons++;
          break;
        case "swap":
          iPtr = op.i + 1;
          break;
        case "place":
          pivotIdx = op.to;
          break;
        case "narrow":
          lo = op.lo;
          hi = op.hi;
          pivotIdx = null;
          iPtr = null;
          break;
        case "found":
          foundIdx = op.idx;
          pivotIdx = null;
          iPtr = null;
          break;
      }
    }
    return { view, lo, hi, pivotIdx, iPtr, compareJ, foundIdx, comparisons };
  }, [input, ops, swaps, step]);

  const { view, lo, hi, pivotIdx, compareJ, foundIdx, comparisons } = frame;

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

  const newNumbers = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const currentOp = step > 0 ? ops[step - 1] : undefined;
  const kOrdinal = target + 1;

  const caption = (() => {
    if (!currentOp) return `Find the ${ordinal(kOrdinal)} smallest (index ${target}). Press play.`;
    switch (currentOp.t) {
      case "pivot":
        return `Pivot = ${view[currentOp.pivotIdx]}. Split the range into smaller-than-pivot and the rest.`;
      case "compare":
        return `Is ${view[currentOp.j]} < pivot ${view[currentOp.pivotIdx]}? ${view[currentOp.j] < view[currentOp.pivotIdx] ? "Yes — it belongs on the left." : "No — leave it."}`;
      case "swap":
        return `Move ${view[currentOp.i]} into the smaller-than-pivot region.`;
      case "place":
        return `Pivot settles at index ${currentOp.to} — its final sorted position.`;
      case "narrow":
        return currentOp.keep === "left"
          ? `Target ${target} < ${currentOp.pivotPos} → keep the LEFT pile, discard the right entirely.`
          : `Target ${target} > ${currentOp.pivotPos} → keep the RIGHT pile, discard the left entirely.`;
      case "found":
        return `Index ${currentOp.idx} holds ${view[currentOp.idx]} — the ${ordinal(kOrdinal)} smallest. Done.`;
    }
  })();

  const maxVal = N;

  const cellTone = (idx: number): string => {
    if (foundIdx === idx) return "var(--color-output)";
    if (pivotIdx === idx) return "var(--color-primary)";
    if (compareJ === idx) return "var(--accent)";
    if (idx < lo || idx > hi) return "color-mix(in srgb, var(--color-muted) 16%, white)"; // discarded
    return "color-mix(in srgb, var(--accent) 26%, white)"; // active range
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it select</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Quickselect
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          Find&nbsp;{ordinal(kOrdinal)}&nbsp;smallest
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Quickselect for the ${ordinal(kOrdinal)} smallest of ${N} values; ${
          foundIdx != null ? `found ${view[foundIdx]} at index ${foundIdx}` : `step ${step} of ${total}`
        }`}
      >
        <div className="flex items-end justify-center gap-[3px] sm:gap-1.5">
          {view.map((v, idx) => {
            const tone = cellTone(idx);
            const isPivot = pivotIdx === idx;
            const isTarget = idx === target;
            return (
              <div key={idx} className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex w-full items-end justify-center" style={{ height: "104px" }}>
                  <div
                    className="dp-bar flex w-full items-start justify-center rounded-t-md pt-1 font-mono text-[11px] font-bold sm:text-xs"
                    style={{
                      height: `${28 + (v / maxVal) * 72}px`,
                      background: tone,
                      color: tone.startsWith("color-mix") ? "var(--color-ink)" : "white",
                      transform: compareJ === idx || isPivot ? "translateY(-3px)" : undefined,
                    }}
                  >
                    {v}
                  </div>
                </div>
                {/* target k marker */}
                <div className="mt-1 flex h-3 items-center text-[9px] font-bold leading-none">
                  {isTarget && (
                    <span style={{ color: foundIdx === idx ? "var(--color-output)" : "var(--color-ink)" }}>▲k</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Comparisons" value={comparisons} />
        <Stat label="Live range" value={foundIdx != null ? 1 : Math.max(0, hi - lo + 1)} />
        <Stat label="Answer" value={foundIdx != null ? view[foundIdx] : "—"} />
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
          onClick={newNumbers}
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
        <LegendDot color="var(--color-primary)" label="Pivot" />
        <LegendDot color="var(--accent)" label="Comparing" />
        <LegendDot color="color-mix(in srgb, var(--accent) 26%, white)" label="Live range" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 16%, white)" label="Discarded" />
        <LegendDot color="var(--color-output)" label="Answer" />
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
