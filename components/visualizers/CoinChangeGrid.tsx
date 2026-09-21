"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   CoinChangeGrid — a "watch the table fill" explainer for Coin Change
   (Minimum Coins), lesson id "coin-change-min-coins".

   Faithful to the lesson's bottom-up recurrence over amounts 0..N:
     • dp[0] = 0 (zero coins make zero).
     • for every amount i from 1..N, try each coin: if coin <= i, then
       dp[i] = min(dp[i], dp[i - coin] + 1).
   We animate one coin-attempt at a time, highlighting the source cell
   dp[i - coin] the recurrence reads, and whether that attempt improved dp[i].
   Unreachable amounts stay ∞ (the "impossible" case). dp[N] is the answer.

   Architecture mirrors SortVisualizer: record the run as a flat op list, derive
   everything from a single `step` counter in a useMemo, no setState in effects.
   ──────────────────────────────────────────────────────────────────────── */

const INF = Infinity;

type Op =
  | { t: "seed" } // dp[0] = 0
  | {
      t: "try";
      i: number;
      coin: number;
      source: number; // i - coin
      sourceVal: number; // dp[source]
      candidate: number; // sourceVal + 1
      accepted: boolean;
      newVal: number; // dp[i] after this attempt
    }
  | { t: "settle"; i: number };

type Recording = {
  ops: Op[];
  coins: number[];
  amount: number;
  dp: number[];
};

function recordCoinChange(amount: number, coins: number[]): Recording {
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  const ops: Op[] = [];
  ops.push({ t: "seed" });

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        const sourceVal = dp[i - coin];
        const candidate = sourceVal + 1;
        const accepted = candidate < dp[i];
        if (accepted) dp[i] = candidate;
        ops.push({
          t: "try",
          i,
          coin,
          source: i - coin,
          sourceVal,
          candidate,
          accepted,
          newVal: dp[i],
        });
      }
    }
    ops.push({ t: "settle", i });
  }

  return { ops, coins: [...coins], amount, dp: [...dp] };
}

// Seeded configs — amount <= 11 so the array fits 375px. Includes the classic
// [1,3,4]→6 (greedy fails) and an impossible case ([2,5]→9 leaves odd gaps? no —
// use [3,7]→5 which is genuinely impossible) to show the ∞ / impossible result.
const CONFIGS: Array<{ coins: number[]; amount: number }> = [
  { coins: [1, 3, 4], amount: 6 },
  { coins: [1, 2, 5], amount: 11 },
  { coins: [2, 5], amount: 11 },
  { coins: [3, 7], amount: 5 },
];

const SPEEDS = [700, 480, 300, 170, 90] as const;

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

function pickConfig(seed: number): { coins: number[]; amount: number } {
  const rng = makeRng(seed);
  return CONFIGS[Math.floor(rng() * CONFIGS.length)];
}

function fmt(v: number): string {
  return v === INF ? "∞" : String(v);
}

export function CoinChangeGrid({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(1);
  const config = useMemo(() => pickConfig(seed), [seed]);
  const recording = useMemo(
    () => recordCoinChange(config.amount, config.coins),
    [config]
  );

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(2);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = recording.ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const dp: number[] = new Array(recording.amount + 1).fill(INF);
    const settled = new Set<number>();
    let current: number | null = null;
    let source: number | null = null;
    let attempts = 0;
    for (let k = 0; k < step; k++) {
      const op = recording.ops[k];
      current = null;
      source = null;
      switch (op.t) {
        case "seed":
          dp[0] = 0;
          settled.add(0);
          current = 0;
          break;
        case "try":
          dp[op.i] = op.newVal;
          current = op.i;
          source = op.source;
          attempts++;
          break;
        case "settle":
          settled.add(op.i);
          break;
      }
    }
    return { dp, settled, current, source, attempts };
  }, [recording, step]);

  const { dp, settled, current, source, attempts } = frame;

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

  const currentOp = step > 0 ? recording.ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp)
      return "Ready. Fill the table amount by amount, one coin at a time.";
    switch (currentOp.t) {
      case "seed":
        return "dp[0] = 0 — zero coins make zero. The rest start at ∞ (unknown).";
      case "try": {
        const src = `dp[${currentOp.source}]=${fmt(currentOp.sourceVal)}`;
        if (currentOp.sourceVal === INF) {
          return `Amount ${currentOp.i}, coin ${currentOp.coin}: ${src} is unreachable — skip.`;
        }
        return currentOp.accepted
          ? `Amount ${currentOp.i}, coin ${currentOp.coin}: ${src} + 1 = ${currentOp.candidate} — new best, dp[${currentOp.i}] = ${fmt(currentOp.newVal)}.`
          : `Amount ${currentOp.i}, coin ${currentOp.coin}: ${src} + 1 = ${currentOp.candidate} — not better than ${fmt(currentOp.newVal)}, keep it.`;
      }
      case "settle":
        return `dp[${currentOp.i}] = ${fmt(dp[currentOp.i])} — the fewest coins for amount ${currentOp.i}.`;
    }
  })();

  const answerVal = done ? recording.dp[recording.amount] : null;
  const answerText =
    answerVal === null ? "—" : answerVal === INF ? "impossible" : String(answerVal);

  const cellState = (
    idx: number
  ): "answer" | "current" | "source" | "settled" | "unreached" | "empty" => {
    if (done && idx === recording.amount) return "answer";
    if (current === idx) return "current";
    if (source === idx) return "source";
    if (settled.has(idx)) return dp[idx] === INF ? "unreached" : "settled";
    return "empty";
  };

  const cellBg: Record<string, string> = {
    answer: "var(--color-output)",
    current: "var(--accent)",
    source: "var(--color-primary)",
    settled: "color-mix(in srgb, var(--accent) 18%, white)",
    unreached: "color-mix(in srgb, var(--color-muted) 20%, white)",
    empty: "color-mix(in srgb, var(--color-muted) 10%, white)",
  };
  const cellFg: Record<string, string> = {
    answer: "white",
    current: "white",
    source: "white",
    settled: "var(--ink, #1a1c2b)",
    unreached: "var(--color-muted, #5b6079)",
    empty: "var(--color-muted, #5b6079)",
  };

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
          Coin change
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      <div
        className="mt-4 overflow-x-auto rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Coin-change dynamic-programming table for amount ${recording.amount} with coins ${recording.coins.join(", ")}, ${
          done ? "complete" : `${step} of ${total} steps`
        }`}
      >
        <div className="flex items-end justify-center gap-1.5">
          {dp.map((v, idx) => {
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
                  {fmt(v)}
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
        <Stat label="Coins" value={recording.coins.join(" ")} />
        <Stat label="Amount" value={recording.amount} />
        <Stat label="Attempts" value={attempts} />
        <Stat label="Min coins" value={answerText} />
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

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Computing dp[i]" />
        <LegendDot color="var(--color-primary)" label="Reads dp[i − coin]" />
        <LegendDot color="var(--color-output)" label="Answer" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 10%, white)" label="Not settled yet" />
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
