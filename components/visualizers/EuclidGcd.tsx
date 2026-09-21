"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   EuclidGcd — "watch the pair shrink" explainer for Euclid's GCD.

   Faithful to the lesson: take two numbers a and b, look at the remainder of
   a ÷ b, then replace the pair with (b, remainder). Repeat until the remainder
   hits 0 — the last non-zero divisor is the greatest common divisor.

   Following the lesson's rope analogy, each number is drawn as a bar. On every
   step we show how many whole copies of b fit inside a (the quotient blocks)
   and the leftover remainder — the piece that becomes the next divisor.

   The full run is recorded up front; playback is derived purely from a single
   `step` counter, so no setState ever runs inside an effect body.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "mod"; a: number; b: number; q: number; r: number }
  | { t: "done"; gcd: number };

function record(a0: number, b0: number): Op[] {
  const ops: Op[] = [];
  let x = a0;
  let y = b0;
  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    ops.push({ t: "mod", a: x, b: y, q, r });
    x = y;
    y = r;
  }
  ops.push({ t: "done", gcd: x });
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

/** Two numbers 12..96, larger first, so the first divide is meaningful. */
function pickPair(seed: number): [number, number] {
  const rng = makeRng(seed);
  const x = 12 + Math.floor(rng() * 85);
  const y = 12 + Math.floor(rng() * 85);
  return x >= y ? [x, y] : [y, x];
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function EuclidGcd({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  // Default seed lands on the lesson's own example (48, 18) region;
  // any deterministic pair is fine for first paint.
  const [seed, setSeed] = useState<number>(() => lessonSeed("euclids-gcd"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const [a0, b0] = useMemo(() => pickPair(seed), [seed]);
  const ops = useMemo(() => record(a0, b0), [a0, b0]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    let steps = 0;
    let gcd: number | null = null;
    for (let k = 0; k < step; k++) {
      if (ops[k].t === "mod") steps++;
      else gcd = (ops[k] as { gcd: number }).gcd;
    }
    return { steps, gcd };
  }, [ops, step]);

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
  const maxInit = Math.max(a0, b0, 1);

  // What pair to draw right now.
  const showDone = currentOp?.t === "done";
  const dispA = currentOp
    ? currentOp.t === "mod"
      ? currentOp.a
      : frame.gcd ?? a0
    : a0;
  const dispB = currentOp ? (currentOp.t === "mod" ? currentOp.b : 0) : b0;

  const caption = (() => {
    if (!currentOp)
      return `Find the GCD of ${a0} and ${b0}. Divide the larger by the smaller and read the remainder.`;
    if (currentOp.t === "mod")
      return `${currentOp.a} ÷ ${currentOp.b} = ${currentOp.q} remainder ${currentOp.r}. Replace the pair with (${currentOp.b}, ${currentOp.r}).`;
    return `The remainder reached 0 — the last divisor ${currentOp.gcd} is the GCD.`;
  })();

  // Quotient blocks for the a-bar (only shown for a reasonable count).
  const modOp = currentOp?.t === "mod" ? currentOp : null;
  const showBlocks = modOp !== null && modOp.q <= 12;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the pair shrink</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          gcd({a0}, {b0})
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-5"
        role="img"
        aria-label={`Euclid's algorithm on ${a0} and ${b0}; ${
          done ? `gcd ${frame.gcd}` : `step ${step} of ${total}`
        }`}
      >
        {showDone ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div
              className="h-9 rounded-lg"
              style={{
                width: `${Math.max((frame.gcd ?? 1) / maxInit, 0.04) * 100}%`,
                minWidth: "36px",
                background: "var(--color-output)",
              }}
            />
            <div className="font-mono text-lg font-bold" style={{ color: "var(--color-output)" }}>
              GCD = {frame.gcd}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* a-bar: broken into quotient blocks of b plus the remainder */}
            <BarRow label="a" value={dispA}>
              <div
                className="flex h-9 items-stretch gap-[2px] overflow-hidden rounded-lg"
                style={{ width: `${Math.max(dispA / maxInit, 0.04) * 100}%`, minWidth: "24px" }}
              >
                {showBlocks ? (
                  <>
                    {Array.from({ length: modOp!.q }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full flex-1"
                        style={{
                          background: "color-mix(in srgb, var(--color-primary) 40%, white)",
                        }}
                      />
                    ))}
                    {modOp!.r > 0 && (
                      <div
                        className="h-full"
                        style={{
                          flex: `0 0 ${(modOp!.r / dispA) * 100}%`,
                          background: "var(--accent)",
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="h-full w-full rounded-lg" style={{ background: "var(--accent)" }} />
                )}
              </div>
            </BarRow>

            {/* b-bar: the current divisor */}
            {dispB > 0 && (
              <BarRow label="b" value={dispB}>
                <div
                  className="h-9 rounded-lg"
                  style={{
                    width: `${Math.max(dispB / maxInit, 0.04) * 100}%`,
                    minWidth: "24px",
                    background: "color-mix(in srgb, var(--color-primary) 55%, white)",
                  }}
                />
              </BarRow>
            )}

            {modOp && (
              <div className="text-center font-mono text-sm text-ink">
                {modOp.a} = {modOp.q} × {modOp.b} + <span style={{ color: "var(--accent)" }}>{modOp.r}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="a" value={showDone ? frame.gcd ?? a0 : dispA} />
        <Stat label="b" value={showDone ? 0 : dispB} />
        <Stat label="Remainder" value={modOp ? modOp.r : "—"} />
        <Stat label="GCD" value={frame.gcd === null ? "—" : frame.gcd} />
      </div>

      <Controls
        running={running}
        done={done}
        speedIdx={speedIdx}
        onToggle={togglePlay}
        onStep={stepForward}
        onNew={newInput}
        onSpeed={setSpeedIdx}
        newLabel="⤨ New pair"
      />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="color-mix(in srgb, var(--color-primary) 40%, white)" label="Copies of b inside a" />
        <LegendDot color="var(--accent)" label="Remainder (next divisor)" />
        <LegendDot color="var(--color-output)" label="GCD" />
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  children,
}: {
  label: string;
  value: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 font-mono text-xs font-bold text-muted">{label}</span>
      {children}
      <span className="font-mono text-xs font-semibold text-ink">{value}</span>
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
