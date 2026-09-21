"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SlidingWindow — "watch it slide" animated explainer for the fixed-size
   sliding-window technique.

   A window of k consecutive cells slides across the row. We sum the first
   window once, then each slide just drops the cell that left and adds the
   cell that entered — never recomputing from scratch. The best window sum
   seen so far is remembered and highlighted. Every slide is recorded as a
   self-describing op up front and replayed purely from a single `step`.
   ──────────────────────────────────────────────────────────────────────── */

type Op = {
  start: number;
  end: number;
  sum: number;
  best: number;
  bestStart: number;
  /** value entering the window on this slide (undefined for the first window). */
  added?: number;
  /** value leaving the window on this slide. */
  dropped?: number;
  isBest: boolean;
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

function lessonSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

const K = 3;

function buildInput(seed: number): number[] {
  const rng = makeRng(seed);
  const arr: number[] = [];
  for (let i = 0; i < 8; i++) arr.push(1 + Math.floor(rng() * 9));
  return arr;
}

function record(arr: number[], k: number): Op[] {
  const ops: Op[] = [];
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let best = sum;
  let bestStart = 0;
  ops.push({ start: 0, end: k - 1, sum, best, bestStart, isBest: true });
  for (let end = k; end < arr.length; end++) {
    sum += arr[end] - arr[end - k];
    const start = end - k + 1;
    const isBest = sum > best;
    if (isBest) {
      best = sum;
      bestStart = start;
    }
    ops.push({
      start,
      end,
      sum,
      best,
      bestStart,
      added: arr[end],
      dropped: arr[end - k],
      isBest,
    });
  }
  return ops;
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function SlidingWindow({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("sliding-window"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const arr = useMemo(() => buildInput(seed), [seed]);
  const ops = useMemo(() => record(arr, K), [arr]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const current = step > 0 ? ops[step - 1] : ops[0];
  const shownStart = step > 0 ? current.start : ops[0].start;
  const shownEnd = step > 0 ? current.end : ops[0].end;
  const windowSum = step > 0 ? current.sum : ops[0].sum;
  const best = step > 0 ? current.best : ops[0].best;
  const bestStart = step > 0 ? current.bestStart : ops[0].bestStart;

  useEffect(() => {
    if (!running) return;
    timerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, total));
    }, SPEEDS[speedIdx]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, step, speedIdx, total]);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
  };

  const togglePlay = () => {
    if (done) {
      setStep(0);
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

  const inWindow = (idx: number) => idx >= shownStart && idx <= shownEnd;
  const inBest = (idx: number) => idx >= bestStart && idx <= bestStart + K - 1;

  const caption = !step
    ? `First window covers the first ${K} cells — add them up to start: ${windowSum}.`
    : current.added === undefined
      ? `Window sum ${windowSum}, best so far ${best}.`
      : `Slide right: drop ${current.dropped}, add ${current.added}. Window sum ${windowSum}.${
          current.isBest ? " New best!" : ""
        }`;

  const maxVal = Math.max(...arr, 1);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it slide</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Sliding window (k={K})
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Fixed window of size ${K} sliding across ${arr.length} numbers; ${
          done ? `best window sum ${best}` : `step ${step} of ${total}`
        }`}
      >
        <div className="flex items-end justify-center gap-[3px] sm:gap-1.5">
          {arr.map((v, idx) => {
            const active = inWindow(idx);
            const winnerCell = done && inBest(idx);
            const bg = winnerCell
              ? "var(--color-output)"
              : active
                ? "var(--accent)"
                : inBest(idx)
                  ? "color-mix(in srgb, var(--color-primary) 22%, white)"
                  : "color-mix(in srgb, var(--color-muted) 14%, white)";
            const barH = 28 + Math.round((v / maxVal) * 60);
            return (
              <div key={idx} className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className="dp-bar flex w-full items-end justify-center rounded-lg pb-1 font-mono text-xs font-bold sm:text-sm"
                  style={{
                    height: `${barH}px`,
                    background: bg,
                    color: active || winnerCell ? "white" : "var(--color-ink)",
                    transform: active ? "translateY(-2px)" : undefined,
                    outline:
                      inBest(idx) && !active
                        ? "2px solid var(--color-primary)"
                        : undefined,
                    outlineOffset: "-2px",
                  }}
                >
                  {v}
                </div>
                <div className="mt-1 h-3 text-[10px] font-bold leading-none">
                  {idx === shownStart && (
                    <span style={{ color: "var(--accent)" }}>▲</span>
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
        <Stat label="Window sum" value={windowSum} />
        <Stat label="Best sum" value={best} />
        <Stat label="Window" value={`[${shownStart}, ${shownEnd}]`} />
        <Stat label="Step" value={`${step}/${total}`} />
      </div>

      <Controls
        running={running}
        done={done}
        speedIdx={speedIdx}
        onToggle={togglePlay}
        onStep={stepForward}
        onNew={newNumbers}
        onSpeed={setSpeedIdx}
      />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Current window" />
        <LegendDot color="var(--color-primary)" label="Best window" />
        <LegendDot color="var(--color-output)" label="Answer" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 14%, white)" label="Outside window" />
      </div>
    </div>
  );
}

function Controls({
  running,
  done,
  speedIdx,
  onToggle,
  onStep,
  onNew,
  onSpeed,
}: {
  running: boolean;
  done: boolean;
  speedIdx: number;
  onToggle: () => void;
  onStep: () => void;
  onNew: () => void;
  onSpeed: (n: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="dp-lift inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        {running ? "⏸ Pause" : done ? "↻ Replay" : "▶ Play"}
      </button>
      <button
        type="button"
        onClick={onStep}
        disabled={done}
        className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
      >
        Step ›
      </button>
      <button
        type="button"
        onClick={onNew}
        className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
      >
        ⤨ New numbers
      </button>
      <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted">
        Speed
        <input
          type="range"
          min={0}
          max={SPEEDS.length - 1}
          value={speedIdx}
          onChange={(e) => onSpeed(Number(e.target.value))}
          className="w-24 accent-[color:var(--accent)]"
          aria-label="Playback speed"
        />
      </label>
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
