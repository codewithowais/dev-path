"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   StackViz — a "watch it stack" animated explainer for the Stack lesson.

   A stack is LIFO: Last In, First Out (a pile of plates). You push a new
   item onto the TOP, and pop always removes the most-recently pushed item
   from that same top. This visualizer plays a scripted sequence of push/pop
   operations, sliding cells in and out at the top so you can see that the
   last thing in is always the first thing out.

   Architecture mirrors SortVisualizer: a scripted run is RECORDED up front
   as a flat op list, then played back purely from a single `step` counter.
   Everything visible is derived from `step` in a useMemo, so the animation is
   deterministic, scrubbable and StrictMode-safe. The only state that changes
   during playback is `step`, advanced by a setTimeout inside the autoplay
   callback — never by setState inside an effect body.
   ──────────────────────────────────────────────────────────────────────── */

/** One recorded operation. `id`/`value` are fixed at record time — for a pop
 *  they record the item that leaves, so playback can show it sliding out. */
type Op = {
  kind: "add" | "remove"; // push | pop
  id: number;
  value: number;
};

type Cell = { id: number; value: number };

const MAX_SIZE = 6;
const NUM_OPS = 11;
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [900, 620, 420, 260, 150] as const;

/** Tiny deterministic PRNG (mulberry32): a given seed always yields the same
 *  sequence, so server and client first render are identical (no hydration
 *  mismatch). We only pick a fresh seed on an explicit user action. */
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

/** Stable per-lesson seed so the first render is deterministic. */
function makeSeed(tag: string): number {
  let h = 2166136261;
  for (let i = 0; i < tag.length; i++) {
    h ^= tag.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/** Build a valid scripted push/pop sequence: never pop an empty stack, never
 *  exceed MAX_SIZE. Push values are sequential (1, 2, 3, …) so each cell reads
 *  clearly. Deterministic for a given seed. */
function buildScript(seed: number): Op[] {
  const rng = makeRng(seed);
  const ops: Op[] = [];
  const stack: Cell[] = [];
  let nextId = 0;
  let nextVal = 1;

  for (let i = 0; i < NUM_OPS; i++) {
    const empty = stack.length === 0;
    const full = stack.length >= MAX_SIZE;
    // Bias toward pushing, but guarantee at least one pop near the end.
    const forcePop = i === NUM_OPS - 1 && stack.length > 0;
    const push = !forcePop && (empty || (!full && rng() < 0.58));
    if (push) {
      const cell = { id: nextId++, value: nextVal++ };
      stack.push(cell);
      ops.push({ kind: "add", id: cell.id, value: cell.value });
    } else {
      const cell = stack.pop() as Cell;
      ops.push({ kind: "remove", id: cell.id, value: cell.value });
    }
  }
  return ops;
}

function narrate(op: Op | undefined): string {
  if (!op) return "Ready. Press play — push adds to the top, pop removes from the top.";
  if (op.kind === "add") return `push ${op.value}: place ${op.value} on top of the stack.`;
  return `pop: remove ${op.value} — the most-recently pushed item leaves the top (LIFO).`;
}

export function StackViz({
  accent,
  complexity,
}: {
  accent: string;
  /** e.g. "push: O(1) · pop: O(1) · peek: O(1)" — shown as a chip. */
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => makeSeed("stack"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ops = useMemo(() => buildScript(seed), [seed]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  // Derive the whole picture at `step` by replaying ops 0..step. Pure + cheap.
  const frame = useMemo(() => {
    const cells: Cell[] = [];
    let pushes = 0;
    let pops = 0;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.kind === "add") {
        cells.push({ id: op.id, value: op.value });
        pushes++;
      } else {
        cells.pop();
        pops++;
      }
    }
    const current = step > 0 ? ops[step - 1] : undefined;
    // The cell that just entered (a push) is the top of `cells`.
    const enteringId = current && current.kind === "add" ? current.id : null;
    // A pop's leaving cell is reconstructed as a ghost shown sliding off the top.
    const leaving: Cell | null =
      current && current.kind === "remove"
        ? { id: current.id, value: current.value }
        : null;
    return { cells, pushes, pops, enteringId, leaving, current };
  }, [ops, step]);

  const { cells, pushes, pops, enteringId, leaving, current } = frame;

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    runStartRef.current = null;
  };

  // Autoplay: advance one op per tick while running (functional update inside
  // the timer callback — never in the effect body).
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

  const togglePlay = () => {
    if (done) {
      setStep(0);
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

  const newSequence = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const lastOpLabel = current
    ? current.kind === "add"
      ? `push ${current.value}`
      : `pop ${current.value}`
    : "—";

  // The top-of-stack marker (violet) sits on the newest settled cell — but not
  // while that cell is still the one animating in, and not on the leaving ghost.
  const topId =
    cells.length > 0 ? cells[cells.length - 1].id : null;

  const cellStyle = (id: number): { background: string; ring: boolean } => {
    if (id === enteringId) return { background: "var(--accent)", ring: false };
    if (id === topId) return { background: "var(--color-primary)", ring: true };
    return { background: "var(--color-output)", ring: false };
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Scoped keyframes for the top slide in/out. Flattened site-wide under
          prefers-reduced-motion (global rule zeroes animation-duration). */}
      <style>{`
        @keyframes svz-in { from { opacity: 0; transform: translateY(-16px) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes svz-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-16px) scale(0.92); } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the stack</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Stack · LIFO
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: a vertical pile, newest on top */}
      <div
        className="mt-4 flex h-64 items-end justify-center gap-3 rounded-xl bg-paper px-3 py-3"
        role="img"
        aria-label={`Stack visualization with ${cells.length} item${
          cells.length === 1 ? "" : "s"
        }, ${done ? "sequence complete" : `step ${step} of ${total}`}`}
      >
        {/* Top marker column */}
        <div className="flex h-full flex-col items-center justify-start pt-1 text-[10px] font-semibold text-muted">
          <span
            className="dp-eyebrow text-[9px]"
            style={{ color: "var(--color-primary)" }}
          >
            top ↓
          </span>
        </div>

        {/* The pile itself */}
        <div className="flex h-full flex-col-reverse items-center justify-start gap-1.5">
          {/* Leaving ghost sits above the pile (rendered last in a reversed
              column so it appears on top). */}
          {leaving && (
            <div
              key={`ghost-${leaving.id}`}
              className="flex w-24 items-center justify-center rounded-lg py-2 font-mono text-sm font-bold text-white sm:w-28"
              style={{
                background: "var(--accent)",
                animation: "svz-out 340ms var(--dp-ease, ease) forwards",
                order: 999,
              }}
            >
              {leaving.value}
            </div>
          )}
          {cells.map((c) => {
            const s = cellStyle(c.id);
            return (
              <div
                key={c.id}
                className="flex w-24 items-center justify-center rounded-lg py-2 font-mono text-sm font-bold text-white sm:w-28"
                style={{
                  background: s.background,
                  boxShadow: s.ring
                    ? "0 0 0 2px var(--color-card), 0 0 0 4px var(--color-primary)"
                    : undefined,
                  animation:
                    c.id === enteringId ? "svz-in 340ms var(--dp-ease, ease)" : undefined,
                }}
              >
                {c.value}
              </div>
            );
          })}
          {cells.length === 0 && !leaving && (
            <div className="flex w-24 items-center justify-center rounded-lg border border-dashed border-line py-2 font-mono text-xs text-muted sm:w-28">
              empty
            </div>
          )}
        </div>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(current)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Size" value={cells.length} />
        <Stat label="Last op" value={lastOpLabel} />
        <Stat label="Step" value={`${step}/${total}`} />
        <Stat label="Pushes/Pops" value={`${pushes}/${pops}`} />
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
          onClick={newSequence}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤨ New sequence
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
        <LegendDot color="var(--accent)" label="Entering / leaving" />
        <LegendDot color="var(--color-primary)" label="Top of stack" />
        <LegendDot color="var(--color-output)" label="In the stack" />
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
