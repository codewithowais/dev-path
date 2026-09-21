"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Sieve — "watch the primes emerge" explainer for the Sieve of Eratosthenes.

   Faithful to the lesson: write every number from 2 to N on a grid. Take the
   next number still standing as a prime, then cross out every multiple of it
   (it starts crossing at i × i, the lesson's speedup). Move to the next number
   still standing and repeat. Whatever survives is prime.

   Every "pick a prime" and "cross out a multiple" is recorded up front; the
   grid is derived purely from a single `step` counter, so playback is
   deterministic and no setState runs inside an effect body.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "pick"; n: number; hasMultiples: boolean }
  | { t: "cross"; n: number; by: number };

function record(N: number): Op[] {
  const ops: Op[] = [];
  const isPrime = new Array<boolean>(N + 1).fill(true);
  for (let i = 2; i <= N; i++) {
    if (!isPrime[i]) continue;
    ops.push({ t: "pick", n: i, hasMultiples: i * i <= N });
    for (let m = i * i; m <= N; m += i) {
      if (isPrime[m]) {
        isPrime[m] = false;
        ops.push({ t: "cross", n: m, by: i });
      }
    }
  }
  return ops;
}

function lessonSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

const LIMITS = [30, 40, 48] as const;

const SPEEDS = [900, 560, 340, 190, 90] as const;

export function Sieve({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  // Deterministic "new input": cycle the limit with a seeded index so the
  // first render matches on server and client (lesson default is 30).
  const [seed, setSeed] = useState<number>(() => lessonSeed("sieve-of-eratosthenes") % LIMITS.length);
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const N = LIMITS[seed % LIMITS.length];
  const ops = useMemo(() => record(N), [N]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const picked = new Set<number>();
    const crossed = new Set<number>();
    let activePrime = -1;
    let activeCross = -1;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.t === "pick") {
        picked.add(op.n);
        activePrime = op.n;
        activeCross = -1;
      } else {
        crossed.add(op.n);
        activePrime = op.by;
        activeCross = op.n;
      }
    }
    return { picked, crossed, activePrime, activeCross };
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

  const caption = (() => {
    if (!currentOp)
      return `Every number from 2 to ${N} starts as a candidate. Press play to sieve out the composites.`;
    if (currentOp.t === "pick")
      return currentOp.hasMultiples
        ? `${currentOp.n} is still standing — mark it prime, then cross out its multiples.`
        : `${currentOp.n} is still standing and prime. No multiples ≤ ${N} left to cross.`;
    return `${currentOp.by} × ${currentOp.n / currentOp.by} = ${currentOp.n} — cross it out, it can't be prime.`;
  })();

  const cells: number[] = [];
  for (let i = 2; i <= N; i++) cells.push(i);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the primes emerge</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Sieve up to {N}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper p-3"
        role="img"
        aria-label={`Sieve of Eratosthenes up to ${N}; ${
          done ? `${frame.picked.size} primes found` : `step ${step} of ${total}`
        }`}
      >
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
          {cells.map((num) => {
            const isPrime = frame.picked.has(num);
            const isCrossed = frame.crossed.has(num);
            const isActiveCross = num === frame.activeCross;
            const isActivePrime = num === frame.activePrime && num !== frame.activeCross;

            let bg = "color-mix(in srgb, var(--color-muted) 10%, white)";
            let color = "var(--color-ink)";
            let outline = "none";
            if (isActiveCross) {
              bg = "var(--accent)";
              color = "white";
            } else if (isCrossed) {
              bg = "color-mix(in srgb, var(--color-muted) 8%, white)";
              color = "color-mix(in srgb, var(--color-muted) 70%, white)";
            } else if (isPrime) {
              bg = "color-mix(in srgb, var(--color-output) 22%, white)";
              color = "var(--color-ink)";
            }
            if (isActivePrime) outline = "2px solid var(--color-primary)";

            return (
              <div
                key={num}
                className="flex aspect-square items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums sm:text-sm"
                style={{
                  background: bg,
                  color,
                  outline,
                  outlineOffset: "-2px",
                  textDecoration: isCrossed && !isActiveCross ? "line-through" : "none",
                }}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {done ? `Done. The numbers still standing are the primes up to ${N}.` : caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Primes found" value={frame.picked.size} />
        <Stat label="Crossed out" value={frame.crossed.size} />
        <Stat
          label="Current prime"
          value={frame.activePrime > 0 ? frame.activePrime : "—"}
        />
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
        newLabel="⤨ New limit"
      />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Crossing out now" />
        <LegendDot color="var(--color-primary)" label="Current prime" />
        <LegendDot color="color-mix(in srgb, var(--color-output) 22%, white)" label="Prime" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 10%, white)" label="Still standing" />
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
