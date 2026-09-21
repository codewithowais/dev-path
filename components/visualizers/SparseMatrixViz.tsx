"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SparseMatrixViz — explainer for the Sparse Matrix lesson.

   A sparse matrix is a big grid that is almost entirely zeros. Instead of
   storing every cell, you store ONLY the non-zero entries as (row, col, value)
   triples — like a star catalog listing stars, not a photo of the whole sky.
   This visualizer plays a scripted run of set / overwrite / clear operations
   and shows the dense grid side by side with the compact triple list, so you
   can watch the stored count stay tiny while the grid stays mostly empty.

   Architecture mirrors SortVisualizer: the run is RECORDED up front as a flat
   op list and replayed purely from a single `step` counter in a useMemo —
   deterministic, scrubbable, StrictMode-safe. The only playback state is
   `step`, advanced by a setTimeout in the autoplay callback (never setState in
   an effect body). Positions/values come from a seeded PRNG so the server and
   client first render match.
   ──────────────────────────────────────────────────────────────────────── */

const ROWS = 6;
const COLS = 6;
const DENSE = ROWS * COLS;
const SPEEDS = [980, 680, 460, 280, 160] as const;

type Op =
  | { t: "set"; r: number; c: number; value: number; fresh: boolean }
  | { t: "clear"; r: number; c: number };

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

function makeSeed(tag: string): number {
  let h = 2166136261;
  for (let i = 0; i < tag.length; i++) {
    h ^= tag.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

const key = (r: number, c: number) => `${r},${c}`;

/** Script a run of set / overwrite / clear ops on distinct seeded cells. */
function record(seed: number): Op[] {
  const rng = makeRng(seed);
  const ops: Op[] = [];
  const occupied = new Set<string>();
  const placed: { r: number; c: number }[] = [];

  // Five distinct non-zero placements.
  let guard = 0;
  while (placed.length < 5 && guard < 200) {
    guard++;
    const r = Math.floor(rng() * ROWS);
    const c = Math.floor(rng() * COLS);
    if (occupied.has(key(r, c))) continue;
    occupied.add(key(r, c));
    placed.push({ r, c });
    ops.push({ t: "set", r, c, value: 1 + Math.floor(rng() * 9), fresh: true });
  }

  // Overwrite an existing cell — updates in place, no new storage.
  const ov = placed[1];
  ops.push({ t: "set", r: ov.r, c: ov.c, value: 1 + Math.floor(rng() * 9), fresh: false });

  // Clear a cell — a zero is not worth storing, so the triple is dropped.
  const cl = placed[0];
  ops.push({ t: "clear", r: cl.r, c: cl.c });

  return ops;
}

function narrate(op: Op | undefined): string {
  if (!op)
    return "Ready. Press play — only non-zero cells become stored (row, col, value) triples.";
  if (op.t === "set") {
    return op.fresh
      ? `set(${op.r}, ${op.c}, ${op.value}) — store a new triple (${op.r}, ${op.c}, ${op.value}). Zeros are never stored.`
      : `set(${op.r}, ${op.c}, ${op.value}) — update the existing triple at (${op.r}, ${op.c}) in place.`;
  }
  return `set(${op.r}, ${op.c}, 0) — a zero isn't worth storing, so drop the triple at (${op.r}, ${op.c}).`;
}

export function SparseMatrixViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => makeSeed("sparse-matrix"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ops = useMemo(() => record(seed), [seed]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    // Ordered list of stored triples; `values` mirrors it for O(1) grid lookup.
    const triples: { r: number; c: number; value: number }[] = [];
    const values = new Map<string, number>();
    let active: { r: number; c: number } | null = null;
    let activeKind: "set" | "clear" | null = null;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      active = { r: op.r, c: op.c };
      if (op.t === "set") {
        activeKind = "set";
        values.set(key(op.r, op.c), op.value);
        const existing = triples.find((tr) => tr.r === op.r && tr.c === op.c);
        if (existing) existing.value = op.value;
        else triples.push({ r: op.r, c: op.c, value: op.value });
      } else {
        activeKind = "clear";
        values.delete(key(op.r, op.c));
        const idx = triples.findIndex((tr) => tr.r === op.r && tr.c === op.c);
        if (idx >= 0) triples.splice(idx, 1);
      }
    }
    return { triples, values, active, activeKind };
  }, [ops, step]);

  const { triples, values, active, activeKind } = frame;
  const current = step > 0 ? ops[step - 1] : undefined;
  const stored = triples.length;

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

  const isActive = (r: number, c: number) =>
    active != null && active.r === r && active.c === c;

  const cellStyle = (r: number, c: number): { bg: string; white: boolean; v: number } => {
    const v = values.get(key(r, c)) ?? 0;
    if (isActive(r, c)) {
      if (activeKind === "clear")
        return { bg: "var(--color-here)", white: true, v };
      return { bg: "var(--accent)", white: true, v };
    }
    if (v !== 0)
      return { bg: "color-mix(in srgb, var(--accent) 32%, white)", white: false, v };
    return { bg: "color-mix(in srgb, var(--color-muted) 10%, white)", white: false, v };
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Dense grid ↔ triples</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Sparse matrix · {ROWS}×{COLS}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: grid beside (stacks under on mobile) the stored-triple list */}
      <div
        className="mt-4 flex flex-col items-start gap-4 rounded-xl bg-paper px-3 py-4 sm:flex-row sm:justify-center sm:gap-6"
        role="img"
        aria-label={`Sparse matrix visualization, ${stored} of ${DENSE} cells stored, ${
          done ? "run complete" : `step ${step} of ${total}`
        }`}
      >
        {/* Dense grid */}
        <div className="mx-auto overflow-x-auto sm:mx-0">
          <div className="w-max">
            {Array.from({ length: ROWS }, (_, r) => (
              <div key={r} className="mt-1 flex gap-1 first:mt-0">
                {Array.from({ length: COLS }, (_, c) => {
                  const { bg, white, v } = cellStyle(r, c);
                  return (
                    <div
                      key={c}
                      className="flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs font-bold transition-colors sm:h-9 sm:w-9"
                      style={{
                        background: bg,
                        border: "1px solid color-mix(in srgb, var(--color-muted) 16%, white)",
                        color: v === 0 && !white ? "var(--color-muted)" : white ? "white" : "var(--color-ink)",
                      }}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Stored triples */}
        <div className="w-full sm:w-44">
          <div className="dp-eyebrow mb-1 text-[10px] text-muted">
            Stored triples ({stored})
          </div>
          <div className="flex flex-col gap-1">
            {triples.length === 0 && (
              <div className="rounded-lg border border-dashed border-line px-2 py-1.5 font-mono text-xs text-muted">
                (nothing stored yet)
              </div>
            )}
            {triples.map((tr) => {
              const on = isActive(tr.r, tr.c);
              return (
                <div
                  key={key(tr.r, tr.c)}
                  className="rounded-lg px-2 py-1.5 font-mono text-xs font-semibold transition-colors"
                  style={{
                    background: on
                      ? "var(--accent)"
                      : "color-mix(in srgb, var(--accent) 12%, white)",
                    color: on ? "white" : "var(--color-ink)",
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, white)",
                  }}
                >
                  ({tr.r}, {tr.c}) = {tr.value}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(current)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Dense cells" value={DENSE} />
        <Stat label="Stored (non-zero)" value={stored} />
        <Stat label="Zeros skipped" value={DENSE - stored} />
        <Stat label="Step" value={`${step}/${total}`} />
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
        <LegendDot color="var(--accent)" label="Just set / stored" />
        <LegendDot color="var(--color-here)" label="Cleared (back to 0)" />
        <LegendDot color="color-mix(in srgb, var(--accent) 32%, white)" label="Non-zero value" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 10%, white)" label="Zero (not stored)" />
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
