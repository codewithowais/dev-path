"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   FrequencyMapViz — a "watch it tally" explainer for the Frequency Map lesson.

   A word is scanned one letter at a time. Each letter bumps a running count in
   a map (a brand-new letter starts at 0, then +1), exactly like the lesson's
   tally chart. Counts render as a live bar chart that grows as the scan runs.
   At the end the most common letter is spotlighted — the "key whose count is
   highest" the lesson warns not to confuse with the count itself.

   Same engine as SortVisualizer: the whole run is recorded up front as a list
   of ops, then replayed purely from one `step` counter. Deterministic (seeded
   PRNG, never Math.random in render), scrubbable, StrictMode-safe. All motion
   is disabled under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Op = { t: "read"; i: number } | { t: "tally"; i: number } | { t: "max"; ch: string };

type Recording = { ops: Op[]; word: string; distinct: string[]; topChar: string; topCount: number };

const WORDS = ["mississippi", "banana", "tennessee", "bookkeeper", "committee", "assessment"];

function stableSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

function buildRun(word: string): Recording {
  const ops: Op[] = [];
  const counts = new Map<string, number>();
  const distinct: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    ops.push({ t: "read", i });
    if (!counts.has(ch)) distinct.push(ch);
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
    ops.push({ t: "tally", i });
  }
  // Find the most common (first key to reach the highest count).
  let topChar = distinct[0] ?? "";
  let topCount = 0;
  for (const ch of distinct) {
    const c = counts.get(ch) ?? 0;
    if (c > topCount) {
      topCount = c;
      topChar = ch;
    }
  }
  ops.push({ t: "max", ch: topChar });
  return { ops, word, distinct, topChar, topCount };
}

const SPEEDS = [640, 420, 260, 150, 70] as const;

export function FrequencyMapViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [wordIdx, setWordIdx] = useState<number>(() => stableSeed("frequency-map") % WORDS.length);

  const word = WORDS[wordIdx];
  const recording = useMemo(() => buildRun(word), [word]);
  const { ops, distinct, topChar, topCount } = recording;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ch of distinct) counts.set(ch, 0);
    let readIdx: number | null = null;
    let tallyChar: string | null = null;
    let scanned = 0;
    let maxRevealed = false;
    for (let s = 0; s < step; s++) {
      const op = ops[s];
      if (op.t === "read") {
        readIdx = op.i;
        tallyChar = null;
      } else if (op.t === "tally") {
        const ch = word[op.i];
        counts.set(ch, (counts.get(ch) ?? 0) + 1);
        tallyChar = ch;
        readIdx = op.i;
        scanned++;
      } else {
        maxRevealed = true;
        readIdx = null;
        tallyChar = null;
      }
    }
    const distinctSoFar = distinct.filter((ch) => (counts.get(ch) ?? 0) > 0).length;
    return { counts, readIdx, tallyChar, scanned, maxRevealed, distinctSoFar };
  }, [ops, word, distinct, step]);

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
    setWordIdx((i) => (i + 1) % WORDS.length);
  };

  const { counts, readIdx, tallyChar, maxRevealed } = frame;

  const currentOp = step > 0 ? ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp) return "Ready. Press play to tally letters into a map.";
    if (currentOp.t === "read") return `Reading letter "${word[currentOp.i]}" at index ${currentOp.i}.`;
    if (currentOp.t === "tally") {
      const ch = word[currentOp.i];
      const c = counts.get(ch) ?? 0;
      return c === 1
        ? `New letter "${ch}" — start at 0, then +1 → 1.`
        : `Seen "${ch}" before — bump its count to ${c}.`;
    }
    return `Most common: "${currentOp.ch}" with ${topCount}. The key with the highest count.`;
  })();

  const chartMax = Math.max(topCount, 1);

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it tally</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Frequency map
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* The word being scanned */}
      <div className="mt-4 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Scanning the word</div>
        <div
          className="flex flex-wrap gap-1"
          role="img"
          aria-label={`Counting letters of ${word}, ${done ? "complete" : `step ${step} of ${total}`}`}
        >
          {[...word].map((ch, i) => {
            const isRead = readIdx === i;
            const isPast = currentOp ? i < (readIdx ?? (maxRevealed ? word.length : 0)) : false;
            const bg = isRead
              ? "var(--accent)"
              : isPast
                ? "color-mix(in srgb, var(--color-muted) 12%, white)"
                : "color-mix(in srgb, var(--accent) 18%, white)";
            return (
              <span
                key={i}
                className="dp-bar flex h-7 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold"
                style={{
                  background: bg,
                  color: isRead ? "white" : "var(--color-ink)",
                  opacity: isPast && !isRead ? 0.5 : 1,
                  transform: isRead ? "translateY(-2px)" : undefined,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      </div>

      {/* Live count bar chart */}
      <div className="mt-3 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Counts</div>
        <div className="flex items-end justify-around gap-2" style={{ height: "8rem" }}>
          {distinct.map((ch) => {
            const c = counts.get(ch) ?? 0;
            const isBumping = tallyChar === ch;
            const isTop = maxRevealed && ch === topChar;
            const bg = isBumping
              ? "var(--accent)"
              : isTop
                ? "var(--color-primary)"
                : "color-mix(in srgb, var(--color-muted) 16%, white)";
            return (
              <div key={ch} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
                <span className="font-mono text-[11px] font-bold tabular-nums text-ink">{c}</span>
                <div
                  className="dp-bar w-full max-w-[2.5rem] rounded-t-md"
                  style={{
                    height: `${(c / chartMax) * 100}%`,
                    minHeight: c > 0 ? "6px" : "2px",
                    background: bg,
                    transform: isBumping ? "scaleY(1.03)" : undefined,
                  }}
                />
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: isTop ? "var(--color-primary)" : "var(--color-ink)" }}
                >
                  {ch}
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
        <Stat label="Read" value={`${frame.scanned}/${word.length}`} />
        <Stat label="Distinct" value={frame.distinctSoFar} />
        <Stat label="Most common" value={maxRevealed ? topChar : "—"} />
        <Stat label="Top count" value={maxRevealed ? topCount : "—"} />
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
          ⤨ New word
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
        <LegendDot color="var(--accent)" label="Reading / bumping" />
        <LegendDot color="var(--color-primary)" label="Most common" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 16%, white)" label="Settled count" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-2 py-2">
      <div className="font-mono text-base font-bold tabular-nums text-ink sm:text-lg">{value}</div>
      <div className="dp-eyebrow mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {label}
    </span>
  );
}
