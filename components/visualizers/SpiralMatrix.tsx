"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SpiralMatrix — a "watch it spiral" explainer for Spiral Matrix Traversal.

   A cursor peels the grid from the outside in: across the top edge, down the
   right, back across the bottom, up the left — then the rectangle shrinks by
   one ring and it repeats. It's the visual version of the lesson's four
   moving boundaries (top / bottom / left / right), each pulled inward the
   moment its edge is walked.

   Architecture mirrors SortVisualizer/GraphVisualizer: the whole traversal is
   recorded up front as an ordered list of cell visits, then played back purely
   from a single `step` counter (how many cells have been read). Everything
   visible is derived from `step`, so stepping/scrubbing is exact and
   StrictMode-safe. The only state that changes during playback is `step`
   (a setTimeout functional update) and `elapsed` (a setInterval) — never a
   setState in an effect body. Motion is disabled under prefers-reduced-motion
   (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Leg = "top" | "right" | "bottom" | "left";
type Visit = { r: number; c: number; value: number; leg: Leg };

/** Simulate the exact boundary-shrinking spiral from the lesson, recording
 *  each cell visit in order along with which edge-walk produced it. */
function buildVisits(rows: number, cols: number): Visit[] {
  const value = (r: number, c: number) => r * cols + c + 1; // row-major 1..n
  const out: Visit[] = [];
  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push({ r: top, c, value: value(top, c), leg: "top" });
    top++;
    for (let r = top; r <= bottom; r++) out.push({ r, c: right, value: value(r, right), leg: "right" });
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push({ r: bottom, c, value: value(bottom, c), leg: "bottom" });
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push({ r, c: left, value: value(r, left), leg: "left" });
      left++;
    }
  }
  return out;
}

const LEG_LABEL: Record<Leg, string> = {
  top: "Across the top row",
  right: "Down the right column",
  bottom: "Back across the bottom row",
  left: "Up the left column",
};

/** Deterministic PRNG (mulberry32) — a given seed always yields the same
 *  sequence, so server and client render the same grid on first paint. */
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

/** A few pleasing grid shapes; a seed picks one so the demo can vary. */
const SHAPES: readonly [number, number][] = [
  [3, 4],
  [4, 4],
  [3, 5],
  [4, 3],
  [3, 3],
  [2, 6],
];

const SPEEDS = [720, 460, 300, 180, 90] as const;

export function SpiralMatrix({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  // Stable per-component seed → identical first render on server and client.
  const [seed, setSeed] = useState<number>(0);

  const [rows, cols] = useMemo(() => {
    const idx = Math.floor(makeRng(seed + 1)() * SHAPES.length) % SHAPES.length;
    return SHAPES[idx];
  }, [seed]);

  const visits = useMemo(() => buildVisits(rows, cols), [rows, cols]);
  const total = visits.length;

  const [step, setStep] = useState(0); // cells visited so far
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = step >= total;
  const running = playing && !done;

  // Autoplay — functional setStep in the timer callback, never in the body.
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

  // Live elapsed — setState only inside the interval callback.
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
    setStep((s) => Math.min(s + 1, total));
  };

  const newGrid = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
    setSeed((s) => s + 1);
  };

  // Derived view: which cells are visited, the current one, and the order.
  const current = step > 0 ? visits[step - 1] : null;
  const visitedKey = useMemo(() => {
    const set = new Set<string>();
    for (let k = 0; k < step; k++) set.add(`${visits[k].r},${visits[k].c}`);
    return set;
  }, [visits, step]);
  const order = useMemo(() => visits.slice(0, step).map((v) => v.value), [visits, step]);

  const caption = !current
    ? "Four boundaries frame the unvisited rectangle. Walk its outer ring, then shrink inward."
    : done
      ? `Done. Spiral order: ${order.join(" ")}.`
      : `${LEG_LABEL[current.leg]} → ${current.value}.`;

  // Geometry: pick a cell size that keeps the grid compact and centred.
  const PAD = 6;
  const cell = Math.min(Math.floor(300 / cols), 58);
  const gridW = cols * cell;
  const gridH = rows * cell;
  const vbW = gridW + PAD * 2;
  const vbH = gridH + PAD * 2;
  const cx = (c: number) => PAD + c * cell + cell / 2;
  const cy = (r: number) => PAD + r * cell + cell / 2;

  // Polyline through the centres of the cells visited so far (the spiral path).
  const pathPts = visits
    .slice(0, step)
    .map((v) => `${cx(v.c)},${cy(v.r)}`)
    .join(" ");

  const cells: { r: number; c: number; value: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push({ r, c, value: r * cols + c + 1 });
  }

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it spiral</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Spiral traversal
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          {rows}×{cols}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The grid */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: `${Math.max(vbW * 1.1, 220)}px` }}
          role="img"
          aria-label={`Spiral traversal of a ${rows} by ${cols} grid; visited so far: ${
            order.join(" ") || "none"
          }`}
        >
          {cells.map(({ r, c, value }) => {
            const isCurrent = current != null && current.r === r && current.c === c;
            const isVisited = visitedKey.has(`${r},${c}`);
            const fill = isCurrent
              ? "var(--accent)"
              : isVisited
                ? "color-mix(in srgb, var(--accent) 20%, white)"
                : "color-mix(in srgb, var(--color-muted) 10%, white)";
            const stroke = isCurrent
              ? "var(--accent)"
              : isVisited
                ? "color-mix(in srgb, var(--accent) 45%, white)"
                : "var(--color-line)";
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={PAD + c * cell + 2}
                  y={PAD + r * cell + 2}
                  width={cell - 4}
                  height={cell - 4}
                  rx={7}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  style={{ transition: "fill 200ms, stroke 200ms" }}
                />
                <text
                  x={cx(c)}
                  y={cy(r)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.min(15, cell * 0.34)}
                  fontWeight={700}
                  fill={isCurrent ? "#fff" : "var(--color-ink)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* The spiral path traced so far */}
          {step > 1 && (
            <polyline
              points={pathPts}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.55}
            />
          )}
        </svg>
      </div>

      {/* Output order */}
      <div className="mt-3">
        <div className="dp-eyebrow mb-1.5 text-muted">Spiral order</div>
        <div className="flex flex-wrap gap-1.5">
          {order.length === 0 && <span className="text-sm text-muted">—</span>}
          {order.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 font-mono text-sm font-bold text-white"
              style={{ background: "var(--color-output)" }}
            >
              {v}
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
        {caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Visited" value={`${step}/${total}`} />
        <Stat label="Leg" value={current ? capitalize(current.leg) : "—"} />
        <Stat label="Step" value={`${step}/${total}`} />
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
          onClick={newGrid}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤨ New grid
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
        <LegendDot color="var(--accent)" label="Current cell" />
        <LegendDot color="color-mix(in srgb, var(--accent) 20%, white)" label="Visited ring" />
        <LegendDot color="var(--color-output)" label="Output order" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 10%, white)" label="Unvisited" ring />
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
