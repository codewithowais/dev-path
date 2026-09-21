"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   PriorityQueueViz — a "watch it board" explainer for a heap-backed priority
   queue. Like airport boarding, arrival order doesn't matter: whoever has the
   best priority leaves next. Here a LOWER number means MORE urgent (priority 1
   boards before priority 3).

   Under the hood it's a min-heap keyed by priority. enqueue(item, p) drops the
   item at the end and lets it bubble up past any less-urgent parent; dequeue()
   removes the root (always the most urgent), moves the last item to the top,
   and sifts it back down. Both are O(log n). The tree and the backing array are
   shown together so you can watch the heap reorder itself.

   The run is precomputed as frames and replayed from a single `step` index —
   deterministic, scrubbable, StrictMode-safe. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Item = { label: string; p: number };

type Frame = {
  heap: Item[];
  compare: number[]; // accent
  swap: [number, number] | null; // violet
  special: number | null; // coral
  caption: string;
  dequeued: string[]; // labels boarded so far, best-first
};

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

const LABELS = ["mail", "build", "sync", "cache", "scan", "report", "ping", "alarm"] as const;

/** Five items with distinct priorities 1..9, seeded for a stable first paint. */
function pickItems(seed: number): Item[] {
  const rng = makeRng(seed);
  const labels = [...LABELS];
  for (let i = labels.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }
  const prios = Array.from({ length: 9 }, (_, i) => i + 1);
  for (let i = prios.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [prios[i], prios[j]] = [prios[j], prios[i]];
  }
  return labels.slice(0, 5).map((label, i) => ({ label, p: prios[i] }));
}

function build(seed: number): Frame[] {
  const items = pickItems(seed);
  const heap: Item[] = [];
  const dequeued: string[] = [];
  const frames: Frame[] = [];

  const snap = (extra: Partial<Frame>): Frame => ({
    heap: heap.map((x) => ({ ...x })),
    compare: [],
    swap: null,
    special: null,
    caption: "",
    dequeued: [...dequeued],
    ...extra,
  });

  frames.push(snap({ caption: "Empty queue. Enqueue tasks — lower number = more urgent." }));

  // Enqueue phase — sift up by priority.
  for (const it of items) {
    heap.push({ ...it });
    let i = heap.length - 1;
    frames.push(
      snap({ special: i, caption: `Enqueue ${it.label} (priority ${it.p}) at the end.` }),
    );
    let settled = true;
    while (i > 0) {
      const par = (i - 1) >> 1;
      frames.push(
        snap({
          compare: [i, par],
          caption: `Is ${heap[i].label} (${heap[i].p}) more urgent than ${heap[par].label} (${heap[par].p})?`,
        }),
      );
      if (heap[par].p <= heap[i].p) {
        frames.push(
          snap({ special: i, caption: `${heap[par].p} ≤ ${heap[i].p} — ${heap[i].label} settles here.` }),
        );
        settled = false;
        break;
      }
      [heap[par], heap[i]] = [heap[i], heap[par]];
      frames.push(
        snap({ swap: [i, par], caption: `More urgent — bubble ${heap[par].label} up.` }),
      );
      i = par;
    }
    if (settled) {
      frames.push(snap({ special: 0, caption: `${heap[0].label} is now the most urgent.` }));
    }
  }

  // Dequeue phase — twice.
  const dequeue = () => {
    if (heap.length === 0) return;
    const top = heap[0];
    frames.push(
      snap({ special: 0, caption: `Dequeue ${top.label} — best priority (${top.p}) boards next.` }),
    );
    const last = heap.length - 1;
    if (last > 0) {
      [heap[0], heap[last]] = [heap[last], heap[0]];
      frames.push(
        snap({ swap: [0, last], caption: `Move the last item ${heap[0].label} to the top.` }),
      );
    }
    heap.pop();
    dequeued.push(top.label);
    frames.push(
      snap({
        caption: heap.length
          ? `${top.label} boarded. Sift ${heap[0].label} down to restore order.`
          : `${top.label} boarded. The queue is empty.`,
      }),
    );
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      const kids: number[] = [];
      if (l < heap.length) kids.push(l);
      if (r < heap.length) kids.push(r);
      if (kids.length === 0) {
        frames.push(snap({ special: i, caption: `${heap[i].label} reached the bottom — settled.` }));
        break;
      }
      let s = i;
      for (const k of kids) if (heap[k].p < heap[s].p) s = k;
      frames.push(
        snap({
          compare: [i, ...kids],
          caption: `Compare ${heap[i].label} (${heap[i].p}) with ${kids
            .map((k) => `${heap[k].label} (${heap[k].p})`)
            .join(" & ")}.`,
        }),
      );
      if (s === i) {
        frames.push(snap({ special: i, caption: `${heap[i].label} is the most urgent here — settled.` }));
        break;
      }
      [heap[i], heap[s]] = [heap[s], heap[i]];
      frames.push(
        snap({ swap: [i, s], caption: `${heap[i].label} is more urgent — it rises.` }),
      );
      i = s;
    }
  };
  dequeue();
  dequeue();

  return frames;
}

const SPEEDS = [1100, 750, 480, 300, 160] as const;
const IDLE = "color-mix(in srgb, var(--accent) 18%, white)";

function nodePos(i: number, maxDepth: number, vbw: number, vbh: number) {
  const d = Math.floor(Math.log2(i + 1));
  const levelStart = (1 << d) - 1;
  const within = i - levelStart;
  const levelCount = 1 << d;
  return {
    x: ((within + 0.5) / levelCount) * vbw,
    y: ((d + 0.5) / (maxDepth + 1)) * vbh,
  };
}

export function PriorityQueueViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(1);
  const frames = useMemo(() => build(seed), [seed]);
  const total = frames.length;

  const maxLen = useMemo(() => Math.max(1, ...frames.map((f) => f.heap.length)), [frames]);
  const maxDepth = Math.floor(Math.log2(maxLen));
  const vbw = (1 << maxDepth) * 80;
  const vbh = (maxDepth + 1) * 82;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState<number>(2);
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
  const compareSet = new Set(f.compare);
  const swapSet = new Set(f.swap ?? []);

  const cellState = (i: number): "compare" | "swap" | "special" | "idle" => {
    if (f.swap && swapSet.has(i)) return "swap";
    if (f.special === i) return "special";
    if (compareSet.has(i)) return "compare";
    return "idle";
  };
  const fillFor = (st: ReturnType<typeof cellState>) =>
    st === "compare"
      ? "var(--accent)"
      : st === "swap"
        ? "var(--color-primary)"
        : st === "special"
          ? "var(--color-here)"
          : IDLE;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it board</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Priority queue
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          low&nbsp;=&nbsp;urgent
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* The heap tree */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${vbw} ${vbh}`}
          className="mx-auto block h-48 w-full sm:h-56"
          role="img"
          aria-label={`Priority queue heap with ${f.heap.length} item${
            f.heap.length === 1 ? "" : "s"
          }; ${f.caption}`}
        >
          {/* Edges */}
          {f.heap.map((_, i) => {
            if (i === 0) return null;
            const par = (i - 1) >> 1;
            const a = nodePos(par, maxDepth, vbw, vbh);
            const b = nodePos(i, maxDepth, vbw, vbh);
            return (
              <line
                key={`e-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-line)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {/* Nodes: priority is the big number, label sits underneath */}
          {f.heap.map((it, i) => {
            const st = cellState(i);
            const fill = fillFor(st);
            const colored = st !== "idle";
            const pos = nodePos(i, maxDepth, vbw, vbh);
            return (
              <g key={`n-${i}`}>
                {st === "compare" && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={16}
                  fill={fill}
                  stroke={colored ? fill : "var(--color-line)"}
                  strokeWidth={2}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={700}
                  fill={colored ? "#fff" : "var(--color-ink)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {it.p}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 27}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight={600}
                  fill="var(--color-muted)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {it.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Backing array + boarded list */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="dp-eyebrow mb-1.5 text-muted">Backing array</div>
          <div className="flex flex-wrap gap-1.5">
            {f.heap.length === 0 && <span className="text-sm text-muted">empty</span>}
            {f.heap.map((it, i) => {
              const st = cellState(i);
              const fill = fillFor(st);
              const colored = st !== "idle";
              return (
                <span
                  key={`a-${i}`}
                  className="flex h-10 w-12 flex-col items-center justify-center rounded-lg font-mono leading-tight"
                  style={{
                    background: fill,
                    color: colored ? "#fff" : "var(--color-ink)",
                    boxShadow: colored ? undefined : "inset 0 0 0 1px var(--color-line)",
                  }}
                >
                  <span className="text-sm font-bold">{it.p}</span>
                  <span className="text-[9px] opacity-80">{it.label}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div className="dp-eyebrow mb-1.5 text-muted">Boarded (best first)</div>
          <div className="flex min-h-[28px] flex-wrap gap-1.5">
            {f.dequeued.length === 0 && <span className="text-sm text-muted">—</span>}
            {f.dequeued.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="flex h-7 items-center rounded-lg px-2 font-mono text-xs font-bold"
                style={{
                  background: "color-mix(in srgb, var(--color-here) 18%, white)",
                  color: "var(--color-ink)",
                  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-here) 45%, white)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {f.caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="In queue" value={f.heap.length} />
        <Stat label="Next out" value={f.heap.length ? `${f.heap[0].label}·${f.heap[0].p}` : "—"} />
        <Stat label="Boarded" value={f.dequeued.length} />
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
        <LegendDot color="var(--accent)" label="Comparing" />
        <LegendDot color="var(--color-primary)" label="Swapping" />
        <LegendDot color="var(--color-here)" label="Most urgent" />
        <LegendDot color={IDLE} label="Waiting" ring />
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

function LegendDot({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: color,
          boxShadow: ring ? "inset 0 0 0 1px var(--color-line)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
