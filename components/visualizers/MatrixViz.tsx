"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   MatrixViz — a "watch the grid" explainer for the Matrix (2D grid) lesson.

   A matrix is a grid of cells you address with TWO indices: grid[row][col].
   This visualizer plays three phases so the ideas land in order:
     1) Address one cell directly — grid[r][c] is O(1), you jump straight there.
     2) Row-major traversal — the nested loop (outer rows, inner cols) that
        touches every cell exactly once, O(rows × cols).
     3) Transpose — the value at [r][c] swaps across the diagonal to [c][r].

   Architecture mirrors SortVisualizer: the whole run is RECORDED up front as a
   flat op list, then replayed purely from a single `step` counter inside a
   useMemo — deterministic, scrubbable, StrictMode-safe. The only state that
   changes during playback is `step`, advanced by a setTimeout in the autoplay
   callback (never setState in an effect body). Grid values come from a seeded
   PRNG so the server and client first render match.
   ──────────────────────────────────────────────────────────────────────── */

const N = 4; // square grid so transpose reflects neatly across the diagonal
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [820, 560, 380, 230, 120] as const;

type Op =
  | { t: "address"; r: number; c: number }
  | { t: "visit"; r: number; c: number }
  | { t: "swap"; r: number; c: number } // swaps [r][c] with [c][r], r < c
  | { t: "phase"; label: "traverse" | "transpose" };

/** Tiny deterministic PRNG (mulberry32). */
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

/** Fill the grid with distinct two-digit values, deterministic per seed. */
function makeGrid(seed: number): number[][] {
  const rng = makeRng(seed);
  const g: number[][] = [];
  for (let r = 0; r < N; r++) {
    const row: number[] = [];
    for (let c = 0; c < N; c++) row.push(10 + Math.floor(rng() * 89));
    g.push(row);
  }
  return g;
}

/** Script the run for a given (square) grid: address one cell, walk row-major,
 *  then transpose across the diagonal. Shared by the random and code paths. */
function scriptGrid(grid: number[][], addr: { r: number; c: number }): Op[] {
  const n = grid.length;
  const ops: Op[] = [];

  ops.push({ t: "address", r: addr.r, c: addr.c });

  ops.push({ t: "phase", label: "traverse" });
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) ops.push({ t: "visit", r, c });
  }

  ops.push({ t: "phase", label: "transpose" });
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) ops.push({ t: "swap", r, c });
  }

  return ops;
}

/** Record: address one seeded cell, walk row-major, then transpose. */
function record(seed: number): { ops: Op[]; grid: number[][] } {
  const grid = makeGrid(seed);
  const rng = makeRng(seed ^ 0x51ed270b);
  const addr = { r: Math.floor(rng() * N), c: Math.floor(rng() * N) };
  return { ops: scriptGrid(grid, addr), grid };
}

/* ─────────────────────────── Bind to the lesson's code ───────────────────
   Parse a SQUARE 2D numeric literal (e.g. [[1,2],[3,4]]) from the lesson's
   code — the transpose animation swaps [r][c]↔[c][r] in place, which is only
   defined for a square grid. A non-square grid, a grid built without a literal,
   or missing code all return null, and the component keeps its random demo. */
function parseMatrixCode(code?: string): number[][] | null {
  if (!code) return null;
  try {
    // An outer bracket wrapping one or more `[...]` rows.
    const outer = code.match(/\[\s*(\[[^[\]]*\](?:\s*,\s*\[[^[\]]*\])*)\s*\]/);
    if (!outer) return null;
    const rowLits = outer[1].match(/\[[^[\]]*\]/g);
    if (!rowLits || rowLits.length < 2) return null;

    const grid: number[][] = [];
    for (const rl of rowLits) {
      const nums = rl.slice(1, -1).match(/-?\d+(?:\.\d+)?/g);
      if (!nums) return null;
      grid.push(nums.map(Number));
    }
    const size = grid.length;
    if (size < 2 || size > 6) return null;
    // Require a square grid — transpose-in-place is undefined otherwise.
    if (!grid.every((row) => row.length === size)) return null;

    return grid;
  } catch {
    return null;
  }
}

function narrate(op: Op | undefined, view: number[][]): string {
  if (!op)
    return "Ready. Press play — address a cell, walk every cell, then transpose across the diagonal.";
  switch (op.t) {
    case "address":
      return `grid[${op.r}][${op.c}] = ${view[op.r][op.c]} — two indices, one direct jump. O(1).`;
    case "phase":
      return op.label === "traverse"
        ? "Row-major traversal: outer loop over rows, inner loop over columns — visit every cell once."
        : "Transpose: each value at [row][col] moves to [col][row], reflecting across the diagonal.";
    case "visit":
      return `Visiting grid[${op.r}][${op.c}] = ${view[op.r][op.c]} (row ${op.r}, then column ${op.c}).`;
    case "swap":
      return `Swap grid[${op.r}][${op.c}] with grid[${op.c}][${op.r}] — mirrored across the diagonal.`;
  }
}

export function MatrixViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source — bind to a square 2D literal within it. */
  code?: string;
}) {
  const parsed = useMemo(() => parseMatrixCode(code), [code]);
  const hasCodeData = parsed !== null;
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(() => makeSeed("matrix"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The active dataset: the lesson's own square grid, or a seeded random one.
  const { ops, grid } = useMemo(
    () =>
      useCode && parsed
        ? { grid: parsed, ops: scriptGrid(parsed, { r: 0, c: 0 }) }
        : record(seed),
    [useCode, parsed, seed],
  );
  const n = grid.length;
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  // Derive the grid + highlights at `step` by replaying ops 0..step.
  const frame = useMemo(() => {
    const view = grid.map((row) => [...row]);
    const visited = new Set<string>();
    let visits = 0;
    let swaps = 0;
    let phase: "address" | "traverse" | "transpose" = "address";
    let active: { r: number; c: number } | null = null;
    let mirror: { r: number; c: number } | null = null;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      active = null;
      mirror = null;
      switch (op.t) {
        case "address":
          active = { r: op.r, c: op.c };
          break;
        case "phase":
          phase = op.label;
          break;
        case "visit":
          visited.add(`${op.r},${op.c}`);
          active = { r: op.r, c: op.c };
          visits++;
          break;
        case "swap": {
          const tmp = view[op.r][op.c];
          view[op.r][op.c] = view[op.c][op.r];
          view[op.c][op.r] = tmp;
          active = { r: op.r, c: op.c };
          mirror = { r: op.c, c: op.r };
          swaps++;
          break;
        }
      }
    }
    return { view, visited, visits, swaps, phase, active, mirror };
  }, [ops, grid, step]);

  const { view, visited, visits, swaps, phase, active, mirror } = frame;
  const current = step > 0 ? ops[step - 1] : undefined;

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

  const cellColor = (r: number, c: number): string => {
    if (active && active.r === r && active.c === c) return "var(--accent)";
    if (mirror && mirror.r === r && mirror.c === c) return "var(--color-primary)";
    if (visited.has(`${r},${c}`))
      return "color-mix(in srgb, var(--accent) 22%, white)";
    if (r === c) return "color-mix(in srgb, var(--color-primary) 10%, white)"; // diagonal hint
    return "color-mix(in srgb, var(--color-muted) 14%, white)";
  };
  const cellWhite = (r: number, c: number): boolean =>
    (active && active.r === r && active.c === c) ||
    (mirror != null && mirror.r === r && mirror.c === c);

  const phaseLabel =
    phase === "address" ? "Addressing" : phase === "traverse" ? "Traversing" : "Transposing";

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the grid</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Matrix · {n}×{n}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: the grid with row + column index headers */}
      <div
        className="mt-4 overflow-x-auto rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Matrix visualization, ${phaseLabel.toLowerCase()}, ${
          done ? "run complete" : `step ${step} of ${total}`
        }`}
      >
        <div className="mx-auto w-max">
          {/* Column index header */}
          <div className="flex gap-1.5 pl-7">
            {Array.from({ length: n }, (_, c) => (
              <div
                key={c}
                className="flex h-5 w-12 items-center justify-center font-mono text-[10px] text-muted sm:w-14"
              >
                c{c}
              </div>
            ))}
          </div>
          {view.map((row, r) => (
            <div key={r} className="mt-1.5 flex items-center gap-1.5">
              <div className="flex h-12 w-6 items-center justify-center font-mono text-[10px] text-muted sm:h-14">
                r{r}
              </div>
              {row.map((v, c) => (
                <div
                  key={c}
                  className="flex h-12 w-12 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors sm:h-14 sm:w-14"
                  style={{
                    background: cellColor(r, c),
                    border: "1px solid color-mix(in srgb, var(--color-muted) 20%, white)",
                    color: cellWhite(r, c) ? "white" : "var(--color-ink)",
                    transform: cellWhite(r, c) ? "scale(1.06)" : undefined,
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(current, view)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Phase" value={phaseLabel} />
        <Stat label="Cells visited" value={`${visits}/${n * n}`} />
        <Stat label="Swaps" value={swaps} />
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
          disabled={useCode}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          ⤨ New input
        </button>

        {/* Data source: the lesson's own grid vs a random one. */}
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
        <LegendDot color="var(--accent)" label="Current cell" />
        <LegendDot color="var(--color-primary)" label="Mirror cell [c][r]" />
        <LegendDot color="color-mix(in srgb, var(--accent) 22%, white)" label="Visited" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 14%, white)" label="Idle" />
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
