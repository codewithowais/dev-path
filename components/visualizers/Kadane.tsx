"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Kadane — "watch the best streak" animated explainer for Kadane's algorithm
   (maximum subarray sum).

   We walk the row once. At each cell we decide: extend the current streak
   (currentSum + value) or start fresh here (value alone) — whichever is
   larger. The current streak sum is our live accumulator; the best sum ever
   seen is remembered along with its start/end, and that best subarray is
   highlighted. Every decision is recorded as a self-describing op and
   replayed purely from a single `step`.
   ──────────────────────────────────────────────────────────────────────── */

type Op = {
  i: number;
  cur: number;
  best: number;
  curStart: number;
  bestStart: number;
  bestEnd: number;
  /** did the current streak restart at this cell? */
  reset: boolean;
  /** did we set a new best on this cell? */
  newBest: boolean;
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

/** Mixed positives/negatives, at least one positive so a nonzero streak exists. */
function buildInput(seed: number): number[] {
  const rng = makeRng(seed);
  const arr: number[] = [];
  for (let i = 0; i < 9; i++) arr.push(Math.floor(rng() * 13) - 5); // −5..7
  if (!arr.some((v) => v > 0)) arr[Math.floor(rng() * arr.length)] = 4;
  return arr;
}

function record(arr: number[]): Op[] {
  const ops: Op[] = [];
  let cur = arr[0];
  let best = arr[0];
  let curStart = 0;
  let bestStart = 0;
  let bestEnd = 0;
  ops.push({ i: 0, cur, best, curStart, bestStart, bestEnd, reset: false, newBest: true });
  for (let i = 1; i < arr.length; i++) {
    const extend = cur + arr[i];
    let reset = false;
    if (arr[i] > extend) {
      cur = arr[i];
      curStart = i;
      reset = true;
    } else {
      cur = extend;
    }
    let newBest = false;
    if (cur > best) {
      best = cur;
      bestStart = curStart;
      bestEnd = i;
      newBest = true;
    }
    ops.push({ i, cur, best, curStart, bestStart, bestEnd, reset, newBest });
  }
  return ops;
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function Kadane({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("kadanes-algorithm"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const arr = useMemo(() => buildInput(seed), [seed]);
  const ops = useMemo(() => record(arr), [arr]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const current = step > 0 ? ops[step - 1] : ops[0];
  const idx = step > 0 ? current.i : -1;

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

  const cur = step > 0 ? current.cur : 0;
  const best = step > 0 ? current.best : arr[0];
  const curStart = current.curStart;
  const bestStart = current.bestStart;
  const bestEnd = current.bestEnd;

  const caption = (() => {
    if (step === 0) return "Start the current and best streak at the first value. Press play.";
    if (current.i === 0) return `Seed both current and best streak at ${arr[0]}.`;
    const v = arr[current.i];
    const lead = current.reset
      ? `${v} alone (${v}) beats extending — restart the streak here.`
      : `Extend the streak: current sum becomes ${current.cur}.`;
    return current.newBest ? `${lead} New best: ${current.best}.` : lead;
  })();

  const inCurrent = (i: number) =>
    step > 0 && !done && i >= curStart && i <= idx;
  const inBest = (i: number) => step > 0 && i >= bestStart && i <= bestEnd;

  const maxAbs = Math.max(...arr.map((v) => Math.abs(v)), 1);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the best streak</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Kadane&apos;s algorithm
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
        aria-label={`Kadane's algorithm scanning ${arr.length} numbers for the maximum subarray sum; ${
          done ? `best sum ${best}` : `step ${step} of ${total}`
        }`}
      >
        <div className="flex items-center justify-center gap-[3px] sm:gap-1.5">
          {arr.map((v, i) => {
            const isCur = i === idx;
            const best_ = inBest(i);
            const cur_ = inCurrent(i);
            let bg = "color-mix(in srgb, var(--color-muted) 12%, white)";
            let color = "var(--color-ink)";
            if (best_ && done) {
              bg = "var(--color-output)";
              color = "white";
            } else if (isCur) {
              bg = "var(--accent)";
              color = "white";
            } else if (cur_) {
              bg = "color-mix(in srgb, var(--color-primary) 22%, white)";
            } else if (best_) {
              bg = "color-mix(in srgb, var(--color-output) 22%, white)";
            }
            const barH = 24 + Math.round((Math.abs(v) / maxAbs) * 52);
            return (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className="flex w-full items-end justify-center"
                  style={{ height: "84px" }}
                >
                  <div
                    className="dp-bar flex w-full items-center justify-center rounded-lg font-mono text-xs font-bold sm:text-sm"
                    style={{
                      height: `${barH}px`,
                      background: bg,
                      color,
                      outline:
                        best_ && !done ? "2px solid var(--color-output)" : undefined,
                      outlineOffset: "-2px",
                      transform: isCur ? "translateY(-2px)" : undefined,
                    }}
                  >
                    {v}
                  </div>
                </div>
                <div className="mt-1 h-3 text-[10px] font-bold leading-none">
                  {isCur && <span style={{ color: "var(--accent)" }}>▲</span>}
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
        <Stat label="Current sum" value={cur} />
        <Stat label="Best sum" value={best} />
        <Stat label="Best range" value={`[${bestStart}, ${bestEnd}]`} />
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
        <LegendDot color="var(--accent)" label="Current cell" />
        <LegendDot color="color-mix(in srgb, var(--color-primary) 22%, white)" label="Current streak" />
        <LegendDot color="var(--color-output)" label="Best subarray" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 12%, white)" label="Untouched" />
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
