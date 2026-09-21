"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   LruCacheViz — a "watch the freshest float to the front" explainer for the
   LRU (Least Recently Used) Cache lesson.

   The cache is a fixed-capacity ordered list from most-recently-used (left)
   to least-recently-used (right). A get(key) hit returns the value AND moves
   that entry to the front. A put(key,value) updates-and-moves an existing key,
   or inserts a new one at the front — and if the cache is already full, first
   evicts the entry at the right end (the least recently used). Both are O(1)
   with a hash map plus an order-preserving structure, so nothing is scanned.

   Architecture mirrors SortVisualizer: a scripted run is RECORDED up front as
   a flat op list, then replayed purely from one `step` counter in a useMemo.
   The only playback state is `step`, advanced by a setTimeout in the autoplay
   callback — never setState inside an effect body.
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { kind: "get"; key: string }
  | { kind: "put"; key: string; value: number };

type Entry = { key: string; value: number };

const CAPACITY = 4;
const NUM_OPS = 11;
const KEYS = ["A", "B", "C", "D", "E", "F"] as const;
// ms per step at each slider notch (left = slow, right = fast).
const SPEEDS = [1050, 720, 480, 300, 170] as const;

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

/** Build a script that is guaranteed to show: filling up, a get hit that
 *  reorders, a get miss, an update, and at least one eviction. We simulate the
 *  cache while generating so the ops stay sensible. Deterministic per seed. */
function buildScript(seed: number): Op[] {
  const rng = makeRng(seed);
  const ops: Op[] = [];
  const order: string[] = []; // front = MRU
  const present = new Set<string>();
  const val = () => 10 + Math.floor(rng() * 89);

  const touch = (key: string) => {
    const i = order.indexOf(key);
    if (i >= 0) order.splice(i, 1);
    order.unshift(key);
  };
  const insert = (key: string) => {
    if (!present.has(key) && order.length >= CAPACITY) {
      const evicted = order.pop();
      if (evicted) present.delete(evicted);
    }
    present.add(key);
    touch(key);
  };

  let evicted = false;
  let hadHit = false;
  let hadMiss = false;

  for (let i = 0; i < NUM_OPS; i++) {
    const r = rng();
    // Early on, fill with fresh keys. Later, mix in gets (hits + a miss) and a
    // put that forces an eviction.
    if (order.length < CAPACITY && (i < 3 || r < 0.45)) {
      const key = KEYS[order.length % KEYS.length];
      ops.push({ kind: "put", key, value: val() });
      insert(key);
    } else if (r < 0.62 && order.length > 0) {
      // get — usually a hit, sometimes a deliberate miss on a not-present key.
      if (!hadMiss && r < 0.18) {
        const missKey = KEYS.find((k) => !present.has(k)) ?? "Z";
        ops.push({ kind: "get", key: missKey });
        hadMiss = true;
      } else {
        const key = order[Math.floor(rng() * order.length)];
        ops.push({ kind: "get", key });
        hadHit = true;
        touch(key);
      }
    } else {
      // put a brand-new key — forces an eviction when full.
      const fresh = KEYS.find((k) => !present.has(k));
      const key = fresh ?? order[order.length - 1];
      if (fresh && present.size >= CAPACITY) evicted = true;
      ops.push({ kind: "put", key, value: val() });
      insert(key);
    }
  }

  // Guarantee the interesting moments exist; if not, append them.
  if (!hadHit && order.length > 0) {
    ops.push({ kind: "get", key: order[order.length - 1] });
  }
  if (!evicted) {
    const fresh = KEYS.find((k) => !present.has(k)) ?? "F";
    ops.push({ kind: "put", key: fresh, value: 10 + Math.floor(rng() * 89) });
  }
  return ops;
}

type Frame = {
  entries: Entry[]; // front (index 0) = MRU
  activeKey: string | null; // entry just touched / inserted
  evicted: Entry | null; // entry that just left
  missKey: string | null; // a get that missed
  hits: number;
  misses: number;
  evictions: number;
  lastLabel: string;
};

function replay(ops: Op[], step: number): Frame {
  const entries: Entry[] = [];
  const idxOf = (key: string) => entries.findIndex((e) => e.key === key);
  let activeKey: string | null = null;
  let evicted: Entry | null = null;
  let missKey: string | null = null;
  let hits = 0;
  let misses = 0;
  let evictions = 0;
  let lastLabel = "—";

  for (let k = 0; k < step; k++) {
    const op = ops[k];
    activeKey = null;
    evicted = null;
    missKey = null;
    if (op.kind === "get") {
      const i = idxOf(op.key);
      if (i >= 0) {
        const [e] = entries.splice(i, 1);
        entries.unshift(e); // move to MRU
        activeKey = e.key;
        hits++;
        lastLabel = `get ${op.key} → ${e.value}`;
      } else {
        missKey = op.key;
        misses++;
        lastLabel = `get ${op.key} → miss`;
      }
    } else {
      const i = idxOf(op.key);
      if (i >= 0) {
        // update in place, then move to front
        const [e] = entries.splice(i, 1);
        e.value = op.value;
        entries.unshift(e);
        activeKey = e.key;
        lastLabel = `put ${op.key}=${op.value}`;
      } else {
        if (entries.length >= CAPACITY) {
          const gone = entries.pop();
          if (gone) {
            evicted = gone;
            evictions++;
          }
        }
        entries.unshift({ key: op.key, value: op.value });
        activeKey = op.key;
        lastLabel = `put ${op.key}=${op.value}`;
      }
    }
  }
  return { entries, activeKey, evicted, missKey, hits, misses, evictions, lastLabel };
}

function narrate(f: Frame, started: boolean): string {
  if (!started) {
    return "Ready. Most-recent on the left, least-recent on the right. Touching an entry floats it to the front.";
  }
  if (f.missKey) {
    return `get ${f.missKey}: not in the cache — a miss. Nothing moves.`;
  }
  if (f.evicted) {
    return `Cache was full — evict ${f.evicted.key} (least recently used) from the right, then insert ${f.activeKey} at the front.`;
  }
  if (f.lastLabel.startsWith("get")) {
    return `${f.lastLabel}: a hit also counts as "using" it — move ${f.activeKey} to the most-recent end.`;
  }
  return `${f.lastLabel}: place ${f.activeKey} at the most-recently-used front.`;
}

export function LruCacheViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [seed, setSeed] = useState<number>(() => makeSeed("lru-cache"));
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ops = useMemo(() => buildScript(seed), [seed]);
  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => replay(ops, step), [ops, step]);
  const { entries, activeKey, evicted, missKey } = frame;

  const started = step > 0;

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

  const lruKey = entries.length ? entries[entries.length - 1].key : null;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <style>{`
        @keyframes lru-in { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: none; } }
        @keyframes lru-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(16px) scale(0.85); } }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the LRU cache</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          LRU cache · cap {CAPACITY}
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Canvas: MRU → LRU ordered row */}
      <div
        className="mt-4 rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`LRU cache with ${entries.length} of ${CAPACITY} slots used, ${
          done ? "sequence complete" : `step ${step} of ${total}`
        }`}
      >
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold">
          <span style={{ color: "var(--accent)" }}>◄ most recently used</span>
          <span style={{ color: "var(--color-primary)" }}>least recently used ►</span>
        </div>
        <div className="flex min-h-[76px] items-center gap-2 overflow-x-auto pb-1">
          {entries.map((e, i) => {
            const isActive = e.key === activeKey;
            const isLru = i === entries.length - 1;
            const bg = isActive
              ? "var(--accent)"
              : isLru
                ? "color-mix(in srgb, var(--color-primary) 16%, white)"
                : "color-mix(in srgb, var(--color-muted) 12%, white)";
            const border = isActive
              ? "var(--accent)"
              : isLru
                ? "color-mix(in srgb, var(--color-primary) 55%, white)"
                : "var(--color-line)";
            const keyColor = isActive ? "#fff" : isLru ? "var(--color-primary)" : "var(--color-ink)";
            const valColor = isActive ? "rgba(255,255,255,0.85)" : "var(--color-muted)";
            return (
              <div
                key={e.key}
                className="flex min-w-[62px] flex-col items-center rounded-xl border px-3 py-2"
                style={{
                  background: bg,
                  borderColor: border,
                  animation: isActive ? "lru-in 320ms var(--dp-ease, ease)" : undefined,
                }}
              >
                <span className="font-mono text-base font-bold" style={{ color: keyColor }}>
                  {e.key}
                </span>
                <span className="font-mono text-[11px]" style={{ color: valColor }}>
                  {e.value}
                </span>
              </div>
            );
          })}
          {/* the entry that was just evicted, drifting off the right */}
          {evicted && (
            <div
              key={`ev-${evicted.key}`}
              className="flex min-w-[62px] flex-col items-center rounded-xl border px-3 py-2"
              style={{
                background: "color-mix(in srgb, var(--color-here) 20%, white)",
                borderColor: "var(--color-here)",
                animation: "lru-out 360ms var(--dp-ease, ease) forwards",
              }}
            >
              <span className="font-mono text-base font-bold" style={{ color: "var(--color-here)" }}>
                {evicted.key}
              </span>
              <span className="font-mono text-[11px]" style={{ color: "var(--color-here)" }}>
                evicted
              </span>
            </div>
          )}
          {entries.length === 0 && !evicted && (
            <div className="flex min-w-[62px] items-center justify-center rounded-xl border border-dashed border-line px-3 py-4 font-mono text-xs text-muted">
              empty
            </div>
          )}
        </div>
        {missKey && (
          <div className="mt-2 text-center text-[11px] font-semibold" style={{ color: "var(--color-here)" }}>
            get {missKey} → miss (not cached)
          </div>
        )}
      </div>

      {/* Commentary */}
      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {narrate(frame, started)}
      </p>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Used" value={`${entries.length}/${CAPACITY}`} />
        <Stat label="LRU (next out)" value={lruKey ?? "–"} />
        <Stat label="Hits/Misses" value={`${frame.hits}/${frame.misses}`} />
        <Stat label="Evictions" value={frame.evictions} />
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
        <LegendDot color="var(--accent)" label="Just touched (now MRU)" />
        <LegendDot color="color-mix(in srgb, var(--color-primary) 55%, white)" label="Least recently used" />
        <LegendDot color="var(--color-here)" label="Evicted / miss" />
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
