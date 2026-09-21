"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SkipListViz — a "ride the express lane" explainer for the Skip List lesson.
   The bottom level is a complete sorted linked list (every value). Higher
   levels are express lanes holding only some of those same nodes, so they skip
   over chunks of the level below. A search starts at the head on the top level
   and moves right while the next node is still less than the target; the
   moment moving right would overshoot, it drops down a level — landing on the
   target after only a handful of hops.

   Node levels are assigned exactly as the lesson does (deterministically, from
   how many times the insert count divides by two), giving the classic 8·4·2·1
   express-lane pyramid. Architecture mirrors GraphVisualizer/SortVisualizer:
   the whole search is recorded up front and replayed purely from a single
   `step` index — deterministic, scrubbable and StrictMode-safe. The only state
   changing during playback is `step` (setTimeout functional update) and
   `elapsed` (setInterval); no setState in an effect body. "New input"
   reshuffles the values and target with a seeded PRNG so server and client
   first render match. Motion is disabled under prefers-reduced-motion (handled
   globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

const MAX_LEVEL = 3;
const HEAD = 0; // sentinel node id for the head (-∞)

type SkipNode = { id: number; value: number; level: number; pos: number };

/** Deterministic level, exactly the lesson's _levelFor: count how many times
 *  n divides evenly by two (capped at MAX_LEVEL). */
function levelFor(n: number): number {
  let level = 0;
  while (n % 2 === 0 && level < MAX_LEVEL) {
    n = Math.floor(n / 2);
    level++;
  }
  return level;
}

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

const BASE_SEED = 3;

type Plan = { insertOrder: number[]; target: number };

/** Seed BASE_SEED reproduces the lesson (insert 50 10 30 70 20 60 40 80, then
 *  search 40); other seeds vary the eight values and the target (sometimes a
 *  value that is present, sometimes one that is missing). */
function makePlan(seed: number): Plan {
  if (seed === BASE_SEED) {
    return { insertOrder: [50, 10, 30, 70, 20, 60, 40, 80], target: 40 };
  }
  const rng = makeRng(seed);
  // Eight distinct multiples of 5 in 10..95, in a shuffled insert order.
  const pool: number[] = [];
  for (let v = 10; v <= 95; v += 5) pool.push(v);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const insertOrder = pool.slice(0, 8);
  const present = rng() < 0.6;
  let target: number;
  if (present) {
    target = insertOrder[Math.floor(rng() * insertOrder.length)];
  } else {
    // A miss: a multiple-of-5 value not inserted, or between two values.
    const sorted = [...insertOrder].sort((a, b) => a - b);
    target = sorted[Math.floor(rng() * (sorted.length - 1))] + 2; // lands in a gap
  }
  return { insertOrder, target };
}

type Frame = {
  cursor: number; // node id the search sits on (HEAD = 0)
  level: number; // current search level; -1 once finished
  hop: { from: number; to: number; level: number } | null; // link just ridden
  overshoot: number | null; // next node that forced a drop (coral)
  landing: number | null; // node landed on at level 0
  result: "searching" | "found" | "missing";
  hops: number; // forward + down moves so far
  caption: string;
};

function buildModel(plan: Plan) {
  // Assign levels by insertion index (1-based), then sort by value.
  const nodes: SkipNode[] = plan.insertOrder.map((value, idx) => ({
    id: idx + 1,
    value,
    level: levelFor(idx + 1),
    pos: 0,
  }));
  nodes.sort((a, b) => a.value - b.value);
  nodes.forEach((n, i) => (n.pos = i + 1)); // column index; head = 0
  const topLevel = nodes.reduce((m, n) => Math.max(m, n.level), 0);
  return { nodes, topLevel };
}

/** Present nodes on a level, head first, in sorted order. */
function levelNodes(nodes: SkipNode[], level: number): (SkipNode | null)[] {
  return [null, ...nodes.filter((n) => n.level >= level)];
}

function buildFrames(plan: Plan): Frame[] {
  const { nodes, topLevel } = buildModel(plan);
  const target = plan.target;
  const frames: Frame[] = [];
  let hops = 0;

  const idOf = (n: SkipNode | null) => (n == null ? HEAD : n.id);
  const valOf = (n: SkipNode | null) => (n == null ? -Infinity : n.value);

  // next present node after `cur` on `level`.
  const nextAt = (curId: number, level: number): SkipNode | null => {
    const list = levelNodes(nodes, level);
    const idx = list.findIndex((n) => idOf(n) === curId);
    if (idx < 0 || idx + 1 >= list.length) return null;
    return list[idx + 1];
  };

  frames.push({
    cursor: HEAD,
    level: topLevel,
    hop: null,
    overshoot: null,
    landing: null,
    result: "searching",
    hops: 0,
    caption: `Search for ${target}: start at the head on the top express lane (level ${topLevel}).`,
  });

  let curId = HEAD;
  for (let level = topLevel; level >= 0; level--) {
    // Move right while the next node stays below the target.
    for (;;) {
      const nx = nextAt(curId, level);
      if (nx != null && nx.value < target) {
        hops++;
        frames.push({
          cursor: nx.id,
          level,
          hop: { from: curId, to: nx.id, level },
          overshoot: null,
          landing: null,
          result: "searching",
          hops,
          caption: `Level ${level}: next is ${nx.value} < ${target} — ride right to ${nx.value}.`,
        });
        curId = nx.id;
      } else {
        const overshoot = nx == null ? null : nx.id;
        const nextTxt = nx == null ? "the end of this lane" : `${nx.value} ≥ ${target}`;
        if (level > 0) {
          hops++;
          frames.push({
            cursor: curId,
            level: level - 1,
            hop: null,
            overshoot,
            landing: null,
            result: "searching",
            hops,
            caption: `Level ${level}: next would overshoot (${nextTxt}) — drop down to level ${level - 1}.`,
          });
        } else {
          frames.push({
            cursor: curId,
            level: 0,
            hop: null,
            overshoot,
            landing: null,
            result: "searching",
            hops,
            caption: `Level 0: next would overshoot (${nextTxt}) — stop and check.`,
          });
        }
        break;
      }
    }
  }

  // Land on the first node at the bottom and compare.
  const land = nextAt(curId, 0);
  const found = land != null && land.value === target;
  frames.push({
    cursor: curId,
    level: -1,
    hop: null,
    overshoot: found ? null : idOf(land),
    landing: idOf(land),
    result: found ? "found" : "missing",
    hops,
    caption: found
      ? `Landed on ${target} after ${hops} hops — found it.`
      : `The next node is ${
          land == null ? "past the end" : valOf(land)
        }, not ${target} — ${target} is not in the list.`,
  });

  return frames;
}

/* ───────────────────────────── Geometry ────────────────────────────── */
const COLS = 9; // head + 8 values
const PITCH = 42;
const PAD_L = 22;
const R = 15;
const TOP_Y = 24;
const ROW_GAP = 40;
const CONTENT_W = PAD_L * 2 + (COLS - 1) * PITCH + R * 2;
const colX = (pos: number) => PAD_L + R + pos * PITCH;

const SPEEDS = [1100, 750, 500, 300, 160] as const;

export function SkipListViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(BASE_SEED);
  const plan = useMemo(() => makePlan(seed), [seed]);
  const model = useMemo(() => buildModel(plan), [plan]);
  const frames = useMemo(() => buildFrames(plan), [plan]);
  const total = frames.length;

  const [step, setStep] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(2);
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
  const { nodes, topLevel } = model;
  const svgH = TOP_Y + topLevel * ROW_GAP + R + 20;
  const rowY = (level: number) => TOP_Y + (topLevel - level) * ROW_GAP;

  const posOf = (id: number) =>
    id === HEAD ? 0 : nodes.find((n) => n.id === id)?.pos ?? 0;

  // Segments per level between consecutive present nodes (for the lane lines).
  const segments: { level: number; from: number; to: number }[] = [];
  for (let level = 0; level <= topLevel; level++) {
    const list = levelNodes(nodes, level);
    for (let i = 0; i < list.length - 1; i++) {
      segments.push({
        level,
        from: list[i] == null ? HEAD : (list[i] as SkipNode).id,
        to: (list[i + 1] as SkipNode).id,
      });
    }
  }

  const nodeFill = (id: number): { fill: string; stroke: string; text: string } => {
    if (f.result === "found" && f.landing === id)
      return { fill: "var(--accent)", stroke: "var(--accent)", text: "#fff" };
    if (f.overshoot === id)
      return {
        fill: "color-mix(in srgb, var(--color-here) 22%, white)",
        stroke: "var(--color-here)",
        text: "var(--color-ink)",
      };
    if (f.cursor === id)
      return {
        fill: "color-mix(in srgb, var(--accent) 20%, white)",
        stroke: "var(--accent)",
        text: "var(--color-ink)",
      };
    return { fill: "var(--color-card)", stroke: "var(--color-line)", text: "var(--color-ink)" };
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Ride the express lane</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Skip list
        </span>
        <span
          className="rounded-pill border px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, white)" }}
        >
          find&nbsp;{plan.target}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The stacked levels */}
      <div className="mt-3 overflow-x-auto rounded-xl bg-paper px-1 py-2">
        <svg
          width={CONTENT_W}
          height={svgH}
          viewBox={`0 0 ${CONTENT_W} ${svgH}`}
          className="mx-auto block"
          role="img"
          aria-label={`Skip list with ${nodes.length} values across ${
            topLevel + 1
          } levels, searching for ${plan.target}. ${f.caption}`}
        >
          <defs>
            <marker
              id="skip-head"
              markerWidth="7"
              markerHeight="7"
              refX="5.5"
              refY="3.5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L7,3.5 L0,7 Z" style={{ fill: "var(--accent)" }} />
            </marker>
          </defs>

          {/* Level labels */}
          {Array.from({ length: topLevel + 1 }, (_, k) => k).map((level) => (
            <text
              key={`lvl-${level}`}
              x={2}
              y={rowY(level) + 3}
              fontSize={8}
              fontWeight={700}
              fill={f.level === level ? "var(--accent)" : "var(--color-muted)"}
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              L{level}
            </text>
          ))}

          {/* Vertical spine linking the head across all levels */}
          <line
            x1={colX(0)}
            y1={rowY(topLevel)}
            x2={colX(0)}
            y2={rowY(0)}
            stroke="color-mix(in srgb, var(--color-muted) 30%, white)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Lane segments */}
          {segments.map((s) => {
            const active =
              f.hop != null &&
              f.hop.level === s.level &&
              f.hop.from === s.from &&
              f.hop.to === s.to;
            const y = rowY(s.level);
            const x1 = colX(posOf(s.from)) + R;
            const x2 = colX(posOf(s.to)) - R;
            return (
              <line
                key={`seg-${s.level}-${s.from}-${s.to}`}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke={
                  active
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--color-muted) 34%, white)"
                }
                strokeWidth={active ? 3.5 : 2}
                strokeLinecap="round"
                markerEnd={active ? "url(#skip-head)" : undefined}
                style={{ transition: "stroke 160ms" }}
              />
            );
          })}

          {/* Head node at each level */}
          {Array.from({ length: topLevel + 1 }, (_, k) => k).map((level) => {
            const col = nodeFill(HEAD);
            const onCursor = f.cursor === HEAD && (f.level === level || f.level === -1);
            return (
              <g key={`head-${level}`}>
                {onCursor && level === Math.max(f.level, 0) && (
                  <circle
                    cx={colX(0)}
                    cy={rowY(level)}
                    r={R + 4}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    opacity={0.5}
                  />
                )}
                <circle
                  cx={colX(0)}
                  cy={rowY(level)}
                  r={R}
                  fill={onCursor ? col.fill : "var(--color-card)"}
                  stroke={onCursor ? "var(--accent)" : "var(--color-line)"}
                  strokeWidth={2}
                />
                <text
                  x={colX(0)}
                  y={rowY(level)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={700}
                  fill="var(--color-muted)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  H
                </text>
              </g>
            );
          })}

          {/* Value nodes at every level they occupy */}
          {nodes.map((n) =>
            Array.from({ length: n.level + 1 }, (_, k) => k).map((level) => {
              const col = nodeFill(n.id);
              const isCursor = f.cursor === n.id && (level === Math.max(f.level, 0));
              return (
                <g key={`n-${n.id}-${level}`}>
                  {isCursor && (
                    <circle
                      cx={colX(n.pos)}
                      cy={rowY(level)}
                      r={R + 4}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      opacity={0.5}
                    />
                  )}
                  <circle
                    cx={colX(n.pos)}
                    cy={rowY(level)}
                    r={R}
                    fill={col.fill}
                    stroke={col.stroke}
                    strokeWidth={2}
                    style={{ transition: "fill 160ms, stroke 160ms" }}
                  />
                  <text
                    x={colX(n.pos)}
                    y={rowY(level)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={700}
                    fill={col.text}
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {n.value}
                  </text>
                </g>
              );
            }),
          )}
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
        <Stat label="Target" value={plan.target} />
        <Stat label="Hops" value={f.hops} />
        <Stat label="Step" value={`${step + 1}/${total}`} />
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
        <LegendDot color="var(--accent)" label="Cursor / hop" />
        <LegendDot color="var(--color-here)" label="Would overshoot" />
        <LegendDot
          color="color-mix(in srgb, var(--color-muted) 34%, white)"
          label="Lane link"
        />
        <LegendDot color="var(--color-card)" label="Idle node" ring />
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
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: ring ? "transparent" : color,
          boxShadow: ring ? "inset 0 0 0 1px var(--color-line)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
