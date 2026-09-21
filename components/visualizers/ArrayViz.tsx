"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   ArrayViz — a "watch the array move" explainer for the Array lesson.

   An array is a row of numbered slots (index starts at 0). Reaching any slot
   by its index is instant — O(1) — you jump straight there. But inserting or
   deleting in the MIDDLE is not free: every later item has to slide over to
   make room (insert) or close the gap (delete). This visualizer plays a
   scripted run — one random access, one middle insert, then one middle delete
   — so you can literally count the shifts, one slot at a time.

   Architecture mirrors SortVisualizer/StackViz: the whole run is RECORDED up
   front as a flat op list, then replayed purely from a single `step` counter
   inside a useMemo. The only state that changes during playback is `step`,
   advanced by a setTimeout in the autoplay callback — never setState in an
   effect body. All randomness comes from a seeded PRNG so the server and
   client first render match (no hydration mismatch); we reshuffle only on an
   explicit user action.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "access"; index: number }
  | { t: "insertBegin"; index: number; value: number }
  | { t: "shiftRight"; from: number }
  | { t: "place"; index: number; value: number }
  | { t: "deleteBegin"; index: number }
  | { t: "shiftLeft"; from: number }
  | { t: "truncate" };

type Role = "access" | "insert" | "place" | "shift" | "delete";

const START_LEN = 6;
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [900, 620, 420, 260, 150] as const;

/** Tiny deterministic PRNG (mulberry32). A given seed always yields the same
 *  sequence, so the server and client first render are identical. */
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

/** Stable per-lesson seed so the first render is deterministic. */
function makeSeed(tag: string): number {
  let h = 2166136261;
  for (let i = 0; i < tag.length; i++) {
    h ^= tag.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/** Build the starting values: distinct two-digit numbers, deterministic. */
function makeInitial(seed: number): number[] {
  const rng = makeRng(seed);
  const out: number[] = [];
  const used = new Set<number>();
  while (out.length < START_LEN) {
    const v = 10 + Math.floor(rng() * 89); // 10..98
    if (!used.has(v)) {
      used.add(v);
      out.push(v);
    }
  }
  return out;
}

/** Record the scripted run: access → middle insert (shift right) → access →
 *  middle delete (shift left). Deterministic for a given seed. */
function record(seed: number): { ops: Op[]; initial: number[] } {
  const initial = makeInitial(seed);
  const rng = makeRng(seed ^ 0x9e3779b9); // decorrelated stream for choices
  const ops: Op[] = [];
  let len = initial.length;

  // 1) Random access — the O(1) party trick.
  ops.push({ t: "access", index: Math.floor(rng() * len) });

  // 2) Insert a fresh value somewhere in the middle. Everything from that
  //    index to the end must slide one slot right first.
  const ip = 1 + Math.floor(rng() * (len - 1)); // 1..len-1
  const iv = 10 + Math.floor(rng() * 89);
  ops.push({ t: "insertBegin", index: ip, value: iv });
  for (let j = len - 1; j >= ip; j--) ops.push({ t: "shiftRight", from: j });
  ops.push({ t: "place", index: ip, value: iv });
  len += 1;

  // 3) Access again to reinforce that reads are still instant.
  ops.push({ t: "access", index: Math.floor(rng() * len) });

  // 4) Delete in the middle. Everything after the gap slides one slot left.
  const dp = 1 + Math.floor(rng() * (len - 2)); // 1..len-2
  ops.push({ t: "deleteBegin", index: dp });
  for (let j = dp + 1; j < len; j++) ops.push({ t: "shiftLeft", from: j });
  ops.push({ t: "truncate" });

  return { ops, initial };
}

function narrate(op: Op | undefined): string {
  if (!op)
    return "Ready. Press play — read by index is instant, but inserting or deleting shifts the rest.";
  switch (op.t) {
    case "access":
      return `arr[${op.index}] — jump straight to slot ${op.index}. No searching: O(1), instant.`;
    case "insertBegin":
      return `Insert ${op.value} at index ${op.index}. First make room by sliding later items right…`;
    case "shiftRight":
      return `Slide the item at index ${op.from} one slot right — this is the cost of inserting.`;
    case "place":
      return `Drop ${op.value} into the open slot at index ${op.index}.`;
    case "deleteBegin":
      return `Delete the item at index ${op.index}. Removing it leaves a gap…`;
    case "shiftLeft":
      return `Slide the item at index ${op.from} one slot left to close the gap — the cost of deleting.`;
    case "truncate":
      return "Gap closed. The array is now one slot shorter.";
  }
}

export function ArrayViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => makeSeed("array"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ops, initial } = useMemo(() => record(seed), [seed]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  // Derive the whole picture at `step` by replaying ops 0..step. Pure + cheap.
  // Cells can be `null` while a slot is momentarily a hole mid-shift.
  const frame = useMemo(() => {
    const cells: (number | null)[] = [...initial];
    let reads = 0;
    let shifts = 0;
    let hi: { index: number; role: Role } | null = null;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      hi = null;
      switch (op.t) {
        case "access":
          reads++;
          hi = { index: op.index, role: "access" };
          break;
        case "insertBegin":
          cells.push(null); // open one more slot at the far end
          hi = { index: op.index, role: "insert" };
          break;
        case "shiftRight":
          cells[op.from + 1] = cells[op.from];
          cells[op.from] = null;
          shifts++;
          hi = { index: op.from + 1, role: "shift" };
          break;
        case "place":
          cells[op.index] = op.value;
          hi = { index: op.index, role: "place" };
          break;
        case "deleteBegin":
          cells[op.index] = null;
          hi = { index: op.index, role: "delete" };
          break;
        case "shiftLeft":
          cells[op.from - 1] = cells[op.from];
          cells[op.from] = null;
          shifts++;
          hi = { index: op.from - 1, role: "shift" };
          break;
        case "truncate":
          cells.pop();
          break;
      }
    }
    return { cells, reads, shifts, hi };
  }, [ops, initial, step]);

  const { cells, reads, shifts, hi } = frame;
  const current = step > 0 ? ops[step - 1] : undefined;

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

  const cellColor = (idx: number): string => {
    if (hi && hi.index === idx) {
      if (hi.role === "shift") return "var(--color-here)";
      if (hi.role === "delete") return "var(--color-here)";
      if (hi.role === "place") return "var(--color-primary)";
      return "var(--accent)"; // access / insert target
    }
    return "color-mix(in srgb, var(--color-muted) 16%, white)";
  };
  const cellTextDark = (idx: number): boolean => !(hi && hi.index === idx);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the array</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Array · indexed slots
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: a row of numbered slots */}
      <div
        className="mt-4 overflow-x-auto rounded-xl bg-paper px-3 py-5"
        role="img"
        aria-label={`Array visualization with ${cells.length} slots, ${
          done ? "run complete" : `step ${step} of ${total}`
        }`}
      >
        <div className="flex min-w-max items-start justify-center gap-1.5">
          {cells.map((v, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className="flex h-12 w-10 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors sm:h-14 sm:w-12"
                style={{
                  background: v === null ? "transparent" : cellColor(idx),
                  border:
                    v === null
                      ? "2px dashed color-mix(in srgb, var(--color-muted) 40%, white)"
                      : "1px solid color-mix(in srgb, var(--color-muted) 22%, white)",
                  color:
                    v === null
                      ? "var(--color-muted)"
                      : cellTextDark(idx)
                        ? "var(--color-ink, #1a1c2e)"
                        : "white",
                  transform:
                    hi && hi.index === idx && v !== null ? "translateY(-4px)" : undefined,
                }}
              >
                {v === null ? "" : v}
              </div>
              <span className="font-mono text-[10px] text-muted">{idx}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(current)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Length" value={cells.filter((c) => c !== null).length} />
        <Stat label="Reads (O(1))" value={reads} />
        <Stat label="Shifts" value={shifts} />
        <Stat label="Step" value={`${step}/${total}`} />
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

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Accessed by index" />
        <LegendDot color="var(--color-here)" label="Shifting (the cost)" />
        <LegendDot color="var(--color-primary)" label="New value placed" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 16%, white)" label="Idle slot" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-2 py-2">
      <div className="truncate font-mono text-base font-bold tabular-nums text-ink sm:text-lg">
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
