"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   BitManipulation — "watch the bits flip" explainer for the lesson's core
   trick: counting set bits with n & (n − 1).

   Faithful to the lesson: a number is a row of on/off switches (bits). The
   operation n & (n − 1) always clears the lowest bit that is on. Do it again
   and again, counting each clear, and you have counted the set bits. If it
   takes exactly one clear to reach 0, the number was a power of two.

   Each clear is recorded up front (with its mask and result); the display is
   derived purely from a single `step` counter, so no setState runs inside an
   effect body.
   ──────────────────────────────────────────────────────────────────────── */

const BITS = 8;

type Op =
  | { t: "start"; n: number }
  | { t: "clear"; n: number; mask: number; next: number; low: number }
  | { t: "done"; count: number };

function lowestSetBit(n: number): number {
  for (let i = 0; i < BITS; i++) if ((n >> i) & 1) return i;
  return -1;
}

function record(n0: number): Op[] {
  const ops: Op[] = [{ t: "start", n: n0 }];
  let n = n0;
  let count = 0;
  while (n > 0) {
    const mask = n - 1;
    const next = n & mask;
    ops.push({ t: "clear", n, mask, next, low: lowestSetBit(n) });
    n = next;
    count++;
  }
  ops.push({ t: "done", count });
  return ops;
}

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

/** A number 1..255 to fill an 8-bit row. */
function pickNumber(seed: number): number {
  return 1 + Math.floor(makeRng(seed)() * 255);
}

function bitsOf(n: number): number[] {
  // MSB..LSB, fixed width.
  const out: number[] = [];
  for (let i = BITS - 1; i >= 0; i--) out.push((n >> i) & 1);
  return out;
}

const SPEEDS = [1200, 800, 520, 300, 160] as const;

export function BitManipulation({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  // Default seed lands on a deterministic first number; the lesson's example
  // is 44, and any stable value renders identically on server and client.
  const [seed, setSeed] = useState<number>(() => lessonSeed("bit-manipulation"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const n0 = useMemo(() => pickNumber(seed), [seed]);
  const ops = useMemo(() => record(n0), [n0]);
  const finalCount = useMemo(
    () => ops.filter((o) => o.t === "clear").length,
    [ops],
  );

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    let count = 0;
    for (let k = 0; k < step; k++) if (ops[k].t === "clear") count++;
    const op = step > 0 ? ops[step - 1] : undefined;
    let mainVal = n0;
    if (op) {
      if (op.t === "clear") mainVal = op.next;
      else if (op.t === "done") mainVal = 0;
    }
    return { count, op, mainVal };
  }, [ops, step, n0]);

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

  const newInput = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const clearOp = frame.op?.t === "clear" ? frame.op : null;
  const isPowerOfTwo = finalCount === 1 && n0 > 0;

  const caption = (() => {
    if (!frame.op)
      return `${n0} in binary is ${n0.toString(2)}. We count its set bits by clearing the lowest one each step.`;
    if (frame.op.t === "clear")
      return `${frame.op.n} & ${frame.op.mask} clears the lowest set bit → ${frame.op.next}. Count = ${frame.count}.`;
    return n0 > 0
      ? `Done: ${n0} has ${finalCount} set bit${finalCount === 1 ? "" : "s"}.${
          isPowerOfTwo ? " Exactly one — it's a power of two." : ""
        }`
      : "0 has no set bits.";
  })();

  // Convert a bit index counted from the LSB into a MSB-first column index.
  const lowCol = clearOp ? BITS - 1 - clearOp.low : -1;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the bits flip</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          count set bits · {n0}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-5"
        role="img"
        aria-label={`Counting set bits of ${n0} with n & (n-1); ${
          done ? `${finalCount} set bits` : `step ${step} of ${total}`
        }`}
      >
        {/* The working number's bit row */}
        <BitRow
          label={`n = ${frame.mainVal}`}
          bits={bitsOf(frame.mainVal)}
          setColor="var(--accent)"
        />

        {/* The mechanism: n & (n − 1) = next, highlighting the cleared bit */}
        {clearOp && (
          <div className="mt-4 flex flex-col gap-1.5 rounded-lg border border-line px-2 py-2">
            <BitRow
              label={`${clearOp.n}`}
              bits={bitsOf(clearOp.n)}
              setColor="color-mix(in srgb, var(--color-primary) 55%, white)"
              markCol={lowCol}
              small
            />
            <BitRow
              label={`& ${clearOp.mask}`}
              bits={bitsOf(clearOp.mask)}
              setColor="color-mix(in srgb, var(--color-muted) 45%, white)"
              markCol={lowCol}
              small
            />
            <div className="my-0.5 border-t border-line" />
            <BitRow
              label={`= ${clearOp.next}`}
              bits={bitsOf(clearOp.next)}
              setColor="var(--color-output)"
              markCol={lowCol}
              small
            />
          </div>
        )}
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Value" value={frame.mainVal} />
        <Stat label="Set bits" value={frame.count} />
        <Stat label="Power of 2?" value={done ? (isPowerOfTwo ? "Yes" : "No") : "—"} />
        <Stat label="Step" value={`${step}/${total}`} />
      </div>

      <Controls
        running={running}
        done={done}
        speedIdx={speedIdx}
        onToggle={togglePlay}
        onStep={stepForward}
        onNew={newInput}
        onSpeed={setSpeedIdx}
        newLabel="⤨ New number"
      />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Set bit (1)" />
        <LegendDot color="var(--color-primary)" label="Lowest set bit clearing" />
        <LegendDot color="var(--color-output)" label="Result after clearing" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 12%, white)" label="Unset bit (0)" />
      </div>
    </div>
  );
}

function BitRow({
  label,
  bits,
  setColor,
  markCol = -1,
  small = false,
}: {
  label: string;
  bits: number[];
  setColor: string;
  markCol?: number;
  small?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className={`shrink-0 text-right font-mono font-semibold text-muted ${
          small ? "w-12 text-[11px]" : "w-14 text-xs"
        }`}
      >
        {label}
      </span>
      <div className="flex gap-1">
        {bits.map((b, i) => {
          const on = b === 1;
          const marked = i === markCol;
          const bg = on ? setColor : "color-mix(in srgb, var(--color-muted) 12%, white)";
          return (
            <div
              key={i}
              className={`flex items-center justify-center rounded-md font-mono font-bold tabular-nums ${
                small ? "h-6 w-6 text-[11px]" : "h-9 w-8 text-sm"
              }`}
              style={{
                background: bg,
                color: on ? "white" : "color-mix(in srgb, var(--color-muted) 70%, white)",
                outline: marked ? "2px solid var(--accent)" : "none",
                outlineOffset: "1px",
              }}
            >
              {b}
            </div>
          );
        })}
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
  newLabel,
}: {
  running: boolean;
  done: boolean;
  speedIdx: number;
  onToggle: () => void;
  onStep: () => void;
  onNew: () => void;
  onSpeed: (n: number) => void;
  newLabel: string;
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
        {newLabel}
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
