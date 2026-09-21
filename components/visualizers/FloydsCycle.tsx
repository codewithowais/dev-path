"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   FloydsCycle — a "watch it lap" explainer for Floyd's cycle detection.

   A linked list is drawn as nodes with .next arrows; its tail secretly loops
   back into the middle, so the chain has a cycle. Two pointers start at the
   head: the tortoise (slow) hops one node per tick, the hare (fast) hops two.
   On a straight list the hare would run off the end — but here the loop keeps
   the hare circling until it laps the tortoise and they land on the same node.
   That collision is the proof of a cycle, found with O(1) extra memory.

   The whole chase is recorded up front as frames and replayed from a single
   `step` index — deterministic, scrubbable, StrictMode-safe. The only state
   that changes during playback is `step` (a setTimeout functional update) and
   `elapsed` (a setInterval). Motion is disabled under prefers-reduced-motion
   (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Config = { n: number; cycleStart: number }; // cycleStart is 0-based node

const CONFIGS: readonly Config[] = [
  { n: 5, cycleStart: 2 }, // the lesson's list: 1→2→3→4→5→3
  { n: 6, cycleStart: 3 },
  { n: 6, cycleStart: 1 },
  { n: 5, cycleStart: 0 }, // whole list is one loop
];

type Frame = {
  slow: number;
  fast: number;
  meet: boolean;
  hops: number; // pointer-advance rounds so far
  caption: string;
};

function buildFrames(cfg: Config): Frame[] {
  const { n, cycleStart } = cfg;
  const next = (i: number) => (i === n - 1 ? cycleStart : i + 1);
  const frames: Frame[] = [];

  let slow = 0;
  let fast = 0;
  frames.push({
    slow,
    fast,
    meet: false,
    hops: 0,
    caption: "Both the tortoise (slow) and the hare (fast) start at the head.",
  });

  // The list always has a cycle here, so the two pointers must meet; cap the
  // loop defensively at a few laps just in case.
  for (let round = 1; round <= n * 3; round++) {
    slow = next(slow);
    fast = next(next(fast));
    const meet = slow === fast;
    frames.push({
      slow,
      fast,
      meet,
      hops: round,
      caption: meet
        ? `Both pointers landed on node ${slow + 1} — they met, so the list has a cycle.`
        : `Tortoise hops 1 → node ${slow + 1}; hare hops 2 → node ${fast + 1}.`,
    });
    if (meet) break;
  }

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

const SPEEDS = [1100, 750, 500, 300, 160] as const;
const SLOW = "var(--accent)";
const FAST = "var(--color-primary)";

export function FloydsCycle({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(0);

  const cfg = useMemo(() => {
    const idx = Math.floor(makeRng(seed + 1)() * CONFIGS.length) % CONFIGS.length;
    return CONFIGS[idx];
  }, [seed]);

  const frames = useMemo(() => buildFrames(cfg), [cfg]);
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
  const { n, cycleStart } = cfg;
  const mu = cycleStart; // tail length before the loop
  const loopLen = n - cycleStart;

  // Layout: tail nodes on a horizontal line, loop nodes around a circle whose
  // leftmost point is the loop's entry node (nearest the tail).
  const VB_W = 360;
  const VB_H = 232;
  const CY = 120;
  const X0 = 40;
  const DX = 60;
  const R = loopLen <= 3 ? 52 : 60;

  const pos = useMemo(() => {
    const p: { x: number; y: number }[] = [];
    for (let i = 0; i < mu; i++) p.push({ x: X0 + i * DX, y: CY });
    const lastTailX = mu > 0 ? X0 + (mu - 1) * DX : X0 - DX;
    const loopCX = lastTailX + DX + R;
    for (let k = 0; k < loopLen; k++) {
      const ang = (Math.PI * (180 - (360 / loopLen) * k)) / 180;
      p.push({ x: loopCX + R * Math.cos(ang), y: CY + R * Math.sin(ang) });
    }
    return p;
  }, [mu, loopLen, R]);

  const next = (i: number) => (i === n - 1 ? cycleStart : i + 1);

  /** Boundary point on a node circle (r=18) toward a target. */
  const edge = (a: number, b: number) => {
    const dx = pos[b].x - pos[a].x;
    const dy = pos[b].y - pos[a].y;
    const d = Math.hypot(dx, dy) || 1;
    return { x: pos[a].x + (dx / d) * 20, y: pos[a].y + (dy / d) * 20 };
  };

  const nodeFill = (i: number) => {
    if (f.meet && (i === f.slow || i === f.fast)) return "var(--color-output)";
    if (i === f.slow && i === f.fast) return "var(--color-output)";
    if (i === f.slow) return SLOW;
    if (i === f.fast) return FAST;
    return "var(--color-card)";
  };
  const isColored = (i: number) => i === f.slow || i === f.fast;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it lap</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Floyd&rsquo;s cycle detection
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The linked list */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="mx-auto block h-56 w-full sm:h-64"
          role="img"
          aria-label={`Linked list with a cycle. Slow pointer on node ${f.slow + 1}, fast pointer on node ${f.fast + 1}. ${f.caption}`}
        >
          <defs>
            <marker
              id="floyd-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6.5"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="color-mix(in srgb, var(--color-muted) 55%, white)" />
            </marker>
          </defs>

          {/* .next arrows */}
          {Array.from({ length: n }).map((_, i) => {
            const j = next(i);
            const s = edge(i, j);
            const e = edge(j, i);
            const isBack = j === cycleStart && i === n - 1 && loopLen < n;
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={e.x}
                y2={e.y}
                stroke={
                  isBack
                    ? "color-mix(in srgb, var(--color-primary) 45%, white)"
                    : "color-mix(in srgb, var(--color-muted) 42%, white)"
                }
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={isBack ? "5 4" : undefined}
                markerEnd="url(#floyd-arrow)"
              />
            );
          })}

          {/* nodes */}
          {Array.from({ length: n }).map((_, i) => {
            const fill = nodeFill(i);
            const colored = isColored(i) || (f.meet && i === f.slow);
            return (
              <g key={i}>
                {i === f.slow && i === f.fast && (
                  <circle cx={pos[i].x} cy={pos[i].y} r={25} fill="none" stroke="var(--color-output)" strokeWidth={2} opacity={0.5} />
                )}
                <circle
                  cx={pos[i].x}
                  cy={pos[i].y}
                  r={18}
                  fill={fill}
                  stroke={colored ? fill : "var(--color-line)"}
                  strokeWidth={2}
                  style={{ transition: "fill 200ms" }}
                />
                <text
                  x={pos[i].x}
                  y={pos[i].y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={700}
                  fill={colored ? "#fff" : "var(--color-ink)"}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* head label */}
          <text
            x={pos[0].x}
            y={pos[0].y - 28}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill="var(--color-muted)"
            style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" }}
          >
            head
          </text>

          {/* pointer badges: slow below, fast above (offset so both read) */}
          <PointerBadge x={pos[f.slow].x} y={pos[f.slow].y + 30} label="S" color={SLOW} />
          <PointerBadge x={pos[f.fast].x} y={pos[f.fast].y - 30} label="H" color={FAST} />
        </svg>
      </div>

      {/* Commentary */}
      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {f.caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Slow (S)" value={f.slow + 1} />
        <Stat label="Fast (H)" value={f.fast + 1} />
        <Stat label="Rounds" value={f.hops} />
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
          ⤨ New list
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
        <LegendDot color={SLOW} label="Tortoise (slow, +1)" />
        <LegendDot color={FAST} label="Hare (fast, +2)" />
        <LegendDot color="var(--color-output)" label="They meet → cycle" />
      </div>
    </div>
  );
}

function PointerBadge({
  x,
  y,
  label,
  color,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
}) {
  return (
    <g style={{ transition: "transform 200ms" }}>
      <circle cx={x} cy={y} r={9} fill={color} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill="#fff"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        {label}
      </text>
    </g>
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
