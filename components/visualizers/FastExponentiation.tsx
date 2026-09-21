"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   FastExponentiation — "watch it square and halve" explainer for computing
   a^n by repeated squaring (exponentiation by squaring).

   Faithful to the lesson's idea: instead of multiplying the base by itself n
   times, we repeatedly square the base and halve the exponent. Reading n in
   binary makes this exact — process one bit of n at a time (lowest first):
     • if the bit is 1, fold the current base into the running result
     • then square the base and shift the exponent right (halve it)
   The result accumulates from the bits that are set.

   The run is recorded up front and derived purely from a single `step`
   counter, so no setState runs inside an effect body.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "start" }
  | { t: "bit"; pos: number; bit: number; b: number; result: number }
  | { t: "square"; pos: number; oldB: number; newB: number; e: number }
  | { t: "done"; result: number };

function record(base: number, n: number): Op[] {
  const ops: Op[] = [{ t: "start" }];
  let result = 1;
  let b = base;
  let e = n;
  let pos = 0;
  while (e > 0) {
    const bit = e & 1;
    if (bit) result *= b;
    ops.push({ t: "bit", pos, bit, b, result });
    const oldB = b;
    b = b * b;
    e = e >>> 1;
    ops.push({ t: "square", pos, oldB, newB: b, e });
    pos++;
  }
  ops.push({ t: "done", result });
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

/** Small base and exponent so values stay legible (lesson uses 3^13). */
function pickInput(seed: number): [number, number] {
  const rng = makeRng(seed);
  const base = 2 + Math.floor(rng() * 4); // 2..5
  const n = 6 + Math.floor(rng() * 10); // 6..15
  return [base, n];
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function FastExponentiation({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("fast-exponentiation"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const [base, n] = useMemo(() => pickInput(seed), [seed]);
  const ops = useMemo(() => record(base, n), [base, n]);
  const bin = useMemo(() => n.toString(2), [n]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    let result = 1;
    let b = base;
    let e = n;
    let doneBits = 0;
    let activePos = -1;
    let phase = "start";
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.t === "bit") {
        result = op.result;
        b = op.b;
        activePos = op.pos;
        phase = op.bit ? "mul" : "skip";
      } else if (op.t === "square") {
        b = op.newB;
        e = op.e;
        activePos = op.pos;
        doneBits++;
        phase = "square";
      } else if (op.t === "done") {
        phase = "done";
      }
    }
    return { result, b, e, doneBits, activePos, phase };
  }, [ops, step, base, n]);

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

  const currentOp = step > 0 ? ops[step - 1] : undefined;

  const caption = (() => {
    if (!currentOp || currentOp.t === "start")
      return `Compute ${base}^${n}. In binary, ${n} = ${bin}. Start the result at 1 and the base at ${base}.`;
    if (currentOp.t === "bit")
      return currentOp.bit
        ? `This bit is 1 → multiply the result by the current base ${currentOp.b}. Result = ${currentOp.result}.`
        : `This bit is 0 → skip the multiply. Result stays ${currentOp.result}.`;
    if (currentOp.t === "square")
      return currentOp.e > 0
        ? `Square the base: ${currentOp.oldB}² = ${currentOp.newB}. Halve the exponent → ${currentOp.e}.`
        : `Square the base and halve the exponent → 0. Nothing left to process.`;
    return `${base}^${n} = ${currentOp.result}.`;
  })();

  // Binary cells: written MSB..LSB (as usual). Track which bit is active by
  // its distance from the right.
  const bitCells = bin.split("").map((c, i) => {
    const lsbPos = bin.length - 1 - i;
    return { char: c, lsbPos };
  });

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it square &amp; halve</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          {base}^{n}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-5"
        role="img"
        aria-label={`Fast exponentiation of ${base} to the ${n}; ${
          done ? `result ${frame.result}` : `step ${step} of ${total}`
        }`}
      >
        {/* n in binary — the bits drive the whole run */}
        <div className="mb-4 flex flex-col items-center gap-1.5">
          <span className="dp-eyebrow text-[10px] text-muted">exponent {n} in binary</span>
          <div className="flex items-center gap-1">
            {bitCells.map((cell, i) => {
              const isProcessed = cell.lsbPos < frame.doneBits;
              const isActive =
                cell.lsbPos === frame.activePos &&
                cell.lsbPos >= frame.doneBits &&
                frame.phase !== "done" &&
                frame.phase !== "start";
              const isOne = cell.char === "1";
              let bg = isOne
                ? "color-mix(in srgb, var(--color-primary) 20%, white)"
                : "color-mix(in srgb, var(--color-muted) 10%, white)";
              let color = "var(--color-ink)";
              let outline = "none";
              if (isProcessed) {
                bg = isOne
                  ? "color-mix(in srgb, var(--color-output) 24%, white)"
                  : "color-mix(in srgb, var(--color-muted) 6%, white)";
                color = "color-mix(in srgb, var(--color-muted) 65%, white)";
              }
              if (isActive) {
                bg = "var(--accent)";
                color = "white";
                outline = "2px solid var(--accent)";
              }
              return (
                <div
                  key={i}
                  className="flex h-8 w-7 items-center justify-center rounded-md font-mono text-sm font-bold tabular-nums"
                  style={{ background: bg, color, outline, outlineOffset: "1px" }}
                >
                  {cell.char}
                </div>
              );
            })}
          </div>
        </div>

        {/* The three moving quantities */}
        <div className="flex flex-wrap items-stretch justify-center gap-2">
          <Quantity label="base (squares)" value={frame.b} tint="var(--color-primary)" />
          <Quantity label="exponent (halves)" value={frame.e} tint="var(--color-muted)" />
          <Quantity
            label="result (accumulates)"
            value={frame.result}
            tint="var(--color-output)"
            highlight={frame.phase === "mul"}
          />
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Base" value={frame.b} />
        <Stat label="Exponent" value={frame.e} />
        <Stat label="Result" value={frame.result} />
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
        newLabel="⤨ New input"
      />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Bit being processed" />
        <LegendDot color="color-mix(in srgb, var(--color-primary) 20%, white)" label="Set bit (1)" />
        <LegendDot color="var(--color-output)" label="Folded into result" />
      </div>
    </div>
  );
}

function Quantity({
  label,
  value,
  tint,
  highlight = false,
}: {
  label: string;
  value: number;
  tint: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex min-w-[92px] flex-1 flex-col items-center rounded-lg px-3 py-2"
      style={{
        background: `color-mix(in srgb, ${tint} 12%, white)`,
        outline: highlight ? `2px solid ${tint}` : "none",
        outlineOffset: "-2px",
      }}
    >
      <span className="font-mono text-lg font-bold tabular-nums text-ink">{value}</span>
      <span className="dp-eyebrow mt-0.5 text-[9px] text-muted">{label}</span>
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
