"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   GraphDSViz — a "build the graph" explainer for the Graph (Adjacency List)
   lesson. This is the graph AS A DATA STRUCTURE, not a traversal: the nodes
   sit still, edges appear one connection at a time, and the adjacency-list
   "phone book" fills in beside the drawing — each node mapping to the list of
   its direct neighbours. Because a friendship is undirected, adding one edge
   pushes each node onto the OTHER's neighbour list (two writes per edge, just
   like the lesson's addEdge). A final pass highlights one node's neighbour
   list at a time, the exact O(1) lookup the structure exists for.

   Architecture mirrors GraphVisualizer/SortVisualizer: the whole run is
   precomputed as a list of frames and replayed purely from a single `step`
   index — deterministic, scrubbable and StrictMode-safe. The only state that
   changes during playback is `step` (a setTimeout functional update) and
   `elapsed` (a setInterval); no setState is ever called in an effect body.
   Randomness ("New graph") comes from a seeded PRNG so the server and client
   first render are identical (no hydration mismatch). Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type NodeId = string;

/** Fixed pentagon slots so edges read cleanly (viewBox 0 0 300 240). A node's
 *  position is its index in the active node list, so graphs of 2–5 nodes all
 *  land on the same tidy layout. */
const POS_SLOTS: { x: number; y: number }[] = [
  { x: 150, y: 34 },
  { x: 262, y: 118 },
  { x: 214, y: 216 },
  { x: 86, y: 216 },
  { x: 38, y: 118 },
];
const MAX_NODES = POS_SLOTS.length;

/** Node labels for the random ("New graph") mode — the full pentagon. */
const DEFAULT_NODES = ["A", "B", "C", "D", "E"];

type Edge = [NodeId, NodeId];

const edgeKey = (a: NodeId, b: NodeId) =>
  [a, b].slice().sort().join("-");

type Frame = {
  edges: Edge[]; // connections drawn so far
  adjacency: Record<NodeId, NodeId[]>; // the phone book so far
  activeEdge: Edge | null; // edge being added this step (accent)
  writeNodes: NodeId[]; // whose neighbour list just gained an entry
  focusNode: NodeId | null; // node whose list we're spotlighting
  focusNeighbors: NodeId[]; // that node's neighbours (violet)
  caption: string;
  op: string;
};

/* Tiny deterministic PRNG (mulberry32) — identical output on server & client
   for a given seed, so the first render never mismatches. */
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

/** A stable base seed so the component opens on the same graph every render. */
const BASE_SEED = 4104;

/** Build a connected, de-duplicated edge list from a seed: a random spanning
 *  path/tree over the nodes plus a couple of extra shortcuts. Deterministic. */
function makeEdges(seed: number, nodes: NodeId[]): Edge[] {
  const rng = makeRng(seed);
  const order = nodes.slice();
  // Seeded Fisher–Yates shuffle for the spanning order.
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const add = (a: NodeId, b: NodeId) => {
    if (a === b) return;
    const k = edgeKey(a, b);
    if (seen.has(k)) return;
    seen.add(k);
    edges.push([a, b]);
  };
  // Spanning tree: connect each node to an earlier one — guarantees no islands.
  for (let i = 1; i < order.length; i++) {
    const j = Math.floor(rng() * i);
    add(order[i], order[j]);
  }
  // Two extra connections for a bit of branching.
  let guard = 0;
  while (edges.length < nodes.length + 1 && guard < 40) {
    guard++;
    const a = nodes[Math.floor(rng() * nodes.length)];
    const b = nodes[Math.floor(rng() * nodes.length)];
    add(a, b);
  }
  return edges;
}

/** Parse the lesson's addEdge("a", "b") calls into a graph. Node names are
 *  remapped positionally onto the pentagon's letter labels (first name seen →
 *  A, next → B, …) so the fixed-size layout and adjacency badges stay tidy;
 *  the topology drawn is exactly the one written in the code. Returns null on
 *  anything unexpected so the component falls back to random graphs. */
function parseGraph(code?: string): { nodes: NodeId[]; edges: Edge[] } | null {
  if (!code) return null;
  const re = /addEdge\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
  const order: string[] = [];
  const raw: [string, string][] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    raw.push([m[1], m[2]]);
    for (const name of [m[1], m[2]]) if (!order.includes(name)) order.push(name);
  }
  if (raw.length === 0 || order.length < 2 || order.length > MAX_NODES) return null;
  const nodes = DEFAULT_NODES.slice(0, order.length);
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const [a, b] of raw) {
    if (a === b) continue;
    const la = nodes[order.indexOf(a)];
    const lb = nodes[order.indexOf(b)];
    const k = edgeKey(la, lb);
    if (seen.has(k)) continue;
    seen.add(k);
    edges.push([la, lb]);
  }
  if (edges.length === 0) return null;
  return { nodes, edges };
}

const emptyAdjacency = (nodes: NodeId[]): Record<NodeId, NodeId[]> => {
  const adj: Record<NodeId, NodeId[]> = {};
  for (const n of nodes) adj[n] = [];
  return adj;
};

/* Build the full frame timeline: draw the nodes, add edges one by one (each
   updating both neighbour lists), then spotlight every node's list in turn. */
function buildFrames(nodes: NodeId[], edges: Edge[]): Frame[] {
  const frames: Frame[] = [];
  const adjacency = emptyAdjacency(nodes);

  const snapshot = (): Record<NodeId, NodeId[]> => {
    const copy = emptyAdjacency(nodes);
    (Object.keys(adjacency) as NodeId[]).forEach((k) => {
      copy[k] = [...adjacency[k]];
    });
    return copy;
  };

  frames.push({
    edges: [],
    adjacency: snapshot(),
    activeEdge: null,
    writeNodes: [],
    focusNode: null,
    focusNeighbors: [],
    caption: `${nodes.length} nodes, no connections yet. Each node's neighbour list starts empty.`,
    op: "setup",
  });

  const drawn: Edge[] = [];
  for (const [a, b] of edges) {
    drawn.push([a, b]);
    // Undirected: add each node to the other's list, kept sorted for clarity.
    adjacency[a] = [...adjacency[a], b].sort();
    adjacency[b] = [...adjacency[b], a].sort();
    frames.push({
      edges: [...drawn],
      adjacency: snapshot(),
      activeEdge: [a, b],
      writeNodes: [a, b],
      focusNode: null,
      focusNeighbors: [],
      caption: `Connect ${a}–${b}: push ${b} onto ${a}'s list and ${a} onto ${b}'s list.`,
      op: "addEdge",
    });
  }

  frames.push({
    edges: [...drawn],
    adjacency: snapshot(),
    activeEdge: null,
    writeNodes: [],
    focusNode: null,
    focusNeighbors: [],
    caption: "Graph built. The adjacency list is the whole structure.",
    op: "built",
  });

  // Spotlight each node's neighbour list — the O(1) lookup the list gives you.
  for (const n of nodes) {
    frames.push({
      edges: [...drawn],
      adjacency: snapshot(),
      activeEdge: null,
      writeNodes: [],
      focusNode: n,
      focusNeighbors: adjacency[n],
      caption:
        adjacency[n].length > 0
          ? `Look up ${n}: its neighbours are ${adjacency[n].join(", ")}.`
          : `Look up ${n}: it has no neighbours.`,
      op: "lookup",
    });
  }

  return frames;
}

const SPEEDS = [1100, 750, 500, 300, 160] as const;

export function GraphDSViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source — its addEdge(...) calls build the graph. */
  code?: string;
}) {
  const codeGraph = useMemo(() => parseGraph(code), [code]);
  const hasCodeData = codeGraph != null;
  // Default to the lesson's own graph when we can parse it, so the drawing
  // matches the code on the page; the learner can switch to random for variety.
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(BASE_SEED);

  const nodes = useCode && hasCodeData ? codeGraph.nodes : DEFAULT_NODES;
  const edges = useMemo(
    () =>
      useCode && hasCodeData ? codeGraph.edges : makeEdges(seed, DEFAULT_NODES),
    [useCode, hasCodeData, codeGraph, seed],
  );
  const frames = useMemo(() => buildFrames(nodes, edges), [nodes, edges]);
  const total = frames.length;

  const [step, setStep] = useState(0); // frame index
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

  const newGraph = () => {
    resetRun();
    setSeed((s) => s + 1);
  };

  const toggleSource = (next: boolean) => {
    resetRun();
    setUseCode(next);
  };

  const f = frames[Math.min(step, total - 1)];
  const posOf = (n: NodeId) => POS_SLOTS[nodes.indexOf(n)];

  const isActiveEdge = (a: NodeId, b: NodeId) =>
    f.activeEdge != null && edgeKey(a, b) === edgeKey(f.activeEdge[0], f.activeEdge[1]);
  const isFocusEdge = (a: NodeId, b: NodeId) =>
    f.focusNode != null && (a === f.focusNode || b === f.focusNode);

  const nodeKind = (n: NodeId): "active" | "focus" | "neighbor" | "idle" => {
    if (f.writeNodes.includes(n)) return "active";
    if (f.focusNode === n) return "focus";
    if (f.focusNeighbors.includes(n)) return "neighbor";
    return "idle";
  };
  const nodeFill = (k: ReturnType<typeof nodeKind>) =>
    k === "active"
      ? "var(--accent)"
      : k === "focus"
        ? "var(--accent)"
        : k === "neighbor"
          ? "var(--color-primary)"
          : "var(--color-card)";

  const edgeCount = f.edges.length;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Build the graph</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Adjacency list
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* Graph + adjacency list side by side */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-paper px-2 py-3">
          <svg
            viewBox="0 0 300 240"
            className="mx-auto block h-56 w-full sm:h-60"
            role="img"
            aria-label={`Undirected graph, ${edgeCount} connections drawn. ${f.caption}`}
          >
            {/* Edges (behind nodes) */}
            {f.edges.map(([a, b]) => {
              const active = isActiveEdge(a, b);
              const focus = isFocusEdge(a, b);
              return (
                <line
                  key={edgeKey(a, b)}
                  x1={posOf(a).x}
                  y1={posOf(a).y}
                  x2={posOf(b).x}
                  y2={posOf(b).y}
                  stroke={
                    active
                      ? "var(--accent)"
                      : focus
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-muted) 34%, white)"
                  }
                  strokeWidth={active ? 4 : focus ? 3.5 : 2}
                  strokeLinecap="round"
                  style={{ transition: "stroke 200ms, stroke-width 200ms" }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const k = nodeKind(n);
              const fill = nodeFill(k);
              const idle = k === "idle";
              return (
                <g key={n}>
                  {(k === "active" || k === "focus") && (
                    <circle
                      cx={posOf(n).x}
                      cy={posOf(n).y}
                      r={23}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      opacity={0.35}
                    />
                  )}
                  <circle
                    cx={posOf(n).x}
                    cy={posOf(n).y}
                    r={17}
                    fill={fill}
                    stroke={idle ? "var(--color-line)" : fill}
                    strokeWidth={2}
                    style={{ transition: "fill 200ms" }}
                  />
                  <text
                    x={posOf(n).x}
                    y={posOf(n).y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                    fontWeight={700}
                    fill={idle ? "var(--color-ink)" : "#fff"}
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {n}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Adjacency list "phone book" */}
        <div className="rounded-xl bg-paper px-3 py-3">
          <div className="dp-eyebrow mb-2 text-muted">adjacency</div>
          <div className="flex flex-col gap-1.5">
            {nodes.map((n) => {
              const k = nodeKind(n);
              const rowActive = k === "active" || k === "focus";
              return (
                <div
                  key={n}
                  className="flex items-center gap-2 rounded-lg px-1.5 py-1 font-mono text-[13px]"
                  style={{
                    background: rowActive
                      ? "color-mix(in srgb, var(--accent) 12%, white)"
                      : "transparent",
                    transition: "background 200ms",
                  }}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold text-white"
                    style={{
                      background: rowActive
                        ? "var(--accent)"
                        : "color-mix(in srgb, var(--color-muted) 45%, white)",
                    }}
                  >
                    {n}
                  </span>
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {f.adjacency[n].length === 0 && (
                      <span className="text-muted">[ ]</span>
                    )}
                    {f.adjacency[n].map((m, i) => {
                      const justAdded =
                        f.writeNodes.includes(n) && f.activeEdge != null &&
                        (f.activeEdge[0] === m || f.activeEdge[1] === m) &&
                        (f.activeEdge[0] === n || f.activeEdge[1] === n);
                      const isNeighborSpot = f.focusNode === n;
                      return (
                        <span
                          key={`${n}-${m}-${i}`}
                          className="flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-bold"
                          style={{
                            background: justAdded
                              ? "var(--accent)"
                              : isNeighborSpot
                                ? "var(--color-primary)"
                                : "color-mix(in srgb, var(--color-primary) 14%, white)",
                            color:
                              justAdded || isNeighborSpot
                                ? "#fff"
                                : "var(--color-ink)",
                            transition: "background 200ms",
                          }}
                        >
                          {m}
                        </span>
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
        <Stat label="Nodes" value={nodes.length} />
        <Stat label="Connections" value={edgeCount} />
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
          onClick={newGraph}
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
        <LegendDot color="var(--accent)" label="Adding connection" />
        <LegendDot color="var(--color-primary)" label="Neighbour list" />
        <LegendDot
          color="color-mix(in srgb, var(--color-muted) 34%, white)"
          label="Existing edge"
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
          background: color,
          boxShadow: ring ? "inset 0 0 0 1px var(--color-line)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
