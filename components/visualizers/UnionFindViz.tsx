"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   UnionFindViz — a "merge the friend groups" explainer for the Union-Find
   (Disjoint Set) lesson. Six elements sit in a row, each starting alone as its
   own set. Every element carries one parent pointer, drawn as an arc up to its
   current leader; a root points to itself (a small self-loop). The animation
   plays the lesson's exact story:

     • union(a, b) — find each element's leader by following parent arcs to a
       root, then link one root under the other (union by rank).
     • find(x)     — walk x's parent arcs up to the root.
     • path compression — after a walk, re-point every node on the path
       straight at the root, so the next find is instant.

   Elements are coloured by which set they belong to (their root), so merges
   are visible as two colours becoming one. Architecture mirrors
   GraphVisualizer/SortVisualizer: the whole run is recorded up front as a list
   of frames and replayed purely from a single `step` index — deterministic,
   scrubbable and StrictMode-safe. The only state that changes during playback
   is `step` (setTimeout functional update) and `elapsed` (setInterval); no
   setState in an effect body. "New input" reshuffles the union sequence with a
   seeded PRNG so server and client first render match. Motion is disabled
   under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

const N = 6;

/** Parse the lesson's demo: the element count from `new UnionFind(n)` and the
 *  ordered union(a, b) calls (the method definition's non-numeric args never
 *  match). Returns null on anything unexpected so we fall back to random. */
function parseUnionFind(
  code?: string,
): { count: number; unions: [number, number][] } | null {
  if (!code) return null;
  const countMatch = code.match(/new\s+UnionFind\s*\(\s*(\d+)\s*\)/);
  if (!countMatch) return null;
  const count = Number(countMatch[1]);
  if (!Number.isInteger(count) || count < 2 || count > 12) return null;
  const unions: [number, number][] = [];
  const re = /\bunion\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a < 0 || b < 0 || a >= count || b >= count) return null;
    unions.push([a, b]);
  }
  if (unions.length === 0) return null;
  return { count, unions };
}

type Frame = {
  parent: number[]; // parent pointer per element (snapshot)
  active: number[]; // elements spotlighted this step (accent ring)
  moving: { child: number; parent: number } | null; // pointer set/followed now
  caption: string;
  op: string;
  sets: number; // distinct roots right now
};

/* Categorical fills for multi-member sets — none clash with the teal accent
   (which we reserve for the ring on the elements active in the current op) or
   with the coral/violet used as pointer highlights. A singleton keeps a plain
   card fill until it joins a group. */
const SET_FILLS = [
  "color-mix(in srgb, var(--color-primary) 42%, white)", // violet
  "color-mix(in srgb, var(--color-here) 44%, white)", // coral
  "color-mix(in srgb, #3b82f6 40%, white)", // blue
  "color-mix(in srgb, #ec4899 38%, white)", // pink
];

/* Tiny deterministic PRNG (mulberry32) so the first render matches on server
   and client for a given seed. */
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

const BASE_SEED = 7;

/** A sequence of union commands. Seed 0 = the lesson's exact script; other
 *  seeds draw a fresh set of pairs from distinct elements so the merges vary. */
function makeUnions(seed: number): [number, number][] {
  if (seed === BASE_SEED) {
    return [
      [0, 1],
      [1, 2],
      [3, 4],
      [2, 3],
    ];
  }
  const rng = makeRng(seed);
  const unions: [number, number][] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (unions.length < 4 && guard < 60) {
    guard++;
    const a = Math.floor(rng() * N);
    const b = Math.floor(rng() * N);
    if (a === b) continue;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unions.push([a, b]);
  }
  return unions;
}

function countSets(parent: number[]): number {
  let c = 0;
  for (let i = 0; i < parent.length; i++) if (parent[i] === i) c++;
  return c;
}

/* Record the whole run: replay the union sequence, emitting a frame for each
   pointer we follow (find) and each pointer we set (link / compression). */
function buildFrames(unions: [number, number][], count: number): Frame[] {
  const parent = Array.from({ length: count }, (_, i) => i);
  const rank = new Array<number>(count).fill(0);
  const frames: Frame[] = [];

  const snap = (
    extra: Pick<Frame, "active" | "moving" | "caption" | "op">,
  ) => {
    frames.push({
      parent: [...parent],
      sets: countSets(parent),
      ...extra,
    });
  };

  snap({
    active: [],
    moving: null,
    caption: `${count} elements, each alone in its own set — every element is its own leader.`,
    op: "start",
  });

  // find with path recording + compression; emits frames as it goes.
  const find = (x: number, label: string): number => {
    const path: number[] = [];
    let cur = x;
    while (parent[cur] !== cur) {
      path.push(cur);
      snap({
        active: [x, cur, parent[cur]],
        moving: { child: cur, parent: parent[cur] },
        caption: `${label} follows ${cur}'s pointer up to ${parent[cur]}.`,
        op: "find",
      });
      cur = parent[cur];
    }
    const root = cur;
    if (path.length === 0) {
      snap({
        active: [x],
        moving: null,
        caption: `${label}: ${x} is already its own leader.`,
        op: "find",
      });
    } else {
      snap({
        active: [x, root],
        moving: null,
        caption: `${label} reached the leader: ${root}.`,
        op: "find",
      });
    }
    // Path compression: re-point every node on the path straight at the root.
    for (const node of path) {
      if (parent[node] !== root) {
        parent[node] = root;
        snap({
          active: [node, root],
          moving: { child: node, parent: root },
          caption: `Path compression: point ${node} straight at leader ${root}.`,
          op: "compress",
        });
      }
    }
    return root;
  };

  for (const [a, b] of unions) {
    snap({
      active: [a, b],
      moving: null,
      caption: `union(${a}, ${b}): find each element's leader, then merge.`,
      op: "union",
    });
    const ra = find(a, `find(${a})`);
    const rb = find(b, `find(${b})`);
    if (ra === rb) {
      snap({
        active: [ra],
        moving: null,
        caption: `${a} and ${b} share leader ${ra} already — nothing to merge.`,
        op: "union",
      });
      continue;
    }
    // Union by rank: attach the shorter tree under the taller.
    let child: number;
    let par: number;
    if (rank[ra] < rank[rb]) {
      parent[ra] = rb;
      child = ra;
      par = rb;
    } else if (rank[ra] > rank[rb]) {
      parent[rb] = ra;
      child = rb;
      par = ra;
    } else {
      parent[rb] = ra;
      rank[ra]++;
      child = rb;
      par = ra;
    }
    snap({
      active: [child, par],
      moving: { child, parent: par },
      caption: `Link leader ${child} under ${par} — the two sets are now one.`,
      op: "link",
    });
  }

  // Finish with a find on the deepest element to show a multi-hop walk +
  // compression at least once.
  let deepest = 0;
  let deepestDepth = 0;
  for (let i = 0; i < count; i++) {
    let d = 0;
    let cur = i;
    while (parent[cur] !== cur) {
      d++;
      cur = parent[cur];
    }
    if (d > deepestDepth) {
      deepestDepth = d;
      deepest = i;
    }
  }
  if (deepestDepth >= 1) {
    snap({
      active: [deepest],
      moving: null,
      caption: `Now find(${deepest}) — watch the walk to the leader, then the shortcut.`,
      op: "find",
    });
    find(deepest, `find(${deepest})`);
  }

  snap({
    active: [],
    moving: null,
    caption: `Done. ${countSets(parent)} sets remain.`,
    op: "done",
  });

  return frames;
}

/* ───────────────────────────── Geometry ────────────────────────────── */
const PAD = 30;
const PITCH = 48;
const R = 16;
const BASE_CY = 150;
const SVG_H = 176;
const contentW = (count: number) => PAD * 2 + (count - 1) * PITCH + R * 2;
const elemX = (i: number) => PAD + R + i * PITCH;

const SPEEDS = [1100, 750, 500, 320, 170] as const;

export function UnionFindViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source — its UnionFind(n) size and union() calls. */
  code?: string;
}) {
  const codeData = useMemo(() => parseUnionFind(code), [code]);
  const hasCodeData = codeData != null;
  // Default to the lesson's own sequence when we can parse it, so the merges
  // match the code on the page; the learner can switch to random for variety.
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(BASE_SEED);

  const count = useCode && hasCodeData ? codeData.count : N;
  const unions = useMemo(
    () => (useCode && hasCodeData ? codeData.unions : makeUnions(seed)),
    [useCode, hasCodeData, codeData, seed],
  );
  const frames = useMemo(() => buildFrames(unions, count), [unions, count]);
  const total = frames.length;
  const svgW = contentW(count);

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

  const resetRun = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

  const newInput = () => {
    resetRun();
    setSeed((s) => s + 1);
  };

  const toggleSource = (next: boolean) => {
    resetRun();
    setUseCode(next);
  };

  const f = frames[Math.min(step, total - 1)];

  // Root of each element under the current frame's parent array.
  const rootOf = (i: number): number => {
    let cur = i;
    const parent = f.parent;
    while (parent[cur] !== cur) cur = parent[cur];
    return cur;
  };

  // Colour map: assign a categorical fill to every root that has >1 member.
  const setColor = useMemo(() => {
    const size: Record<number, number> = {};
    for (let i = 0; i < count; i++) {
      const r = (() => {
        let cur = i;
        while (f.parent[cur] !== cur) cur = f.parent[cur];
        return cur;
      })();
      size[r] = (size[r] ?? 0) + 1;
    }
    const multiRoots = Object.keys(size)
      .map(Number)
      .filter((r) => size[r] > 1)
      .sort((a, b) => a - b);
    const map: Record<number, string> = {};
    multiRoots.forEach((r, idx) => {
      map[r] = SET_FILLS[idx % SET_FILLS.length];
    });
    return map;
  }, [f, count]);

  const isActive = (i: number) => f.active.includes(i);

  // Arc path from a child element up to its parent element.
  const arcPath = (child: number, par: number) => {
    const x1 = elemX(child);
    const x2 = elemX(par);
    const span = Math.abs(x2 - x1);
    const lift = Math.min(96, 34 + span * 0.5);
    const cx = (x1 + x2) / 2;
    const cy = BASE_CY - lift;
    return `M ${x1} ${BASE_CY - R} Q ${cx} ${cy} ${x2} ${BASE_CY - R}`;
  };

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Merge the groups</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Union-Find
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The elements + parent arcs */}
      <div className="mt-3 overflow-x-auto rounded-xl bg-paper px-1 py-2">
        <svg
          width={svgW}
          height={SVG_H}
          viewBox={`0 0 ${svgW} ${SVG_H}`}
          className="mx-auto block"
          role="img"
          aria-label={`Union-Find over ${count} elements, ${f.sets} sets. ${f.caption}`}
        >
          <defs>
            <marker
              id="uf-head"
              markerWidth="8"
              markerHeight="8"
              refX="6.5"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L8,4 L0,8 Z" style={{ fill: "var(--accent)" }} />
            </marker>
            <marker
              id="uf-head-idle"
              markerWidth="8"
              markerHeight="8"
              refX="6.5"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M0,0 L8,4 L0,8 Z"
                style={{ fill: "color-mix(in srgb, var(--color-muted) 50%, white)" }}
              />
            </marker>
          </defs>

          {/* Parent arcs (behind elements) */}
          {Array.from({ length: count }, (_, i) => i).map((i) => {
            const par = f.parent[i];
            if (par === i) return null; // roots handled separately
            const hot =
              f.moving != null && f.moving.child === i && f.moving.parent === par;
            return (
              <path
                key={`arc-${i}`}
                d={arcPath(i, par)}
                fill="none"
                stroke={
                  hot
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--color-muted) 50%, white)"
                }
                strokeWidth={hot ? 3.5 : 2}
                strokeLinecap="round"
                markerEnd={hot ? "url(#uf-head)" : "url(#uf-head-idle)"}
                style={{ transition: "stroke 180ms" }}
              />
            );
          })}

          {/* Elements */}
          {Array.from({ length: count }, (_, i) => i).map((i) => {
            const r = rootOf(i);
            const fill = setColor[r] ?? "var(--color-card)";
            const active = isActive(i);
            const isRoot = f.parent[i] === i;
            return (
              <g key={`node-${i}`}>
                {active && (
                  <circle
                    cx={elemX(i)}
                    cy={BASE_CY}
                    r={R + 5}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    opacity={0.5}
                  />
                )}
                {/* Root self-loop marker */}
                {isRoot && (
                  <path
                    d={`M ${elemX(i) - 6} ${BASE_CY - R - 1} Q ${elemX(i)} ${
                      BASE_CY - R - 15
                    } ${elemX(i) + 6} ${BASE_CY - R - 1}`}
                    fill="none"
                    stroke="color-mix(in srgb, var(--color-muted) 55%, white)"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                )}
                <circle
                  cx={elemX(i)}
                  cy={BASE_CY}
                  r={R}
                  fill={fill}
                  stroke={
                    fill === "var(--color-card)" ? "var(--color-line)" : "transparent"
                  }
                  strokeWidth={2}
                  style={{ transition: "fill 200ms" }}
                />
                <text
                  x={elemX(i)}
                  y={BASE_CY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={700}
                  fill="var(--color-ink)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {i}
                </text>
                {isRoot && (
                  <text
                    x={elemX(i)}
                    y={BASE_CY + R + 13}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={700}
                    fill="var(--color-muted)"
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    leader
                  </text>
                )}
              </g>
            );
          })}
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
        <Stat label="Sets" value={f.sets} />
        <Stat label="Operation" value={f.op} />
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
          disabled={useCode}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          ⤨ New input
        </button>

        {/* Data source: the lesson's own union sequence vs a random one. */}
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
        <LegendDot color="var(--accent)" label="Active in op" ring />
        <LegendDot color={SET_FILLS[0]} label="Set A" />
        <LegendDot color={SET_FILLS[1]} label="Set B" />
        <LegendDot color="var(--color-card)" label="Own set" ring />
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
          boxShadow: ring ? `inset 0 0 0 2px ${color}` : undefined,
        }}
      />
      {label}
    </span>
  );
}
