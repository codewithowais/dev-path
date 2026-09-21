"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SortedSetViz — a "watch it stay sorted" explainer for the Sorted Set lesson.

   Numbers arrive one at a time. For each, we scan the already-sorted array to
   find exactly where it belongs, then slide the larger items right to open a
   gap and drop it in — so the array is always in order. Duplicates are
   silently rejected, just like a set. The live "shifts" counter makes the
   O(n) insert cost the lesson mentions visible.

   Same engine as SortVisualizer: the whole run is recorded up front as a list
   of ops, then replayed purely from one `step` counter. Deterministic (seeded
   PRNG, never Math.random in render), scrubbable, StrictMode-safe. All motion
   is disabled under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "incoming"; src: number }
  | { t: "compare"; src: number; idx: number }
  | { t: "dup"; src: number; idx: number }
  | { t: "insert"; src: number; pos: number; shifted: number };

type Recording = { ops: Op[]; stream: number[] };

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

function stableSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/** A stream of 7 values in 5..95, seeded to include at least one duplicate. */
function buildStream(seed: number): number[] {
  const rng = makeRng(seed);
  const stream: number[] = [];
  while (stream.length < 6) {
    const v = 5 + Math.floor(rng() * 91);
    stream.push(v);
  }
  // Guarantee a duplicate to show rejection: repeat an earlier value.
  const dupOf = stream[Math.floor(rng() * 3)];
  stream.splice(3 + Math.floor(rng() * 3), 0, dupOf);
  return stream.slice(0, 7);
}

function buildRun(stream: number[]): Recording {
  const ops: Op[] = [];
  const arr: number[] = [];
  stream.forEach((value, src) => {
    ops.push({ t: "incoming", src });
    let pos = arr.length;
    let dup = -1;
    for (let i = 0; i < arr.length; i++) {
      ops.push({ t: "compare", src, idx: i });
      if (arr[i] === value) {
        dup = i;
        break;
      }
      if (arr[i] > value) {
        pos = i;
        break;
      }
    }
    if (dup >= 0) {
      ops.push({ t: "dup", src, idx: dup });
    } else {
      const shifted = arr.length - pos;
      ops.push({ t: "insert", src, pos, shifted });
      arr.splice(pos, 0, value);
    }
  });
  return { ops, stream };
}

const SPEEDS = [720, 480, 300, 170, 80] as const;

export function SortedSetViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(() => stableSeed("sorted-set"));

  const stream = useMemo(() => buildStream(seed), [seed]);
  const recording = useMemo(() => buildRun(stream), [stream]);
  const { ops } = recording;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const arr: number[] = [];
    const status: ("pending" | "active" | "inserted" | "rejected")[] = stream.map(() => "pending");
    let activeSrc: number | null = null;
    let compareIdx: number | null = null;
    let dupIdx: number | null = null;
    let justInserted: number | null = null; // value just placed
    let shifts = 0;
    let comparisons = 0;
    let rejected = 0;
    let inserted = 0;
    for (let s = 0; s < step; s++) {
      const op = ops[s];
      switch (op.t) {
        case "incoming":
          activeSrc = op.src;
          status[op.src] = "active";
          compareIdx = null;
          dupIdx = null;
          justInserted = null;
          break;
        case "compare":
          activeSrc = op.src;
          compareIdx = op.idx;
          dupIdx = null;
          justInserted = null;
          comparisons++;
          break;
        case "dup":
          activeSrc = op.src;
          status[op.src] = "rejected";
          dupIdx = op.idx;
          compareIdx = null;
          justInserted = null;
          rejected++;
          break;
        case "insert": {
          activeSrc = op.src;
          status[op.src] = "inserted";
          const value = stream[op.src];
          arr.splice(op.pos, 0, value);
          justInserted = value;
          compareIdx = null;
          dupIdx = null;
          shifts += op.shifted;
          inserted++;
          break;
        }
      }
    }
    return { arr, status, activeSrc, compareIdx, dupIdx, justInserted, shifts, comparisons, rejected, inserted };
  }, [ops, stream, step]);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, total));
    }, SPEEDS[speedIdx]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, step, speedIdx, total]);

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

  const newInput = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const { arr, status, compareIdx, dupIdx, justInserted } = frame;

  const currentOp = step > 0 ? ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp) return "Ready. Press play to insert numbers in order.";
    switch (currentOp.t) {
      case "incoming":
        return `Incoming: ${stream[currentOp.src]}. Find where it belongs.`;
      case "compare":
        return `Compare ${stream[currentOp.src]} with ${arr[currentOp.idx]} at index ${currentOp.idx}.`;
      case "dup":
        return `${stream[currentOp.src]} is already in the set — rejected.`;
      case "insert":
        return currentOp.shifted > 0
          ? `Slide ${currentOp.shifted} item${currentOp.shifted > 1 ? "s" : ""} right, drop ${stream[currentOp.src]} into index ${currentOp.pos}.`
          : `${stream[currentOp.src]} goes at index ${currentOp.pos} — no shifting needed.`;
    }
  })();

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it stay sorted</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Sorted set
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Input stream */}
      <div className="mt-4 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Incoming numbers</div>
        <div
          className="flex flex-wrap gap-1.5"
          role="img"
          aria-label={`Sorted set built from ${stream.length} numbers, ${done ? "complete" : `step ${step} of ${total}`}`}
        >
          {stream.map((v, src) => {
            const st = status[src];
            let bg = "color-mix(in srgb, var(--accent) 18%, white)";
            let color = "var(--color-ink)";
            if (st === "inserted") {
              bg = "var(--accent)";
              color = "white";
            } else if (st === "rejected") {
              bg = "var(--color-here)";
              color = "white";
            } else if (st === "active") {
              bg = "var(--color-primary)";
              color = "white";
            }
            const settled = st === "inserted" || st === "rejected";
            return (
              <span
                key={src}
                className="dp-bar rounded-lg px-2.5 py-1 font-mono text-xs font-bold tabular-nums"
                style={{
                  background: bg,
                  color,
                  opacity: settled ? 0.5 : 1,
                  transform: st === "active" ? "translateY(-2px)" : undefined,
                }}
              >
                {v}
              </span>
            );
          })}
        </div>
      </div>

      {/* The sorted array */}
      <div className="mt-3 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Sorted array (always in order)</div>
        <div className="flex min-h-[3rem] flex-wrap items-end gap-1.5">
          {arr.length === 0 && <span className="font-mono text-[11px] text-muted">empty</span>}
          {arr.map((v, idx) => {
            const isCompare = compareIdx === idx;
            const isDup = dupIdx === idx;
            const isJust = justInserted === v && !isCompare && !isDup;
            const bg = isDup
              ? "var(--color-here)"
              : isCompare
                ? "var(--color-primary)"
                : isJust
                  ? "var(--accent)"
                  : "color-mix(in srgb, var(--color-muted) 14%, white)";
            return (
              <div key={`${v}-${idx}`} className="flex flex-col items-center gap-0.5">
                <span
                  className="dp-bar flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 font-mono text-sm font-bold tabular-nums"
                  style={{
                    background: bg,
                    color: isCompare || isDup || isJust ? "white" : "var(--color-ink)",
                    transform: isJust ? "translateY(-2px)" : undefined,
                  }}
                >
                  {v}
                </span>
                <span className="font-mono text-[9px] text-muted">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Size" value={arr.length} />
        <Stat label="Comparisons" value={frame.comparisons} />
        <Stat label="Shifts" value={frame.shifts} />
        <Stat label="Dupes dropped" value={frame.rejected} />
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
          onClick={newInput}
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
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--color-primary)" label="Comparing" />
        <LegendDot color="var(--accent)" label="Just inserted" />
        <LegendDot color="var(--color-here)" label="Duplicate (rejected)" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 14%, white)" label="Settled" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-2 py-2">
      <div className="font-mono text-base font-bold tabular-nums text-ink sm:text-lg">{value}</div>
      <div className="dp-eyebrow mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {label}
    </span>
  );
}
