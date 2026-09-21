"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   PrefixSums — "build once, answer instantly" animated explainer.

   Phase 1 builds the prefix array cell by cell: prefix[0] = 0, then each
   prefix[i+1] = prefix[i] + arr[i] (a running odometer of totals). Phase 2
   answers a range-sum query [left, right] with a single subtraction,
   prefix[right + 1] − prefix[left], lighting up exactly the two prefix cells
   it reads. The run is recorded as ops up front and replayed from `step`.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "seed" }
  | { t: "build"; i: number; running: number }
  | { t: "queryStart"; left: number; right: number }
  | { t: "pickHi"; index: number; value: number }
  | { t: "pickLo"; index: number; value: number }
  | { t: "answer"; value: number };

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

function buildInput(seed: number): { arr: number[]; left: number; right: number } {
  const rng = makeRng(seed);
  const arr: number[] = [];
  for (let i = 0; i < 6; i++) arr.push(1 + Math.floor(rng() * 9));
  const left = Math.floor(rng() * 3); // 0..2
  const right = left + 1 + Math.floor(rng() * (arr.length - 1 - left));
  return { arr, left, right: Math.min(right, arr.length - 1) };
}

function record(arr: number[], left: number, right: number): {
  ops: Op[];
  prefix: number[];
} {
  const prefix = [0];
  for (let i = 0; i < arr.length; i++) prefix.push(prefix[i] + arr[i]);

  const ops: Op[] = [{ t: "seed" }];
  for (let i = 0; i < arr.length; i++) {
    ops.push({ t: "build", i, running: prefix[i + 1] });
  }
  ops.push({ t: "queryStart", left, right });
  ops.push({ t: "pickHi", index: right + 1, value: prefix[right + 1] });
  ops.push({ t: "pickLo", index: left, value: prefix[left] });
  ops.push({ t: "answer", value: prefix[right + 1] - prefix[left] });
  return { ops, prefix };
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function PrefixSums({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("prefix-sums"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const { arr, left, right } = useMemo(() => buildInput(seed), [seed]);
  const { ops, prefix } = useMemo(
    () => record(arr, left, right),
    [arr, left, right],
  );

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

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

  // Derive the picture: how many prefix cells are built, which source cell is
  // active, and the query state.
  const frame = useMemo(() => {
    let built = 0; // number of prefix cells finalized (index 0..built-1)
    let activeSrc = -1; // arr index currently being added
    let phase: "build" | "query" | "answer" = "build";
    let hi = -1;
    let lo = -1;
    let answer: number | null = null;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      switch (op.t) {
        case "seed":
          built = 1;
          break;
        case "build":
          built = op.i + 2;
          activeSrc = op.i;
          break;
        case "queryStart":
          phase = "query";
          activeSrc = -1;
          break;
        case "pickHi":
          hi = op.index;
          break;
        case "pickLo":
          lo = op.index;
          break;
        case "answer":
          phase = "answer";
          answer = op.value;
          break;
      }
    }
    return { built, activeSrc, phase, hi, lo, answer };
  }, [ops, step]);

  const { built, activeSrc, phase, hi, lo, answer } = frame;
  const runningTotal = built > 0 ? prefix[built - 1] : 0;

  const caption = (() => {
    if (step === 0) return "prefix[0] = 0 — nothing summed yet. Press play to build.";
    const op = ops[step - 1];
    switch (op.t) {
      case "seed":
        return "prefix[0] = 0 — the empty running total.";
      case "build":
        return `prefix[${op.i + 1}] = prefix[${op.i}] + ${arr[op.i]} = ${op.running}.`;
      case "queryStart":
        return `Prefix array built. Now answer: sum of indices ${op.left}…${op.right}.`;
      case "pickHi":
        return `Read prefix[${op.index}] = ${op.value} (total up to the right end).`;
      case "pickLo":
        return `Read prefix[${op.index}] = ${op.value} (total before the left end).`;
      case "answer":
        return `Range sum = prefix[${right + 1}] − prefix[${left}] = ${prefix[right + 1]} − ${prefix[left]} = ${op.value}.`;
    }
  })();

  const inRange = (idx: number) =>
    phase !== "build" && idx >= left && idx <= right;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Build once, answer fast</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Prefix sums
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
        aria-label={`Building a prefix-sum array over ${arr.length} numbers, then answering the range sum of indices ${left} to ${right}; ${
          done ? "answered" : `step ${step} of ${total}`
        }`}
      >
        {/* Source numbers row */}
        <div className="mb-1 text-center font-mono text-[10px] uppercase tracking-wide text-muted">
          numbers
        </div>
        <div className="flex justify-center gap-[3px] sm:gap-1.5">
          {arr.map((v, idx) => {
            const active = idx === activeSrc;
            const ranged = inRange(idx);
            const bg = active
              ? "var(--accent)"
              : ranged
                ? "color-mix(in srgb, var(--color-output) 26%, white)"
                : "color-mix(in srgb, var(--color-muted) 12%, white)";
            return (
              <div
                key={idx}
                className="dp-bar flex h-9 flex-1 items-center justify-center rounded-lg font-mono text-xs font-bold sm:text-sm"
                style={{
                  background: bg,
                  color: active ? "white" : "var(--color-ink)",
                  maxWidth: "3rem",
                }}
              >
                {v}
              </div>
            );
          })}
          {/* spacer to align with the extra prefix cell */}
          <div className="h-9 flex-1" style={{ maxWidth: "3rem" }} aria-hidden="true" />
        </div>

        {/* Prefix array row (length n + 1) */}
        <div className="mb-1 mt-3 text-center font-mono text-[10px] uppercase tracking-wide text-muted">
          prefix
        </div>
        <div className="flex justify-center gap-[3px] sm:gap-1.5">
          {prefix.map((v, idx) => {
            const isBuilt = idx < built;
            const isActive = idx === built - 1 && activeSrc >= 0;
            const isHi = idx === hi;
            const isLo = idx === lo;
            let bg = "color-mix(in srgb, var(--color-muted) 12%, white)";
            let color = "var(--color-ink)";
            if (isHi) {
              bg = "var(--accent)";
              color = "white";
            } else if (isLo) {
              bg = "var(--color-primary)";
              color = "white";
            } else if (isActive) {
              bg = "color-mix(in srgb, var(--accent) 40%, white)";
            } else if (isBuilt) {
              bg = "color-mix(in srgb, var(--color-output) 20%, white)";
            }
            return (
              <div key={idx} className="flex flex-1 flex-col items-center" style={{ maxWidth: "3rem" }}>
                <div
                  className="dp-bar flex h-9 w-full items-center justify-center rounded-lg font-mono text-xs font-bold sm:text-sm"
                  style={{
                    background: bg,
                    color,
                    opacity: isBuilt ? 1 : 0.45,
                  }}
                >
                  {isBuilt ? v : "·"}
                </div>
                <div className="mt-0.5 h-3 text-[9px] font-bold leading-none">
                  {isHi && <span style={{ color: "var(--accent)" }}>R+1</span>}
                  {isLo && <span style={{ color: "var(--color-primary)" }}>L</span>}
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
        <Stat label="Running total" value={runningTotal} />
        <Stat label="Query range" value={`[${left}, ${right}]`} />
        <Stat label="Answer" value={answer === null ? "—" : answer} />
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
        <LegendDot color="var(--accent)" label="Building / prefix[R+1]" />
        <LegendDot color="var(--color-primary)" label="prefix[L]" />
        <LegendDot color="color-mix(in srgb, var(--color-output) 26%, white)" label="Queried range" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 12%, white)" label="Not yet used" />
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
