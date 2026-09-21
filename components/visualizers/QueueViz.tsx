"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   QueueViz — a "watch the queue" animated explainer for the Queue lesson.

   A queue is FIFO: First In, First Out (a line at a coffee shop). New items
   ENQUEUE at the back; DEQUEUE always serves the item at the front — the one
   that has waited longest. This visualizer plays a scripted sequence of
   enqueue/dequeue operations, sliding cells in at the back (right) and out at
   the front (left), so you can see the oldest item is always served first.

   Same architecture as SortVisualizer: the run is recorded up front as a flat
   op list and replayed purely from a single `step` counter inside a useMemo.
   No setState is ever called in an effect body; autoplay advances `step` from
   a setTimeout callback.
   ──────────────────────────────────────────────────────────────────────── */

type CellValue = number | string;
type Op = {
  kind: "add" | "remove"; // enqueue | dequeue
  id: number;
  value: CellValue;
};

type Cell = { id: number; value: CellValue };

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

/** Build a valid scripted enqueue/dequeue sequence: never dequeue an empty
 *  queue, never exceed MAX_SIZE. Values are sequential so the smallest number
 *  is always the oldest — making "oldest served first" easy to read. */
function buildScript(seed: number): Op[] {
  const rng = makeRng(seed);
  const ops: Op[] = [];
  const queue: Cell[] = [];
  let nextId = 0;
  let nextVal = 1;

  for (let i = 0; i < NUM_OPS; i++) {
    const empty = queue.length === 0;
    const full = queue.length >= MAX_SIZE;
    // Front-load a few enqueues, then interleave; force a dequeue at the end.
    const forceDeq = i === NUM_OPS - 1 && queue.length > 0;
    const enqueue = !forceDeq && (empty || (!full && rng() < (i < 3 ? 0.9 : 0.52)));
    if (enqueue) {
      const cell = { id: nextId++, value: nextVal++ };
      queue.push(cell);
      ops.push({ kind: "add", id: cell.id, value: cell.value });
    } else {
      const cell = queue.shift() as Cell;
      ops.push({ kind: "remove", id: cell.id, value: cell.value });
    }
  }
  return ops;
}

function narrate(op: Op | undefined): string {
  if (!op) return "Ready. Press play — enqueue joins the back, dequeue serves the front.";
  if (op.kind === "add") return `enqueue ${op.value}: ${op.value} joins the back of the line.`;
  return `dequeue: serve ${op.value} — the oldest waiting item leaves the front (FIFO).`;
}

/** Read a call argument as a number or a quoted-string literal. Returns null
 *  for anything we can't reproduce literally (a variable, an expression). */
function parseArg(raw: string): CellValue | null {
  const t = raw.trim();
  if (t === "") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(t)) return Number(t);
  const m = /^(["'`])([\s\S]*)\1$/.exec(t);
  if (m) return m[2];
  return null;
}

/** Parse the lesson demo's enqueue/dequeue sequence (e.g. `q.enqueue("a");
 *  q.dequeue()`) into a recorded op list, so the animation runs on the exact
 *  data shown in the editor. Returns null if there's no usable demo — the
 *  component then falls back to its random scripted sequence. */
function parseQueueCode(code: string | undefined): Op[] | null {
  if (!code) return null;
  const inst = /(?:const|let|var)\s+(\w+)\s*=\s*new\s+Queue\s*\(/.exec(code);
  if (!inst) return null;
  const name = inst[1];
  const callRe = new RegExp(`\\b${name}\\.(enqueue|dequeue)\\s*\\(([^)]*)\\)`, "g");
  const ops: Op[] = [];
  const queue: Cell[] = [];
  let nextId = 0;
  let peak = 0;
  let m: RegExpExecArray | null;
  while ((m = callRe.exec(code)) !== null) {
    if (m[1] === "enqueue") {
      const val = parseArg(m[2]);
      if (val === null) return null;
      const cell = { id: nextId++, value: val };
      queue.push(cell);
      peak = Math.max(peak, queue.length);
      ops.push({ kind: "add", id: cell.id, value: cell.value });
    } else {
      const cell = queue.shift();
      if (!cell) return null; // dequeue on empty → not a valid demo
      ops.push({ kind: "remove", id: cell.id, value: cell.value });
    }
  }
  if (ops.length < 2 || peak > MAX_SIZE || peak < 1 || ops.length > 24) return null;
  if (!ops.some((o) => o.kind === "add")) return null;
  return ops;
}

export function QueueViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  /** e.g. "enqueue: O(1) · dequeue: O(1) · front: O(1)" — shown as a chip. */
  complexity?: string;
  /** The lesson's JavaScript source — parsed for its exact enqueue/dequeue demo. */
  code?: string;
}) {
  const codeOps = useMemo(() => parseQueueCode(code), [code]);
  const hasCodeData = codeOps !== null;
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(() => makeSeed("queue"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ops = useMemo(
    () => (useCode && codeOps ? codeOps : buildScript(seed)),
    [useCode, codeOps, seed],
  );
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const cells: Cell[] = [];
    let enq = 0;
    let deq = 0;
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      if (op.kind === "add") {
        cells.push({ id: op.id, value: op.value });
        enq++;
      } else {
        cells.shift();
        deq++;
      }
    }
    const current = step > 0 ? ops[step - 1] : undefined;
    // A just-enqueued cell is the back (last) of `cells`.
    const enteringId = current && current.kind === "add" ? current.id : null;
    // A dequeued cell is reconstructed as a ghost shown sliding off the front.
    const leaving: Cell | null =
      current && current.kind === "remove"
        ? { id: current.id, value: current.value }
        : null;
    return { cells, enq, deq, enteringId, leaving, current };
  }, [ops, step]);

  const { cells, enq, deq, enteringId, leaving, current } = frame;

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

  const toggleSource = (next: boolean) => {
    reset();
    setUseCode(next);
  };

  const lastOpLabel = current
    ? current.kind === "add"
      ? `enq ${current.value}`
      : `deq ${current.value}`
    : "—";

  const frontId = cells.length > 0 ? cells[0].id : null;
  const backId = cells.length > 0 ? cells[cells.length - 1].id : null;

  const cellBg = (id: number): string => {
    if (id === enteringId) return "var(--accent)";
    if (id === frontId || id === backId) return "var(--color-primary)";
    return "var(--color-output)";
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <style>{`
        @keyframes qvz-in { from { opacity: 0; transform: translateX(18px) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes qvz-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(-18px) scale(0.92); } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the queue</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Queue · FIFO
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: a horizontal line — front at left, back at right */}
      <div
        className="mt-4 rounded-xl bg-paper px-3 py-5"
        role="img"
        aria-label={`Queue visualization with ${cells.length} item${
          cells.length === 1 ? "" : "s"
        }, ${done ? "sequence complete" : `step ${step} of ${total}`}`}
      >
        <div className="flex items-center justify-between text-[10px] font-semibold">
          <span className="dp-eyebrow text-[9px]" style={{ color: "var(--color-primary)" }}>
            front → serve
          </span>
          <span className="dp-eyebrow text-[9px]" style={{ color: "var(--color-primary)" }}>
            join ← back
          </span>
        </div>
        <div className="mt-2 flex min-h-[3rem] items-center gap-1.5 overflow-x-auto">
          {/* Leaving ghost slides off the front (left-most). */}
          {leaving && (
            <div
              key={`ghost-${leaving.id}`}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-white sm:w-12"
              style={{
                background: "var(--accent)",
                animation: "qvz-out 340ms var(--dp-ease, ease) forwards",
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
                  c.id === enteringId ? "qvz-in 340ms var(--dp-ease, ease)" : undefined,
              }}
            >
              {c.value}
            </div>
          ))}
          {cells.length === 0 && !leaving && (
            <div className="flex h-11 w-full items-center justify-center rounded-lg border border-dashed border-line font-mono text-xs text-muted">
              empty queue
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
        <Stat label="Enq/Deq" value={`${enq}/${deq}`} />
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
          disabled={useCode}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          ⤨ New sequence
        </button>

        {/* Data source: the lesson's own enqueue/dequeue demo vs a random sequence. */}
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
        <LegendDot color="var(--accent)" label="Entering / leaving" />
        <LegendDot color="var(--color-primary)" label="Front & back" />
        <LegendDot color="var(--color-output)" label="Waiting in line" />
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
