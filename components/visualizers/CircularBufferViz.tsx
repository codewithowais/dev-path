"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   CircularBufferViz — a "watch the ring loop" explainer for the Circular
   Buffer (Ring Buffer) lesson.

   A ring buffer is a fixed-size array whose indices wrap around modulo the
   capacity. We track `start` (index of the oldest item) and `count` (how many
   slots are filled). A write drops the new value at the tail = (start+count)%C
   and wraps back to 0 once it runs off the end; once full, a write overwrites
   the oldest value and slides `start` forward. A read (dequeue) hands back the
   oldest value and advances `start`. Both are O(1) — nothing ever shifts.

   Architecture mirrors SortVisualizer: a scripted run is RECORDED up front as
   a flat op list, then replayed purely from a single `step` counter inside a
   useMemo. The only state that changes during playback is `step`, advanced by
   a setTimeout in the autoplay callback — never setState inside an effect body.
   Slots are drawn around a circle so the wrap-around is literally visible.
   ──────────────────────────────────────────────────────────────────────── */

type Op = { kind: "write"; value: number } | { kind: "read" };

const CAPACITY = 6;
const NUM_OPS = 13;
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [900, 620, 420, 260, 150] as const;

/** Tiny deterministic PRNG (mulberry32): a given seed always yields the same
 *  sequence, so server and client first render match (no hydration mismatch).
 *  We only pick a fresh seed on an explicit user action. */
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

/** Build a valid write/read sequence. Writes are always allowed (a write to a
 *  full buffer overwrites the oldest — that's the whole point of the lesson),
 *  reads only when something is present. Biased so we fill, wrap around, and
 *  dequeue at least twice. Deterministic for a given seed. */
function buildScript(seed: number): Op[] {
  const rng = makeRng(seed);
  const ops: Op[] = [];
  let count = 0;
  let nextVal = 1;
  let reads = 0;
  for (let i = 0; i < NUM_OPS; i++) {
    const empty = count === 0;
    // Force a couple of reads late so head advances independently of tail.
    const forceRead = !empty && (i === NUM_OPS - 2 || (i > 7 && reads < 2 && rng() < 0.5));
    const read = forceRead || (!empty && rng() < 0.24);
    if (read) {
      ops.push({ kind: "read" });
      count = Math.max(0, count - 1);
      reads++;
    } else {
      ops.push({ kind: "write", value: nextVal++ });
      count = Math.min(CAPACITY, count + 1);
    }
  }
  return ops;
}

type Frame = {
  slots: (number | null)[];
  start: number;
  count: number;
  active: number | null; // slot the current op touched
  activeKind: "write" | "read" | null;
  writes: number;
  reads: number;
  overwrote: boolean; // did the last write overwrite the oldest?
  lastValue: number | null; // value written or read by the current op
};

function replay(ops: Op[], step: number): Frame {
  const slots: (number | null)[] = new Array(CAPACITY).fill(null);
  let start = 0;
  let count = 0;
  let writes = 0;
  let reads = 0;
  let active: number | null = null;
  let activeKind: "write" | "read" | null = null;
  let overwrote = false;
  let lastValue: number | null = null;

  for (let k = 0; k < step; k++) {
    const op = ops[k];
    overwrote = false;
    if (op.kind === "write") {
      const end = (start + count) % CAPACITY;
      slots[end] = op.value;
      active = end;
      activeKind = "write";
      lastValue = op.value;
      writes++;
      if (count < CAPACITY) {
        count++;
      } else {
        start = (start + 1) % CAPACITY; // full: oldest gets overwritten
        overwrote = true;
      }
    } else {
      // read / dequeue the oldest
      if (count > 0) {
        active = start;
        activeKind = "read";
        lastValue = slots[start];
        slots[start] = null;
        start = (start + 1) % CAPACITY;
        count--;
        reads++;
      }
    }
  }
  return { slots, start, count, active, activeKind, writes, reads, overwrote, lastValue };
}

function narrate(f: Frame, started: boolean): string {
  if (!started) {
    return "Ready. A fixed ring of 6 slots — writes wrap around with modulo math, nothing ever shifts.";
  }
  if (f.activeKind === "write") {
    if (f.overwrote) {
      return `Buffer was full — writing ${f.lastValue} overwrites the oldest value and slides head forward (wrap-around).`;
    }
    return `write ${f.lastValue}: dropped at the tail = (start + count) % ${CAPACITY}. Tail wraps back to 0 at the end.`;
  }
  if (f.activeKind === "read") {
    return `read: hand back the oldest value ${f.lastValue} and advance head — O(1), no shifting.`;
  }
  return "Ready.";
}

export function CircularBufferViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => makeSeed("circular-buffer"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ops = useMemo(() => buildScript(seed), [seed]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => replay(ops, step), [ops, step]);
  const { slots, start, count, active } = frame;

  // Tail = the next-write slot. Head = the oldest slot (= start).
  const tail = (start + count) % CAPACITY;
  const full = count === CAPACITY;
  const empty = count === 0;

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
  };

  // Autoplay: functional update inside the timer callback, never in the body.
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

  const newSequence = () => {
    reset();
    setSeed((s) => s + 1);
  };

  // Geometry for the ring of slots.
  const CX = 130;
  const CY = 130;
  const R = 88; // slot-centre radius
  const SLOT_R = 24;
  const pos = (i: number) => {
    // Slot 0 at top, going clockwise.
    const ang = (i / CAPACITY) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), ang };
  };

  const occupied = new Set<number>();
  for (let i = 0; i < count; i++) occupied.add((start + i) % CAPACITY);

  const started = step > 0;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <style>{`
        @keyframes cbz-pulse { 0% { transform: scale(0.82); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the ring loop</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Circular buffer · cap {CAPACITY}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: the ring */}
      <div
        className="mt-4 flex items-center justify-center rounded-xl bg-paper px-3 py-3"
        role="img"
        aria-label={`Circular buffer of capacity ${CAPACITY}, ${count} slot${
          count === 1 ? "" : "s"
        } filled, ${
          empty ? "empty" : full ? "full" : "partly full"
        }, ${done ? "sequence complete" : `step ${step} of ${total}`}`}
      >
        <svg viewBox="0 0 260 260" className="h-60 w-full max-w-[260px]">
          {/* faint guide ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="color-mix(in srgb, var(--color-muted) 22%, white)"
            strokeWidth={1.5}
            strokeDasharray="4 5"
          />
          {slots.map((v, i) => {
            const p = pos(i);
            const isActive = i === active;
            const isOcc = occupied.has(i);
            const fill = isActive
              ? "var(--accent)"
              : isOcc
                ? "color-mix(in srgb, var(--accent) 20%, white)"
                : "color-mix(in srgb, var(--color-muted) 10%, white)";
            const stroke = isActive
              ? "var(--accent)"
              : isOcc
                ? "color-mix(in srgb, var(--accent) 55%, white)"
                : "color-mix(in srgb, var(--color-muted) 30%, white)";
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={SLOT_R}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive ? 3 : 1.5}
                  strokeDasharray={isOcc || isActive ? undefined : "3 4"}
                  style={{
                    transformOrigin: `${p.x}px ${p.y}px`,
                    animation: isActive ? "cbz-pulse 340ms var(--dp-ease, ease)" : undefined,
                  }}
                />
                <text
                  x={p.x}
                  y={p.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono font-bold"
                  fontSize={15}
                  fill={isActive ? "#fff" : v == null ? "color-mix(in srgb, var(--color-muted) 60%, white)" : "var(--color-ink)"}
                >
                  {v == null ? "·" : v}
                </text>
                {/* slot index, just outside the ring */}
                <text
                  x={CX + (R + SLOT_R + 12) * Math.cos(p.ang)}
                  y={CY + (R + SLOT_R + 12) * Math.sin(p.ang)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono"
                  fontSize={9}
                  fill="color-mix(in srgb, var(--color-muted) 70%, white)"
                >
                  {i}
                </text>
              </g>
            );
          })}

          {/* head marker (violet) — points at the oldest slot from outside */}
          {!empty && (
            <HeadTailMark
              p={pos(start)}
              cy={CY}
              slotR={SLOT_R}
              color="var(--color-primary)"
              label="head"
              outside
            />
          )}
          {/* tail marker (coral) — the next write slot, from inside */}
          <HeadTailMark
            p={pos(tail)}
            cy={CY}
            slotR={SLOT_R}
            color="var(--color-here)"
            label="tail"
            outside={false}
          />
        </svg>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(frame, started)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Fill" value={`${count}/${CAPACITY}`} />
        <Stat label="head / tail" value={`${empty ? "–" : start} / ${tail}`} />
        <Stat label="State" value={empty ? "empty" : full ? "full" : "open"} />
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
          onClick={newSequence}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤨ New sequence
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
        <LegendDot color="var(--accent)" label="Slot just touched" />
        <LegendDot color="var(--color-primary)" label="head (oldest)" />
        <LegendDot color="var(--color-here)" label="tail (next write)" />
        <LegendDot color="color-mix(in srgb, var(--accent) 20%, white)" label="Filled" />
      </div>
    </div>
  );
}

function HeadTailMark({
  p,
  cy,
  slotR,
  color,
  label,
  outside,
}: {
  p: { x: number; y: number; ang: number };
  cy: number;
  slotR: number;
  color: string;
  label: string;
  outside: boolean;
}) {
  // Place the marker just outside or just inside the slot along its radius.
  const off = outside ? slotR + 26 : -(slotR + 20);
  const mx = p.x + off * Math.cos(p.ang);
  const my = p.y + off * Math.sin(p.ang);
  return (
    <g>
      <line
        x1={mx}
        y1={my}
        x2={p.x + (outside ? slotR + 2 : -(slotR + 2)) * Math.cos(p.ang)}
        y2={p.y + (outside ? slotR + 2 : -(slotR + 2)) * Math.sin(p.ang)}
        stroke={color}
        strokeWidth={2}
      />
      <circle cx={mx} cy={my} r={4} fill={color} />
      <text
        x={mx}
        y={my + (my < cy ? -8 : 12)}
        textAnchor="middle"
        className="font-mono font-semibold"
        fontSize={10}
        fill={color}
      >
        {label}
      </text>
    </g>
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
