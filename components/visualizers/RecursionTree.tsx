"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   RecursionTree — "watch the calls stack and unwind" explainer for Recursion.

   Faithful to the lesson's example, factorial(n): a function that calls a
   smaller copy of itself until it hits the base case (n ≤ 1), then combines
   each smaller answer on the way back up (n × factorial(n − 1)).

   Every call and return is recorded up front as a self-describing op. Playback
   is derived purely from a single `step` counter (replaying ops 0..step in a
   useMemo), so it is deterministic, scrubbable and StrictMode-safe — no
   setState ever runs inside an effect body.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "call"; n: number }
  | { t: "base"; n: number }
  | { t: "return"; n: number; value: number; child: number };

function record(N: number): Op[] {
  const ops: Op[] = [];
  const fact = (n: number): number => {
    ops.push({ t: "call", n });
    if (n <= 1) {
      ops.push({ t: "base", n });
      return 1;
    }
    const child = fact(n - 1);
    const value = n * child;
    ops.push({ t: "return", n, value, child });
    return value;
  };
  fact(N);
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

/** A friendly n so the tree stays readable and the number stays small. */
function pickN(seed: number): number {
  return 4 + Math.floor(makeRng(seed)() * 3); // 4..6
}

const SPEEDS = [1100, 720, 460, 260, 140] as const;

export function RecursionTree({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("recursion"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const N = useMemo(() => pickN(seed), [seed]);
  const ops = useMemo(() => record(N), [N]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  // Replay ops 0..step to rebuild the whole picture (pure + cheap).
  const frame = useMemo(() => {
    const called: number[] = [];
    const returned: Record<number, number> = {};
    const onStack = new Set<number>();
    let active = -1;
    let phase = "";
    let maxDepth = 0;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.t === "call") {
        called.push(op.n);
        onStack.add(op.n);
        active = op.n;
        phase = "call";
      } else if (op.t === "base") {
        returned[op.n] = 1;
        onStack.delete(op.n);
        active = op.n;
        phase = "base";
      } else {
        returned[op.n] = op.value;
        onStack.delete(op.n);
        active = op.n;
        phase = "return";
      }
      if (onStack.size > maxDepth) maxDepth = onStack.size;
    }
    return { called, returned, onStack, active, phase, maxDepth };
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

  const newNumber = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const currentOp = step > 0 ? ops[step - 1] : undefined;
  const result = frame.returned[N];

  const caption = (() => {
    if (!currentOp)
      return `Press play. We compute factorial(${N}) by calling a smaller copy of itself each time.`;
    if (currentOp.t === "call")
      return currentOp.n <= 1
        ? `factorial(${currentOp.n}) — this is the base case (n ≤ 1). Stop diving.`
        : `factorial(${currentOp.n}) is called; it needs factorial(${currentOp.n - 1}) first. The stack grows.`;
    if (currentOp.t === "base")
      return `Base case: factorial(${currentOp.n}) returns 1. Now the calls unwind back up.`;
    return `factorial(${currentOp.n}) = ${currentOp.n} × ${currentOp.child} = ${currentOp.value}. Returned up the stack.`;
  })();

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the call stack</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          factorial({N})
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Recursion call tree for factorial of ${N}; ${
          done ? `result ${result}` : `step ${step} of ${total}`
        }`}
      >
        <div className="flex flex-col gap-1.5">
          {frame.called.length === 0 && (
            <div className="py-6 text-center text-sm text-muted">
              factorial({N}) is ready to run.
            </div>
          )}
          {frame.called.map((n, i) => {
            const isActive = n === frame.active;
            const isReturned = frame.returned[n] !== undefined;
            const isWaiting = frame.onStack.has(n);
            let bg = "color-mix(in srgb, var(--color-muted) 12%, white)";
            let outline = "none";
            if (isReturned) bg = "color-mix(in srgb, var(--color-output) 20%, white)";
            else if (isWaiting) bg = "color-mix(in srgb, var(--color-primary) 16%, white)";
            if (isActive) outline = "2px solid var(--accent)";
            const depth = N - n;
            return (
              <div
                key={`${n}-${i}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                style={{
                  marginLeft: `${Math.min(depth, 6) * 16}px`,
                  background: bg,
                  outline,
                  outlineOffset: "-2px",
                  borderLeft: "3px solid color-mix(in srgb, var(--color-muted) 30%, white)",
                }}
              >
                <span className="font-mono font-semibold text-ink">factorial({n})</span>
                <span className="ml-auto font-mono text-xs">
                  {isReturned ? (
                    <span style={{ color: "var(--color-output)" }} className="font-bold">
                      → {frame.returned[n]}
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-primary)" }}>waiting…</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Stack depth" value={frame.onStack.size} />
        <Stat label="Calls made" value={frame.called.length} />
        <Stat label="Result" value={result === undefined ? "—" : result} />
        <Stat label="Step" value={`${step}/${total}`} />
      </div>

      <Controls
        running={running}
        done={done}
        speedIdx={speedIdx}
        onToggle={togglePlay}
        onStep={stepForward}
        onNew={newNumber}
        onSpeed={setSpeedIdx}
        newLabel="⤨ New number"
      />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Current call" />
        <LegendDot color="color-mix(in srgb, var(--color-primary) 16%, white)" label="Waiting on the stack" />
        <LegendDot color="color-mix(in srgb, var(--color-output) 20%, white)" label="Returned a value" />
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
