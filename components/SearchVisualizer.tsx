"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SearchVisualizer — a "watch it search" animated explainer.

   Give it a bag of numbers and a target, and it hunts for the target the way
   the algorithm would: linear sweeps left to right; binary halves the range
   each step; jump leaps in √n blocks then scans one. A dashed line marks the
   target height, the live search window stays lit while ruled-out bars fade,
   and the match lands in green — with a running commentary and a comparison
   count so you feel why binary beats linear.

   Same engine as SortVisualizer: each run is recorded up front as a list of
   ops, then replayed purely from a single `step` counter. That keeps playback
   deterministic, scrubbable, and correct under React StrictMode. All motion is
   disabled under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

export type SearchAlgo = "linear-search" | "binary-search" | "jump-search";

/** A single recorded step of a search run. */
type Op =
  | { t: "window"; lo: number; hi: number } // active search range narrows
  | { t: "check"; i: number } // comparing element i to the target
  | { t: "found"; i: number }
  | { t: "miss" };

type Recording = { ops: Op[]; comparisons: number };

const ALGO_LABEL: Record<SearchAlgo, string> = {
  "linear-search": "Linear search",
  "binary-search": "Binary search",
  "jump-search": "Jump search",
};

/** Binary and jump search require sorted input — showing that precondition is
 *  part of the lesson. Linear search runs on the unsorted bag. */
const NEEDS_SORTED: Record<SearchAlgo, boolean> = {
  "linear-search": false,
  "binary-search": true,
  "jump-search": true,
};

/* ───────────────────────────── Recorder ───────────────────────────── */

function recordSearch(algo: SearchAlgo, arr: number[], target: number): Recording {
  const ops: Op[] = [];
  let comparisons = 0;
  const n = arr.length;

  const check = (i: number) => {
    comparisons++;
    ops.push({ t: "check", i });
  };
  const windowTo = (lo: number, hi: number) => ops.push({ t: "window", lo, hi });
  const found = (i: number) => ops.push({ t: "found", i });
  const miss = () => ops.push({ t: "miss" });

  switch (algo) {
    case "linear-search": {
      windowTo(0, n - 1);
      for (let i = 0; i < n; i++) {
        check(i);
        if (arr[i] === target) {
          found(i);
          return { ops, comparisons };
        }
      }
      miss();
      break;
    }
    case "binary-search": {
      let lo = 0;
      let hi = n - 1;
      windowTo(lo, hi);
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        check(mid);
        if (arr[mid] === target) {
          found(mid);
          return { ops, comparisons };
        }
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
        windowTo(lo, hi);
      }
      miss();
      break;
    }
    case "jump-search": {
      const step = Math.max(1, Math.floor(Math.sqrt(n)));
      let block = 0;
      windowTo(0, n - 1);
      // Jump ahead a block at a time until the block boundary reaches/passes
      // the target.
      while (block + step <= n) {
        const b = block + step - 1;
        check(b);
        if (arr[b] < target) block += step;
        else break;
      }
      const end = Math.min(block + step, n) - 1;
      windowTo(block, end);
      for (let i = block; i <= end; i++) {
        check(i);
        if (arr[i] === target) {
          found(i);
          return { ops, comparisons };
        }
      }
      miss();
      break;
    }
  }

  return { ops, comparisons };
}

/* Plain-English commentary for the step currently being shown. */
function narrate(
  op: Op | undefined,
  data: number[],
  target: number,
  algo: SearchAlgo,
): string {
  if (!op) return "Ready. Press play to hunt for the target.";
  switch (op.t) {
    case "window":
      if (op.lo > op.hi) return "Nothing left to search.";
      return `Now searching indices ${op.lo}–${op.hi}.`;
    case "check": {
      const v = data[op.i];
      if (v === target) return `${v} at index ${op.i} matches the target!`;
      if (algo === "linear-search")
        return `Index ${op.i} is ${v}, not ${target} — keep going.`;
      // Sorted searches use the comparison to pick a direction.
      return v < target
        ? `${v} is below ${target} — look further right.`
        : `${v} is above ${target} — look further left.`;
    }
    case "found":
      return `Found ${target} at index ${op.i} — done.`;
    case "miss":
      return `${target} is not in the list.`;
  }
}

const SIZES = [15, 24, 36] as const;
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [560, 360, 220, 120, 50] as const;

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

/** A stable seed derived from the algorithm name, so each search opens on its
 *  own arrangement while staying identical between server and client. */
function algoSeed(algo: string): number {
  let h = 2166136261;
  for (let i = 0; i < algo.length; i++) {
    h ^= algo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

function buildData(algo: SearchAlgo, size: number, seed: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < size; i++) arr.push(8 + Math.round((92 * (i + 1)) / size));
  const rng = makeRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Binary / jump only work on sorted input — show that.
  if (NEEDS_SORTED[algo]) arr.sort((x, y) => x - y);
  return arr;
}

export function SearchVisualizer({
  algo,
  accent,
  complexity,
  lessonData,
}: {
  algo: SearchAlgo;
  accent: string;
  /** e.g. "O(log n) time · O(1) space" — shown as a chip. */
  complexity?: string;
  /** The exact numbers from the lesson's code sample, if any — lets the learner
   *  watch the search run on the same data they see in the editor. */
  lessonData?: number[];
}) {
  const hasLessonData = Array.isArray(lessonData) && lessonData.length >= 2;
  const [useCode, setUseCode] = useState<boolean>(hasLessonData);
  const [size, setSize] = useState<number>(24);
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  // Stable per-algorithm seed: identical bars on server + client (no hydration
  // mismatch); "Shuffle" bumps it for a fresh, deterministic layout + target.
  const [seed, setSeed] = useState<number>(() => algoSeed(algo));

  const data = useMemo(() => {
    if (useCode && hasLessonData) {
      const arr = [...(lessonData as number[])];
      // Binary/jump require sorted input, just like the random path.
      if (NEEDS_SORTED[algo]) arr.sort((x, y) => x - y);
      return arr;
    }
    return buildData(algo, size, seed);
  }, [useCode, hasLessonData, lessonData, algo, size, seed]);

  // Pick a target that actually exists, so the search resolves in a satisfying
  // hit. A separate seed stream keeps it independent of the shuffle.
  const target = useMemo(() => {
    const idx = Math.floor(makeRng(seed + 777)() * data.length);
    return data[idx];
  }, [data, seed]);

  const recording = useMemo(
    () => recordSearch(algo, data, target),
    [algo, data, target],
  );

  const [step, setStep] = useState(0); // ops applied so far
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = recording.ops.length;
  const done = step >= total;

  // Derive the full picture at the current step by replaying ops 0..step.
  const frame = useMemo(() => {
    let lo = 0;
    let hi = data.length - 1;
    let comparisons = 0;
    let current: number | null = null;
    let found: number | null = null;
    let missed = false;
    const visited = new Set<number>();
    for (let k = 0; k < step; k++) {
      const op = recording.ops[k];
      switch (op.t) {
        case "window":
          lo = op.lo;
          hi = op.hi;
          break;
        case "check":
          if (current != null) visited.add(current); // leave a trail
          current = op.i;
          comparisons++;
          break;
        case "found":
          found = op.i;
          break;
        case "miss":
          missed = true;
          break;
      }
    }
    return { lo, hi, comparisons, current, found, missed, visited };
  }, [data.length, recording, step]);

  const running = playing && !done;

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

  // Autoplay loop — pure functional setStep in a timer callback.
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

  // Live elapsed timer — setState only inside the interval callback.
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

  // Scale to the data's own max so the lesson's numbers (e.g. [4,8,15,16,23,42])
  // and the target line fill the chart like the random 8..100 set does.
  const maxVal = Math.max(...data, 1);
  const currentOp = step > 0 ? recording.ops[step - 1] : undefined;
  const caption = narrate(currentOp, data, target, algo);
  const { lo, hi, current, found, missed, visited } = frame;

  const result =
    found != null ? `Found @ ${found}` : missed ? "Not found" : "—";

  const barState = (
    idx: number,
  ): "found" | "current" | "out" | "active" => {
    if (found === idx) return "found";
    if (current === idx && found == null) return "current";
    if (visited.has(idx) || idx < lo || idx > hi) return "out";
    return "active";
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header: what you're watching + the target + complexity */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it search</span>
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
          Target&nbsp;{target}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {NEEDS_SORTED[algo] && (
        <p className="mt-2 text-xs text-muted">
          Sorted first — {ALGO_LABEL[algo].toLowerCase()} only works on ordered data.
        </p>
      )}

      {/* The bars + target line */}
      <div className="mt-3 h-52 rounded-xl bg-paper px-3 py-3 sm:h-64">
        <div
          className="relative flex h-full items-end justify-center gap-[3px]"
          role="img"
          aria-label={`${ALGO_LABEL[algo]} for target ${target}, ${
            found != null
              ? `found at index ${found}`
              : missed
                ? "not found"
                : `${step} of ${total} steps`
          }`}
        >
          {data.map((v, idx) => {
            const st = barState(idx);
            const bg =
              st === "found"
                ? "var(--color-output)"
                : st === "current"
                  ? "var(--accent)"
                  : st === "out"
                    ? "color-mix(in srgb, var(--color-muted) 16%, white)"
                    : "color-mix(in srgb, var(--accent) 32%, white)";
            return (
              <div
                key={idx}
                className="dp-bar min-w-[3px] flex-1 rounded-t-[3px]"
                style={{
                  height: `${(v / maxVal) * 100}%`,
                  background: bg,
                  transform: st === "current" ? "scaleY(1.03)" : undefined,
                }}
              />
            );
          })}

          {/* Dashed line at the target's height — what we're hunting for. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 flex items-center"
            style={{ bottom: `${(target / maxVal) * 100}%` }}
          >
            <div
              className="h-0 w-full border-t border-dashed"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 70%, white)" }}
            />
          </div>
        </div>
      </div>

      {/* Running commentary */}
      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {caption}
      </p>

      {/* Live stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Comparisons" value={frame.comparisons} />
        <Stat label="Result" value={result} />
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
          ⤨ New target
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
              style={useCode ? { background: "var(--accent)", color: "#fff" } : { color: "var(--color-muted)" }}
            >
              From code
            </button>
            <button
              type="button"
              onClick={() => toggleSource(false)}
              aria-pressed={!useCode}
              className="px-3 py-2 transition-colors"
              style={!useCode ? { background: "var(--accent)", color: "#fff" } : { color: "var(--color-muted)" }}
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
            aria-label="Number of items"
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
        <LegendDot color="var(--accent)" label="Checking" />
        <LegendDot color="color-mix(in srgb, var(--accent) 32%, white)" label="In range" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 16%, white)" label="Ruled out" />
        <LegendDot color="var(--color-output)" label="Found" />
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
