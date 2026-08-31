"use client";

// Per-device "lesson progress" toolkit. This is a static site with no backend,
// so completion is a personal convenience stored in the browser's localStorage.
//
// SSR / hydration safety (important — the whole app is server-rendered):
//   • localStorage is client-only. Every access is wrapped in try/catch and
//     guarded by `typeof window !== "undefined"`.
//   • The hook renders a STABLE initial state on the server and the first client
//     paint (empty set, ready=false). The real value is read in a useEffect
//     AFTER mount, then flows in. Consumers key their UI off `ready` so nothing
//     localStorage-derived differs between the server and first client render.
//   • A tiny module-level store keeps every hook instance on the page in sync
//     (toggling in one component updates the pillar bars elsewhere), and a
//     `storage` listener keeps multiple tabs in sync.

import { useCallback, useSyncExternalStore } from "react";

const KEY = "devpath:progress:v1";
const DONE = "#12B886"; // success / expected-output green (== --color-output)

// ── Module-level store (client-only mutable cache + pub/sub) ────────────────
// `store` stays null until the first client read so we never touch localStorage
// during module evaluation on the server.
let store: Set<string> | null = null;
const listeners = new Set<() => void>();

function readStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(
      Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []
    );
  } catch {
    return new Set();
  }
}

function writeStorage(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // Storage can be full or blocked (private mode) — progress just won't persist.
  }
}

function loaded(): Set<string> {
  if (store === null) store = readStorage();
  return store;
}

function emit(): void {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Keep tabs/windows in sync. Registered once, client-only.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== null && e.key !== KEY) return; // ignore unrelated keys
    store = readStorage();
    emit();
  });
}

function toggleId(id: string): void {
  const next = new Set(loaded());
  if (next.has(id)) next.delete(id);
  else next.add(id);
  store = next;
  writeStorage(next);
  emit();
}

// ── Hook ────────────────────────────────────────────────────────────────────

export type LessonProgress = {
  /** Completed lesson ids. Empty (stable) until `ready`. */
  completed: Set<string>;
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  /** Completed count — of `ids` if given, otherwise of everything. */
  count: (ids?: string[]) => number;
  /** false until mounted; render a stable placeholder while false. */
  ready: boolean;
};

// Stable references for the server / pre-hydration snapshot, so useSyncExternalStore
// renders the same thing on the server and the first client paint (no mismatch),
// then swaps in the real localStorage value one paint later.
const EMPTY_SET: Set<string> = new Set();
const subscribeReady = () => () => {};

export function useLessonProgress(): LessonProgress {
  // `completed` comes from the external store; on the server (and the first
  // hydration render) it's the stable empty set. useSyncExternalStore is the
  // idiomatic, hydration-safe way to read an external store — no effect needed.
  const completed = useSyncExternalStore(subscribe, loaded, () => EMPTY_SET);
  // `ready` flips to true only after hydration, so consumers can hold a stable
  // placeholder until the real value is available.
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);

  const isDone = useCallback((id: string) => completed.has(id), [completed]);
  const toggle = useCallback((id: string) => toggleId(id), []);
  const count = useCallback(
    (ids?: string[]) =>
      ids ? ids.reduce((n, id) => (completed.has(id) ? n + 1 : n), 0) : completed.size,
    [completed]
  );

  return { completed, isDone, toggle, count, ready };
}

// ── UI: "Mark as done" toggle button ─────────────────────────────────────────

export function MarkDoneButton({
  lessonId,
  color,
  className = "",
}: {
  lessonId: string;
  /** Pillar accent — tints the outline state's hover border. */
  color?: string;
  className?: string;
}) {
  const { isDone, toggle, ready } = useLessonProgress();
  // Pre-mount / not ready ⇒ stable "not done" so SSR and first paint match.
  const done = ready && isDone(lessonId);

  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => toggle(lessonId)}
      style={
        done
          ? { backgroundColor: DONE, borderColor: DONE }
          : color
            ? ({ ["--accent" as string]: color } as React.CSSProperties)
            : undefined
      }
      className={`dp-lift inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-colors ${
        done
          ? "border-transparent text-white shadow-sm"
          : "dp-card border-line text-ink hover:border-[color:var(--accent,#5B4BEB)]"
      } ${className}`}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {done ? "✓" : "＋"}
      </span>
      {done ? "Done" : "Mark as done"}
    </button>
  );
}

// ── UI: compact progress bar + count ─────────────────────────────────────────

export function PillarProgress({
  total,
  completed,
  color,
  className = "",
  label,
}: {
  total: number;
  completed: number;
  /** Bar fill colour (pillar accent). Defaults to the brand primary. */
  color?: string;
  className?: string;
  /** Optional visually-hidden context, e.g. "Data Structures". */
  label?: string;
}) {
  const safeTotal = Math.max(0, total);
  const safeDone = Math.min(Math.max(0, completed), safeTotal);
  const pct = safeTotal > 0 ? Math.round((safeDone / safeTotal) * 100) : 0;
  const fill = color ?? "#5B4BEB";
  const text = `${safeDone}/${safeTotal}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={safeDone}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-label={`${label ? `${label}: ` : ""}${safeDone} of ${safeTotal} lessons complete`}
        className="h-1.5 w-16 shrink-0 overflow-hidden rounded-pill bg-line"
      >
        <div
          className="h-full rounded-pill transition-[width] duration-[var(--dp-dur)] ease-[var(--dp-ease)]"
          style={{ width: `${pct}%`, backgroundColor: fill }}
        />
      </div>
      <span
        aria-hidden="true"
        className="font-mono text-xs font-semibold tabular-nums text-muted"
      >
        {text}
      </span>
    </div>
  );
}

// ── UI: overall progress line for the Learn hero ─────────────────────────────
// A small client child so the page can stay a server component.

export function OverallProgress({
  ids,
  className = "",
}: {
  ids: string[];
  className?: string;
}) {
  const { count, ready } = useLessonProgress();
  const total = ids.length;
  const done = ready ? count(ids) : 0; // stable 0 until mounted

  return (
    <div className={`inline-flex flex-wrap items-center gap-3 ${className}`}>
      <PillarProgress total={total} completed={done} label="Overall" />
      <span className="text-sm font-semibold text-muted">
        {done > 0 ? (
          <>
            You&apos;ve completed{" "}
            <span className="text-ink">
              {done} of {total}
            </span>{" "}
            lessons
          </>
        ) : (
          <>Mark lessons done to track your progress</>
        )}
      </span>
    </div>
  );
}
