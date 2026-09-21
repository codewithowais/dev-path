"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   LCSGrid — a "watch the grid fill" explainer for Longest Common Subsequence,
   lesson id "longest-common-subsequence".

   Faithful to the lesson's recurrence over two short strings A and B:
     • cell (i, j) = longest common thread using the first i letters of A and
       the first j letters of B.
     • if A[i-1] === B[j-1]: dp[i][j] = dp[i-1][j-1] + 1  (extend — reads the
       DIAGONAL cell).
     • else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])       (reads UP or LEFT,
       whichever is bigger).
   Row 0 and column 0 are the "zero letters used" border, pre-filled with 0.
   The corner cell is the answer; we backtrack to read out the matched letters.

   Architecture mirrors SortVisualizer: record the run as a flat op list, then
   derive everything visible from a single `step` counter in a useMemo. No
   setState in any effect body.
   ──────────────────────────────────────────────────────────────────────── */

type Op = {
  i: number;
  j: number;
  match: boolean;
  value: number;
  /** Source cells this cell read, as [row, col] pairs. */
  sources: Array<[number, number]>;
};

type Recording = {
  ops: Op[];
  a: string;
  b: string;
  grid: number[][];
  lcs: string;
};

function recordLCS(a: string, b: string): Recording {
  const m = a.length;
  const n = b.length;
  const grid: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  const ops: Op[] = [];

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = a[i - 1] === b[j - 1];
      if (match) {
        grid[i][j] = grid[i - 1][j - 1] + 1;
        ops.push({
          i,
          j,
          match: true,
          value: grid[i][j],
          sources: [[i - 1, j - 1]],
        });
      } else {
        const up = grid[i - 1][j];
        const left = grid[i][j - 1];
        grid[i][j] = Math.max(up, left);
        // Show the neighbor(s) that produced the max as the source(s).
        const sources: Array<[number, number]> =
          up === left
            ? [
                [i - 1, j],
                [i, j - 1],
              ]
            : up > left
              ? [[i - 1, j]]
              : [[i, j - 1]];
        ops.push({ i, j, match: false, value: grid[i][j], sources });
      }
    }
  }

  // Backtrack from the corner to read out the actual matching letters.
  let i = m;
  let j = n;
  const chars: string[] = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      chars.push(a[i - 1]);
      i--;
      j--;
    } else if (grid[i - 1][j] >= grid[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  chars.reverse();

  return { ops, a, b, grid, lcs: chars.join("") };
}

// Seeded string pairs — each string length 3..6 so the grid fits 375px.
const STRING_PAIRS: Array<[string, string]> = [
  ["ABCBD", "BDCAB"],
  ["AGCAT", "GAC"],
  ["HUMAN", "CHAMP"],
  ["STONE", "NOTES"],
];

const SPEEDS = [700, 480, 300, 170, 90] as const;

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

function pickPair(seed: number): [string, string] {
  const rng = makeRng(seed);
  return STRING_PAIRS[Math.floor(rng() * STRING_PAIRS.length)];
}

/** Parse the two strings the lesson compares from its code, e.g.
 *  `const a = "ABCBDAB"` / `const b = "BDCABA"`. Requires a quote right after
 *  `=`, so identifiers like `a.length` never match. Returns null (→ no toggle,
 *  existing random behavior) if the code is missing or either string is absent
 *  or too long to fit the grid. */
function parseStrings(code: string | undefined): [string, string] | null {
  if (!code) return null;
  const aMatch = code.match(/\ba\s*=\s*["'`]([A-Za-z]+)["'`]/);
  const bMatch = code.match(/\bb\s*=\s*["'`]([A-Za-z]+)["'`]/);
  if (!aMatch || !bMatch) return null;
  const a = aMatch[1];
  const b = bMatch[1];
  if (a.length < 1 || a.length > 8 || b.length < 1 || b.length > 8) return null;
  return [a, b];
}

export function LCSGrid({
  accent,
  complexity,
  code,
}: {
  accent: string;
  complexity?: string;
  /** The lesson's full JavaScript source — the grid binds to the two strings in it. */
  code?: string;
}) {
  // The exact pair of strings from the lesson's own code, when they parse.
  const codePair = useMemo(() => parseStrings(code), [code]);
  const hasCodeData = codePair !== null;
  // Default to the lesson's own strings when present, so the grid matches the
  // code on the page; the learner can switch to a random pair for variety.
  const [useCode, setUseCode] = useState<boolean>(hasCodeData);
  const [seed, setSeed] = useState<number>(3);
  const [a, b] = useMemo(
    () => (useCode && hasCodeData ? (codePair as [string, string]) : pickPair(seed)),
    [useCode, hasCodeData, codePair, seed],
  );
  const recording = useMemo(() => recordLCS(a, b), [a, b]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(2);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = recording.ops.length;
  const done = step >= total;
  const running = playing && !done;

  const m = a.length;
  const n = b.length;

  const frame = useMemo(() => {
    // Grid values: border row/col pre-filled with 0, inner cells null until filled.
    const values: (number | null)[][] = Array.from({ length: m + 1 }, (_, r) =>
      Array.from({ length: n + 1 }, (_, c) => (r === 0 || c === 0 ? 0 : null))
    );
    let current: [number, number] | null = null;
    let sources: Array<[number, number]> = [];
    let lastMatch = false;
    let matches = 0;
    for (let k = 0; k < step; k++) {
      const op = recording.ops[k];
      current = null;
      sources = [];
      values[op.i][op.j] = op.value;
      current = [op.i, op.j];
      sources = op.sources;
      lastMatch = op.match;
      if (op.match) matches++;
    }
    return { values, current, sources, lastMatch, matches };
  }, [recording, step, m, n]);

  const { values, current, sources, matches } = frame;

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

  const toggleSource = (next: boolean) => {
    reset();
    setUseCode(next);
  };

  const currentOp = step > 0 ? recording.ops[step - 1] : undefined;
  const caption = ((): string => {
    if (!currentOp) return "Ready. Fill the grid row by row to find the longest shared thread.";
    const ca = a[currentOp.i - 1];
    const cb = b[currentOp.j - 1];
    if (currentOp.match) {
      return `A[${currentOp.i}]='${ca}' matches B[${currentOp.j}]='${cb}' — take the diagonal + 1 = ${currentOp.value}.`;
    }
    return `'${ca}' ≠ '${cb}' — take the bigger neighbor (up vs left) = ${currentOp.value}.`;
  })();

  const isSource = (r: number, c: number) =>
    sources.some(([sr, sc]) => sr === r && sc === c);
  const isCurrent = (r: number, c: number) =>
    current !== null && current[0] === r && current[1] === c;
  const isAnswer = (r: number, c: number) => done && r === m && c === n;

  const cellStyle = (r: number, c: number, v: number | null) => {
    let bg = "color-mix(in srgb, var(--color-muted) 10%, white)";
    let fg = "var(--color-muted, #5b6079)";
    if (isAnswer(r, c)) {
      bg = "var(--color-output)";
      fg = "white";
    } else if (isCurrent(r, c)) {
      bg = "var(--accent)";
      fg = "white";
    } else if (isSource(r, c)) {
      bg = "var(--color-primary)";
      fg = "white";
    } else if (v !== null) {
      bg =
        r === 0 || c === 0
          ? "color-mix(in srgb, var(--color-muted) 8%, white)"
          : "color-mix(in srgb, var(--accent) 16%, white)";
      fg = "var(--ink, #1a1c2b)";
    }
    return { background: bg, color: fg };
  };

  const answerVal = done ? recording.grid[m][n] : null;

  return (
    <div
      className="rounded-card border border-line dp-card p-4 sm:p-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="dp-eyebrow text-muted">Watch the grid fill</span>
        <span
          className="rounded-pill px-2.5 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, white)",
            color: "var(--accent)",
          }}
        >
          LCS grid
        </span>
        {complexity && (
          <span className="ml-auto font-mono text-[11px] text-muted">
            {complexity}
          </span>
        )}
      </div>

      <div
        className="mt-4 overflow-x-auto rounded-xl bg-paper px-3 py-4"
        role="img"
        aria-label={`Longest common subsequence grid for "${a}" and "${b}", ${
          done ? "complete" : `${step} of ${total} cells`
        }`}
      >
        <div className="inline-block min-w-full">
          {/* Column header: ε then the letters of B */}
          <div className="flex justify-center gap-1">
            <HeaderCell label="" />
            <HeaderCell label="ε" />
            {b.split("").map((ch, c) => (
              <HeaderCell key={c} label={ch} active={current !== null && current[1] === c + 1} />
            ))}
          </div>
          {values.map((row, r) => (
            <div key={r} className="mt-1 flex justify-center gap-1">
              {/* Row header: ε then the letters of A */}
              <HeaderCell
                label={r === 0 ? "ε" : a[r - 1]}
                active={r !== 0 && current !== null && current[0] === r}
                leading
              />
              {row.map((v, c) => {
                if (r === 0 && c === 0) {
                  return <Cell key={c} value={0} style={cellStyle(0, 0, 0)} />;
                }
                return <Cell key={c} value={v} style={cellStyle(r, c, v)} />;
              })}
            </div>
          ))}
        </div>
      </div>

      <p
        className="mt-3 min-h-[1.5rem] text-sm text-ink"
        aria-live="polite"
        role="status"
      >
        {caption}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Stat label="Strings" value={`${a} · ${b}`} />
        <Stat label="Matches hit" value={matches} />
        <Stat label="LCS length" value={answerVal === null ? "—" : answerVal} />
        <Stat label="LCS" value={done ? recording.lcs || "∅" : "…"} />
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
          disabled={useCode}
          className="rounded-pill border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-[color:var(--accent)] disabled:opacity-40"
        >
          ⤨ New input
        </button>

        {/* Data source: the lesson's own strings vs a random pair. */}
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

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <LegendDot color="var(--accent)" label="Computing" />
        <LegendDot color="var(--color-primary)" label="Reads (diagonal / up / left)" />
        <LegendDot color="var(--color-output)" label="Answer" />
        <LegendDot color="color-mix(in srgb, var(--color-muted) 10%, white)" label="Not filled yet" />
      </div>
    </div>
  );
}

function Cell({
  value,
  style,
}: {
  value: number | null;
  style: { background: string; color: string };
}) {
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-md border border-line font-mono text-xs font-bold tabular-nums transition-colors sm:h-9 sm:w-9 sm:text-sm"
      style={style}
    >
      {value === null ? "" : value}
    </div>
  );
}

function HeaderCell({
  label,
  active,
  leading,
  hidden,
}: {
  label: string;
  active?: boolean;
  leading?: boolean;
  hidden?: boolean;
}) {
  return (
    <div
      className="flex h-8 w-8 items-center justify-center font-mono text-xs font-bold sm:h-9 sm:w-9 sm:text-sm"
      style={{
        color: active ? "var(--accent)" : "var(--color-muted, #5b6079)",
        opacity: hidden ? 0 : 1,
        borderRight: leading ? "2px solid color-mix(in srgb, var(--color-muted) 24%, white)" : undefined,
      }}
      aria-hidden={hidden}
    >
      {label}
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
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
