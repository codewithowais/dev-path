"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   TrieViz — a "watch it file letters away" explainer for a prefix tree.

   Words are inserted one letter at a time. Each letter is a drawer; opening it
   reveals the drawers for the next letter, and words that share a beginning
   share the same drawers. The node where a word ends is marked "a complete
   word ends here" — so 'do' can be a stored word even while 'dog' continues
   past it. After the words are filed, a lookup walks the same drawers letter by
   letter to answer "is this a stored word?".

   Insert or search a word of L letters is O(L), independent of how many other
   words are stored. The run is precomputed as frames and replayed from one
   `step` index — deterministic, scrubbable, StrictMode-safe. Motion is disabled
   under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type TNode = {
  id: number;
  char: string;
  parent: number | null;
  children: Record<string, number>;
  isEnd: boolean;
  depth: number;
  x: number;
  y: number;
};

type Frame = {
  present: number[]; // node ids created so far
  ends: number[]; // node ids marked as a complete word so far
  cursor: number | null; // node touched this step (accent)
  path: number[]; // nodes walked this word/lookup (violet)
  fresh: number | null; // node created this step (coral)
  mark: number | null; // node just marked word-end this step (coral)
  found: number | null; // lookup landed here (coral)
  activeEdge: [number, number] | null;
  caption: string;
};

type Preset = { words: string[]; lookup: string };

const PRESETS: Preset[] = [
  { words: ["cat", "car", "card", "dog", "do"], lookup: "do" },
  { words: ["sun", "so", "sit", "sort", "son"], lookup: "so" },
  { words: ["bat", "bad", "bar", "be", "bee"], lookup: "bad" },
  { words: ["top", "to", "toy", "tap", "ten"], lookup: "to" },
];

/** Pull the exact inserted words and the first looked-up word out of the
 *  lesson's code, e.g. `["cat", "car", "cart"].forEach((w) => trie.insert(w))`
 *  and `trie.search("car")`. Falls back to a stored word if the code has no
 *  lookup, and returns null on anything unexpected so we keep the seeded
 *  behaviour. */
function parseCode(code?: string): Preset | null {
  if (!code) return null;
  const m = code.match(/\[([^\]]*)\]\s*\.forEach/);
  if (!m) return null;
  const words = Array.from(m[1].matchAll(/["']([a-zA-Z]+)["']/g)).map((w) => w[1].toLowerCase());
  if (words.length < 2) return null;
  const look = code.match(/\.(?:search|startsWith)\(\s*["']([a-zA-Z]+)["']/);
  const lookup = (look ? look[1] : words[0]).toLowerCase();
  return { words, lookup };
}

function buildFrom(preset: Preset): {
  frames: Frame[];
  nodes: TNode[];
  vbw: number;
  vbh: number;
} {
  const nodes: TNode[] = [
    { id: 0, char: "•", parent: null, children: {}, isEnd: false, depth: 0, x: 0, y: 0 },
  ];
  const ends: number[] = [];
  const frames: Frame[] = [];

  const snap = (extra: Partial<Frame>): Frame => ({
    present: nodes.map((n) => n.id),
    ends: [...ends],
    cursor: null,
    path: [],
    fresh: null,
    mark: null,
    found: null,
    activeEdge: null,
    caption: "",
    ...extra,
  });

  frames.push(snap({ caption: "Empty root — no letters yet. Insert words letter by letter." }));

  // Insert phase.
  for (const word of preset.words) {
    let cur = 0;
    const path: number[] = [0];
    for (const ch of word) {
      const node = nodes[cur];
      const existing = node.children[ch];
      if (existing !== undefined) {
        frames.push(
          snap({
            cursor: existing,
            path: [...path],
            activeEdge: [cur, existing],
            caption: `'${ch}' already filed under "${prefixOf(nodes, existing)}" — reuse it.`,
          }),
        );
        cur = existing;
      } else {
        const id = nodes.length;
        const child: TNode = {
          id,
          char: ch,
          parent: cur,
          children: {},
          isEnd: false,
          depth: node.depth + 1,
          x: 0,
          y: 0,
        };
        nodes.push(child);
        node.children[ch] = id;
        frames.push(
          snap({
            fresh: id,
            path: [...path],
            activeEdge: [cur, id],
            caption: `No drawer for '${ch}' — create it under "${prefixOf(nodes, cur)}".`,
          }),
        );
        cur = id;
      }
      path.push(cur);
    }
    if (!nodes[cur].isEnd) {
      nodes[cur].isEnd = true;
      ends.push(cur);
    }
    frames.push(
      snap({
        mark: cur,
        path: [...path],
        caption: `Mark the end of "${word}" — a complete word stops here.`,
      }),
    );
  }

  // Layout: leaves take their own column (post-order), parents centre over kids.
  let leafCol = 0;
  let maxDepth = 0;
  const place = (id: number): number => {
    const node = nodes[id];
    if (node.depth > maxDepth) maxDepth = node.depth;
    const kids = Object.keys(node.children)
      .sort()
      .map((k) => node.children[k]);
    if (kids.length === 0) {
      node.x = leafCol++;
      return node.x;
    }
    const xs = kids.map(place);
    node.x = (xs[0] + xs[xs.length - 1]) / 2;
    return node.x;
  };
  place(0);
  const cols = Math.max(1, leafCol);
  const vbw = cols * 62;
  const vbh = (maxDepth + 1) * 70;
  nodes.forEach((node) => {
    node.x = ((node.x + 0.5) / cols) * vbw;
    node.y = ((node.depth + 0.5) / (maxDepth + 1)) * vbh;
  });

  // Lookup phase.
  const target = preset.lookup;
  frames.push(snap({ caption: `Now look up "${target}". Start at the root.` }));
  {
    let cur = 0;
    const path: number[] = [0];
    let ok = true;
    for (const ch of target) {
      const next = nodes[cur].children[ch];
      if (next === undefined) {
        frames.push(
          snap({ cursor: cur, path: [...path], caption: `No drawer for '${ch}' — "${target}" is not stored.` }),
        );
        ok = false;
        break;
      }
      frames.push(
        snap({
          cursor: next,
          path: [...path],
          activeEdge: [cur, next],
          caption: `Walk into '${ch}'.`,
        }),
      );
      cur = next;
      path.push(cur);
    }
    if (ok) {
      const isWord = nodes[cur].isEnd;
      frames.push(
        snap({
          found: cur,
          path: [...path],
          caption: isWord
            ? `Reached the end of "${target}", and it's marked as a word — found it!`
            : `Reached "${target}", but it's only a prefix — not marked as a word.`,
        }),
      );
    }
  }

  return { frames, nodes, vbw, vbh };
}

function build(seed: number): {
  frames: Frame[];
  nodes: TNode[];
  vbw: number;
  vbh: number;
} {
  return buildFrom(PRESETS[seed % PRESETS.length]);
}

/** Rebuild the string spelled out from the root down to `id` (for captions). */
function prefixOf(nodes: TNode[], id: number): string {
  const chars: string[] = [];
  let cur: number | null = id;
  while (cur !== null && cur !== 0) {
    chars.push(nodes[cur].char);
    cur = nodes[cur].parent;
  }
  return chars.reverse().join("");
}

const SPEEDS = [1100, 750, 480, 300, 160] as const;
const IDLE = "color-mix(in srgb, var(--accent) 18%, white)";

export function TrieViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source — we file the exact words from the code and
   *  look up the code's own search word, with a toggle back to a random preset. */
  code?: string;
}) {
  const parsed = useMemo(() => parseCode(code), [code]);
  const hasCodeData = parsed !== null;
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(0);
  const { frames, nodes, vbw, vbh } = useMemo(
    () => (useCode && parsed ? buildFrom(parsed) : build(seed)),
    [useCode, parsed, seed],
  );
  const total = frames.length;

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
  const present = new Set(f.present);
  const pathSet = new Set(f.path);
  const endSet = new Set(f.ends);

  const nodeFill = (id: number): string => {
    if (f.found === id || f.fresh === id || f.mark === id) return "var(--color-here)";
    if (f.cursor === id) return "var(--accent)";
    if (pathSet.has(id)) return "var(--color-primary)";
    return IDLE;
  };
  const nodeColored = (id: number) =>
    f.found === id || f.fresh === id || f.mark === id || f.cursor === id || pathSet.has(id);

  const edgeActive = (a: number, b: number) =>
    f.activeEdge != null && f.activeEdge[0] === a && f.activeEdge[1] === b;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it file letters</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Trie (prefix tree)
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* The trie */}
      <div className="mt-3 rounded-xl bg-paper px-2 py-3">
        <svg
          viewBox={`0 0 ${vbw} ${vbh}`}
          className="mx-auto block h-56 w-full sm:h-64"
          role="img"
          aria-label={`Trie with ${present.size} node${present.size === 1 ? "" : "s"}; ${f.caption}`}
        >
          {/* Edges labelled with the letter of the child drawer */}
          {nodes.map((node) =>
            Object.keys(node.children)
              .map((k) => node.children[k])
              .filter((c) => present.has(c) && present.has(node.id))
              .map((c) => {
                const active = edgeActive(node.id, c);
                return (
                  <line
                    key={`${node.id}-${c}`}
                    x1={node.x}
                    y1={node.y}
                    x2={nodes[c].x}
                    y2={nodes[c].y}
                    stroke={active ? "var(--color-here)" : "var(--color-line)"}
                    strokeWidth={active ? 3.5 : 2}
                    strokeLinecap="round"
                  />
                );
              }),
          )}

          {/* Nodes; a word-end gets a coral ring */}
          {nodes
            .filter((node) => present.has(node.id))
            .map((node) => {
              const colored = nodeColored(node.id);
              const fill = nodeFill(node.id);
              const isEnd = endSet.has(node.id);
              return (
                <g key={node.id}>
                  {isEnd && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={19}
                      fill="none"
                      stroke="var(--color-here)"
                      strokeWidth={2}
                    />
                  )}
                  {f.cursor === node.id && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={22}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      opacity={0.4}
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={15}
                    fill={fill}
                    stroke={colored ? fill : "var(--color-line)"}
                    strokeWidth={2}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={700}
                    fill={colored ? "#fff" : "var(--color-ink)"}
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {node.char}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {f.caption}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Words" value={endSet.size} />
        <Stat label="Nodes" value={present.size} />
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
          ⤨ New words
        </button>

        {/* Data source: the lesson's own words vs a random preset. */}
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
        <LegendDot color="var(--accent)" label="Current letter" />
        <LegendDot color="var(--color-primary)" label="On the path" />
        <LegendDot color="var(--color-here)" label="New / word-end" ringColor="var(--color-here)" />
        <LegendDot color={IDLE} label="Filed" ring />
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
  ringColor,
}: {
  color: string;
  label: string;
  ring?: boolean;
  ringColor?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: color,
          boxShadow: ringColor
            ? `0 0 0 1.5px ${ringColor}`
            : ring
              ? "inset 0 0 0 1px var(--color-line)"
              : undefined,
        }}
      />
      {label}
    </span>
  );
}
