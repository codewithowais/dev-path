"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   LinkedListViz — a "watch it walk" explainer for the Singly Linked List
   lesson. Each node is a box holding a value plus a `.next` pointer arrow to
   the following node. The list only remembers the first node (the head), so
   to reach any item you must follow the links one at a time — that's the whole
   point the animation makes.

   It plays two scripted acts:
     1. Traversal — a cursor starts at the head and follows .next to the tail,
        showing why "find an item" is O(n).
     2. Insert-in-the-middle — walk to node 20, create node 25, and re-point a
        single .next pointer (20.next → 25) so 25 slots between 20 and 30.

   Architecture mirrors GraphVisualizer: the whole run is precomputed as a list
   of frames and played back purely from a single `step` index — deterministic,
   scrubbable and StrictMode-safe. The only state that changes during playback
   is `step` (a setTimeout functional update) and `elapsed` (a setInterval); no
   setState is ever called in an effect body. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type NodeState = "idle" | "cursor" | "visited" | "rewire" | "new";
type ArrowKind = "idle" | "accent" | "violet" | "green";

type Arrow = { from: number; to: number; kind: ArrowKind; faded?: boolean };

type Frame = {
  order: number[]; // node ids on the base row, left → right
  raisedId: number | null; // a node drawn raised above the row (mid-insert)
  raisedAfter: number | null; // the base node the raised node sits after
  cursor: number | null; // node id the cursor points at
  states: Record<number, NodeState>;
  arrows: Arrow[];
  caption: string;
  op: string;
  length: number;
  done: boolean;
};

/* The lesson's example list (10 → 20 → 30 → 40) plus the node we insert — the
 * default when the lesson code can't be parsed. */
type LLConfig = {
  values: number[]; // base node values in head → tail order
  insertAfterIdx: number; // insert the new node after this base index
  insertVal: number; // value carried by the inserted node
};
const DEFAULT_CONFIG: LLConfig = { values: [10, 20, 30, 40], insertAfterIdx: 1, insertVal: 25 };

type Built = { frames: Frame[]; values: Record<number, number> };

const chain = (ids: number[], kind: ArrowKind = "idle"): Arrow[] =>
  ids.slice(0, -1).map((from, i) => ({ from, to: ids[i + 1], kind }));

/** Derive an insert (position + value) for a parsed list: slot the new node
 *  after the second node when possible, carrying the midpoint of its two
 *  neighbours (kept distinct from every existing value). */
function makeConfig(values: number[]): LLConfig {
  const insertAfterIdx = values.length >= 3 ? 1 : 0;
  const a = values[insertAfterIdx];
  const b = values[insertAfterIdx + 1];
  let insertVal = Math.floor((a + b) / 2);
  if (insertVal === a || insertVal === b || values.includes(insertVal)) insertVal = a + 1;
  if (values.includes(insertVal)) insertVal = Math.max(...values) + 5;
  return { values, insertAfterIdx, insertVal };
}

/** Parse the node values from the lesson demo's `list.add(n)` calls so the
 *  animation walks the exact list shown in the editor. Returns null when there
 *  is no usable demo — the component then falls back to the default list. */
function parseLinkedListConfig(code: string | undefined): LLConfig | null {
  if (!code) return null;
  const inst = /(?:const|let|var)\s+(\w+)\s*=\s*new\s+LinkedList\s*\(/.exec(code);
  if (!inst) return null;
  const name = inst[1];
  const re = new RegExp(`\\b${name}\\.add\\s*\\(\\s*(-?\\d+)\\s*\\)`, "g");
  const values: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) values.push(Number(m[1]));
  if (values.length < 2 || values.length > 4) return null;
  return makeConfig(values);
}

/* Build the full frame timeline for a given list configuration. The default
 * config reproduces the original 10 → 20 → 30 → 40 walk exactly. */
function buildRun(cfg: LLConfig): Built {
  const { values: vals, insertAfterIdx, insertVal } = cfg;
  const n = vals.length;
  const BASE = vals.map((_, i) => i + 1); // node ids 1..n
  const NEW_ID = n + 1;
  const AFTER_ID = insertAfterIdx + 1; // id of the node we insert after
  const NEXT_ID = insertAfterIdx + 2; // id of the node currently after it
  const afterVal = vals[insertAfterIdx];
  const nextVal = vals[insertAfterIdx + 1];

  const values: Record<number, number> = {};
  vals.forEach((v, i) => {
    values[i + 1] = v;
  });
  values[NEW_ID] = insertVal;

  const frames: Frame[] = [];
  const idle: Record<number, NodeState> = {};

  // ── Intro ────────────────────────────────────────────────────────────
  frames.push({
    order: [...BASE],
    raisedId: null,
    raisedAfter: null,
    cursor: null,
    states: { ...idle },
    arrows: chain(BASE),
    caption:
      "A linked list: each box holds a value and a .next pointer to the following node.",
    op: "ready",
    length: n,
    done: false,
  });

  // ── Act 1: traversal from the head ─────────────────────────────────────
  const traverseCaption = (i: number): string => {
    const v = vals[i];
    if (i === 0) return `Start at the head — the list only knows this first node (${v}).`;
    if (i === n - 1) return `Follow .next to ${v} — the tail. Its .next is null.`;
    if (i === 1) return `Follow .next to reach ${v}. You can't jump straight here.`;
    return `Follow .next again to ${v}.`;
  };
  for (let i = 0; i < BASE.length; i++) {
    const states: Record<number, NodeState> = {};
    for (let j = 0; j < i; j++) states[BASE[j]] = "visited";
    states[BASE[i]] = "cursor";
    // Arrows already followed light up in the accent.
    const arrows = chain(BASE).map((a, idx) => ({
      ...a,
      kind: (idx < i ? "accent" : "idle") as ArrowKind,
    }));
    frames.push({
      order: [...BASE],
      raisedId: null,
      raisedAfter: null,
      cursor: BASE[i],
      states,
      arrows,
      caption: traverseCaption(i),
      op: "traverse",
      length: n,
      done: false,
    });
  }
  const allVisited: Record<number, NodeState> = {};
  BASE.forEach((id) => {
    allVisited[id] = "visited";
  });
  frames.push({
    order: [...BASE],
    raisedId: null,
    raisedAfter: null,
    cursor: null,
    states: allVisited,
    arrows: chain(BASE, "accent"),
    caption:
      "Reaching an item means walking the whole chain — that's why find is O(n).",
    op: "traverse",
    length: n,
    done: false,
  });

  // ── Act 2: insert the new node after AFTER_ID ──────────────────────────
  frames.push({
    order: [...BASE],
    raisedId: null,
    raisedAfter: null,
    cursor: null,
    states: { ...idle },
    arrows: chain(BASE),
    caption: `Now insert ${insertVal} into the middle — right after ${afterVal}.`,
    op: "insert",
    length: n,
    done: false,
  });
  // Walk to the head, then to the insert-after node.
  frames.push({
    order: [...BASE],
    raisedId: null,
    raisedAfter: null,
    cursor: BASE[0],
    states: { [BASE[0]]: "cursor" },
    arrows: chain(BASE),
    caption: `Walk from the head to find where ${insertVal} belongs…`,
    op: "insert",
    length: n,
    done: false,
  });
  const hereStates: Record<number, NodeState> = { [AFTER_ID]: "rewire" };
  for (let j = 0; j < insertAfterIdx; j++) hereStates[BASE[j]] = "visited";
  frames.push({
    order: [...BASE],
    raisedId: null,
    raisedAfter: null,
    cursor: AFTER_ID,
    states: hereStates,
    arrows: chain(BASE).map((a, idx) => ({
      ...a,
      kind: (idx < insertAfterIdx ? "accent" : "idle") as ArrowKind,
    })),
    caption: `Here's ${afterVal} — we'll link the new node in right after it.`,
    op: "insert",
    length: n,
    done: false,
  });
  // Create the new node (raised above the gap after AFTER_ID).
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEW_ID]: "new" },
    arrows: chain(BASE),
    caption: `Create the new node holding ${insertVal}. It isn't linked in yet.`,
    op: "insert",
    length: n,
    done: false,
  });
  // Step 1: new.next → the node currently after AFTER_ID.
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEW_ID]: "new" },
    arrows: [...chain(BASE), { from: NEW_ID, to: NEXT_ID, kind: "violet" }],
    caption: `First point ${insertVal}'s .next to ${nextVal} — the node that follows ${afterVal}.`,
    op: "rewire",
    length: n,
    done: false,
  });
  // Step 2: AFTER_ID.next → new (the one existing pointer we change).
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEW_ID]: "new" },
    arrows: [
      ...chain(BASE).map((a) =>
        a.from === AFTER_ID && a.to === NEXT_ID ? { ...a, faded: true } : a,
      ),
      { from: AFTER_ID, to: NEW_ID, kind: "violet" },
      { from: NEW_ID, to: NEXT_ID, kind: "violet" },
    ],
    caption: `Now re-point ${afterVal}'s .next to ${insertVal} — the one existing pointer we change.`,
    op: "rewire",
    length: n,
    done: false,
  });
  // Settle: the new node drops into the row.
  const FINAL = [
    ...BASE.slice(0, insertAfterIdx + 1),
    NEW_ID,
    ...BASE.slice(insertAfterIdx + 1),
  ];
  frames.push({
    order: FINAL,
    raisedId: null,
    raisedAfter: null,
    cursor: null,
    states: { [NEW_ID]: "new" },
    arrows: chain(FINAL).map((a) =>
      (a.from === AFTER_ID && a.to === NEW_ID) || (a.from === NEW_ID && a.to === NEXT_ID)
        ? { ...a, kind: "green" as ArrowKind }
        : a,
    ),
    caption: `Done — ${insertVal} sits between ${afterVal} and ${nextVal}. Inserting in the middle changed just one .next.`,
    op: "insert",
    length: n + 1,
    done: true,
  });

  return { frames, values };
}

/* ───────────────────────────── Geometry ────────────────────────────── */
const NODE_W = 68;
const NODE_H = 44;
const PITCH = 120; // slot-to-slot distance
const PAD_L = 22;
const BASE_CY = 108; // centre y of the base row
const RAISE_CY = 46; // centre y of a raised (mid-insert) node
const MAX_SLOTS = 5;
const SVG_H = 160;
const CONTENT_W = PAD_L * 2 + (MAX_SLOTS - 1) * PITCH + NODE_W;
const DIVIDER = NODE_W * 0.64; // value cell | next cell split

const slotX = (i: number) => PAD_L + i * PITCH + NODE_W / 2;

/** Point on a node's rounded-rect boundary in the direction of (tx, ty). */
function edgePoint(
  cx: number,
  cy: number,
  tx: number,
  ty: number,
): { x: number; y: number } {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scale = 1 / Math.max(Math.abs(dx) / (NODE_W / 2), Math.abs(dy) / (NODE_H / 2));
  return { x: cx + dx * scale, y: cy + dy * scale };
}

const ARROW_COLOR: Record<ArrowKind, string> = {
  idle: "color-mix(in srgb, var(--color-muted) 42%, white)",
  accent: "var(--accent)",
  violet: "var(--color-primary)",
  green: "var(--color-output)",
};

const SPEEDS = [1100, 750, 500, 300, 160] as const;

export function LinkedListViz({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source — parsed for the exact node values shown. */
  code?: string;
}) {
  const codeConfig = useMemo(() => parseLinkedListConfig(code), [code]);
  const hasCodeData = codeConfig !== null;
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);

  const built = useMemo(
    () => buildRun(useCode && codeConfig ? codeConfig : DEFAULT_CONFIG),
    [useCode, codeConfig],
  );
  const frames = built.frames;
  const values = built.values;
  const total = frames.length;

  const [step, setStep] = useState(0); // frame index
  const [speedIdx, setSpeedIdx] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = step >= total - 1;
  const running = playing && !done;

  // Autoplay — pure functional setStep in a timer callback (never in the body).
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

  // Live elapsed — setState only inside the interval callback.
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

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

  const toggleSource = (next: boolean) => {
    restart();
    setUseCode(next);
  };

  const f = frames[Math.min(step, total - 1)];

  // Centre position of every node visible this frame (base row + raised node).
  const center = useMemo(() => {
    const m: Record<number, { x: number; y: number }> = {};
    f.order.forEach((id, i) => {
      m[id] = { x: slotX(i), y: BASE_CY };
    });
    if (f.raisedId != null && f.raisedAfter != null) {
      const p = f.order.indexOf(f.raisedAfter);
      m[f.raisedId] = { x: (slotX(p) + slotX(p + 1)) / 2, y: RAISE_CY };
    }
    return m;
  }, [f]);

  // A node has a live outgoing .next when a non-faded arrow starts at it.
  const hasNext = (id: number) =>
    f.arrows.some((a) => a.from === id && !a.faded);

  const nodeFill = (s: NodeState) =>
    s === "cursor"
      ? "color-mix(in srgb, var(--accent) 18%, white)"
      : s === "new"
        ? "color-mix(in srgb, var(--color-output) 18%, white)"
        : s === "rewire"
          ? "color-mix(in srgb, var(--color-primary) 16%, white)"
          : s === "visited"
            ? "color-mix(in srgb, var(--accent) 9%, white)"
            : "var(--color-card)";
  const nodeStroke = (s: NodeState) =>
    s === "cursor"
      ? "var(--accent)"
      : s === "new"
        ? "var(--color-output)"
        : s === "rewire"
          ? "var(--color-primary)"
          : "var(--color-line)";

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it link</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Singly linked list
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      {/* The list */}
      <div className="mt-3 overflow-x-auto rounded-xl bg-paper px-1 py-2">
        <svg
          width={CONTENT_W}
          height={SVG_H}
          viewBox={`0 0 ${CONTENT_W} ${SVG_H}`}
          className="mx-auto block"
          role="img"
          aria-label={`Singly linked list, ${f.length} nodes. ${f.caption}`}
        >
          <defs>
            {(["idle", "accent", "violet", "green"] as ArrowKind[]).map((k) => (
              <marker
                key={k}
                id={`ll-head-${k}`}
                markerWidth="8"
                markerHeight="8"
                refX="6.5"
                refY="4"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L8,4 L0,8 Z" style={{ fill: ARROW_COLOR[k] }} />
              </marker>
            ))}
          </defs>

          {/* Arrows (behind nodes) */}
          {f.arrows.map((a, i) => {
            const A = center[a.from];
            const B = center[a.to];
            if (!A || !B) return null;
            const s = edgePoint(A.x, A.y, B.x, B.y);
            const e = edgePoint(B.x, B.y, A.x, A.y);
            const color = ARROW_COLOR[a.kind];
            return (
              <line
                key={`${a.from}-${a.to}-${i}`}
                x1={s.x}
                y1={s.y}
                x2={e.x}
                y2={e.y}
                stroke={color}
                strokeWidth={a.kind === "idle" ? 2 : 3}
                strokeLinecap="round"
                strokeDasharray={a.faded ? "4 4" : undefined}
                opacity={a.faded ? 0.4 : 1}
                markerEnd={`url(#ll-head-${a.kind})`}
                style={{ transition: "stroke 200ms" }}
              />
            );
          })}

          {/* Nodes */}
          {[...f.order, ...(f.raisedId != null ? [f.raisedId] : [])].map((id) => {
            const c = center[id];
            if (!c) return null;
            const st = f.states[id] ?? "idle";
            const left = c.x - NODE_W / 2;
            const top = c.y - NODE_H / 2;
            return (
              <g key={id} style={{ transition: "transform 220ms" }}>
                {st === "cursor" && (
                  <rect
                    x={left - 5}
                    y={top - 5}
                    width={NODE_W + 10}
                    height={NODE_H + 10}
                    rx={12}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={0.35}
                  />
                )}
                <rect
                  x={left}
                  y={top}
                  width={NODE_W}
                  height={NODE_H}
                  rx={9}
                  fill={nodeFill(st)}
                  stroke={nodeStroke(st)}
                  strokeWidth={2}
                />
                {/* value | next divider */}
                <line
                  x1={left + DIVIDER}
                  y1={top}
                  x2={left + DIVIDER}
                  y2={top + NODE_H}
                  stroke="var(--color-line)"
                  strokeWidth={1}
                />
                <text
                  x={left + DIVIDER / 2}
                  y={c.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={16}
                  fontWeight={700}
                  fill="var(--color-ink)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {values[id]}
                </text>
                {/* the .next pointer origin, or a null slash on the tail */}
                {hasNext(id) ? (
                  <circle
                    cx={left + (DIVIDER + NODE_W) / 2}
                    cy={c.y}
                    r={4}
                    fill={nodeStroke(st) === "var(--color-line)" ? "var(--color-muted)" : nodeStroke(st)}
                  />
                ) : (
                  <line
                    x1={left + DIVIDER + 5}
                    y1={top + NODE_H - 8}
                    x2={left + NODE_W - 5}
                    y2={top + 8}
                    stroke="var(--color-muted)"
                    strokeWidth={1.5}
                  />
                )}
              </g>
            );
          })}

          {/* head label above the first node */}
          {f.order.length > 0 && center[f.order[0]] && (
            <text
              x={center[f.order[0]].x}
              y={BASE_CY + NODE_H / 2 + 16}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="var(--color-muted)"
              style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" }}
            >
              head
            </text>
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
        <Stat label="Length" value={f.length} />
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
          onClick={restart}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤾ Restart
        </button>

        {/* Data source: the lesson's own node values vs the default list. */}
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
              Default
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
        <LegendDot color="var(--accent)" label="Cursor here" />
        <LegendDot color="var(--color-primary)" label="Pointer rewired" />
        <LegendDot color="var(--color-output)" label="Inserted / done" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 42%, white)" label="Idle .next" />
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
