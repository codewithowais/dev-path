"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   BinarySearchAnswer — a "watch it guess the answer" explainer for binary
   search on the answer.

   There is no sorted list here — only a RANGE of candidate answers on a number
   line. We use the classic package-shipping problem from the lesson: given a
   list of package weights that must ship within D days, what is the smallest
   daily ship CAPACITY that works? Small capacities fail, large ones succeed, so
   feasibility is monotonic — which is exactly what lets us binary search the
   capacity itself. Each step tests the midpoint capacity with a fast greedy
   feasibility check (how many days that capacity needs) and throws away the
   half that cannot hold the boundary. It narrows to the smallest capacity that
   still works.

   Same engine as SortVisualizer: the run is recorded up front, then replayed
   purely from a `step` counter. No setState in any effect body; motion is
   disabled globally under prefers-reduced-motion.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "test"; lo: number; hi: number; mid: number; days: number; feasible: boolean }
  | { t: "answer"; value: number };

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

type Problem = { weights: number[]; days: number; lo0: number; hi0: number };

function buildProblem(seed: number): Problem {
  const rng = makeRng(seed);
  const n = 8 + Math.floor(rng() * 3); // 8..10 packages
  const weights: number[] = [];
  for (let i = 0; i < n; i++) weights.push(2 + Math.floor(rng() * 9)); // 2..10
  const days = 3 + Math.floor(rng() * 3); // 3..5 days
  const lo0 = Math.max(...weights); // must fit the heaviest package
  const hi0 = weights.reduce((a, b) => a + b, 0); // one day fits everything
  return { weights, days, lo0, hi0 };
}

/** Greedy feasibility: how many days does this capacity need? */
function daysNeeded(weights: number[], capacity: number): number {
  let days = 1;
  let load = 0;
  for (const w of weights) {
    if (load + w > capacity) {
      days++;
      load = 0;
    }
    load += w;
  }
  return days;
}

function record(p: Problem): Op[] {
  const ops: Op[] = [];
  let lo = p.lo0;
  let hi = p.hi0;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const need = daysNeeded(p.weights, mid);
    const feasible = need <= p.days;
    ops.push({ t: "test", lo, hi, mid, days: need, feasible });
    if (feasible) hi = mid; // works → try smaller
    else lo = mid + 1; // too small → need more room
  }
  ops.push({ t: "answer", value: lo });
  return ops;
}

const SPEEDS = [1100, 720, 460, 260, 130] as const;

export function BinarySearchAnswer({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("binary-search-on-answer"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const problem = useMemo(() => buildProblem(seed), [seed]);
  const ops = useMemo(() => record(problem), [problem]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    let lo = problem.lo0;
    let hi = problem.hi0;
    let mid: number | null = null;
    let feasible: boolean | null = null;
    let midDays: number | null = null;
    let answer: number | null = null;
    let tests = 0;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.t === "test") {
        lo = op.lo;
        hi = op.hi;
        mid = op.mid;
        feasible = op.feasible;
        midDays = op.days;
        tests++;
        // Reflect the narrowing that this test triggers, so the window shown
        // matches what the next guess will search.
        if (op.feasible) hi = op.mid;
        else lo = op.mid + 1;
      } else {
        answer = op.value;
        mid = op.value;
        feasible = true;
      }
    }
    return { lo, hi, mid, feasible, midDays, answer, tests };
  }, [ops, problem, step]);

  const { lo, hi, mid, feasible, midDays, answer, tests } = frame;

  useEffect(() => {
    if (!running) return;
    if (runStartRef.current == null) runStartRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, total));
    }, SPEEDS[speedIdx]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, step, speedIdx, total]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (runStartRef.current != null) {
        setElapsed(performance.now() - runStartRef.current);
      }
    }, 60);
    return () => clearInterval(id);
  }, [running]);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

  const togglePlay = () => {
    if (done) {
      setStep(0);
      setElapsed(0);
      runStartRef.current = null;
      requestAnimationFrame(() => setPlaying(true));
      return;
    }
    setPlaying((p) => !p);
  };

  const stepForward = () => {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, total));
  };

  const newProblem = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const currentOp = step > 0 ? ops[step - 1] : undefined;

  const caption = (() => {
    if (!currentOp)
      return `Which is the smallest capacity to ship every package within ${problem.days} days? Binary-search the capacity itself.`;
    if (currentOp.t === "answer")
      return `Range collapsed. The smallest capacity that ships within ${problem.days} days is ${currentOp.value}.`;
    return currentOp.feasible
      ? `Capacity ${currentOp.mid} → needs ${currentOp.days} day(s) ≤ ${problem.days}. Works! Try smaller — keep the lower half.`
      : `Capacity ${currentOp.mid} → needs ${currentOp.days} day(s) > ${problem.days}. Too small — keep the upper half.`;
  })();

  // Number-line positions across the ORIGINAL range.
  const span = Math.max(1, problem.hi0 - problem.lo0);
  const pctOf = (v: number) => `${((v - problem.lo0) / span) * 100}%`;

  // Day-packing preview for the current mid capacity (faithful to the check).
  const packing = useMemo(() => {
    if (mid == null) return null;
    const cap = mid;
    const days: number[][] = [[]];
    let load = 0;
    for (const w of problem.weights) {
      if (load + w > cap) {
        days.push([]);
        load = 0;
      }
      days[days.length - 1].push(w);
      load += w;
    }
    return days;
  }, [mid, problem.weights]);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it guess</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Binary search on the answer
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          Ship in&nbsp;{problem.days}&nbsp;days
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Binary search on the answer over capacities ${problem.lo0} to ${problem.hi0}; ${
          answer != null ? `answer ${answer}` : mid != null ? `testing capacity ${mid}` : `step ${step} of ${total}`
        }`}
      >
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">
          Candidate capacities {problem.lo0}…{problem.hi0}
        </div>

        {/* Number line */}
        <div className="relative mt-6 h-8">
          {/* full track (eliminated background) */}
          <div
            className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
            style={{ background: "color-mix(in srgb, var(--color-muted) 16%, white)" }}
          />
          {/* live window lo..hi */}
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
            style={{
              left: pctOf(lo),
              width: `${((hi - lo) / span) * 100}%`,
              background: answer != null ? "var(--color-output)" : "color-mix(in srgb, var(--accent) 40%, white)",
            }}
          />
          {/* mid / answer marker */}
          {mid != null && (
            <div
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: pctOf(mid) }}
            >
              <span
                className="rounded px-1 font-mono text-[10px] font-bold text-white"
                style={{
                  background: answer != null ? "var(--color-output)" : "var(--color-primary)",
                }}
              >
                {mid}
              </span>
              <span
                className="mt-0.5 h-6 w-0.5"
                style={{
                  background: answer != null ? "var(--color-output)" : "var(--color-primary)",
                }}
              />
            </div>
          )}
          {/* lo & hi labels */}
          <span className="absolute -bottom-5 -translate-x-1/2 font-mono text-[10px] text-muted" style={{ left: pctOf(lo) }}>
            {lo}
          </span>
          <span className="absolute -bottom-5 -translate-x-1/2 font-mono text-[10px] text-muted" style={{ left: pctOf(hi) }}>
            {hi}
          </span>
        </div>

        {/* Feasibility check preview: pack weights into days at capacity mid */}
        <div className="mt-8">
          <div className="dp-eyebrow mb-1.5 text-[10px] text-muted">
            Feasibility check{mid != null ? ` — capacity ${mid}` : ""}
            {midDays != null && (
              <span
                className="ml-2 font-mono"
                style={{
                  color: feasible ? "var(--color-output)" : "var(--color-primary)",
                }}
              >
                needs {midDays} day{midDays === 1 ? "" : "s"} {feasible ? "≤" : ">"} {problem.days}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {packing ? (
              packing.map((day, di) => (
                <div
                  key={di}
                  className="flex items-center gap-0.5 rounded-lg border px-1 py-0.5"
                  style={{
                    borderColor:
                      di + 1 <= problem.days
                        ? "color-mix(in srgb, var(--accent) 30%, white)"
                        : "var(--color-primary)",
                  }}
                >
                  {day.map((w, wi) => (
                    <span
                      key={wi}
                      className="flex h-5 items-center justify-center rounded font-mono text-[10px] font-bold text-white"
                      style={{
                        width: `${10 + w * 2}px`,
                        background:
                          di + 1 <= problem.days
                            ? "color-mix(in srgb, var(--accent) 60%, white)"
                            : "var(--color-primary)",
                      }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              ))
            ) : (
              <span className="text-xs text-muted">Press play to test the first midpoint capacity.</span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Low" value={lo} />
        <Stat label="High" value={hi} />
        <Stat label={answer != null ? "Answer" : "Guess"} value={mid ?? "—"} />
        <Stat label="Tests" value={tests} />
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
          onClick={newProblem}
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

        <span className="font-mono text-[11px] text-muted">
          {(elapsed / 1000).toFixed(1)}s
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="color-mix(in srgb, var(--accent) 40%, white)" label="Live range" />
        <LegendDot color="var(--color-primary)" label="Midpoint guess" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 16%, white)" label="Eliminated" />
        <LegendDot color="var(--color-output)" label="Answer" />
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
