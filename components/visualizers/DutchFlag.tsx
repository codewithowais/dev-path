"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   DutchFlag — "watch it partition" animated explainer for the Dutch National
   Flag algorithm (3-way partition of 0s / 1s / 2s in one pass).

   Three markers walk the row: low (boundary of the 0s), mid (the cell under
   inspection) and high (boundary of the 2s). If a[mid] is 0 we swap it down
   to low and advance both; if 1 we leave it and advance mid; if 2 we swap it
   out to high and pull high in WITHOUT advancing mid (the swapped-in value is
   still unchecked). The unknown middle shrinks as the coloured regions grow.
   Each decision is recorded as a self-describing op; the array is rebuilt for
   any step by replaying the recorded swaps, exactly like SortVisualizer.
   ──────────────────────────────────────────────────────────────────────── */

type Op = {
  /** "zero" swaps mid↔low; "one" passes; "two" swaps mid↔high; "done" ends. */
  t: "zero" | "one" | "two" | "done";
  low: number;
  mid: number;
  high: number;
  /** the value inspected at mid (undefined for "done"). */
  value?: number;
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

function buildInput(seed: number): number[] {
  const rng = makeRng(seed);
  const arr: number[] = [];
  for (let i = 0; i < 9; i++) arr.push(Math.floor(rng() * 3)); // 0, 1 or 2
  return arr;
}

/** Record ops plus, for each op, the pre-swap indices so we can replay swaps. */
function record(input: number[]): { ops: Op[]; swaps: [number, number][] } {
  const a = [...input];
  const ops: Op[] = [];
  const swaps: [number, number][] = [];
  let low = 0;
  let mid = 0;
  let high = a.length - 1;
  while (mid <= high) {
    const value = a[mid];
    if (value === 0) {
      ops.push({ t: "zero", low, mid, high, value });
      swaps.push([low, mid]);
      [a[low], a[mid]] = [a[mid], a[low]];
      low++;
      mid++;
    } else if (value === 1) {
      ops.push({ t: "one", low, mid, high, value });
      swaps.push([mid, mid]); // no-op swap keeps ops/swaps aligned
      mid++;
    } else {
      ops.push({ t: "two", low, mid, high, value });
      swaps.push([mid, high]);
      [a[mid], a[high]] = [a[high], a[mid]];
      high--;
    }
  }
  ops.push({ t: "done", low, mid, high });
  swaps.push([0, 0]);
  return { ops, swaps };
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function DutchFlag({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("dutch-national-flag"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const initial = useMemo(() => buildInput(seed), [seed]);
  const { ops, swaps } = useMemo(() => record(initial), [initial]);

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

  // Derive the array + pointer positions by replaying swaps for ops < step.
  const frame = useMemo(() => {
    const view = [...initial];
    for (let k = 0; k < step; k++) {
      const [i, j] = swaps[k];
      if (i !== j) [view[i], view[j]] = [view[j], view[i]];
    }
    // Pointers to show: state AFTER the last applied op (i.e. the pointers
    // carried by the next op), so the row reflects the current partition.
    const at = ops[Math.min(step, total - 1)];
    const low = step === 0 ? 0 : at.low;
    const mid = step === 0 ? 0 : at.mid;
    const high = step === 0 ? initial.length - 1 : at.high;
    return { view, low, mid, high };
  }, [initial, swaps, ops, step, total]);

  const { view, low, mid, high } = frame;
  const currentOp = step > 0 ? ops[step - 1] : undefined;

  const caption = (() => {
    if (!currentOp) return "Three markers: low, mid, high. Press play to sort in one pass.";
    switch (currentOp.t) {
      case "zero":
        return `a[mid] = 0 → swap it down to the low boundary; advance low and mid.`;
      case "one":
        return `a[mid] = 1 → already in the middle group; just advance mid.`;
      case "two":
        return `a[mid] = 2 → swap it out to the high boundary; pull high in (mid stays put).`;
      case "done":
        return "mid passed high — every value is in its region. Sorted in one pass.";
    }
  })();

  // Region of a cell: 0-zone (idx<low), 1-zone (low..mid-1), unknown (mid..high),
  // 2-zone (idx>high). The mid cell is the active inspection point.
  const zoneColor = (idx: number): { bg: string; color: string; ring?: string } => {
    if (!done && idx === mid && mid <= high) {
      return { bg: "var(--accent)", color: "white" };
    }
    if (idx < low) return { bg: "var(--color-output)", color: "white" }; // settled 0s
    if (idx < mid) return { bg: "color-mix(in srgb, var(--color-primary) 55%, white)", color: "white" }; // settled 1s
    if (idx > high) return { bg: "var(--color-primary)", color: "white" }; // settled 2s
    return {
      bg: "color-mix(in srgb, var(--color-muted) 14%, white)",
      color: "var(--color-ink)",
    }; // unknown
  };

  const barH = (v: number) => 34 + v * 22; // 0→34, 1→56, 2→78 px

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it partition</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Dutch national flag
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
        aria-label={`Dutch national flag 3-way partition of ${initial.length} values into 0s, 1s and 2s; ${
          done ? "sorted" : `step ${step} of ${total}`
        }`}
      >
        <div className="flex items-end justify-center gap-[3px] sm:gap-1.5">
          {view.map((v, idx) => {
            const z = zoneColor(idx);
            const isMid = !done && idx === mid && mid <= high;
            return (
              <div key={idx} className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex w-full items-end justify-center" style={{ height: "80px" }}>
                  <div
                    className="dp-bar flex w-full items-center justify-center rounded-lg font-mono text-xs font-bold sm:text-sm"
                    style={{
                      height: `${barH(v)}px`,
                      background: z.bg,
                      color: z.color,
                      transform: isMid ? "translateY(-3px)" : undefined,
                    }}
                  >
                    {v}
                  </div>
                </div>
                {/* pointer badges */}
                <div className="mt-1 flex h-3 gap-0.5 text-[9px] font-bold leading-none">
                  {idx === low && low <= high && (
                    <span style={{ color: "var(--color-output)" }}>L</span>
                  )}
                  {idx === mid && !done && (
                    <span style={{ color: "var(--accent)" }}>M</span>
                  )}
                  {idx === high && low <= high && (
                    <span style={{ color: "var(--color-primary)" }}>H</span>
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
        <Stat label="Low" value={low} />
        <Stat label="Mid" value={done ? "—" : mid} />
        <Stat label="High" value={high} />
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
        <LegendDot color="var(--color-output)" label="0s (low zone)" />
        <LegendDot color="color-mix(in srgb, var(--color-primary) 55%, white)" label="1s (middle)" />
        <LegendDot color="var(--color-primary)" label="2s (high zone)" />
        <LegendDot color="var(--accent)" label="Mid (inspecting)" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 14%, white)" label="Unknown" />
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
