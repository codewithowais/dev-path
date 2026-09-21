"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   BoyerMoore — a "watch the votes cancel" explainer for the Boyer-Moore
   majority vote algorithm.

   One sweep, one candidate, one count. When the count hits zero we adopt the
   current item as the new candidate. Then every matching vote adds one and
   every differing vote subtracts one — pairing a leader off against a
   challenger. Because the true majority appears more than half the time, it is
   the only value that can still be standing at the end.

   Same engine as SortVisualizer: the run is recorded up front, then replayed
   purely from a `step` counter. No setState in any effect body; motion is
   disabled globally under prefers-reduced-motion.
   ──────────────────────────────────────────────────────────────────────── */

type Op = { t: "visit"; i: number } | { t: "done" };

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

const N = 13;
const VALUES = [1, 2, 3] as const; // three "parties" to vote for

/** Build a list that genuinely HAS a majority (>half), then seeded-shuffle it,
 *  so the algorithm's precondition holds and the answer is well defined. */
function buildVotes(seed: number): number[] {
  const rng = makeRng(seed);
  const majority = VALUES[Math.floor(rng() * VALUES.length)];
  const majCount = Math.floor(N / 2) + 1 + Math.floor(rng() * 2); // strictly > half
  const arr: number[] = [];
  for (let i = 0; i < majCount; i++) arr.push(majority);
  const others = VALUES.filter((v) => v !== majority);
  while (arr.length < N) arr.push(others[Math.floor(rng() * others.length)]);
  // Fisher–Yates shuffle so the majority is scattered, not clumped.
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function record(votes: number[]): Op[] {
  const ops: Op[] = [];
  for (let i = 0; i < votes.length; i++) ops.push({ t: "visit", i });
  ops.push({ t: "done" });
  return ops;
}

/** A stable colour per value so a token's "party" reads at a glance. */
const VALUE_COLOR: Record<number, string> = {
  1: "var(--accent)",
  2: "var(--color-primary)",
  3: "var(--color-output)",
};
const VALUE_TINT: Record<number, string> = {
  1: "color-mix(in srgb, var(--accent) 22%, white)",
  2: "color-mix(in srgb, var(--color-primary) 22%, white)",
  3: "color-mix(in srgb, var(--color-output) 22%, white)",
};

const SPEEDS = [720, 460, 280, 160, 80] as const;

export function BoyerMoore({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => lessonSeed("boyer-moore-majority-vote"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);

  const votes = useMemo(() => buildVotes(seed), [seed]);
  const ops = useMemo(() => record(votes), [votes]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    let candidate: number | null = null;
    let count = 0;
    let active: number | null = null;
    let becameCandidate = false;
    let matched = false;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.t !== "visit") continue;
      active = op.i;
      if (count === 0) {
        candidate = votes[op.i];
        becameCandidate = true;
      } else {
        becameCandidate = false;
      }
      matched = votes[op.i] === candidate;
      count += matched ? 1 : -1;
    }
    return { candidate, count, active, becameCandidate, matched };
  }, [ops, step, votes]);

  const { candidate, count, active, becameCandidate, matched } = frame;

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

  const newVotes = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const currentOp = step > 0 ? ops[step - 1] : undefined;

  const caption = (() => {
    if (!currentOp) return "One candidate, one count. Press play to cancel votes down to the majority.";
    if (currentOp.t === "done")
      return `Last one standing: ${candidate}. That is the majority — it appears more than half the time.`;
    const v = votes[currentOp.i];
    if (becameCandidate)
      return `Count was 0 → adopt ${v} as the new candidate, then count becomes 1.`;
    return matched
      ? `${v} matches the candidate → +1 vote, count is now ${count}.`
      : `${v} differs → cancel one vote, count is now ${count}.`;
  })();

  // The winner (majority) — used only to celebrate at the end.
  const winner = useMemo(() => {
    const tally = new Map<number, number>();
    for (const v of votes) tally.set(v, (tally.get(v) ?? 0) + 1);
    let best = votes[0];
    let bestN = 0;
    tally.forEach((n, v) => {
      if (n > bestN) {
        bestN = n;
        best = v;
      }
    });
    return best;
  }, [votes]);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch votes cancel</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Boyer-Moore majority
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Boyer-Moore majority vote over ${votes.length} votes; ${
          done ? `majority is ${candidate}` : `step ${step} of ${total}`
        }`}
      >
        {/* Candidate + count readout */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="dp-eyebrow text-[10px] text-muted">Candidate</span>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-lg font-bold text-white transition-transform"
              style={{
                background: candidate == null ? "color-mix(in srgb, var(--color-muted) 30%, white)" : VALUE_COLOR[candidate],
                transform: becameCandidate ? "scale(1.08)" : undefined,
              }}
            >
              {candidate ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="dp-eyebrow text-[10px] text-muted">Count</span>
            <div className="flex items-end gap-0.5">
              {Array.from({ length: Math.max(1, count) }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-sm"
                  style={{
                    height: `${10 + i * 3}px`,
                    background: candidate == null ? "var(--color-muted)" : VALUE_COLOR[candidate],
                    opacity: count === 0 ? 0.25 : 1,
                  }}
                />
              ))}
              <span
                className="ml-1 font-mono text-lg font-bold tabular-nums"
                style={{ color: count === 0 ? "var(--color-muted)" : "var(--color-ink)" }}
              >
                {count}
              </span>
            </div>
          </div>
        </div>

        {/* The votes row */}
        <div className="mt-4 flex flex-wrap justify-center gap-[3px] sm:gap-1.5">
          {votes.map((v, idx) => {
            const isActive = active === idx;
            const visited = active != null && idx <= active && !isActive;
            const isCandidateColor = candidate === v;
            return (
              <div
                key={idx}
                className="dp-bar flex h-9 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold sm:w-8"
                style={{
                  background: isActive
                    ? VALUE_COLOR[v]
                    : isCandidateColor && visited
                      ? VALUE_TINT[v]
                      : VALUE_TINT[v],
                  color: isActive ? "white" : "var(--color-ink)",
                  outline: isActive ? "2px solid var(--color-ink)" : undefined,
                  outlineOffset: isActive ? "1px" : undefined,
                  opacity: visited && !isCandidateColor ? 0.5 : 1,
                  transform: isActive ? "translateY(-3px)" : undefined,
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Candidate" value={candidate ?? "—"} />
        <Stat label="Count" value={count} />
        <Stat label="Majority" value={done ? winner : "—"} />
        <Stat label="Step" value={`${step}/${total}`} />
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
          onClick={newVotes}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤨ New votes
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
        <LegendDot color="var(--color-ink)" label="Now voting" />
        <LegendDot color={VALUE_COLOR[1]} label="Value 1" />
        <LegendDot color={VALUE_COLOR[2]} label="Value 2" />
        <LegendDot color={VALUE_COLOR[3]} label="Value 3" />
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
