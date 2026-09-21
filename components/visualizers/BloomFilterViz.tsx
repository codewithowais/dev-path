"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   BloomFilterViz — a "watch the bits" explainer for the Bloom Filter lesson.

   A fixed row of bits starts all off. Adding an item runs it through k hash
   functions; each points at one bit, which is flipped on. A query re-runs the
   same hashes: if every bit is on we say "possibly present"; if even one is
   off we say "definitely absent". The run deliberately ends on a false
   positive — an item never added whose k bits all happen to be on — the exact
   trap the lesson warns about, while never producing a false negative.

   Same engine as SortVisualizer: the whole run is recorded up front as a list
   of ops, then replayed purely from one `step` counter. Deterministic (seeded
   PRNG, never Math.random in render), scrubbable, StrictMode-safe. All motion
   is disabled under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

const SIZE = 18; // bits
const K = 3; // hash functions
const ADD_COUNT = 4;

const POOL = [
  "apple", "banana", "cherry", "grape", "lemon", "mango", "melon", "peach",
  "plum", "kiwi", "lime", "olive", "fig", "date", "pear", "guava",
  "berry", "cocoa", "papaya", "quince", "apricot", "raisin", "tomato", "onion",
];

/** k independent hashes of a string, each folded into [0, SIZE). */
function hashes(s: string): number[] {
  let h1 = 0;
  let h2 = 0;
  let h3 = 5381;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 += c;
    h2 += (i + 1) * c;
    h3 = (h3 * 33 + c) & 0x7fffffff;
  }
  return [h1 % SIZE, h2 % SIZE, h3 % SIZE];
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

function stableSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

type QueryKind = "tp" | "tn" | "fp";

type Op =
  | { t: "add-start"; w: string }
  | { t: "add-bit"; w: string; fn: number; bit: number }
  | { t: "q-start"; w: string; kind: QueryKind }
  | { t: "q-bit"; w: string; fn: number; bit: number; isSet: boolean }
  | { t: "q-result"; w: string; present: boolean; kind: QueryKind };

type Recording = { ops: Op[]; added: string[]; queries: { w: string; kind: QueryKind }[] };

/** Deterministically choose 4 items to add plus three queries — a true
 *  positive, a true negative, and (guaranteed) a false positive — by trying
 *  seed-derived arrangements until one yields all three from the pool. */
function buildRun(seed: number): Recording {
  for (let attempt = 0; attempt < 300; attempt++) {
    const rng = makeRng(seed + attempt * 7919);
    const pool = [...POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const added = pool.slice(0, ADD_COUNT);
    const rest = pool.slice(ADD_COUNT);

    const bits = new Array<number>(SIZE).fill(0);
    for (const w of added) for (const b of hashes(w)) bits[b] = 1;

    let falsePos: string | null = null;
    let trueNeg: string | null = null;
    for (const w of rest) {
      const allSet = hashes(w).every((b) => bits[b] === 1);
      if (allSet && falsePos == null) falsePos = w;
      if (!allSet && trueNeg == null) trueNeg = w;
    }
    if (falsePos == null || trueNeg == null) continue;

    const queries: { w: string; kind: QueryKind }[] = [
      { w: added[0], kind: "tp" },
      { w: trueNeg, kind: "tn" },
      { w: falsePos, kind: "fp" },
    ];

    const ops: Op[] = [];
    const live = new Array<number>(SIZE).fill(0);
    for (const w of added) {
      ops.push({ t: "add-start", w });
      hashes(w).forEach((bit, fn) => {
        live[bit] = 1;
        ops.push({ t: "add-bit", w, fn, bit });
      });
    }
    for (const q of queries) {
      ops.push({ t: "q-start", w: q.w, kind: q.kind });
      const hs = hashes(q.w);
      hs.forEach((bit, fn) => {
        ops.push({ t: "q-bit", w: q.w, fn, bit, isSet: live[bit] === 1 });
      });
      const present = hs.every((b) => live[b] === 1);
      ops.push({ t: "q-result", w: q.w, present, kind: q.kind });
    }
    return { ops, added, queries };
  }
  // Extremely unlikely fallback: add-only run.
  const added = POOL.slice(0, ADD_COUNT);
  const ops: Op[] = [];
  for (const w of added) {
    ops.push({ t: "add-start", w });
    hashes(w).forEach((bit, fn) => ops.push({ t: "add-bit", w, fn, bit }));
  }
  return { ops, added, queries: [] };
}

const KIND_LABEL: Record<QueryKind, string> = {
  tp: "added earlier",
  tn: "never added",
  fp: "never added",
};

const SPEEDS = [780, 520, 320, 190, 90] as const;

export function BloomFilterViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(() => stableSeed("bloom-filter"));

  const recording = useMemo(() => buildRun(seed), [seed]);
  const { ops } = recording;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const bits = new Array<number>(SIZE).fill(0);
    const highlight = new Map<number, "accent" | "violet" | "coral">();
    let phase: "add" | "query" | null = null;
    let activeWord: string | null = null;
    let kind: QueryKind | null = null;
    let itemsAdded = 0;
    let queriesDone = 0;
    let present: boolean | null = null;
    let resolved = false;

    for (let s = 0; s < step; s++) {
      const op = ops[s];
      switch (op.t) {
        case "add-start":
          highlight.clear();
          phase = "add";
          activeWord = op.w;
          kind = null;
          present = null;
          resolved = false;
          break;
        case "add-bit":
          bits[op.bit] = 1;
          highlight.set(op.bit, "accent");
          activeWord = op.w;
          if (op.fn === K - 1) itemsAdded++;
          break;
        case "q-start":
          highlight.clear();
          phase = "query";
          activeWord = op.w;
          kind = op.kind;
          present = null;
          resolved = false;
          break;
        case "q-bit":
          highlight.set(op.bit, op.isSet ? "violet" : "coral");
          activeWord = op.w;
          break;
        case "q-result":
          present = op.present;
          kind = op.kind;
          resolved = true;
          queriesDone++;
          break;
      }
    }
    const bitsSet = bits.reduce((a, b) => a + b, 0);
    return { bits, highlight, phase, activeWord, kind, itemsAdded, queriesDone, present, resolved, bitsSet };
  }, [ops, step]);

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

  const { bits, highlight, phase, activeWord, kind, present, resolved } = frame;

  const currentOp = step > 0 ? ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp) return "Ready. Press play to add items, then query the filter.";
    switch (currentOp.t) {
      case "add-start":
        return `Adding "${currentOp.w}" — run it through ${K} hashes and flip those bits on.`;
      case "add-bit":
        return `h${currentOp.fn + 1}("${currentOp.w}") → bit ${currentOp.bit}. Flip it on.`;
      case "q-start":
        return `Query "${currentOp.w}" (${KIND_LABEL[currentOp.kind]}) — check the same ${K} bits.`;
      case "q-bit":
        return currentOp.isSet
          ? `h${currentOp.fn + 1}("${currentOp.w}") → bit ${currentOp.bit} is ON so far.`
          : `h${currentOp.fn + 1}("${currentOp.w}") → bit ${currentOp.bit} is OFF — that settles it.`;
      case "q-result":
        if (!currentOp.present) return `Bit missing → "${currentOp.w}" is definitely absent.`;
        return currentOp.kind === "fp"
          ? `All bits on → "${currentOp.w}" reads as possibly present — but it was never added. A false positive!`
          : `All bits on → "${currentOp.w}" is possibly present.`;
    }
  })();

  const verdict = resolved
    ? present
      ? "possibly present"
      : "definitely absent"
    : phase === "query"
      ? "checking…"
      : "—";
  const verdictBg = resolved
    ? present
      ? "var(--accent)"
      : "var(--color-here)"
    : "var(--color-primary)";

  const isFalsePositive = resolved && kind === "fp" && present === true;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the bits</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Bloom filter
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Bit array */}
      <div className="mt-4 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">
          Bit array ({K} hashes per item)
        </div>
        <div
          className="flex flex-wrap gap-1.5"
          role="img"
          aria-label={`Bloom filter with ${SIZE} bits, ${done ? "run complete" : `step ${step} of ${total}`}`}
        >
          {bits.map((b, i) => {
            const hl = highlight.get(i);
            let bg = b === 1 ? "color-mix(in srgb, var(--accent) 30%, white)" : "color-mix(in srgb, var(--color-muted) 12%, white)";
            let color = "var(--color-ink)";
            if (hl === "accent") {
              bg = "var(--accent)";
              color = "white";
            } else if (hl === "violet") {
              bg = "var(--color-primary)";
              color = "white";
            } else if (hl === "coral") {
              bg = "var(--color-here)";
              color = "white";
            }
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span
                  className="dp-bar flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-bold"
                  style={{
                    background: bg,
                    color,
                    transform: hl ? "translateY(-2px)" : undefined,
                    outline: hl ? `2px solid ${bg}` : undefined,
                  }}
                >
                  {b}
                </span>
                <span className="font-mono text-[9px] text-muted">{i}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active item + verdict */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {activeWord && (
          <span
            className="rounded-pill px-3 py-1 font-mono text-xs font-semibold"
            style={{
              background: "color-mix(in srgb, var(--accent) 14%, white)",
              color: "var(--accent)",
            }}
          >
            {phase === "add" ? "add" : "query"}(&quot;{activeWord}&quot;)
          </span>
        )}
        {phase === "query" && (
          <>
            <span className="font-mono text-muted">→</span>
            <span
              className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-bold text-white"
              style={{ background: verdictBg }}
            >
              {verdict}
            </span>
          </>
        )}
        {isFalsePositive && (
          <span
            className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-bold text-white"
            style={{ background: "var(--color-here)" }}
          >
            false positive
          </span>
        )}
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Bits set" value={`${frame.bitsSet}/${SIZE}`} />
        <Stat label="Items added" value={`${frame.itemsAdded}/${ADD_COUNT}`} />
        <Stat label="Queries" value={frame.queriesDone} />
        <Stat label="Verdict" value={verdict === "—" ? "—" : verdict === "checking…" ? "…" : present ? "maybe" : "no"} />
      </div>

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

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Bit set / setting" />
        <LegendDot color="var(--color-primary)" label="Checking (on)" />
        <LegendDot color="var(--color-here)" label="Off bit / false positive" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 12%, white)" label="Empty bit" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-2 py-2">
      <div className="font-mono text-base font-bold tabular-nums text-ink sm:text-lg">{value}</div>
      <div className="dp-eyebrow mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      {label}
    </span>
  );
}
