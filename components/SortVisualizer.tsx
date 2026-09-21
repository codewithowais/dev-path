"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SortVisualizer — a "watch it sort" animated explainer.

   Give it a bag of random numbers and it sorts them in front of you, one
   comparison and swap at a time, with a running commentary and live counts
   (comparisons, swaps, time). It's the in-lesson version of those short
   "here's how the algorithm actually moves" clips.

   How it works internally: each algorithm is a pure *generator* that records
   every step it takes as a small op ({ compare }, { swap }, { overwrite },
   { pivot }, { sorted }). Recording first, playing back second, keeps the
   animation deterministic and lets us scrub, step, pause, and replay without
   re-running the algorithm. All motion is disabled under prefers-reduced-motion
   (handled globally in globals.css) and the final sorted state still shows.
   ──────────────────────────────────────────────────────────────────────── */

export type SortAlgo =
  | "bubble-sort"
  | "selection-sort"
  | "insertion-sort"
  | "merge-sort"
  | "quick-sort"
  | "heap-sort";

/** A single recorded step of an algorithm's run. */
type Op =
  | { t: "compare"; i: number; j: number }
  | { t: "swap"; i: number; j: number }
  | { t: "overwrite"; i: number; value: number }
  | { t: "pivot"; i: number }
  | { t: "unpivot" }
  | { t: "sorted"; i: number };

type Recording = {
  ops: Op[];
  /** Total comparisons and writes the run made — the honest cost. */
  comparisons: number;
  writes: number;
};

const ALGO_LABEL: Record<SortAlgo, string> = {
  "bubble-sort": "Bubble sort",
  "selection-sort": "Selection sort",
  "insertion-sort": "Insertion sort",
  "merge-sort": "Merge sort",
  "quick-sort": "Quick sort",
  "heap-sort": "Heap sort",
};

/* ───────────────────────────── Recorders ─────────────────────────────
   Each takes a starting array and returns the full list of ops plus the
   comparison/write tallies. They mutate a private copy, never the input. */

function record(algo: SortAlgo, input: number[]): Recording {
  const a = [...input];
  const ops: Op[] = [];
  let comparisons = 0;
  let writes = 0;

  const compare = (i: number, j: number) => {
    comparisons++;
    ops.push({ t: "compare", i, j });
  };
  const swap = (i: number, j: number) => {
    writes += 2;
    [a[i], a[j]] = [a[j], a[i]];
    ops.push({ t: "swap", i, j });
  };
  const overwrite = (i: number, value: number) => {
    writes++;
    a[i] = value;
    ops.push({ t: "overwrite", i, value });
  };
  const sorted = (i: number) => ops.push({ t: "sorted", i });
  const pivot = (i: number) => ops.push({ t: "pivot", i });
  const unpivot = () => ops.push({ t: "unpivot" });

  const n = a.length;

  switch (algo) {
    case "bubble-sort": {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          compare(j, j + 1);
          if (a[j] > a[j + 1]) swap(j, j + 1);
        }
        sorted(n - 1 - i);
      }
      sorted(0);
      break;
    }
    case "selection-sort": {
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        for (let j = i + 1; j < n; j++) {
          compare(min, j);
          if (a[j] < a[min]) min = j;
        }
        if (min !== i) swap(i, min);
        sorted(i);
      }
      sorted(n - 1);
      break;
    }
    case "insertion-sort": {
      sorted(0);
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        while (j >= 0) {
          compare(j, j + 1);
          if (a[j] > key) {
            overwrite(j + 1, a[j]);
            j--;
          } else break;
        }
        overwrite(j + 1, key);
        // Everything up to i is now in order among itself.
        sorted(i);
      }
      break;
    }
    case "merge-sort": {
      const mergeSort = (lo: number, hi: number) => {
        if (hi - lo <= 1) return;
        const mid = (lo + hi) >> 1;
        mergeSort(lo, mid);
        mergeSort(mid, hi);
        // Merge the two sorted halves using a value buffer, writing results
        // back into place so later merges see sorted data.
        const buf = a.slice(lo, hi);
        let i = 0;
        let j = mid - lo;
        let k = lo;
        const leftEnd = mid - lo;
        const rightEnd = hi - lo;
        while (i < leftEnd && j < rightEnd) {
          compare(lo + i, lo + j);
          if (buf[i] <= buf[j]) overwrite(k++, buf[i++]);
          else overwrite(k++, buf[j++]);
        }
        while (i < leftEnd) overwrite(k++, buf[i++]);
        while (j < rightEnd) overwrite(k++, buf[j++]);
      };
      mergeSort(0, n);
      for (let i = 0; i < n; i++) sorted(i);
      break;
    }
    case "quick-sort": {
      const partition = (lo: number, hi: number) => {
        const pivotVal = a[hi];
        pivot(hi);
        let i = lo;
        for (let j = lo; j < hi; j++) {
          compare(j, hi);
          if (a[j] < pivotVal) {
            if (i !== j) swap(i, j);
            i++;
          }
        }
        if (i !== hi) swap(i, hi);
        unpivot();
        return i;
      };
      const qs = (lo: number, hi: number) => {
        if (lo > hi) return;
        if (lo === hi) {
          sorted(lo);
          return;
        }
        const p = partition(lo, hi);
        sorted(p);
        qs(lo, p - 1);
        qs(p + 1, hi);
      };
      qs(0, n - 1);
      break;
    }
    case "heap-sort": {
      const siftDown = (start: number, size: number) => {
        let i = start;
        for (;;) {
          const l = 2 * i + 1;
          const r = 2 * i + 2;
          let largest = i;
          if (l < size) {
            compare(l, largest);
            if (a[l] > a[largest]) largest = l;
          }
          if (r < size) {
            compare(r, largest);
            if (a[r] > a[largest]) largest = r;
          }
          if (largest === i) break;
          swap(i, largest);
          i = largest;
        }
      };
      for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n);
      for (let end = n - 1; end > 0; end--) {
        swap(0, end);
        sorted(end);
        siftDown(0, end);
      }
      sorted(0);
      break;
    }
  }

  return { ops, comparisons, writes };
}

/* Plain-English commentary for the step currently being shown. */
function narrate(op: Op | undefined, view: number[]): string {
  if (!op) return "Ready. Press play to watch it sort.";
  switch (op.t) {
    case "compare":
      return `Comparing ${view[op.i]} and ${view[op.j]}…`;
    case "swap":
      return `${view[op.i]} and ${view[op.j]} are out of order — swap them.`;
    case "overwrite":
      return `Placing ${op.value} into position.`;
    case "pivot":
      return `Pivot chosen: ${view[op.i]}. Everything smaller goes left.`;
    case "unpivot":
      return "Pivot settled into its final spot.";
    case "sorted":
      return `${view[op.i]} is locked in its final place.`;
  }
}

const SIZES = [14, 24, 36] as const;
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [420, 260, 150, 80, 32] as const;

/** Tiny deterministic PRNG (mulberry32). A given seed always yields the same
 *  sequence, so the server and client render identical bars on first paint —
 *  no hydration mismatch. We only reshuffle (with a fresh seed) after mount. */
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

/** A stable seed derived from the algorithm name, so each sort opens on its
 *  own arrangement while staying identical between server and client. */
function algoSeed(algo: string): number {
  let h = 2166136261;
  for (let i = 0; i < algo.length; i++) {
    h ^= algo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

function randomArray(size: number, seed: number): number[] {
  // Distinct heights from 8..100 so bars read clearly.
  const arr: number[] = [];
  for (let i = 0; i < size; i++) {
    arr.push(8 + Math.round((92 * (i + 1)) / size));
  }
  // Seeded Fisher–Yates shuffle.
  const rng = makeRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function SortVisualizer({
  algo,
  accent,
  complexity,
  lessonData,
}: {
  algo: SortAlgo;
  accent: string;
  /** e.g. "O(n²) time · O(1) space" — shown as a chip. */
  complexity?: string;
  /** The exact numbers from the lesson's code sample, if any — lets the learner
   *  watch the sort run on the same data they see in the editor. */
  lessonData?: number[];
}) {
  const hasLessonData = Array.isArray(lessonData) && lessonData.length >= 2;
  // Default to the lesson's own numbers when we have them, so the animation
  // matches the code on the page; the learner can switch to random for variety.
  const [useCode, setUseCode] = useState<boolean>(hasLessonData);
  const [size, setSize] = useState<number>(24);
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  // A stable per-algorithm starting seed so the server and client render the
  // exact same bars (no hydration mismatch) and each sort opens on its own
  // arrangement. "Shuffle" bumps this for a fresh, deterministic reshuffle.
  const [seed, setSeed] = useState<number>(() => algoSeed(algo));

  // The starting numbers: the lesson's exact array in "from code" mode,
  // otherwise a seeded random arrangement (regenerated on size/shuffle).
  const initial = useMemo(
    () => (useCode && hasLessonData ? [...(lessonData as number[])] : randomArray(size, seed)),
    [useCode, hasLessonData, lessonData, size, seed],
  );

  // Record the whole run up front so playback is smooth and scrubbable.
  const recording = useMemo(() => record(algo, initial), [algo, initial]);

  // Playback state — deliberately minimal. `step` is the single source of
  // truth (how many ops have played); everything visible is *derived* from it
  // by replaying the ops. Keeping the reducer pure (no setState-in-setState)
  // makes it correct under React StrictMode's double-invoked updaters.
  const [step, setStep] = useState(0); // ops applied so far
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = recording.ops.length;
  const done = step >= total;

  // Derive the full picture at the current step by replaying ops 0..step. This
  // is pure and cheap (a few hundred ops), and makes stepping/scrubbing exact.
  const frame = useMemo(() => {
    const view = [...initial];
    const sorted = new Set<number>();
    let pivot: number | null = null;
    let compare: readonly [number, number] | null = null;
    let swapping: readonly [number, number] | null = null;
    let comparisons = 0;
    let writes = 0;
    for (let k = 0; k < step; k++) {
      const op = recording.ops[k];
      compare = null; // transient highlights reflect only the latest op
      swapping = null;
      switch (op.t) {
        case "compare":
          compare = [op.i, op.j];
          comparisons++;
          break;
        case "swap":
          [view[op.i], view[op.j]] = [view[op.j], view[op.i]];
          swapping = [op.i, op.j];
          writes += 2;
          break;
        case "overwrite":
          view[op.i] = op.value;
          swapping = [op.i, op.i];
          writes++;
          break;
        case "pivot":
          pivot = op.i;
          break;
        case "unpivot":
          pivot = null;
          break;
        case "sorted":
          sorted.add(op.i);
          break;
      }
    }
    return { view, sorted, pivot, compare, swapping, comparisons, writes };
  }, [initial, recording, step]);

  const { view, sorted: sortedSet, pivot: pivotIdx, compare, swapping } = frame;

  // "Actively animating" = the user pressed play AND there's more to show. We
  // derive this instead of flipping `playing` off at the end, so no effect ever
  // calls setState synchronously (which cascades renders / trips lint).
  const running = playing && !done;

  // Reset to the unsorted start. Called from the handlers that change the run
  // (shuffle / size), never from an effect.
  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

  // Autoplay loop: advance one op per tick while running. setStep is a pure
  // functional update, and it runs in a timer callback (not the effect body),
  // so it's safe under StrictMode's double invocation.
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

  // Live elapsed timer while running. setState here is inside the interval
  // callback (allowed), not the effect body. When the run ends, `running` goes
  // false, the interval is cleared, and elapsed keeps its last value.
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
      // Restart from the top.
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

  const shuffle = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const changeSize = (n: number) => {
    reset();
    setSize(n);
  };

  const toggleSource = (next: boolean) => {
    reset();
    setUseCode(next);
  };

  const shown = { c: frame.comparisons, w: frame.writes };

  // Scale bar heights to the data's own max, so the lesson's small numbers
  // (e.g. [5,2,9,1,5,6]) fill the chart just as the random 8..100 set does.
  const maxVal = Math.max(...initial, 1);
  const currentOp = step > 0 ? recording.ops[step - 1] : undefined;
  const caption = narrate(currentOp, view);

  const barState = (idx: number): "sorted" | "pivot" | "swap" | "compare" | "idle" => {
    if (sortedSet.has(idx)) return "sorted";
    if (pivotIdx === idx) return "pivot";
    if (swapping && (swapping[0] === idx || swapping[1] === idx)) return "swap";
    if (compare && (compare[0] === idx || compare[1] === idx)) return "compare";
    return "idle";
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header: what you're watching + complexity */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it sort</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          {ALGO_LABEL[algo]}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The bars */}
      <div
        className="mt-4 flex h-52 items-end justify-center gap-[3px] overflow-hidden rounded-xl bg-paper px-3 pt-3 sm:h-64"
        role="img"
        aria-label={`${ALGO_LABEL[algo]} visualization with ${size} bars, ${
          done ? "sorted" : `${step} of ${total} steps`
        }`}
      >
        {view.map((v, idx) => {
          const st = barState(idx);
          const bg =
            st === "sorted"
              ? "var(--color-output)"
              : st === "pivot"
                ? "var(--color-primary)"
                : st === "swap"
                  ? "var(--color-here)"
                  : st === "compare"
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--accent) 26%, white)";
          return (
            <div
              key={idx}
              className="dp-bar min-w-[3px] flex-1 rounded-t-[3px]"
              style={{
                height: `${(v / maxVal) * 100}%`,
                background: bg,
                transform: st === "compare" || st === "swap" ? "scaleY(1.02)" : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Running commentary */}
      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {caption}
      </p>

      {/* Live stats — the "how much work did it do" readout */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Comparisons" value={shown.c} />
        <Stat label="Writes" value={shown.w} />
        <Stat label="Step" value={`${step}/${total}`} />
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
          onClick={shuffle}
          disabled={useCode}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          ⤨ Shuffle
        </button>

        {/* Data source: the lesson's own numbers vs a random set. */}
        {hasLessonData && (
          <div
            className="ml-auto inline-flex overflow-hidden rounded-pill border border-line text-xs font-semibold"
            role="group"
            aria-label="Data source"
          >
            <button
              type="button"
              onClick={() => toggleSource(true)}
              aria-pressed={useCode}
              className="px-3 py-2 transition-colors"
              style={
                useCode
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--color-muted)" }
              }
            >
              From code
            </button>
            <button
              type="button"
              onClick={() => toggleSource(false)}
              aria-pressed={!useCode}
              className="px-3 py-2 transition-colors"
              style={
                !useCode
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--color-muted)" }
              }
            >
              Random
            </button>
          </div>
        )}

        <label
          className={`flex items-center gap-2 text-xs font-semibold text-muted ${hasLessonData ? "" : "ml-auto"}`}
        >
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

        <label className="flex items-center gap-2 text-xs font-semibold text-muted">
          Size
          <select
            value={size}
            onChange={(e) => changeSize(Number(e.target.value))}
            disabled={useCode}
            className="rounded-lg border border-line bg-card px-2 py-1 text-ink disabled:opacity-40"
            aria-label="Number of bars"
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Comparing" />
        <LegendDot color="var(--color-here)" label="Swapping" />
        {(algo === "quick-sort") && <LegendDot color="var(--color-primary)" label="Pivot" />}
        <LegendDot color="var(--color-output)" label="Sorted" />
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
