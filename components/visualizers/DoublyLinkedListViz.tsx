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

/* The lesson's example list (10 ⇄ 20 ⇄ 30 ⇄ 40) plus the node we insert — the
 * default when the lesson code can't be parsed. */
type LLConfig = {
  values: number[]; // base node values in head → tail order
  insertAfterIdx: number; // insert the new node after this base index
  insertVal: number; // value carried by the inserted node
};
const DEFAULT_CONFIG: LLConfig = { values: [10, 20, 30, 40], insertAfterIdx: 1, insertVal: 25 };

type Built = { frames: Frame[]; values: Record<number, number> };

/** Both directions of a chain: a .next arrow and a .prev arrow per adjacent pair. */
function duplex(ids: number[], kind: ArrowKind = "idle"): Arrow[] {
  const out: Arrow[] = [];
  for (let i = 0; i < ids.length - 1; i++) {
    out.push({ from: ids[i], to: ids[i + 1], dir: "next", kind });
    out.push({ from: ids[i + 1], to: ids[i], dir: "prev", kind });
  }
  return out;
}

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

/** Parse the node values from the lesson demo's `list.addLast(n)` calls so the
 *  animation walks the exact list shown in the editor. Returns null when there
 *  is no usable demo — the component then falls back to the default list. */
function parseDoublyLinkedListConfig(code: string | undefined): LLConfig | null {
  if (!code) return null;
  const inst = /(?:const|let|var)\s+(\w+)\s*=\s*new\s+DoublyLinkedList\s*\(/.exec(code);
  if (!inst) return null;
  const name = inst[1];
  const re = new RegExp(`\\b${name}\\.addLast\\s*\\(\\s*(-?\\d+)\\s*\\)`, "g");
  const values: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) values.push(Number(m[1]));
  if (values.length < 2 || values.length > 4) return null;
  return makeConfig(values);
}

/* Build the full frame timeline for a given list configuration. The default
 * config reproduces the original 10 ⇄ 20 ⇄ 30 ⇄ 40 walk exactly. */
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
    length: n,
    done: false,
  });

  // ── Act 1: forward traversal (follow .next from the head) ────────────────
  const fwdCaption = (i: number): string => {
    const v = vals[i];
    if (i === 0) return `Start at the head (${v}) and walk forward with .next.`;
    if (i === n - 1) return `Follow .next to ${v} — the tail.`;
    return `Follow .next to ${v}.`;
  };
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
      caption: fwdCaption(i),
      op: "forward",
      length: n,
      done: false,
    });
  }

  // ── Act 2: backward traversal (follow .prev from the tail) ───────────────
  const bwdCaption = (i: number, idx: number): string => {
    const v = vals[idx];
    if (i === 0) return `Now start at the tail (${v}) and walk backward with .prev.`;
    if (idx === 0) return `Follow .prev to ${v} — the head. A singly linked list can't do this.`;
    return `Follow .prev to ${v}.`;
  };
  for (let i = 0; i < BASE.length; i++) {
    const idx = BASE.length - 1 - i; // n-1 … 0
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
      caption: bwdCaption(i, idx),
      op: "backward",
      length: n,
      done: false,
    });
  }

  // ── Act 3: insert the new node between AFTER_ID and NEXT_ID (four pointers) ──
  frames.push({
    ...base(),
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEXT_ID]: "rewire" },
    arrows: duplex(BASE),
    caption: `Insert ${insertVal} between ${afterVal} and ${nextVal} — a doubly linked insert rewires four pointers.`,
    op: "insert",
    length: n,
    done: false,
  });
  // Create the raised node.
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEXT_ID]: "rewire", [NEW_ID]: "new" },
    arrows: duplex(BASE),
    caption: `Create the new node ${insertVal}, sitting above the gap. None of its links are set yet.`,
    op: "insert",
    length: n,
    done: false,
  });
  // Step 1: new.prev → AFTER_ID.
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEXT_ID]: "rewire", [NEW_ID]: "new" },
    arrows: [...duplex(BASE), { from: NEW_ID, to: AFTER_ID, dir: "prev", kind: "violet" }],
    caption: `1 of 4: point ${insertVal}'s .prev back to ${afterVal}.`,
    op: "rewire",
    length: n,
    done: false,
  });
  // Step 2: new.next → NEXT_ID.
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEXT_ID]: "rewire", [NEW_ID]: "new" },
    arrows: [
      ...duplex(BASE),
      { from: NEW_ID, to: AFTER_ID, dir: "prev", kind: "violet" },
      { from: NEW_ID, to: NEXT_ID, dir: "next", kind: "violet" },
    ],
    caption: `2 of 4: point ${insertVal}'s .next forward to ${nextVal}.`,
    op: "rewire",
    length: n,
    done: false,
  });
  // Step 3: AFTER_ID.next → new (fade the old AFTER→NEXT next).
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEXT_ID]: "rewire", [NEW_ID]: "new" },
    arrows: [
      ...duplex(BASE).map((a) =>
        a.from === AFTER_ID && a.to === NEXT_ID && a.dir === "next" ? { ...a, faded: true } : a,
      ),
      { from: NEW_ID, to: AFTER_ID, dir: "prev", kind: "violet" },
      { from: NEW_ID, to: NEXT_ID, dir: "next", kind: "violet" },
      { from: AFTER_ID, to: NEW_ID, dir: "next", kind: "violet" },
    ],
    caption: `3 of 4: re-point ${afterVal}'s .next to ${insertVal}.`,
    op: "rewire",
    length: n,
    done: false,
  });
  // Step 4: NEXT_ID.prev → new (fade the old NEXT→AFTER prev).
  frames.push({
    order: [...BASE],
    raisedId: NEW_ID,
    raisedAfter: AFTER_ID,
    cursor: null,
    states: { [AFTER_ID]: "rewire", [NEXT_ID]: "rewire", [NEW_ID]: "new" },
    arrows: [
      ...duplex(BASE).map((a) => {
        if (a.from === AFTER_ID && a.to === NEXT_ID && a.dir === "next") return { ...a, faded: true };
        if (a.from === NEXT_ID && a.to === AFTER_ID && a.dir === "prev") return { ...a, faded: true };
        return a;
      }),
      { from: NEW_ID, to: AFTER_ID, dir: "prev", kind: "violet" },
      { from: NEW_ID, to: NEXT_ID, dir: "next", kind: "violet" },
      { from: AFTER_ID, to: NEW_ID, dir: "next", kind: "violet" },
      { from: NEXT_ID, to: NEW_ID, dir: "prev", kind: "violet" },
    ],
    caption: `4 of 4: re-point ${nextVal}'s .prev to ${insertVal}.`,
    op: "rewire",
    length: n,
    done: false,
  });
  // Settle: the new node drops into the row, all four links green.
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
    arrows: duplex(FINAL).map((a) =>
      (a.from === AFTER_ID && a.to === NEW_ID) ||
      (a.from === NEW_ID && a.to === AFTER_ID) ||
      (a.from === NEW_ID && a.to === NEXT_ID) ||
      (a.from === NEXT_ID && a.to === NEW_ID)
        ? { ...a, kind: "green" as ArrowKind }
        : a,
    ),
    caption: `Done — four pointers rewired and ${insertVal} is fully stitched into the chain both ways.`,
    op: "insert",
    length: n + 1,
    done: true,
  });

  return { frames, values };
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
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's JavaScript source — parsed for the exact node values shown. */
  code?: string;
}) {
  const codeConfig = useMemo(() => parseDoublyLinkedListConfig(code), [code]);
  const hasCodeData = codeConfig !== null;
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);

  const built = useMemo(
    () => buildRun(useCode && codeConfig ? codeConfig : DEFAULT_CONFIG),
    [useCode, codeConfig],
  );
  const frames = built.frames;
  const values = built.values;
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

  const toggleSource = (next: boolean) => {
    restart();
    setUseCode(next);
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
                  {values[id]}
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
