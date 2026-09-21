"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   GreedyCoinChange — a "watch it grab" explainer for greedy coin change.

   Like a cashier making change, it always grabs the biggest coin that still
   fits into what's left, over and over, before moving to the next-smaller
   coin. The remaining amount shrinks toward zero, the picked coins pile up,
   and a per-denomination tally shows how many of each got used.

   Faithful to the lesson's sort-largest-first, take-while-it-fits loop. The
   whole run is recorded up front as frames and replayed from a single `step`
   index — deterministic, scrubbable, StrictMode-safe. The only state that
   changes during playback is `step` (a setTimeout functional update) and
   `elapsed` (a setInterval). Motion is disabled under prefers-reduced-motion
   (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Kind = "start" | "consider" | "take" | "skip" | "done";
type Frame = {
  coinIdx: number; // denomination being considered (-1 = none)
  picked: number[]; // coin values grabbed so far, in order
  remaining: number;
  kind: Kind;
  caption: string;
};

function buildFrames(amount: number, coins: number[]): Frame[] {
  const frames: Frame[] = [];
  const picked: number[] = [];
  let remaining = amount;

  frames.push({
    coinIdx: -1,
    picked: [],
    remaining,
    kind: "start",
    caption: `Make ${amount} with as few coins as possible — try the largest coins first.`,
  });

  for (let idx = 0; idx < coins.length; idx++) {
    const coin = coins[idx];
    frames.push({
      coinIdx: idx,
      picked: [...picked],
      remaining,
      kind: "consider",
      caption: `Consider the ${coin} coin — does it fit into ${remaining}?`,
    });
    if (remaining < coin) {
      frames.push({
        coinIdx: idx,
        picked: [...picked],
        remaining,
        kind: "skip",
        caption: `${coin} is larger than ${remaining} left — skip to the next-smaller coin.`,
      });
      continue;
    }
    while (remaining >= coin) {
      picked.push(coin);
      remaining -= coin;
      frames.push({
        coinIdx: idx,
        picked: [...picked],
        remaining,
        kind: "take",
        caption: `Take a ${coin}. ${remaining} still to make.`,
      });
    }
  }

  frames.push({
    coinIdx: -1,
    picked: [...picked],
    remaining: 0,
    kind: "done",
    caption: `Done — ${picked.length} coins: ${picked.join(" + ")} = ${amount}.`,
  });

  return frames;
}

/** Deterministic PRNG (mulberry32) so the demo can pick a stable case. */
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

/** Canonical coin systems (largest first) where greedy gives the true best. */
const COIN_SETS: readonly number[][] = [
  [25, 10, 5, 1],
  [50, 25, 10, 5, 1],
  [20, 10, 5, 1],
  [25, 5, 1],
];

const SPEEDS = [900, 620, 400, 240, 120] as const;

export function GreedyCoinChange({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(0);

  const { amount, coins } = useMemo(() => {
    const rng = makeRng(seed + 3);
    const set = COIN_SETS[Math.floor(rng() * COIN_SETS.length) % COIN_SETS.length];
    const amt = 37 + Math.floor(rng() * 62); // 37..98
    return { amount: amt, coins: set };
  }, [seed]);

  const frames = useMemo(() => buildFrames(amount, coins), [amount, coins]);
  const total = frames.length;

  const [step, setStep] = useState(0); // frame index
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = step >= total - 1;
  const running = playing && !done;

  useEffect(() => {
    if (!running) return;
    if (runStartRef.current == null) runStartRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, total - 1));
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
    setStep((s) => Math.min(s + 1, total - 1));
  };

  const newInput = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
    setSeed((s) => s + 1);
  };

  const f = frames[Math.min(step, total - 1)];
  const counts = coins.map((c) => f.picked.filter((p) => p === c).length);
  const pct = Math.max(0, Math.min(100, (f.remaining / amount) * 100));
  const lastTakeIdx = f.kind === "take" ? f.picked.length - 1 : -1;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it grab</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Greedy coin change
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          amount {amount}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* Remaining amount + shrinking bar */}
      <div
        className="mt-3 rounded-xl bg-paper px-4 py-4"
        role="img"
        aria-label={`Greedy coin change for ${amount}. Remaining ${f.remaining}. ${f.caption}`}
      >
        <div className="flex items-baseline justify-between">
          <span className="dp-eyebrow text-muted">Remaining</span>
          <span
            className="font-mono text-3xl font-bold tabular-nums"
            style={{ color: f.remaining === 0 ? "var(--color-output)" : "var(--accent)" }}
          >
            {f.remaining}
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--color-muted) 14%, white)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: f.remaining === 0 ? "var(--color-output)" : "var(--accent)",
              transition: "width 240ms ease",
            }}
          />
        </div>

        {/* Denominations with running tally */}
        <div className="mt-4 flex flex-wrap gap-2">
          {coins.map((c, idx) => {
            const active = f.coinIdx === idx && f.kind !== "done";
            const usedUp = f.coinIdx > idx || (f.kind === "done");
            return (
              <div
                key={c}
                className="flex flex-col items-center gap-1 rounded-xl border px-3 py-2"
                style={{
                  borderColor: active
                    ? "var(--accent)"
                    : "var(--color-line)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 12%, white)"
                    : "var(--color-card)",
                  opacity: usedUp && counts[idx] === 0 ? 0.5 : 1,
                  transition: "background 180ms, border-color 180ms, opacity 180ms",
                }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm font-bold"
                  style={{
                    background: active ? "var(--accent)" : "color-mix(in srgb, var(--accent) 16%, white)",
                    color: active ? "#fff" : "var(--color-ink)",
                  }}
                >
                  {c}
                </span>
                <span className="font-mono text-[11px] font-semibold text-muted">×{counts[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coins picked */}
      <div className="mt-3">
        <div className="dp-eyebrow mb-1.5 text-muted">Coins picked</div>
        <div className="flex min-h-[32px] flex-wrap gap-1.5">
          {f.picked.length === 0 && <span className="text-sm text-muted">—</span>}
          {f.picked.map((c, i) => (
            <span
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
              style={{
                background: i === lastTakeIdx ? "var(--accent)" : "var(--color-output)",
                boxShadow: i === lastTakeIdx ? "0 0 0 3px color-mix(in srgb, var(--accent) 28%, white)" : undefined,
                transition: "background 180ms",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Commentary */}
      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {f.caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Remaining" value={f.remaining} />
        <Stat label="Coins used" value={f.picked.length} />
        <Stat label="Trying" value={f.coinIdx >= 0 && f.kind !== "done" ? coins[f.coinIdx] : "—"} />
        <Stat label="Time" value={`${(elapsed / 1000).toFixed(1)}s`} />
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

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Coin being tried / just taken" />
        <LegendDot color="var(--color-output)" label="Coins kept" />
        <LegendDot color="color-mix(in srgb, var(--accent) 16%, white)" label="Denomination" />
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
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
