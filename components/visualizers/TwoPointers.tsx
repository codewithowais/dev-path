"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   TwoPointers — "watch it converge" animated explainer for the two-pointer
   technique on a SORTED array.

   Two pointers start at opposite ends of a sorted row. Each step we look at
   the sum of the two ends: if it hits the target we're done; if it's too
   small the left pointer steps right (the only move that can raise the sum);
   if it's too big the right pointer steps left. The whole run is recorded as
   a list of self-describing ops up front, then replayed purely from a single
   `step` counter, so playback is deterministic, scrubbable and StrictMode-safe.
   ──────────────────────────────────────────────────────────────────────── */

type Op = {
  left: number;
  right: number;
  sum: number;
  /** "eq" = found, "low" = sum too small (move left), "high" = too big (move right). */
  cmp: "eq" | "low" | "high";
};

/** Tiny deterministic PRNG (mulberry32) so server and client first render match. */
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

/** Stable per-lesson seed so each open renders identically on server + client. */
function lessonSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/** A sorted array of distinct small numbers plus a guaranteed-reachable target. */
function buildInput(seed: number): { arr: number[]; target: number } {
  const rng = makeRng(seed);
  const pool = new Set<number>();
  while (pool.size < 8) pool.add(2 + Math.floor(rng() * 26));
  const arr = [...pool].sort((x, y) => x - y);
  // Pick two distinct positions so a valid pair always exists.
  const i = Math.floor(rng() * (arr.length - 1));
  let j = i + 1 + Math.floor(rng() * (arr.length - 1 - i));
  if (j >= arr.length) j = arr.length - 1;
  return { arr, target: arr[i] + arr[j] };
}

function record(arr: number[], target: number): Op[] {
  const ops: Op[] = [];
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      ops.push({ left, right, sum, cmp: "eq" });
      break;
    }
    if (sum < target) {
      ops.push({ left, right, sum, cmp: "low" });
      left++;
    } else {
      ops.push({ left, right, sum, cmp: "high" });
      right--;
    }
  }
  return ops;
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function TwoPointers({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("two-pointers"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const { arr, target } = useMemo(() => buildInput(seed), [seed]);
  const ops = useMemo(() => record(arr, target), [arr, target]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const current = step > 0 ? ops[step - 1] : undefined;
  const foundOp =
    current && current.cmp === "eq" ? current : undefined;

  // Autoplay: advance one op per tick, functional update inside the timer.
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

  const left = current?.left ?? 0;
  const right = current?.right ?? arr.length - 1;
  const sum = current?.sum ?? arr[0] + arr[arr.length - 1];

  const caption = !current
    ? "Sorted list ready. One pointer at each end — press play."
    : current.cmp === "eq"
      ? `${arr[left]} + ${arr[right]} = ${target}. Found the pair!`
      : current.cmp === "low"
        ? `${arr[left]} + ${arr[right]} = ${sum}, below ${target}. Move the left pointer right for a bigger sum.`
        : `${arr[left]} + ${arr[right]} = ${sum}, above ${target}. Move the right pointer left for a smaller sum.`;

  const cellState = (
    idx: number,
  ): "answer" | "left" | "right" | "candidate" | "dropped" => {
    if (foundOp && (idx === left || idx === right)) return "answer";
    if (idx === left) return "left";
    if (idx === right) return "right";
    if (idx < left || idx > right) return "dropped";
    return "candidate";
  };

  const fillFor = (st: ReturnType<typeof cellState>): string => {
    switch (st) {
      case "answer":
        return "var(--color-output)";
      case "left":
        return "var(--accent)";
      case "right":
        return "var(--color-primary)";
      case "dropped":
        return "color-mix(in srgb, var(--color-muted) 14%, white)";
      default:
        return "color-mix(in srgb, var(--accent) 20%, white)";
    }
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it converge</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Two pointers
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
        aria-label={`Two-pointer search on a sorted array of ${arr.length} numbers for a pair summing to ${target}; ${
          done ? "pair found" : `step ${step} of ${total}`
        }`}
      >
        <div className="mb-2 text-center font-mono text-xs text-muted">
          target sum = <span className="font-bold text-ink">{target}</span>
        </div>
        <div className="flex items-stretch justify-center gap-[3px] sm:gap-1.5">
          {arr.map((v, idx) => {
            const st = cellState(idx);
            const isPtr = st === "left" || st === "right" || st === "answer";
            return (
              <div key={idx} className="flex min-w-0 flex-1 flex-col items-center">
                {/* pointer badge above */}
                <div className="mb-1 h-4 text-[10px] font-bold leading-none">
                  {idx === left && (
                    <span style={{ color: "var(--accent)" }}>L</span>
                  )}
                  {idx === right && idx !== left && (
                    <span style={{ color: "var(--color-primary)" }}>R</span>
                  )}
                </div>
                <div
                  className="dp-bar flex aspect-square w-full items-center justify-center rounded-lg font-mono text-xs font-bold sm:text-sm"
                  style={{
                    background: fillFor(st),
                    color: isPtr ? "white" : "var(--color-ink)",
                    transform: isPtr ? "translateY(-2px)" : undefined,
                  }}
                >
                  {v}
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
        <Stat label="Current sum" value={sum} />
        <Stat label="Target" value={target} />
        <Stat label="Left · Right" value={`${arr[left]} · ${arr[right]}`} />
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
        <LegendDot color="var(--accent)" label="Left pointer" />
        <LegendDot color="var(--color-primary)" label="Right pointer" />
        <LegendDot color="var(--color-output)" label="Matching pair" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 14%, white)" label="Ruled out" />
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
