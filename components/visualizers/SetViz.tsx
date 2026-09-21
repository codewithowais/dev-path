"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   SetViz — a "watch it dedup" animated explainer for the Set lesson.

   A stream of names is fed in one at a time (the party guest list from the
   lesson). Each name is either added — if it's new — or silently rejected —
   if the set already has it. Once every name is processed, we run two
   membership tests: one hit and one miss, showing the fast yes/no the lesson
   promises.

   Same engine as SortVisualizer: the whole run is recorded up front as a list
   of ops, then replayed purely from one `step` counter. Deterministic (seeded
   PRNG, never Math.random in render), scrubbable, StrictMode-safe. All motion
   is disabled under prefers-reduced-motion (handled globally in globals.css).
   ──────────────────────────────────────────────────────────────────────── */

type Op =
  | { t: "consider"; src: number }
  | { t: "add"; src: number }
  | { t: "reject"; src: number; matchOrder: number }
  | { t: "query-check"; value: string; present: boolean }
  | { t: "query-result"; value: string; present: boolean };

type Recording = { ops: Op[]; stream: string[]; missValue: string };

const NAME_POOL = ["amy", "bo", "cy", "di", "ed", "fi", "gus", "hal"];

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

/** Build a stream of ~7 names, deliberately seeded to contain duplicates so
 *  the dedup behaviour is visible, plus a name that is NOT in the set (miss). */
function buildRun(seed: number): Recording {
  const rng = makeRng(seed);
  const shuffled = [...NAME_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const uniques = shuffled.slice(0, 3); // the names that will actually be in the set
  const missValue = shuffled[3]; // present in the pool but never inserted

  // Weave duplicates through the stream deterministically.
  const stream: string[] = [];
  const pattern = [0, 1, 0, 2, 1, 0, 2];
  for (const p of pattern) stream.push(uniques[p]);

  const ops: Op[] = [];
  const setOrder = new Map<string, number>();
  stream.forEach((value, src) => {
    ops.push({ t: "consider", src });
    if (setOrder.has(value)) {
      ops.push({ t: "reject", src, matchOrder: setOrder.get(value)! });
    } else {
      setOrder.set(value, setOrder.size);
      ops.push({ t: "add", src });
    }
  });

  // Two membership tests: a hit (first unique) then a miss.
  const hitValue = uniques[0];
  ops.push({ t: "query-check", value: hitValue, present: true });
  ops.push({ t: "query-result", value: hitValue, present: true });
  ops.push({ t: "query-check", value: missValue, present: false });
  ops.push({ t: "query-result", value: missValue, present: false });

  return { ops, stream, missValue };
}

const SPEEDS = [780, 520, 320, 180, 90] as const;

export function SetViz({
  accent,
  complexity,
}: {
  accent: string;
  complexity?: string;
}) {
  const [speedIdx, setSpeedIdx] = useState<number>(2);
  const [seed, setSeed] = useState<number>(() => stableSeed("set"));

  const recording = useMemo(() => buildRun(seed), [seed]);
  const { ops, stream } = recording;

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = ops.length;
  const done = step >= total;
  const running = playing && !done;

  const frame = useMemo(() => {
    const members: string[] = []; // unique values in insertion order
    // Per-input status: pending until considered, then active/added/rejected.
    const status: ("pending" | "active" | "added" | "rejected")[] = stream.map(() => "pending");
    let activeSrc: number | null = null;
    let lastAction: "add" | "reject" | null = null;
    let matchValue: string | null = null; // set member flashing on reject/query
    let processed = 0;
    let rejected = 0;
    let queryValue: string | null = null;
    let queryPresent: boolean | null = null;
    let queryPhase: "check" | "result" | null = null;

    for (let s = 0; s < step; s++) {
      const op = ops[s];
      switch (op.t) {
        case "consider":
          activeSrc = op.src;
          status[op.src] = "active";
          lastAction = null;
          matchValue = null;
          queryPhase = null;
          break;
        case "add":
          members.push(stream[op.src]);
          activeSrc = op.src;
          status[op.src] = "added";
          lastAction = "add";
          processed++;
          break;
        case "reject":
          activeSrc = op.src;
          status[op.src] = "rejected";
          lastAction = "reject";
          matchValue = stream[op.src];
          processed++;
          rejected++;
          break;
        case "query-check":
          activeSrc = null;
          lastAction = null;
          queryValue = op.value;
          queryPresent = null;
          queryPhase = "check";
          matchValue = op.present ? op.value : null;
          break;
        case "query-result":
          activeSrc = null;
          queryValue = op.value;
          queryPresent = op.present;
          queryPhase = "result";
          matchValue = op.present ? op.value : null;
          break;
      }
    }
    return { members, status, activeSrc, lastAction, matchValue, processed, rejected, queryValue, queryPresent, queryPhase };
  }, [ops, stream, step]);

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

  const { members, status, matchValue, queryValue, queryPresent, queryPhase } = frame;

  const currentOp = step > 0 ? ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp) return "Ready. Press play to build the set.";
    switch (currentOp.t) {
      case "consider":
        return `Next up: "${stream[currentOp.src]}". Is it already in the set?`;
      case "add":
        return `"${stream[currentOp.src]}" is new — add it to the set.`;
      case "reject":
        return `"${stream[currentOp.src]}" is already in the set — rejected, nothing changes.`;
      case "query-check":
        return `Membership test: is "${currentOp.value}" in the set?`;
      case "query-result":
        return currentOp.present
          ? `Yes — "${currentOp.value}" is in the set. A fast hit.`
          : `No — "${currentOp.value}" was never added. A miss.`;
    }
  })();

  const resultLabel =
    queryPhase === "result"
      ? queryPresent
        ? "hit"
        : "miss"
      : "—";

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch it dedup</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          Set
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">{complexity}</span>
        )}
      </div>

      {/* Input stream */}
      <div className="mt-4 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">Incoming names</div>
        <div
          className="flex flex-wrap gap-1.5"
          role="img"
          aria-label={`Set built from ${stream.length} names, ${done ? "complete" : `step ${step} of ${total}`}`}
        >
          {stream.map((name, src) => {
            const st = status[src];
            let bg = "color-mix(in srgb, var(--accent) 18%, white)"; // pending
            let color = "var(--color-ink)";
            if (st === "added") {
              bg = "var(--accent)";
              color = "white";
            } else if (st === "rejected") {
              bg = "var(--color-here)";
              color = "white";
            } else if (st === "active") {
              bg = "var(--color-primary)";
              color = "white";
            }
            const settled = st === "added" || st === "rejected";
            return (
              <span
                key={src}
                className="dp-bar rounded-pill px-2.5 py-1 font-mono text-xs font-semibold"
                style={{
                  background: bg,
                  color,
                  opacity: settled ? 0.55 : 1,
                  transform: st === "active" ? "translateY(-2px)" : undefined,
                }}
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>

      {/* The set */}
      <div className="mt-3 rounded-xl bg-paper px-3 py-3">
        <div className="dp-eyebrow mb-2 text-[10px] text-muted">The set (unique only)</div>
        <div className="flex min-h-[2.25rem] flex-wrap items-center gap-1.5">
          {members.length === 0 && (
            <span className="font-mono text-[11px] text-muted">empty</span>
          )}
          {members.map((value) => {
            const isMatch = matchValue === value;
            const isHit = isMatch && queryPhase != null;
            const bg = isHit
              ? "var(--accent)"
              : isMatch
                ? "var(--color-primary)"
                : "color-mix(in srgb, var(--color-muted) 12%, white)";
            return (
              <span
                key={value}
                className="dp-bar rounded-pill px-3 py-1 font-mono text-xs font-semibold"
                style={{
                  background: bg,
                  color: isMatch ? "white" : "var(--color-ink)",
                }}
              >
                {value}
              </span>
            );
          })}
        </div>
      </div>

      {/* Membership test readout */}
      {queryValue != null && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-mono text-muted">has(&quot;{queryValue}&quot;) →</span>
          <span
            className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-bold text-white"
            style={{
              background:
                queryPhase === "result"
                  ? queryPresent
                    ? "var(--accent)"
                    : "var(--color-here)"
                  : "var(--color-primary)",
            }}
          >
            {queryPhase === "result" ? (queryPresent ? "yes (hit)" : "no (miss)") : "checking…"}
          </span>
        </div>
      )}

      <p className="mt-3 min-h-[1.5rem] text-sm text-ink" aria-live="polite" role="status">
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Processed" value={`${frame.processed}/${stream.length}`} />
        <Stat label="Unique" value={members.length} />
        <Stat label="Duplicates" value={frame.rejected} />
        <Stat label="Test" value={resultLabel} />
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
        <LegendDot color="var(--accent)" label="Added / hit" />
        <LegendDot color="var(--color-primary)" label="Considering / match" />
        <LegendDot color="var(--color-here)" label="Rejected / miss" />
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
