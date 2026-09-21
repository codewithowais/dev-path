"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   DoublyLinkedListViz — a "walk it both ways" explainer for the Doubly Linked
   List lesson. Like a train, each node connects to the car in front (.next)
   and the car behind (.prev), so you can walk forward from the head OR
   backward from the tail.

   It plays three scripted acts:
     1. Forward traversal — cursor follows .next from the head to the tail.
     2. Backward traversal — cursor follows .prev from the tail to the head.
     3. Insert-in-the-middle — slot 25 between 20 and 30 by rewiring FOUR
        pointers: 25.prev→20, 25.next→30, 20.next→25, 30.prev→25.

   Architecture mirrors GraphVisualizer: the whole run is precomputed as a list
   of frames and played back purely from a single `step` index — deterministic,
   scrubbable and StrictMode-safe. The only state that changes during playback
   is `step` (a setTimeout functional update) and `elapsed` (a setInterval); no
   setState is ever called in an effect body. Motion is disabled under
   prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type NodeState = "idle" | "cursor" | "visited" | "rewire" | "new";
type ArrowKind = "idle" | "accent" | "violet" | "green";
type Dir = "next" | "prev";

type Arrow = { from: number; to: number; dir: Dir; kind: ArrowKind; faded?: boolean };

type Frame = {
  order: number[]; // node ids on the base row, left → right
  raisedId: number | null;
  raisedAfter: number | null;
  cursor: number | null;
  states: Record<number, NodeState>;
  arrows: Arrow[];
  caption: string;
  op: string;
  length: number;
  done: boolean;
};

/* The lesson's example list (10 ⇄ 20 ⇄ 30 ⇄ 40) plus the node we insert. */
const VALUES: Record<number, number> = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 25 };
const BASE = [1, 2, 3, 4];
const NEW_ID = 5;
const AFTER_ID = 2; // insert 25 after 20

/** Both directions of a chain: a .next arrow and a .prev arrow per adjacent pair. */
function duplex(ids: number[], kind: ArrowKind = "idle"): Arrow[] {
  const out: Arrow[] = [];
  for (let i = 0; i < ids.length - 1; i++) {
    out.push({ from: ids[i], to: ids[i + 1], dir: "next", kind });
    out.push({ from: ids[i + 1], to: ids[i], dir: "prev", kind });
  }
  return out;
}

function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  const base = (): Pick<Frame, "order" | "raisedId" | "raisedAfter"> => ({
    order: [...BASE],
    raisedId: null,
    raisedAfter: null,
  });

  // ── Intro ──────────────────────────────────────────────────────────────
  frames.push({
    ...base(),
    cursor: null,
    states: {},
    arrows: duplex(BASE),
    caption:
      "A doubly linked list: every node points to the next node AND the previous one.",
    op: "ready",
    length: 4,
    done: false,
  });

  // ── Act 1: forward traversal (follow .next from the head) ────────────────
  const fwdCaps = [
    "Start at the head (10) and walk forward with .next.",
    "Follow .next to 20.",
    "Follow .next to 30.",
    "Follow .next to 40 — the tail.",
  ];
  for (let i = 0; i < BASE.length; i++) {
    const states: Record<number, NodeState> = {};
    for (let j = 0; j < i; j++) states[BASE[j]] = "visited";
    states[BASE[i]] = "cursor";
    frames.push({
      ...base(),
      cursor: BASE[i],
      states,
      arrows: duplex(BASE).map((a) =>
        a.dir === "next" && BASE.indexOf(a.to) <= i && BASE.indexOf(a.to) > 0
          ? { ...a, kind: "accent" as ArrowKind }
          : a,
      ),
      caption: fwdCaps[i],
      op: "forward",
      length: 4,
      done: false,
    });
  }

  // ── Act 2: backward traversal (follow .prev from the tail) ───────────────
  const bwdCaps = [
    "Now start at the tail (40) and walk backward with .prev.",
    "Follow .prev to 30.",
    "Follow .prev to 20.",
    "Follow .prev to 10 — the head. A singly linked list can't do this.",
  ];
  for (let i = 0; i < BASE.length; i++) {
    const idx = BASE.length - 1 - i; // 3,2,1,0
    const states: Record<number, NodeState> = {};
    for (let j = BASE.length - 1; j > idx; j--) states[BASE[j]] = "visited";
    states[BASE[idx]] = "cursor";
    frames.push({
      ...base(),
      cursor: BASE[idx],
      states,
      arrows: duplex(BASE).map((a) =>
        a.dir === "prev" && BASE.indexOf(a.to) >= idx && BASE.indexOf(a.to) < BASE.length - 1
          ? { ...a, kind: "accent" as ArrowKind }
          : a,
      ),
      caption: bwdCaps[i],
      op: "backward",
      length: 4,
      done: false,
    });
  }

  // ── Act 3: insert 25 between 20 and 30 (four pointers) ───────────────────
  frames.push({
    ...base(),
    cursor: null,
    states: { 2: "rewire", 3: "rewire" },
    arrows: duplex(BASE),
    caption: "Insert 25 between 20 and 30 — a doubly linked insert rewires four pointers.",
    op: "insert",
    length: 4,
    done: false,
  });
  // Create the raised node.
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { 2: "rewire", 3: "rewire", 5: "new" },
    arrows: duplex(BASE),
    caption: "Create the new node 25, sitting above the gap. None of its links are set yet.",
    op: "insert",
    length: 4,
    done: false,
  });
  // Step 1: 25.prev → 20.
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { 2: "rewire", 3: "rewire", 5: "new" },
    arrows: [...duplex(BASE), { from: NEW_ID, to: 2, dir: "prev", kind: "violet" }],
    caption: "1 of 4: point 25's .prev back to 20.",
    op: "rewire",
    length: 4,
    done: false,
  });
  // Step 2: 25.next → 30.
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { 2: "rewire", 3: "rewire", 5: "new" },
    arrows: [
      ...duplex(BASE),
      { from: NEW_ID, to: 2, dir: "prev", kind: "violet" },
      { from: NEW_ID, to: 3, dir: "next", kind: "violet" },
    ],
    caption: "2 of 4: point 25's .next forward to 30.",
    op: "rewire",
    length: 4,
    done: false,
  });
  // Step 3: 20.next → 25 (fade the old 20→30 next).
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { 2: "rewire", 3: "rewire", 5: "new" },
    arrows: [
      ...duplex(BASE).map((a) =>
        a.from === 2 && a.to === 3 && a.dir === "next" ? { ...a, faded: true } : a,
      ),
      { from: NEW_ID, to: 2, dir: "prev", kind: "violet" },
      { from: NEW_ID, to: 3, dir: "next", kind: "violet" },
      { from: 2, to: NEW_ID, dir: "next", kind: "violet" },
    ],
    caption: "3 of 4: re-point 20's .next to 25.",
    op: "rewire",
    length: 4,
    done: false,
  });
  // Step 4: 30.prev → 25 (fade the old 30→20 prev).
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { 2: "rewire", 3: "rewire", 5: "new" },
    arrows: [
      ...duplex(BASE).map((a) => {
        if (a.from === 2 && a.to === 3 && a.dir === "next") return { ...a, faded: true };
        if (a.from === 3 && a.to === 2 && a.dir === "prev") return { ...a, faded: true };
        return a;
      }),
      { from: NEW_ID, to: 2, dir: "prev", kind: "violet" },
      { from: NEW_ID, to: 3, dir: "next", kind: "violet" },
      { from: 2, to: NEW_ID, dir: "next", kind: "violet" },
      { from: 3, to: NEW_ID, dir: "prev", kind: "violet" },
    ],
    caption: "4 of 4: re-point 30's .prev to 25.",
    op: "rewire",
    length: 4,
    done: false,
  });
  // Settle: the new node drops into the row, all four links green.
  const FINAL = [1, 2, NEW_ID, 3, 4];
  frames.push({
    order: FINAL,
    raisedId: null,
    raisedAfter: null,
    cursor: null,
    states: { 5: "new" },
    arrows: [
      { from: 1, to: 2, dir: "next", kind: "idle" },
      { from: 2, to: 1, dir: "prev", kind: "idle" },
      { from: 2, to: NEW_ID, dir: "next", kind: "green" },
      { from: NEW_ID, to: 2, dir: "prev", kind: "green" },
      { from: NEW_ID, to: 3, dir: "next", kind: "green" },
      { from: 3, to: NEW_ID, dir: "prev", kind: "green" },
      { from: 3, to: 4, dir: "next", kind: "idle" },
      { from: 4, to: 3, dir: "prev", kind: "idle" },
    ],
    caption:
      "Done — four pointers rewired and 25 is fully stitched into the chain both ways.",
    op: "insert",
    length: 5,
    done: true,
  });

  return frames;
}

/* ───────────────────────────── Geometry ────────────────────────────── */
const NODE_W = 78;
const NODE_H = 46;
const PITCH = 132;
const PAD_L = 24;
const BASE_CY = 120;
const RAISE_CY = 52;
const MAX_SLOTS = 5;
const SVG_H = 188;
const CONTENT_W = PAD_L * 2 + (MAX_SLOTS - 1) * PITCH + NODE_W;
const PREV_DIV = NODE_W * 0.24; // prev cell | value split
const NEXT_DIV = NODE_W * 0.76; // value | next cell split
const LANE = 9; // vertical offset separating the next / prev lanes

const slotX = (i: number) => PAD_L + i * PITCH + NODE_W / 2;

function edgePoint(cx: number, cy: number, tx: number, ty: number) {
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

export function DoublyLinkedListViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const frames = useMemo(() => buildFrames(), []);
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

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setStep(0);
    setElapsed(0);
    runStartRef.current = null;
  };

  const f = frames[Math.min(step, total - 1)];

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

  const hasNext = (id: number) =>
    f.arrows.some((a) => a.from === id && a.dir === "next" && !a.faded);
  const hasPrev = (id: number) =>
    f.arrows.some((a) => a.from === id && a.dir === "prev" && !a.faded);

  const arrowGeom = (a: Arrow) => {
    const A = center[a.from];
    const B = center[a.to];
    if (!A || !B) return null;
    const raised = Math.abs(A.y - B.y) > 1;
    if (!raised) {
      const lane = a.dir === "next" ? -LANE : LANE;
      const ltr = A.x < B.x;
      return {
        x1: ltr ? A.x + NODE_W / 2 : A.x - NODE_W / 2,
        y1: A.y + lane,
        x2: ltr ? B.x - NODE_W / 2 : B.x + NODE_W / 2,
        y2: B.y + lane,
      };
    }
    const s = edgePoint(A.x, A.y, B.x, B.y);
    const e = edgePoint(B.x, B.y, A.x, A.y);
    return { x1: s.x, y1: s.y, x2: e.x, y2: e.y };
  };

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
        <span className="dp-eyebrow text-muted">Walk it both ways</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Doubly linked list
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
          aria-label={`Doubly linked list, ${f.length} nodes. ${f.caption}`}
        >
          <defs>
            {(["idle", "accent", "violet", "green"] as ArrowKind[]).map((k) => (
              <marker
                key={k}
                id={`dll-head-${k}`}
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
            const g = arrowGeom(a);
            if (!g) return null;
            const color = ARROW_COLOR[a.kind];
            return (
              <line
                key={`${a.from}-${a.to}-${a.dir}-${i}`}
                x1={g.x1}
                y1={g.y1}
                x2={g.x2}
                y2={g.y2}
                stroke={color}
                strokeWidth={a.kind === "idle" ? 2 : 3}
                strokeLinecap="round"
                strokeDasharray={a.faded ? "4 4" : undefined}
                opacity={a.faded ? 0.4 : 1}
                markerEnd={`url(#dll-head-${a.kind})`}
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
            const stroke = nodeStroke(st);
            const dotFill = stroke === "var(--color-line)" ? "var(--color-muted)" : stroke;
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
                  stroke={stroke}
                  strokeWidth={2}
                />
                {/* prev | value | next dividers */}
                <line x1={left + PREV_DIV} y1={top} x2={left + PREV_DIV} y2={top + NODE_H} stroke="var(--color-line)" strokeWidth={1} />
                <line x1={left + NEXT_DIV} y1={top} x2={left + NEXT_DIV} y2={top + NODE_H} stroke="var(--color-line)" strokeWidth={1} />
                <text
                  x={left + (PREV_DIV + NEXT_DIV) / 2}
                  y={c.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={16}
                  fontWeight={700}
                  fill="var(--color-ink)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {VALUES[id]}
                </text>
                {/* prev pointer origin (or null slash on the head) */}
                {hasPrev(id) ? (
                  <circle cx={left + PREV_DIV / 2} cy={c.y} r={3.5} fill={dotFill} />
                ) : (
                  <line x1={left + 5} y1={top + NODE_H - 8} x2={left + PREV_DIV - 3} y2={top + 8} stroke="var(--color-muted)" strokeWidth={1.5} />
                )}
                {/* next pointer origin (or null slash on the tail) */}
                {hasNext(id) ? (
                  <circle cx={left + (NEXT_DIV + NODE_W) / 2} cy={c.y} r={3.5} fill={dotFill} />
                ) : (
                  <line x1={left + NEXT_DIV + 3} y1={top + NODE_H - 8} x2={left + NODE_W - 5} y2={top + 8} stroke="var(--color-muted)" strokeWidth={1.5} />
                )}
              </g>
            );
          })}

          {/* head / tail labels */}
          {f.order.length > 0 && center[f.order[0]] && (
            <text x={center[f.order[0]].x} y={BASE_CY + NODE_H / 2 + 16} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--color-muted)" style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" }}>
              head
            </text>
          )}
          {f.order.length > 0 && center[f.order[f.order.length - 1]] && (
            <text x={center[f.order[f.order.length - 1]].x} y={BASE_CY + NODE_H / 2 + 16} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--color-muted)" style={{ fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" }}>
              tail
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
        <LegendDot color="var(--accent)" label="Cursor here" />
        <LegendDot color="var(--color-primary)" label="Pointer rewired" />
        <LegendDot color="var(--color-output)" label="Inserted / done" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 42%, white)" label="Idle .next / .prev" />
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
