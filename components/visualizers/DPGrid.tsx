"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   DPGrid — a "watch the table fill" explainer for Dynamic Programming
   (Memoization), lesson id "dynamic-programming".

   The lesson's `big` is Fibonacci with memoization, so we animate the
   bottom-up Fibonacci table fib[0..N]. Each new cell is computed from the two
   prior cells it reads — fib[i] = fib[i-1] + fib[i-2] — and we highlight those
   two source cells as the recurrence pulls from them. The last cell is the
   final answer.

   Architecture mirrors SortVisualizer: the whole run is recorded up front as a
   flat op list, and everything visible is DERIVED from a single `step` counter
   by replaying ops in a useMemo. No setState is ever called in an effect body;
   autoplay advances `step` from inside a setTimeout callback.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "seed"; i: number; value: number }
  | { t: "compute"; i: number; value: number }
  | { t: "answer"; i: number };

type Recording = { ops: Op[]; n: number };

function recordFib(n: number): Recording {
  const ops: Op[] = [];
  const fib: number[] = [];
  // Base cases: the two sticky notes we start with.
  fib[0] = 0;
  ops.push({ t: "seed", i: 0, value: 0 });
  if (n >= 1) {
    fib[1] = 1;
    ops.push({ t: "seed", i: 1, value: 1 });
  }
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
    ops.push({ t: "compute", i, value: fib[i] });
  }
  ops.push({ t: "answer", i: n });
  return { ops, n };
}

const N_OPTIONS = [8, 9, 10, 11] as const;
const SPEEDS = [900, 620, 380, 220, 120] as const;

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

function pickN(seed: number): number {
  const rng = makeRng(seed);
  return N_OPTIONS[Math.floor(rng() * N_OPTIONS.length)];
}

/** Parse the N of the lesson's fib example from its code, e.g. fib(10) → 10.
 *  We match the first `fib(<number>)` call with a plain integer argument, so
 *  the recursive `fib(n - 1, memo)` calls are ignored. Returns null (→ no
 *  toggle, existing random behavior) if the code is missing or nothing sane
 *  parses out. */
function parseFibN(code: string | undefined): number | null {
  if (!code) return null;
  const match = code.match(/\bfib\(\s*(\d+)\s*\)/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isInteger(n) || n < 1 || n > 20) return null;
  return n;
}

export function DPGrid({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's full JavaScript source — the fib table binds to the N in it. */
  code?: string;
}) {
  // The N written in the lesson's own code (e.g. fib(10)), when it parses.
  const codeN = useMemo(() => parseFibN(code), [code]);
  const hasCodeData = codeN !== null;
  // Default to the lesson's own N when we have it, so the table matches the
  // code on the page; the learner can switch to a random N for variety.
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  // Stable seed → identical server/client first render (no hydration mismatch).
  const [seed, setSeed] = useState<number>(7);
  const n = useMemo(
    () => (useCode && hasCodeData ? (codeN as number) : pickN(seed)),
    [useCode, hasCodeData, codeN, seed],
  );
  const recording = useMemo(() => recordFib(n), [n]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [speedIdx, setSpeedIdx] = useState(2);

  const total = recording.ops.length;
  const done = step >= total;
  const running = playing && !done;

  // Derive the entire picture at `step` by replaying ops 0..step.
  const frame = useMemo(() => {
    const values: (number | null)[] = Array(recording.n + 1).fill(null);
    const filled = new Set<number>();
    let current: number | null = null;
    let sources: number[] = [];
    let answer: number | null = null;
    for (let k = 0; k < step; k++) {
      const op = recording.ops[k];
      current = null;
      sources = [];
      switch (op.t) {
        case "seed":
          values[op.i] = op.value;
          filled.add(op.i);
          current = op.i;
          break;
        case "compute":
          values[op.i] = op.value;
          filled.add(op.i);
          current = op.i;
          sources = [op.i - 1, op.i - 2];
          break;
        case "answer":
          answer = op.i;
          break;
      }
    }
    return { values, filled, current, sources, answer };
  }, [recording, step]);

  const { values, filled, current, sources, answer } = frame;

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

  const toggleSource = (next: boolean) => {
    reset();
    setUseCode(next);
  };

  const currentOp = step > 0 ? recording.ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp) return "Ready. Press play to fill the table one cell at a time.";
    switch (currentOp.t) {
      case "seed":
        return `Base case: fib(${currentOp.i}) = ${currentOp.value}. A known starting value.`;
      case "compute": {
        const a = values[currentOp.i - 1];
        const b = values[currentOp.i - 2];
        return `fib(${currentOp.i}) = fib(${currentOp.i - 1}) + fib(${
          currentOp.i - 2
        }) = ${a} + ${b} = ${currentOp.value}. Reads the two cells before it.`;
      }
      case "answer":
        return `Done. fib(${currentOp.i}) = ${values[currentOp.i]} — the final answer, built from every cell below it.`;
    }
  })();

  const cellState = (
    idx: number
  ): "answer" | "current" | "source" | "filled" | "empty" => {
    if (answer === idx) return "answer";
    if (current === idx) return "current";
    if (sources.includes(idx)) return "source";
    if (filled.has(idx)) return "filled";
    return "empty";
  };

  const cellBg: Record<string, string> = {
    answer: "var(--color-output)",
    current: "var(--accent)",
    source: "var(--color-primary)",
    filled: "color-mix(in srgb, var(--accent) 18%, white)",
    empty: "color-mix(in srgb, var(--color-muted) 12%, white)",
  };
  const cellFg: Record<string, string> = {
    answer: "white",
    current: "white",
    source: "white",
    filled: "var(--ink, #1a1c2b)",
    empty: "var(--color-muted, #5b6079)",
  };

  const answerVal = values[recording.n];

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the table fill</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Fibonacci DP
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The 1D fib table */}
      <div
        className="mt-4 overflow-x-auto rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Fibonacci dynamic-programming table up to index ${recording.n}, ${
          done ? "complete" : `${step} of ${total} steps`
        }`}
      >
        <div className="flex items-end justify-center gap-1.5">
          {values.map((v, idx) => {
            const st = cellState(idx);
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-11 w-9 items-center justify-center rounded-lg border border-line font-mono text-sm font-bold tabular-nums transition-colors sm:h-12 sm:w-10"
                  style={{
                    background: cellBg[st],
                    color: cellFg[st],
                    transform:
                      st === "current" || st === "source"
                        ? "translateY(-2px)"
                        : undefined,
                  }}
                >
                  {v === null ? "" : v}
                </div>
                <span className="dp-eyebrow text-[9px] text-muted">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Cells filled" value={`${filled.size}/${recording.n + 1}`} />
        <Stat label={`fib(${recording.n})`} value={answerVal === null ? "—" : answerVal} />
        <Stat label="Step" value={`${step}/${total}`} />
        <Stat label="Recurrence" value="i-1 + i-2" />
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
          disabled={useCode}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          ⤨ New input
        </button>

        {/* Data source: the lesson's own N vs a random one. */}
        {hasCodeData && (
          <div
            className="ml-auto inline-flex overflow-hidden rounded-pill border border-line text-xs font-semibold"
            role="group"
            aria-label="Data source"
          >
            <button
              type="button"
              onClick={() => toggleSource(true)}
              aria-pressed={useCode}
              className="px-3 py-2 transition-colors"
              style={
                useCode
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--color-muted)" }
              }
            >
              From code
            </button>
            <button
              type="button"
              onClick={() => toggleSource(false)}
              aria-pressed={!useCode}
              className="px-3 py-2 transition-colors"
              style={
                !useCode
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--color-muted)" }
              }
            >
              Random
            </button>
          </div>
        )}

        <label
          className={`flex items-center gap-2 text-xs font-semibold text-muted ${hasCodeData ? "" : "ml-auto"}`}
        >
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
        <LegendDot color="var(--accent)" label="Computing" />
        <LegendDot color="var(--color-primary)" label="Reads (i-1, i-2)" />
        <LegendDot color="var(--color-output)" label="Answer" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 12%, white)" label="Not filled yet" />
      </div>
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
