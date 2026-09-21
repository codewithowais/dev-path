"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SubstringSearch — a "watch it slide" explainer for naive substring search.

   A pattern strip slides along the text one starting position at a time. At
   each position it compares letters left-to-right: matched letters light up
   green, and the first letter that disagrees is the mismatch that forces the
   whole strip to shift one step right. When every letter under the strip
   matches, the start index is recorded as a hit.

   Faithful to the lesson's O(n·m) double loop: outer loop = each start
   position, inner loop = compare pattern[j] to text[i+j] until a mismatch or a
   full match. The whole run is recorded up front as frames and replayed from a
   single `step` index — deterministic, scrubbable, StrictMode-safe. The only
   state that changes during playback is `step` (a setTimeout functional
   update) and `elapsed` (a setInterval). Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type FrameKind = "align" | "match" | "mismatch" | "found" | "done";
type Frame = {
  offset: number; // where the pattern's first char sits in the text
  cmp: number | null; // pattern index being compared this frame
  matched: number; // matched letters in this alignment so far
  mismatch: boolean; // did the cmp letter disagree?
  found: number[]; // recorded hit start indices
  comparisons: number; // cumulative letter comparisons
  shifts: number; // cumulative window positions tried
  kind: FrameKind;
  caption: string;
};

function buildFrames(text: string, pattern: string): Frame[] {
  const n = text.length;
  const m = pattern.length;
  const frames: Frame[] = [];
  const found: number[] = [];
  let comparisons = 0;

  frames.push({
    offset: 0,
    cmp: null,
    matched: 0,
    mismatch: false,
    found: [],
    comparisons: 0,
    shifts: 0,
    kind: "align",
    caption: "Line the pattern up with the start of the text.",
  });

  for (let i = 0; i <= n - m; i++) {
    const shifts = i + 1;
    if (i > 0) {
      frames.push({
        offset: i,
        cmp: null,
        matched: 0,
        mismatch: false,
        found: [...found],
        comparisons,
        shifts,
        kind: "align",
        caption: `Slide the window to index ${i} and compare again.`,
      });
    }
    let matched = 0;
    let broke = false;
    for (let j = 0; j < m; j++) {
      comparisons++;
      const eq = text[i + j] === pattern[j];
      if (eq) {
        matched = j + 1;
        frames.push({
          offset: i,
          cmp: j,
          matched,
          mismatch: false,
          found: [...found],
          comparisons,
          shifts,
          kind: "match",
          caption: `text[${i + j}] = '${text[i + j]}' matches pattern[${j}].`,
        });
      } else {
        frames.push({
          offset: i,
          cmp: j,
          matched: j,
          mismatch: true,
          found: [...found],
          comparisons,
          shifts,
          kind: "mismatch",
          caption: `text[${i + j}] = '${text[i + j]}' ≠ pattern[${j}] '${pattern[j]}' — mismatch, so shift.`,
        });
        broke = true;
        break;
      }
    }
    if (!broke) {
      found.push(i);
      frames.push({
        offset: i,
        cmp: null,
        matched: m,
        mismatch: false,
        found: [...found],
        comparisons,
        shifts,
        kind: "found",
        caption: `Every letter matched — record a hit at index ${i}.`,
      });
    }
  }

  frames.push({
    offset: Math.max(0, n - m),
    cmp: null,
    matched: 0,
    mismatch: false,
    found: [...found],
    comparisons,
    shifts: n - m + 1,
    kind: "done",
    caption: found.length
      ? `Done. Found at ${found.join(", ")}.`
      : "Done. The pattern never appears in the text.",
  });

  return frames;
}

/** Deterministic PRNG (mulberry32) so the demo can pick a stable start case. */
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

/** Small library of (text, pattern) cases with interesting overlap. */
const CASES: readonly [string, string][] = [
  ["ababcabab", "abab"],
  ["aaaaaa", "aa"],
  ["abcabcabc", "abc"],
  ["mississippi", "issi"],
  ["banana", "ana"],
];

const CELL = 30; // px per letter box
const GAP = 4;
const PITCH = CELL + GAP;

const SPEEDS = [900, 620, 400, 240, 120] as const;

export function SubstringSearch({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(0);

  const [text, pattern] = useMemo(() => {
    const idx = Math.floor(makeRng(seed + 1)() * CASES.length) % CASES.length;
    return CASES[idx];
  }, [seed]);

  const frames = useMemo(() => buildFrames(text, pattern), [text, pattern]);
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
  const m = pattern.length;

  // State for a text cell at absolute index t.
  const textCellState = (t: number): "found" | "matched" | "cmp-bad" | "cmp" | "window" | "idle" => {
    const inWindow = t >= f.offset && t < f.offset + m;
    if (f.kind === "done") {
      return f.found.some((s) => t >= s && t < s + m) ? "found" : "idle";
    }
    if (!inWindow) return "idle";
    const j = t - f.offset;
    if (f.kind === "found") return "matched";
    if (f.mismatch && f.cmp === j) return "cmp-bad";
    if (f.cmp === j && f.kind === "match") return "cmp";
    if (j < f.matched) return "matched";
    return "window";
  };

  // State for pattern cell at index j.
  const patCellState = (j: number): "found" | "matched" | "cmp-bad" | "cmp" | "idle" => {
    if (f.kind === "done") return "idle";
    if (f.kind === "found") return "matched";
    if (f.mismatch && f.cmp === j) return "cmp-bad";
    if (f.cmp === j && f.kind === "match") return "cmp";
    if (j < f.matched) return "matched";
    return "idle";
  };

  const cellStyle = (
    s: "found" | "matched" | "cmp-bad" | "cmp" | "window" | "idle",
  ): React.CSSProperties => {
    switch (s) {
      case "found":
      case "matched":
        return { background: "var(--color-output)", color: "#fff", borderColor: "var(--color-output)" };
      case "cmp-bad":
        return {
          background: "var(--accent)",
          color: "#fff",
          borderColor: "var(--accent)",
        };
      case "cmp":
        return {
          background: "color-mix(in srgb, var(--accent) 22%, white)",
          color: "var(--color-ink)",
          borderColor: "var(--accent)",
        };
      case "window":
        return {
          background: "color-mix(in srgb, var(--color-primary) 10%, white)",
          color: "var(--color-ink)",
          borderColor: "color-mix(in srgb, var(--color-primary) 45%, white)",
        };
      default:
        return {
          background: "var(--color-card)",
          color: "var(--color-ink)",
          borderColor: "var(--color-line)",
        };
    }
  };

  const boxClass =
    "flex items-center justify-center rounded-md border font-mono text-base font-bold";
  const boxSize: React.CSSProperties = { width: CELL, height: CELL + 4 };

  const trackWidth = text.length * PITCH;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it slide</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Substring search
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          &ldquo;{pattern}&rdquo;
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The text + sliding pattern */}
      <div className="mt-3 overflow-x-auto rounded-xl bg-paper px-3 py-4">
        <div
          role="img"
          aria-label={`Searching for ${pattern} in ${text}; window at index ${f.offset}. ${f.caption}`}
        >
          <div className="dp-eyebrow mb-1 text-muted">Text</div>
          <div className="flex" style={{ gap: GAP, width: trackWidth }}>
            {text.split("").map((ch, t) => (
              <div key={t} className={boxClass} style={{ ...boxSize, ...cellStyle(textCellState(t)) }}>
                {ch}
              </div>
            ))}
          </div>
          {/* index ruler */}
          <div className="mt-1 flex" style={{ gap: GAP, width: trackWidth }}>
            {text.split("").map((_, t) => (
              <div
                key={t}
                className="text-center font-mono text-[10px] text-muted"
                style={{ width: CELL }}
              >
                {t}
              </div>
            ))}
          </div>

          <div className="dp-eyebrow mb-1 mt-3 text-muted">Pattern</div>
          <div className="flex" style={{ gap: GAP, marginLeft: f.offset * PITCH, transition: "margin-left 220ms" }}>
            {pattern.split("").map((ch, j) => (
              <div key={j} className={boxClass} style={{ ...boxSize, ...cellStyle(patCellState(j)) }}>
                {ch}
              </div>
            ))}
          </div>
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

      {/* Found indices */}
      <div className="mt-3">
        <div className="dp-eyebrow mb-1.5 text-muted">Found at</div>
        <div className="flex flex-wrap gap-1.5">
          {f.found.length === 0 && <span className="text-sm text-muted">—</span>}
          {f.found.map((idx, i) => (
            <span
              key={`${idx}-${i}`}
              className="flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 font-mono text-sm font-bold text-white"
              style={{ background: "var(--color-output)" }}
            >
              {idx}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Comparisons" value={f.comparisons} />
        <Stat label="Windows tried" value={f.shifts} />
        <Stat label="Hits" value={f.found.length} />
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
        <LegendDot color="color-mix(in srgb, var(--accent) 22%, white)" label="Comparing" />
        <LegendDot color="var(--color-output)" label="Matched / hit" />
        <LegendDot color="var(--accent)" label="Mismatch → shift" />
        <LegendDot color="color-mix(in srgb, var(--color-primary) 45%, white)" label="Window" ring />
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

function LegendDot({
  color,
  label,
  ring,
}: {
  color: string;
  label: string;
  ring?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{
          background: color,
          boxShadow: ring ? "inset 0 0 0 1px var(--color-line)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
