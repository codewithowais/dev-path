"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   HashMapViz — a "watch it hash" animated explainer for the Hash Map lesson.

   Keys are dropped into a fixed row of buckets. For each key we first show the
   hash function turning the key into a slot number (sum of letters mod the
   bucket count), then drop the key into that bucket. When a bucket is already
   taken, the new key is *chained* onto it — a collision resolved by chaining,
   exactly what the lesson describes ("the map turns your key into a slot
   number behind the scenes").

   Same engine as SortVisualizer: the whole run is recorded up front as a list
   of ops, then replayed purely from one `step` counter. Deterministic (seeded
   PRNG, never Math.random in render), scrubbable, StrictMode-safe. All motion
   is disabled under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "hash"; k: number; bucket: number }
  | { t: "place"; k: number; bucket: number; collision: boolean };

type Recording = { ops: Op[]; collisions: number };

const BUCKETS = 5;
const KEY_COUNT = 7; // 7 keys into 5 buckets → a collision is guaranteed

const WORD_POOL = [
  "cat", "dog", "bird", "fox", "owl", "bee", "ant", "elk",
  "cod", "ray", "yak", "hen", "pug", "eel", "jay", "ram",
];

/** hash("cat") = (99+97+116) mod BUCKETS. The lesson's "turn a key into a slot". */
function hashKey(key: string): number {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return sum % BUCKETS;
}

function recordRun(keys: string[]): Recording {
  const ops: Op[] = [];
  const occupied: boolean[] = new Array(BUCKETS).fill(false);
  let collisions = 0;
  keys.forEach((key, k) => {
    const bucket = hashKey(key);
    ops.push({ t: "hash", k, bucket });
    const collision = occupied[bucket];
    if (collision) collisions++;
    occupied[bucket] = true;
    ops.push({ t: "place", k, bucket, collision });
  });
  return { ops, collisions };
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

function pickKeys(seed: number): string[] {
  const pool = [...WORD_POOL];
  const rng = makeRng(seed);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, KEY_COUNT);
}

const SPEEDS = [720, 480, 300, 170, 80] as const;

export function HashMapViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(() => stableSeed("hash-map"));

  const keys = useMemo(() => pickKeys(seed), [seed]);
  const recording = useMemo(() => recordRun(keys), [keys]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = recording.ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
    let activeKey: number | null = null;
    let activeBucket: number | null = null;
    let phase: "hashing" | "placing" | null = null;
    let lastCollision = false;
    let placed = 0;
    let collisions = 0;
    for (let s = 0; s < step; s++) {
      const op = recording.ops[s];
      if (op.t === "hash") {
        activeKey = op.k;
        activeBucket = op.bucket;
        phase = "hashing";
        lastCollision = false;
      } else {
        buckets[op.bucket].push(op.k);
        activeKey = op.k;
        activeBucket = op.bucket;
        phase = "placing";
        lastCollision = op.collision;
        placed++;
        if (op.collision) collisions++;
      }
    }
    const longest = buckets.reduce((m, b) => Math.max(m, b.length), 0);
    const used = buckets.filter((b) => b.length > 0).length;
    return { buckets, activeKey, activeBucket, phase, lastCollision, placed, collisions, longest, used };
  }, [recording, step]);

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

  const { buckets, activeKey, activeBucket, phase } = frame;

  const currentOp = step > 0 ? recording.ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp) return "Ready. Press play to hash keys into buckets.";
    const key = keys[currentOp.k];
    if (currentOp.t === "hash") {
      const codes = [...key].map((c) => c.charCodeAt(0));
      const sum = codes.reduce((a, b) => a + b, 0);
      return `hash("${key}") = (${codes.join("+")}) mod ${BUCKETS} = ${sum % BUCKETS} → bucket ${currentOp.bucket}.`;
    }
    if (currentOp.collision) {
      return `Bucket ${currentOp.bucket} is already taken — chain "${key}" onto it (a collision).`;
    }
    return `Bucket ${currentOp.bucket} was empty — drop "${key}" straight in.`;
  })();

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it hash</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Hash map
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Keys queue */}
      <div className="mt-4 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Keys to insert</div>
        <div
          className="flex flex-wrap gap-1.5"
          role="img"
          aria-label={`Hash map with ${keys.length} keys, ${done ? "all placed" : `step ${step} of ${total}`}`}
        >
          {keys.map((key, k) => {
            const isActive = activeKey === k && phase != null;
            const isPlaced = frame.buckets.some((b) => b.includes(k));
            const bg = isActive
              ? "var(--accent)"
              : isPlaced
                ? "color-mix(in srgb, var(--color-muted) 12%, white)"
                : "color-mix(in srgb, var(--accent) 20%, white)";
            const color = isActive ? "white" : "var(--color-ink)";
            return (
              <span
                key={key}
                className="dp-bar rounded-pill px-2.5 py-1 font-mono text-xs font-semibold"
                style={{
                  background: bg,
                  color,
                  opacity: isPlaced && !isActive ? 0.5 : 1,
                  transform: isActive ? "translateY(-2px)" : undefined,
                }}
              >
                {key}
              </span>
            );
          })}
        </div>
      </div>

      {/* Buckets */}
      <div className="mt-3 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Buckets (slot index)</div>
        <div className="flex flex-col gap-1.5">
          {buckets.map((chain, b) => {
            const isTarget = activeBucket === b && phase != null;
            return (
              <div key={b} className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold"
                  style={{
                    background: isTarget
                      ? "color-mix(in srgb, var(--accent) 20%, white)"
                      : "color-mix(in srgb, var(--color-muted) 10%, white)",
                    color: "var(--color-ink)",
                    outline: isTarget ? "2px solid var(--accent)" : "1px solid var(--color-line)",
                  }}
                >
                  {b}
                </span>
                <div className="flex flex-1 flex-wrap items-center gap-1">
                  {chain.map((k, pos) => {
                    const isJust = activeKey === k && phase === "placing" && activeBucket === b;
                    const chained = pos > 0;
                    const bg = isJust
                      ? chained
                        ? "var(--color-here)"
                        : "var(--accent)"
                      : "color-mix(in srgb, var(--color-muted) 12%, white)";
                    return (
                      <span key={keys[k]} className="flex items-center gap-1">
                        {chained && (
                          <span
                            aria-hidden="true"
                            className="font-mono text-xs"
                            style={{ color: isJust ? "var(--color-here)" : "var(--color-muted)" }}
                          >
                            →
                          </span>
                        )}
                        <span
                          className="dp-bar rounded-pill px-2.5 py-1 font-mono text-xs font-semibold"
                          style={{
                            background: bg,
                            color: isJust ? "white" : "var(--color-ink)",
                          }}
                        >
                          {keys[k]}
                        </span>
                      </span>
                    );
                  })}
                  {chain.length === 0 && (
                    <span className="font-mono text-[11px] text-muted">empty</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Placed" value={`${frame.placed}/${keys.length}`} />
        <Stat label="Buckets used" value={`${frame.used}/${BUCKETS}`} />
        <Stat label="Collisions" value={frame.collisions} />
        <Stat label="Longest chain" value={frame.longest} />
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
        <LegendDot color="var(--accent)" label="Hashing / just placed" />
        <LegendDot color="var(--color-here)" label="Chained (collision)" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 12%, white)" label="Settled" />
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
