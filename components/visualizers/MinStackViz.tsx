"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   MinStackViz — a "watch the two stacks stay in sync" explainer for the
   Min-Stack lesson.

   A min-stack keeps two stacks side by side: the MAIN stack of real values,
   and a MIN stack whose top always holds the smallest value currently in the
   stack. push(x) pushes x onto main, and pushes min(x, minTop) onto the min
   stack. pop() pops BOTH together so they stay the same height. getMin() just
   peeks the min stack's top — the answer is always sitting right there, O(1).

   Architecture mirrors SortVisualizer: a scripted run is RECORDED up front as
   a flat op list, then replayed purely from one `step` counter in a useMemo.
   The only playback state is `step`, advanced by a setTimeout in the autoplay
   callback — never setState inside an effect body.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { kind: "push"; value: number }
  | { kind: "pop" }
  | { kind: "getMin" };

const MAX_SIZE = 6;
const NUM_OPS = 12;
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [1000, 680, 460, 280, 160] as const;

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

/** Build a valid push/pop/getMin script: never pop/getMin an empty stack,
 *  never exceed MAX_SIZE. Push values are random 1..9 so the running minimum
 *  actually changes. Deterministic for a given seed. */
function buildScript(seed: number): Op[] {
  const rng = makeRng(seed);
  const ops: Op[] = [];
  let size = 0;
  for (let i = 0; i < NUM_OPS; i++) {
    const empty = size === 0;
    const full = size >= MAX_SIZE;
    const r = rng();
    if (empty) {
      ops.push({ kind: "push", value: 1 + Math.floor(rng() * 9) });
      size++;
      continue;
    }
    if (r < 0.18) {
      ops.push({ kind: "getMin" });
    } else if (r < 0.42 || full) {
      ops.push({ kind: "pop" });
      size--;
    } else {
      ops.push({ kind: "push", value: 1 + Math.floor(rng() * 9) });
      size++;
    }
  }
  // Make sure the reel ends on a getMin so the payoff is visible.
  if (size > 0) ops.push({ kind: "getMin" });
  return ops;
}

type Frame = {
  main: number[];
  min: number[];
  activeKind: Op["kind"] | null;
  entering: boolean; // a push just landed on the top
  leaving: { value: number; min: number } | null; // a pop just left
  reading: boolean; // getMin is peeking the min top
  pushes: number;
  pops: number;
  lastValue: number | null; // pushed or popped value
};

function replay(ops: Op[], step: number): Frame {
  const main: number[] = [];
  const min: number[] = [];
  let pushes = 0;
  let pops = 0;
  let activeKind: Op["kind"] | null = null;
  let entering = false;
  let leaving: { value: number; min: number } | null = null;
  let reading = false;
  let lastValue: number | null = null;

  for (let k = 0; k < step; k++) {
    const op = ops[k];
    entering = false;
    leaving = null;
    reading = false;
    activeKind = op.kind;
    if (op.kind === "push") {
      main.push(op.value);
      const m = min.length === 0 ? op.value : Math.min(op.value, min[min.length - 1]);
      min.push(m);
      entering = true;
      pushes++;
      lastValue = op.value;
    } else if (op.kind === "pop") {
      const v = main.pop();
      const m = min.pop();
      if (v !== undefined && m !== undefined) {
        leaving = { value: v, min: m };
        lastValue = v;
      }
      pops++;
    } else {
      reading = true;
    }
  }
  return { main, min, activeKind, entering, leaving, reading, pushes, pops, lastValue };
}

function narrate(f: Frame, started: boolean): string {
  if (!started) {
    return "Ready. Two stacks in lock-step — the min stack's top is always the smallest value, read in O(1).";
  }
  const curMin = f.min.length ? f.min[f.min.length - 1] : null;
  if (f.activeKind === "push") {
    return `push ${f.lastValue}: also push min(${f.lastValue}, current min) → the min stack's new top is ${curMin}.`;
  }
  if (f.activeKind === "pop") {
    return `pop ${f.lastValue}: pop BOTH stacks so they stay in sync. Min is now ${curMin ?? "—"}.`;
  }
  return `getMin() → ${curMin}: just peek the min stack's top. No scanning the whole stack.`;
}

export function MinStackViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => makeSeed("min-stack"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ops = useMemo(() => buildScript(seed), [seed]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => replay(ops, step), [ops, step]);
  const { main, min, entering, leaving, reading } = frame;

  const started = step > 0;
  const curMin = min.length ? min[min.length - 1] : null;

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

  const newSequence = () => {
    reset();
    setSeed((s) => s + 1);
  };

  const topIdx = main.length - 1;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <style>{`
        @keyframes msz-in { from { opacity: 0; transform: translateY(-14px) scale(0.9); } to { opacity: 1; transform: none; } }
        @keyframes msz-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-14px) scale(0.9); } }
        @keyframes msz-read { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-here) 60%, transparent); } 100% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--color-here) 0%, transparent); } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the min stack</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Min-Stack · getMin O(1)
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: two side-by-side piles */}
      <div
        className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-paper px-3 py-3"
        role="img"
        aria-label={`Min-stack with ${main.length} item${
          main.length === 1 ? "" : "s"
        }, current minimum ${curMin ?? "none"}, ${
          done ? "sequence complete" : `step ${step} of ${total}`
        }`}
      >
        <StackColumn
          title="main stack"
          titleColor="var(--accent)"
          cells={main}
          topIdx={topIdx}
          entering={entering}
          leaving={leaving ? leaving.value : null}
          topColor="var(--accent)"
          settledColor="color-mix(in srgb, var(--color-muted) 14%, white)"
          settledText="var(--color-ink)"
          ringColor="var(--accent)"
          readTop={false}
        />
        <StackColumn
          title="min stack"
          titleColor="var(--color-primary)"
          cells={min}
          topIdx={topIdx}
          entering={entering}
          leaving={leaving ? leaving.min : null}
          topColor="var(--color-primary)"
          settledColor="color-mix(in srgb, var(--color-primary) 16%, white)"
          settledText="var(--color-primary)"
          ringColor={reading ? "var(--color-here)" : "var(--color-primary)"}
          readTop={reading}
        />
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(frame, started)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Size" value={main.length} />
        <Stat label="getMin" value={curMin ?? "–"} />
        <Stat label="Pushes/Pops" value={`${frame.pushes}/${frame.pops}`} />
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
          onClick={newSequence}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)]"
        >
          ⤨ New sequence
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
        <LegendDot color="var(--accent)" label="Main top (just pushed)" />
        <LegendDot color="var(--color-primary)" label="Min stack / current min" />
        <LegendDot color="var(--color-here)" label="getMin reading the top" />
      </div>
    </div>
  );
}

function StackColumn({
  title,
  titleColor,
  cells,
  topIdx,
  entering,
  leaving,
  topColor,
  settledColor,
  settledText,
  ringColor,
  readTop,
}: {
  title: string;
  titleColor: string;
  cells: number[];
  topIdx: number;
  entering: boolean;
  leaving: number | null;
  topColor: string;
  settledColor: string;
  settledText: string;
  ringColor: string;
  readTop: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="dp-eyebrow mb-2 text-[9px]" style={{ color: titleColor }}>
        {title}
      </span>
      <div className="flex min-h-[190px] w-full flex-col-reverse items-center justify-start gap-1.5">
        {leaving != null && (
          <div
            key="ghost"
            className="flex w-16 items-center justify-center rounded-lg py-1.5 font-mono text-sm font-bold text-white sm:w-20"
            style={{
              background: topColor,
              animation: "msz-out 320ms var(--dp-ease, ease) forwards",
              order: 999,
            }}
          >
            {leaving}
          </div>
        )}
        {cells.map((v, i) => {
          const isTop = i === topIdx;
          return (
            <div
              key={i}
              className="flex w-16 items-center justify-center rounded-lg py-1.5 font-mono text-sm font-bold sm:w-20"
              style={{
                background: isTop ? topColor : settledColor,
                color: isTop ? "#fff" : settledText,
                boxShadow:
                  isTop && !entering
                    ? `0 0 0 2px var(--color-card), 0 0 0 3.5px ${ringColor}`
                    : undefined,
                animation: isTop
                  ? entering
                    ? "msz-in 320ms var(--dp-ease, ease)"
                    : readTop
                      ? "msz-read 620ms var(--dp-ease, ease)"
                      : undefined
                  : undefined,
              }}
            >
              {v}
            </div>
          );
        })}
        {cells.length === 0 && leaving == null && (
          <div className="flex w-16 items-center justify-center rounded-lg border border-dashed border-line py-1.5 font-mono text-xs text-muted sm:w-20">
            empty
          </div>
        )}
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
