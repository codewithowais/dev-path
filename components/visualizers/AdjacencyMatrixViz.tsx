"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   AdjacencyMatrixViz — explainer for the Adjacency Matrix lesson.

   An adjacency matrix stores a graph as an N×N grid of 0s and 1s: grid[i][j]
   is 1 when node i and node j are connected. This visualizer runs two phases:
     1) Build the graph edge by edge. Adding an edge A–B lights BOTH mirrored
        cells grid[A][B] and grid[B][A] (undirected → symmetric).
     2) Scan a node's row. Every column holding a 1 is a neighbor — that's how
        you read off all of a node's connections, O(n) across its row.

   Architecture mirrors SortVisualizer: the run is RECORDED up front as a flat
   op list and replayed purely from a single `step` counter in a useMemo, so
   it's deterministic, scrubbable and StrictMode-safe. The only playback state
   is `step`, advanced by a setTimeout in the autoplay callback (never setState
   in an effect body). Edges are chosen with a seeded PRNG so the server and
   client first render match.
   ──────────────────────────────────────────────────────────────────────── */

const N = 5; // default node count for the random demo (A..E)
const SPEEDS = [900, 620, 420, 260, 150] as const;

type Op = { t: "addEdge"; i: number; j: number } | { t: "scan"; i: number };

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

const nodeLabel = (i: number) => String.fromCharCode(65 + i);

/** Pick a deterministic set of ~5 distinct edges, then script build + scans. */
function record(seed: number, n: number): { ops: Op[]; edges: [number, number][] } {
  const rng = makeRng(seed);
  const pairs: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
  // Seeded Fisher–Yates shuffle, then take the first few as our edge set.
  for (let i = pairs.length - 1; i > 0; i--) {
    const k = Math.floor(rng() * (i + 1));
    [pairs[i], pairs[k]] = [pairs[k], pairs[i]];
  }
  const edges = pairs.slice(0, 5);

  const ops: Op[] = [];
  for (const [i, j] of edges) ops.push({ t: "addEdge", i, j });
  for (let i = 0; i < n; i++) ops.push({ t: "scan", i });
  return { ops, edges };
}

/* ─────────────────────────── Bind to the lesson's code ───────────────────
   Parse the graph the lesson builds: the node list and the addEdge(a, b) calls
   (a, b may be quoted names resolved against that list, or plain indices). The
   animation then adds those exact edges and scans every row. Defensive — any
   surprise returns null and the component keeps its seeded random graph. */

type ParsedAdj = { n: number; ops: Op[] };

function parseAdjacencyCode(code?: string): ParsedAdj | null {
  if (!code) return null;
  try {
    // The node list: the first array literal made only of quoted strings.
    const names: string[] = [];
    const arrays = code.match(/\[[^\]]*\]/g) ?? [];
    for (const lit of arrays) {
      const inner = lit.slice(1, -1).trim();
      if (inner === "") continue;
      const strs = inner.match(/"([^"]*)"|'([^']*)'/g);
      // A pure string array (every comma-separated slot is a quoted string).
      if (strs && strs.length === inner.split(",").length) {
        for (const s of strs) names.push(s.slice(1, -1));
        break;
      }
    }

    const idx = (token: string): number => {
      const t = token.trim();
      const str = t.match(/^"([^"]*)"$/) ?? t.match(/^'([^']*)'$/);
      if (str) return names.indexOf(str[1]);
      if (/^\d+$/.test(t)) return Number(t);
      return -1;
    };

    // addEdge(a, b) calls, in source order.
    const edges: [number, number][] = [];
    const edgeRe =
      /\.add(?:Edge|_edge)\(\s*("[^"]*"|'[^']*'|\d+)\s*,\s*("[^"]*"|'[^']*'|\d+)\s*\)/g;
    let m: RegExpExecArray | null;
    let maxIdx = -1;
    while ((m = edgeRe.exec(code)) !== null) {
      const i = idx(m[1]);
      const j = idx(m[2]);
      if (i < 0 || j < 0 || i === j) return null;
      edges.push([i, j]);
      maxIdx = Math.max(maxIdx, i, j);
    }
    if (edges.length === 0) return null;

    const n = names.length > 0 ? names.length : maxIdx + 1;
    if (n < 2 || n > 8) return null;
    if (maxIdx >= n) return null;

    const ops: Op[] = [];
    for (const [i, j] of edges) ops.push({ t: "addEdge", i, j });
    for (let i = 0; i < n; i++) ops.push({ t: "scan", i });
    return { n, ops };
  } catch {
    return null;
  }
}

/** Node positions on a circle — pure math (no Math.random), so it is safe to
 *  compute during render without a hydration mismatch. */
function nodePositions(n: number): { x: number; y: number }[] {
  const cx = 100;
  const cy = 100;
  const r = 72;
  return Array.from({ length: n }, (_, i) => {
    const ang = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });
}

function narrate(
  op: Op | undefined,
  neighbors: number[],
): string {
  if (!op)
    return "Ready. Press play — add edges to light the grid, then scan a row to read a node's neighbors.";
  if (op.t === "addEdge")
    return `Connect ${nodeLabel(op.i)}–${nodeLabel(op.j)}: set grid[${nodeLabel(
      op.i,
    )}][${nodeLabel(op.j)}]=1 and its mirror grid[${nodeLabel(op.j)}][${nodeLabel(
      op.i,
    )}]=1.`;
  const list = neighbors.length ? neighbors.map(nodeLabel).join(", ") : "none";
  return `Scan row ${nodeLabel(op.i)}: every column with a 1 is a neighbor → ${list}.`;
}

export function AdjacencyMatrixViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source — bind to the graph it builds. */
  code?: string;
}) {
  const parsed = useMemo(() => parseAdjacencyCode(code), [code]);
  const hasCodeData = parsed !== null;
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(() => makeSeed("adjacency-matrix"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The active dataset: the lesson's own graph, or a seeded random one.
  const active = useMemo(
    () => (useCode && parsed ? parsed : { n: N, ops: record(seed, N).ops }),
    [useCode, parsed, seed],
  );
  const { n, ops } = active;
  const pos = useMemo(() => nodePositions(n), [n]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const matrix: number[][] = Array.from({ length: n }, () =>
      new Array(n).fill(0),
    );
    const drawn: [number, number][] = [];
    let edgeCount = 0;
    let activeEdge: [number, number] | null = null;
    let scanRow: number | null = null;
    let neighbors: number[] = [];
    for (let k = 0; k < step; k++) {
      const op = ops[k];
      activeEdge = null;
      scanRow = null;
      neighbors = [];
      if (op.t === "addEdge") {
        matrix[op.i][op.j] = 1;
        matrix[op.j][op.i] = 1;
        drawn.push([op.i, op.j]);
        edgeCount++;
        activeEdge = [op.i, op.j];
      } else {
        scanRow = op.i;
        for (let j = 0; j < n; j++) if (matrix[op.i][j] === 1) neighbors.push(j);
      }
    }
    return { matrix, drawn, edgeCount, activeEdge, scanRow, neighbors };
  }, [ops, step, n]);

  const { matrix, drawn, edgeCount, activeEdge, scanRow, neighbors } = frame;
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

  const isActiveEdge = (a: number, b: number) =>
    activeEdge != null &&
    ((activeEdge[0] === a && activeEdge[1] === b) ||
      (activeEdge[0] === b && activeEdge[1] === a));

  const neighborSet = new Set(neighbors);

  const nodeStyle = (i: number): { fill: string; white: boolean } => {
    if (activeEdge && (activeEdge[0] === i || activeEdge[1] === i))
      return { fill: "var(--accent)", white: true };
    if (scanRow === i) return { fill: "var(--accent)", white: true };
    if (scanRow != null && neighborSet.has(i))
      return { fill: "var(--color-primary)", white: true };
    return { fill: "color-mix(in srgb, var(--color-muted) 30%, white)", white: false };
  };

  const cellColor = (r: number, c: number): { bg: string; white: boolean } => {
    const on = matrix[r][c] === 1;
    if (isActiveEdge(r, c)) return { bg: "var(--accent)", white: true };
    if (scanRow === r) {
      if (on) return { bg: "var(--color-primary)", white: true };
      return { bg: "color-mix(in srgb, var(--accent) 14%, white)", white: false };
    }
    if (on) return { bg: "color-mix(in srgb, var(--accent) 34%, white)", white: false };
    return { bg: "color-mix(in srgb, var(--color-muted) 12%, white)", white: false };
  };

  const scanDegree = scanRow != null ? neighbors.length : null;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Graph ↔ grid</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Adjacency matrix · {n}×{n}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: graph beside (stacks under on mobile) the 0/1 matrix */}
      <div
        className="mt-4 flex flex-col items-center gap-4 rounded-xl bg-paper px-3 py-4 sm:flex-row sm:justify-center sm:gap-6"
        role="img"
        aria-label={`Adjacency matrix visualization with ${edgeCount} edges, ${
          done ? "run complete" : `step ${step} of ${total}`
        }`}
      >
        {/* Graph */}
        <svg viewBox="0 0 200 200" className="h-44 w-44 shrink-0 sm:h-48 sm:w-48">
          {drawn.map(([a, b], idx) => (
            <line
              key={idx}
              x1={pos[a].x}
              y1={pos[a].y}
              x2={pos[b].x}
              y2={pos[b].y}
              stroke={
                isActiveEdge(a, b)
                  ? "var(--accent)"
                  : "color-mix(in srgb, var(--color-muted) 45%, white)"
              }
              strokeWidth={isActiveEdge(a, b) ? 4 : 2}
              strokeLinecap="round"
            />
          ))}
          {pos.map((p, i) => {
            const ns = nodeStyle(i);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={15} fill={ns.fill} />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="12"
                  fontWeight="700"
                  fill={ns.white ? "white" : "var(--color-ink)"}
                >
                  {nodeLabel(i)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Matrix */}
        <div className="w-max">
          <div className="flex gap-1 pl-6">
            {Array.from({ length: n }, (_, c) => (
              <div
                key={c}
                className="flex h-5 w-8 items-center justify-center font-mono text-[10px] text-muted sm:w-9"
              >
                {nodeLabel(c)}
              </div>
            ))}
          </div>
          {matrix.map((row, r) => (
            <div key={r} className="mt-1 flex items-center gap-1">
              <div className="flex h-8 w-5 items-center justify-center font-mono text-[10px] text-muted sm:h-9">
                {nodeLabel(r)}
              </div>
              {row.map((v, c) => {
                const { bg, white } = cellColor(r, c);
                return (
                  <div
                    key={c}
                    className="flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs font-bold transition-colors sm:h-9 sm:w-9"
                    style={{
                      background: bg,
                      border: "1px solid color-mix(in srgb, var(--color-muted) 18%, white)",
                      color: white ? "white" : "var(--color-ink)",
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

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(current, neighbors)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Nodes" value={n} />
        <Stat label="Edges" value={edgeCount} />
        <Stat
          label="Row degree"
          value={scanDegree == null ? "—" : `${nodeLabel(scanRow as number)}:${scanDegree}`}
        />
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
          ⤨ New graph
        </button>

        {/* Data source: the lesson's own graph vs a random one. */}
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
        <LegendDot color="var(--accent)" label="Adding edge / scanned node" />
        <LegendDot color="var(--color-primary)" label="Neighbor (a 1 in the row)" />
        <LegendDot color="color-mix(in srgb, var(--accent) 34%, white)" label="Existing edge (1)" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 12%, white)" label="No edge (0)" />
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
