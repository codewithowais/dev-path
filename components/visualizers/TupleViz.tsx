"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   TupleViz — a short "sealed box vs. growable list" explainer for the Tuple
   lesson.

   A tuple is a small, fixed, ordered, immutable group of values. This reel
   walks through the four things the lesson cares about: reading a value by
   its index (O(1)), unpacking the whole tuple into named variables, that a
   write to a tuple is REJECTED (it's sealed) — contrasted against a plain
   mutable array where the same write succeeds — and that the only way to
   "change" a tuple is to build a brand-new one, leaving the original intact.

   Architecture mirrors SortVisualizer: the whole reel is a fixed op list,
   replayed purely from one `step` counter in a useMemo. The only playback
   state is `step`, advanced by a setTimeout in the autoplay callback — never
   setState in an effect body. "New sequence" swaps in a different pair of
   values deterministically (a stable seed → same first render, no hydration
   mismatch).
   ──────────────────────────────────────────────────────────────────────── */

type Stage =
  | { kind: "read"; index: number }
  | { kind: "unpack" }
  | { kind: "mutate-fail"; index: number; attempt: number }
  | { kind: "array-mutate"; index: number; attempt: number }
  | { kind: "rebuild"; index: number; value: number };

const LABELS = ["x", "y"] as const;
const PAIRS: [number, number][] = [
  [3, 4],
  [7, 2],
  [5, 9],
  [8, 1],
];
const SPEEDS = [1400, 1000, 720, 480, 300] as const;

function makeSeed(tag: string): number {
  let h = 2166136261;
  for (let i = 0; i < tag.length; i++) {
    h ^= tag.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/** Pull the tuple's two values straight from the lesson's JavaScript (the
 *  `Object.freeze([3, 4])` pair), so the reel walks the exact example on the
 *  page. Returns null (→ fall back to the seeded pairs) if anything is off. */
function parseCode(code: string | undefined): [number, number] | null {
  if (!code) return null;
  const m = code.match(/Object\.freeze\(\s*\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return [a, b];
}

/** The fixed reel of stages. Values come from the chosen pair. */
function buildStages(pair: [number, number]): Stage[] {
  const [a, b] = pair;
  const attempt = ((a * 7 + b * 3) % 90) + 10; // deterministic "new" value 10..99
  return [
    { kind: "read", index: 0 },
    { kind: "read", index: 1 },
    { kind: "unpack" },
    { kind: "mutate-fail", index: 0, attempt },
    { kind: "array-mutate", index: 0, attempt },
    { kind: "rebuild", index: 0, value: attempt },
  ];
}

type Frame = {
  stage: Stage | null;
  // tuple slots: fixed values, but a slot may be highlighted for a read.
  highlight: number | null;
  highlightKind: "read" | "blocked" | null;
  unpacked: boolean;
  // the mutable-array contrast panel
  arrayShown: boolean;
  arrayValues: [number, number];
  arrayActive: number | null;
  // the freshly-built tuple
  rebuilt: [number, number] | null;
  readout: string;
};

function replay(pair: [number, number], stages: Stage[], step: number): Frame {
  const [a, b] = pair;
  let highlight: number | null = null;
  let highlightKind: "read" | "blocked" | null = null;
  let unpacked = false;
  let arrayShown = false;
  let arrayValues: [number, number] = [a, b];
  let arrayActive: number | null = null;
  let rebuilt: [number, number] | null = null;
  let readout = "";
  let stage: Stage | null = null;

  for (let k = 0; k < step; k++) {
    const s = stages[k];
    stage = s;
    // transient per-step highlights reset each step
    highlight = null;
    highlightKind = null;
    arrayActive = null;
    if (s.kind === "read") {
      highlight = s.index;
      highlightKind = "read";
      readout = `${LABELS[s.index]} = point[${s.index}] → ${pair[s.index]}`;
    } else if (s.kind === "unpack") {
      unpacked = true;
      readout = `x, y = point → x=${a}, y=${b}`;
    } else if (s.kind === "mutate-fail") {
      highlight = s.index;
      highlightKind = "blocked";
      readout = `point[${s.index}] = ${s.attempt}  ✗ rejected — a tuple is immutable`;
    } else if (s.kind === "array-mutate") {
      arrayShown = true;
      arrayValues = [s.attempt, b];
      arrayActive = s.index;
      readout = `arr[${s.index}] = ${s.attempt}  ✓ a mutable array changes in place`;
    } else if (s.kind === "rebuild") {
      arrayShown = true;
      arrayValues = [s.value, b];
      rebuilt = [s.value, b];
      readout = `newPoint = (${s.value}, ${b}) — build a NEW tuple; the original is still (${a}, ${b})`;
    }
  }
  return {
    stage,
    highlight,
    highlightKind,
    unpacked,
    arrayShown,
    arrayValues,
    arrayActive,
    rebuilt,
    readout,
  };
}

function narrate(f: Frame, started: boolean, pair: [number, number]): string {
  if (!started) {
    return "Ready. A tuple is a small, fixed, ordered group of values — sealed the moment it's created.";
  }
  const s = f.stage;
  if (!s) return "";
  switch (s.kind) {
    case "read":
      return `Read by position: point[${s.index}] is ${pair[s.index]}. Index access is O(1).`;
    case "unpack":
      return `Unpack the whole tuple into named variables in one line: x, y = point.`;
    case "mutate-fail":
      return `Try to change it: point[${s.index}] = ${s.attempt}. A tuple rejects this — it's immutable (sealed).`;
    case "array-mutate":
      return `Contrast: a mutable array allows arr[${s.index}] = ${s.attempt}. It changes in place — that's the difference.`;
    case "rebuild":
      return `To "change" a tuple you build a NEW one: (${s.value}, ${pair[1]}). The original never changes.`;
  }
}

export function TupleViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source. When it parses, the reel runs on the exact
   *  tuple values from the demo instead of a seeded pair. */
  code?: string;
}) {
  const parsed = useMemo(() => parseCode(code), [code]);
  const hasCodeData = parsed != null;
  // Default to the lesson's own values when we can read them.
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(() => makeSeed("tuple"));
  const [speedIdx, setSpeedIdx] = useState<number>(1);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pair = useMemo<[number, number]>(
    () => (useCode && parsed ? parsed : PAIRS[seed % PAIRS.length]),
    [useCode, parsed, seed],
  );
  const stages = useMemo(() => buildStages(pair), [pair]);
  const total = stages.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => replay(pair, stages, step), [pair, stages, step]);
  const started = step > 0;

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

  const newSequence = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const toggleSource = (next: boolean) => {
    reset();
    setUseCode(next);
  };

  const slotStyle = (index: number) => {
    if (frame.highlight === index && frame.highlightKind === "read") {
      return { bg: "var(--accent)", fg: "#fff", border: "var(--accent)", anim: "tpl-read" };
    }
    if (frame.highlight === index && frame.highlightKind === "blocked") {
      return {
        bg: "color-mix(in srgb, var(--color-here) 18%, white)",
        fg: "var(--color-here)",
        border: "var(--color-here)",
        anim: "tpl-shake",
      };
    }
    if (frame.unpacked) {
      return {
        bg: "color-mix(in srgb, var(--accent) 12%, white)",
        fg: "var(--color-ink)",
        border: "color-mix(in srgb, var(--accent) 45%, white)",
        anim: "",
      };
    }
    return {
      bg: "color-mix(in srgb, var(--color-muted) 12%, white)",
      fg: "var(--color-ink)",
      border: "var(--color-line)",
      anim: "",
    };
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <style>{`
        @keyframes tpl-read { 0% { transform: scale(0.9); } 55% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes tpl-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        @keyframes tpl-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Sealed vs. growable</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Tuple · immutable
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas */}
      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Tuple visualization, ${
          done ? "sequence complete" : `step ${step} of ${total}`
        }`}
      >
        {/* The tuple — a sealed, numbered box */}
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 font-mono text-xs font-semibold" style={{ color: "var(--accent)" }}>
            point
          </span>
          <div
            className="flex items-center gap-2 rounded-xl border-2 px-2 py-2"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 45%, white)",
              background: "color-mix(in srgb, var(--accent) 5%, white)",
            }}
          >
            <span className="font-mono text-lg text-muted" aria-hidden="true">(</span>
            {pair.map((v, i) => {
              const s = slotStyle(i);
              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg border-2 font-mono text-lg font-bold"
                    style={{
                      background: s.bg,
                      color: s.fg,
                      borderColor: s.border,
                      animation: s.anim ? `${s.anim} 420ms var(--dp-ease, ease)` : undefined,
                    }}
                  >
                    {v}
                  </div>
                  <span className="mt-1 font-mono text-[10px] text-muted">
                    [{i}] {LABELS[i]}
                  </span>
                </div>
              );
            })}
            <span className="font-mono text-lg text-muted" aria-hidden="true">)</span>
            <span
              className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                background: "color-mix(in srgb, var(--accent) 16%, white)",
                color: "var(--accent)",
              }}
              title="sealed / immutable"
            >
              🔒 sealed
            </span>
          </div>
        </div>

        {/* Unpack readout */}
        {frame.unpacked && !frame.rebuilt && (
          <div
            className="mt-3 font-mono text-xs"
            style={{ color: "var(--color-primary)", animation: "tpl-in 300ms var(--dp-ease, ease)" }}
          >
            x = {pair[0]} , y = {pair[1]}
          </div>
        )}

        {/* Mutable-array contrast panel */}
        {frame.arrayShown && (
          <div
            className="mt-4 flex items-center gap-3 border-t border-line pt-3"
            style={{ animation: "tpl-in 320ms var(--dp-ease, ease)" }}
          >
            <span className="w-14 shrink-0 font-mono text-xs font-semibold text-muted">arr</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg text-muted" aria-hidden="true">[</span>
              {frame.arrayValues.map((v, i) => {
                const changed = frame.arrayActive === i;
                return (
                  <div
                    key={i}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border-2 font-mono text-base font-bold"
                    style={{
                      background: changed ? "var(--accent)" : "color-mix(in srgb, var(--color-muted) 12%, white)",
                      color: changed ? "#fff" : "var(--color-ink)",
                      borderColor: changed ? "var(--accent)" : "var(--color-line)",
                      animation: changed ? "tpl-read 420ms var(--dp-ease, ease)" : undefined,
                    }}
                  >
                    {v}
                  </div>
                );
              })}
              <span className="font-mono text-lg text-muted" aria-hidden="true">]</span>
              <span className="ml-1 font-mono text-[10px] text-muted">mutable — changes in place</span>
            </div>
          </div>
        )}

        {/* Freshly-built new tuple */}
        {frame.rebuilt && (
          <div
            className="mt-3 flex items-center gap-3"
            style={{ animation: "tpl-in 320ms var(--dp-ease, ease)" }}
          >
            <span className="w-14 shrink-0 font-mono text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
              newPoint
            </span>
            <div
              className="flex items-center gap-2 rounded-xl border-2 px-2 py-1.5"
              style={{
                borderColor: "color-mix(in srgb, var(--color-primary) 55%, white)",
                background: "color-mix(in srgb, var(--color-primary) 8%, white)",
              }}
            >
              <span className="font-mono text-base text-muted" aria-hidden="true">(</span>
              {frame.rebuilt.map((v, i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-lg font-mono text-base font-bold text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  {v}
                </div>
              ))}
              <span className="font-mono text-base text-muted" aria-hidden="true">)</span>
              <span className="ml-1 font-mono text-[10px] text-muted">a brand-new tuple</span>
            </div>
          </div>
        )}
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(frame, started, pair)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Tuple" value={`(${pair[0]}, ${pair[1]})`} />
        <Stat label="Length" value={`${pair.length} (locked)`} />
        <Stat label="Readout" value={frame.readout ? "see below" : "–"} />
        <Stat label="Step" value={`${step}/${total}`} />
      </div>
      {frame.readout && (
        <div className="mt-2 truncate rounded-lg bg-paper px-3 py-2 font-mono text-[11px] text-ink">
          {frame.readout}
        </div>
      )}

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
          onClick={newSequence}
          disabled={useCode}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          ⤨ New values
        </button>

        {/* Data source: the lesson's own values vs a seeded pair. */}
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

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Reading by index" />
        <LegendDot color="var(--color-here)" label="Write rejected (sealed)" />
        <LegendDot color="var(--color-primary)" label="New tuple / unpacked" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-2 py-2">
      <div className="truncate font-mono text-base font-bold tabular-nums text-ink sm:text-lg">
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
