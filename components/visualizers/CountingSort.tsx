"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   CountingSort — a "watch it tally" animated explainer for counting sort.

   Counting sort never compares two items. It works in two visible phases:
   1) TALLY — sweep the input once, bumping a bucket (a count) for each value.
   2) REBUILD — walk the buckets from smallest value to largest and write each
      value out as many times as it was counted, filling the sorted output.

   Same engine as SortVisualizer: the whole run is recorded up front as a list
   of ops, then replayed purely from a single `step` counter, so playback is
   deterministic, scrubbable and correct under React StrictMode. No setState in
   any effect body; motion is disabled globally under prefers-reduced-motion.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "tally"; i: number; value: number } // count input[i] into its bucket
  | { t: "scan"; value: number } // move the read head to bucket `value`
  | { t: "emit"; value: number; outIdx: number } // write value into output
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

const N = 12;
const MAX_VALUE = 9; // small range k — the whole point of counting sort

function buildInput(seed: number): number[] {
  const rng = makeRng(seed);
  const arr: number[] = [];
  for (let i = 0; i < N; i++) arr.push(Math.floor(rng() * (MAX_VALUE + 1)));
  return arr;
}

function record(input: number[]): { ops: Op[]; max: number } {
  const ops: Op[] = [];
  const max = input.reduce((m, v) => Math.max(m, v), 0);
  const counts = new Array<number>(max + 1).fill(0);

  // Phase 1 — tally each value into its bucket.
  for (let i = 0; i < input.length; i++) {
    counts[input[i]]++;
    ops.push({ t: "tally", i, value: input[i] });
  }

  // Phase 2 — read buckets in order, writing each value counts[value] times.
  let outIdx = 0;
  for (let value = 0; value <= max; value++) {
    ops.push({ t: "scan", value });
    for (let c = 0; c < counts[value]; c++) {
      ops.push({ t: "emit", value, outIdx });
      outIdx++;
    }
  }
  ops.push({ t: "done" });
  return { ops, max };
}

const SPEEDS = [640, 400, 250, 140, 70] as const;

export function CountingSort({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("counting-sort"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const input = useMemo(() => buildInput(seed), [seed]);
  const { ops, max } = useMemo(() => record(input), [input]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const counts = new Array<number>(max + 1).fill(0);
    const output = new Array<number | null>(input.length).fill(null);
    let activeInput: number | null = null;
    let activeBucket: number | null = null;
    let activeOut: number | null = null;
    let tallied = 0;
    let placed = 0;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      activeInput = null;
      activeBucket = null;
      activeOut = null;
      switch (op.t) {
        case "tally":
          counts[op.value]++;
          activeInput = op.i;
          activeBucket = op.value;
          tallied++;
          break;
        case "scan":
          activeBucket = op.value;
          break;
        case "emit":
          output[op.outIdx] = op.value;
          activeBucket = op.value;
          activeOut = op.outIdx;
          placed++;
          break;
        case "done":
          break;
      }
    }
    return { counts, output, activeInput, activeBucket, activeOut, tallied, placed };
  }, [input.length, ops, step, max]);

  const { counts, output, activeInput, activeBucket, activeOut, tallied, placed } =
    frame;

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
  const phase: "idle" | "tally" | "build" | "done" = !currentOp
    ? "idle"
    : currentOp.t === "tally"
      ? "tally"
      : currentOp.t === "done"
        ? "done"
        : "build";

  const caption = (() => {
    if (!currentOp) return "Two phases: tally values into bins, then read the bins in order. No comparisons.";
    switch (currentOp.t) {
      case "tally":
        return `Input ${currentOp.value} → bump bin ${currentOp.value}. Just counting, never comparing.`;
      case "scan":
        return counts[currentOp.value] === 0
          ? `Bin ${currentOp.value} is empty — skip it.`
          : `Reading bin ${currentOp.value}: it holds ${counts[currentOp.value]} item(s).`;
      case "emit":
        return `Write ${currentOp.value} into the output. That value was counted ${counts[currentOp.value]} time(s).`;
      case "done":
        return "Every bin read in order — the output is fully sorted.";
    }
  })();

  const maxCount = counts.reduce((m, c) => Math.max(m, c), 1);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it count</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Counting sort
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Counting sort of ${input.length} values with range 0 to ${max}; ${
          done ? "sorted" : `step ${step} of ${total}, ${phase} phase`
        }`}
      >
        {/* Input row */}
        <div className="dp-eyebrow mb-1.5 text-[10px] text-muted">Input</div>
        <div className="flex flex-wrap justify-center gap-[3px] sm:gap-1.5">
          {input.map((v, idx) => {
            const isActive = activeInput === idx;
            const counted = phase !== "idle" && idx < tallied;
            const bg = isActive
              ? "var(--accent)"
              : counted
                ? "color-mix(in srgb, var(--color-muted) 14%, white)"
                : "color-mix(in srgb, var(--accent) 20%, white)";
            return (
              <div
                key={idx}
                className="dp-bar flex h-8 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold sm:w-8"
                style={{
                  background: bg,
                  color: isActive ? "white" : "var(--color-ink)",
                  opacity: counted && !isActive ? 0.5 : 1,
                  transform: isActive ? "translateY(-2px)" : undefined,
                }}
              >
                {v}
              </div>
            );
          })}
        </div>

        {/* Bins / counts */}
        <div className="dp-eyebrow mb-1.5 mt-4 text-[10px] text-muted">
          Bins (count of each value)
        </div>
        <div className="flex items-end justify-center gap-[3px] sm:gap-1.5">
          {counts.map((c, value) => {
            const isActive = activeBucket === value;
            return (
              <div key={value} className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex h-16 w-full items-end justify-center">
                  <div
                    className="dp-bar flex w-full items-start justify-center rounded-t-md pt-0.5 font-mono text-[11px] font-bold sm:text-xs"
                    style={{
                      height: `${Math.max(18, (c / maxCount) * 100)}%`,
                      background: isActive
                        ? "var(--color-primary)"
                        : c === 0
                          ? "color-mix(in srgb, var(--color-muted) 12%, white)"
                          : "color-mix(in srgb, var(--accent) 30%, white)",
                      color: isActive ? "white" : "var(--color-ink)",
                    }}
                  >
                    {c}
                  </div>
                </div>
                <div
                  className="mt-1 font-mono text-[10px] font-semibold"
                  style={{ color: isActive ? "var(--color-primary)" : "var(--color-muted)" }}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Output row */}
        <div className="dp-eyebrow mb-1.5 mt-4 text-[10px] text-muted">Sorted output</div>
        <div className="flex flex-wrap justify-center gap-[3px] sm:gap-1.5">
          {output.map((v, idx) => {
            const isActive = activeOut === idx;
            const filled = v !== null;
            return (
              <div
                key={idx}
                className="dp-bar flex h-8 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold sm:w-8"
                style={{
                  background: isActive
                    ? "var(--accent)"
                    : filled
                      ? "var(--color-output)"
                      : "color-mix(in srgb, var(--color-muted) 10%, white)",
                  color: filled || isActive ? "white" : "var(--color-muted)",
                  transform: isActive ? "translateY(-2px)" : undefined,
                }}
              >
                {filled ? v : "·"}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Comparisons" value={0} />
        <Stat label="Tallied" value={`${tallied}/${input.length}`} />
        <Stat label="Placed" value={`${placed}/${input.length}`} />
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
        <LegendDot color="var(--accent)" label="Reading now" />
        <LegendDot color="var(--color-primary)" label="Active bin" />
        <LegendDot color="var(--color-output)" label="Placed (sorted)" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 14%, white)" label="Done / empty" />
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
