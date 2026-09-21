"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   DequeViz — a "watch the deque" animated explainer for the Deque lesson.

   A deque (say "deck") is a double-ended queue: you can add or remove at
   EITHER end. It combines a stack and a queue. This visualizer plays a
   scripted mix of pushFront / pushBack / popFront / popBack, sliding a cell
   in or out at whichever end the operation touches — and lighting up that end
   — so you can see both ends are equally reachable.

   Same architecture as SortVisualizer: the run is recorded up front as a flat
   op list and replayed purely from a single `step` counter in a useMemo. No
   setState in any effect body; autoplay advances `step` from a setTimeout.
   ──────────────────────────────────────────────────────────────────────── */

type End = "front" | "back";
type Op = {
  kind: "add" | "remove";
  end: End;
  id: number;
  value: number;
};

type Cell = { id: number; value: number };

const MAX_SIZE = 6;
const NUM_OPS = 12;
const SPEEDS = [900, 620, 420, 260, 150] as const;

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

/** Build a valid scripted mix of the four deque operations: never pop an empty
 *  deque, never exceed MAX_SIZE. Values are sequential so each cell is
 *  distinct. Deterministic for a given seed. */
function buildScript(seed: number): Op[] {
  const rng = makeRng(seed);
  const ops: Op[] = [];
  const dq: Cell[] = [];
  let nextId = 0;
  let nextVal = 1;

  for (let i = 0; i < NUM_OPS; i++) {
    const empty = dq.length === 0;
    const full = dq.length >= MAX_SIZE;
    const end: End = rng() < 0.5 ? "front" : "back";
    // Fill up early, then mix pushes and pops through the middle.
    const push = empty || (!full && rng() < (i < 3 ? 0.85 : 0.5));
    if (push) {
      const cell = { id: nextId++, value: nextVal++ };
      if (end === "front") dq.unshift(cell);
      else dq.push(cell);
      ops.push({ kind: "add", end, id: cell.id, value: cell.value });
    } else {
      const cell = (end === "front" ? dq.shift() : dq.pop()) as Cell;
      ops.push({ kind: "remove", end, id: cell.id, value: cell.value });
    }
  }
  return ops;
}

function narrate(op: Op | undefined): string {
  if (!op) return "Ready. Press play — a deque lets you add or remove at either end.";
  const endWord = op.end === "front" ? "front" : "back";
  if (op.kind === "add") return `push${cap(op.end)} ${op.value}: add ${op.value} at the ${endWord}.`;
  return `pop${cap(op.end)}: remove ${op.value} from the ${endWord}.`;
}

function cap(end: End): string {
  return end === "front" ? "Front" : "Back";
}

export function DequeViz({
  accent,
  complexity,
}: {
  accent: string;
  /** e.g. "add/remove either end: O(1)" — shown as a chip. */
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => makeSeed("deque"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ops = useMemo(() => buildScript(seed), [seed]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const cells: Cell[] = [];
    let adds = 0;
    let removes = 0;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.kind === "add") {
        if (op.end === "front") cells.unshift({ id: op.id, value: op.value });
        else cells.push({ id: op.id, value: op.value });
        adds++;
      } else {
        if (op.end === "front") cells.shift();
        else cells.pop();
        removes++;
      }
    }
    const current = step > 0 ? ops[step - 1] : undefined;
    const enteringId = current && current.kind === "add" ? current.id : null;
    // A removed cell becomes a ghost sliding off the end it left from.
    const leaving: (Cell & { end: End }) | null =
      current && current.kind === "remove"
        ? { id: current.id, value: current.value, end: current.end }
        : null;
    return { cells, adds, removes, enteringId, leaving, current };
  }, [ops, step]);

  const { cells, adds, removes, enteringId, leaving, current } = frame;
  const activeEnd = current?.end ?? null;

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    runStartRef.current = null;
  };

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
    ? `${current.kind === "add" ? "push" : "pop"}${current.end === "front" ? "F" : "B"} ${current.value}`
    : "—";

  const frontId = cells.length > 0 ? cells[0].id : null;
  const backId = cells.length > 0 ? cells[cells.length - 1].id : null;

  const cellBg = (id: number): string => {
    if (id === enteringId) return "var(--accent)";
    if (id === frontId || id === backId) return "var(--color-primary)";
    return "var(--color-output)";
  };

  const endLabelColor = (end: End) =>
    activeEnd === end ? "var(--accent)" : "var(--color-primary)";

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <style>{`
        @keyframes dvz-inL { from { opacity: 0; transform: translateX(-18px) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes dvz-outL { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(-18px) scale(0.92); } }
        @keyframes dvz-inR { from { opacity: 0; transform: translateX(18px) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes dvz-outR { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(18px) scale(0.92); } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the deque</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Deque · both ends
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: a horizontal line reachable from both ends */}
      <div
        className="mt-4 rounded-xl bg-paper px-3 py-5"
        role="img"
        aria-label={`Deque visualization with ${cells.length} item${
          cells.length === 1 ? "" : "s"
        }, ${done ? "sequence complete" : `step ${step} of ${total}`}`}
      >
        <div className="flex items-center justify-between text-[10px] font-semibold">
          <span className="dp-eyebrow text-[9px]" style={{ color: endLabelColor("front") }}>
            ↞ front
          </span>
          <span className="dp-eyebrow text-[9px]" style={{ color: endLabelColor("back") }}>
            back ↠
          </span>
        </div>
        <div className="mt-2 flex min-h-[3rem] items-center justify-center gap-1.5 overflow-x-auto">
          {/* Front-leaving ghost slides off the left. */}
          {leaving && leaving.end === "front" && (
            <div
              key={`ghost-${leaving.id}`}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-white sm:w-12"
              style={{
                background: "var(--accent)",
                animation: "dvz-outL 340ms var(--dp-ease, ease) forwards",
              }}
            >
              {leaving.value}
            </div>
          )}
          {cells.map((c) => (
            <div
              key={c.id}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-white sm:w-12"
              style={{
                background: cellBg(c.id),
                animation:
                  c.id === enteringId
                    ? `${activeEnd === "front" ? "dvz-inL" : "dvz-inR"} 340ms var(--dp-ease, ease)`
                    : undefined,
              }}
            >
              {c.value}
            </div>
          ))}
          {/* Back-leaving ghost slides off the right. */}
          {leaving && leaving.end === "back" && (
            <div
              key={`ghost-${leaving.id}`}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-white sm:w-12"
              style={{
                background: "var(--accent)",
                animation: "dvz-outR 340ms var(--dp-ease, ease) forwards",
              }}
            >
              {leaving.value}
            </div>
          )}
          {cells.length === 0 && !leaving && (
            <div className="flex h-11 w-full items-center justify-center rounded-lg border border-dashed border-line font-mono text-xs text-muted">
              empty deque
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
        <Stat label="Adds/Rem" value={`${adds}/${removes}`} />
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
        <LegendDot color="var(--accent)" label="Active end (added / removed)" />
        <LegendDot color="var(--color-primary)" label="Front & back" />
        <LegendDot color="var(--color-output)" label="Settled items" />
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
