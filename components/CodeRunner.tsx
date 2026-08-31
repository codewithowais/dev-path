"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import type { Language } from "@/content/lessons";

Prism.manual = true; // don't auto-scan the page; we highlight on demand

type Props = {
  code: Partial<Record<Language, string>>;
  /** Verified expected output (identical across languages). */
  output: string;
};

type RunState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; out: string; error?: string; matches: boolean };

/** Layout metrics shared with the CSS (`.dp-editor` custom props). Kept here as
 *  plain numbers so we can compute the active-line band + caret line in JS.
 *  These MUST match `--dp-code-lh` / `--dp-code-pad` in globals.css. */
const LINE_H = 21; // integer px line-height — the key to layer alignment
const PAD = 12; // px padding on every layer (px-3 / py-3)
const MAX_H = 440; // editor viewport height before it scrolls
const TAB = "  "; // two spaces, matching tab-size: 2

/** Runs a snippet of JS in a Web Worker so infinite loops can be killed and the
 *  page thread never freezes. Only console.log/error output is captured. */
/** Handle to an in-flight run so the caller can abort it (e.g. on unmount). */
type RunHandle = { worker: Worker; timer: ReturnType<typeof setTimeout> };

function runJavaScript(
  code: string,
  timeoutMs = 2000,
  onActive?: (handle: RunHandle) => void
): Promise<{ out: string; error?: string }> {
  return new Promise((resolve) => {
    const src = `
      const logs = [];
      const fmt = (a) => typeof a === 'string' ? a
        : (a && typeof a === 'object') ? JSON.stringify(a) : String(a);
      console.log = (...a) => logs.push(a.map(fmt).join(' '));
      console.error = console.log; console.info = console.log; console.warn = console.log;
      self.onmessage = (e) => {
        try { new Function(e.data)(); self.postMessage({ out: logs.join('\\n') }); }
        catch (err) { self.postMessage({ out: logs.join('\\n'), error: String((err && err.message) || err) }); }
      };
    `;
    let url: string;
    let worker: Worker;
    try {
      url = URL.createObjectURL(new Blob([src], { type: "application/javascript" }));
      worker = new Worker(url);
    } catch {
      resolve({ out: "", error: "Couldn't start the runner in this browser." });
      return;
    }
    let settled = false;
    const finish = (r: { out: string; error?: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(
      () => finish({ out: "", error: "Timed out — check for an infinite loop." }),
      timeoutMs
    );
    worker.onmessage = (e) => finish(e.data as { out: string; error?: string });
    worker.onerror = (e) => finish({ out: "", error: e.message || "Something went wrong." });
    // Expose the live worker + timer so the component can tear them down on unmount.
    onActive?.({ worker, timer });
    worker.postMessage(code);
  });
}

// Mirror scripts/verify-output.mjs: normalize line endings, strip trailing
// whitespace per line, and trim BOTH leading and trailing blank lines.
// NOTE: this only aligns whitespace/trim. The worker formats objects with
// JSON.stringify (`{"a":1}`), whereas the verifier uses Node's util.inspect
// (`{ a: 1 }`), so object/array output can still differ from expected.
const norm = (s: string) =>
  s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");

/** Index of the line the caret sits on, given a caret offset into `value`. */
const lineOf = (value: string, offset: number) =>
  value.slice(0, offset).split("\n").length - 1;

export function CodeRunner({ code, output }: Props) {
  const languages = useMemo(() => Object.keys(code) as Language[], [code]);
  const [lang, setLang] = useState<Language>(languages[0]);
  const [drafts, setDrafts] = useState<Partial<Record<Language, string>>>({});
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const [caretLine, setCaretLine] = useState(0);
  const [focused, setFocused] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  // Guards for late/aborted runs (see doRun + the unmount cleanup effect).
  const mountedRef = useRef(true);
  const runTokenRef = useRef(0);
  const langRef = useRef<Language>(lang);
  const runHandleRef = useRef<RunHandle | null>(null);
  const caretLineRef = useRef(0);
  // Selection to restore after a controlled edit (Tab/Shift+Tab/auto-indent),
  // since re-rendering with a new value would otherwise jump the caret to end.
  const pendingSelRef = useRef<{ s: number; e: number } | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const original = code[lang] ?? "";
  const current = drafts[lang] ?? original;
  const isJS = lang === "JavaScript";
  const edited = current !== original;
  const lineCount = current.split("\n").length;

  const highlighted = useMemo(() => {
    const grammar = lang === "Python" ? Prism.languages.python : Prism.languages.javascript;
    const name = lang === "Python" ? "python" : "javascript";
    return Prism.highlight(current, grammar, name);
  }, [current, lang]);

  // Keep the active-line band pinned to the caret's line, offset by scroll.
  function positionBand() {
    const ta = taRef.current;
    const band = bandRef.current;
    if (!ta || !band) return;
    band.style.top = PAD + caretLineRef.current * LINE_H - ta.scrollTop + "px";
  }

  function updateCaret() {
    const ta = taRef.current;
    if (!ta) return;
    const line = lineOf(ta.value, ta.selectionStart);
    caretLineRef.current = line;
    setCaretLine(line);
    positionBand();
  }

  // Grow the textarea to fit its content (capped) so the transparent input
  // layer always covers every highlighted line — no dead zone at the bottom.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, MAX_H) + "px";
    syncScroll();
    positionBand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, lang]);

  // After a programmatic edit, restore the intended caret/selection.
  useLayoutEffect(() => {
    const p = pendingSelRef.current;
    const ta = taRef.current;
    if (p && ta) {
      ta.selectionStart = p.s;
      ta.selectionEnd = p.e;
      pendingSelRef.current = null;
      updateCaret();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Keep the current language readable from async callbacks that captured an
  // older render, so a late run can tell whether the language changed.
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // Abort any in-flight run and block setState after the component unmounts.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (runHandleRef.current) {
        runHandleRef.current.worker.terminate();
        clearTimeout(runHandleRef.current.timer);
        runHandleRef.current = null;
      }
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  function syncScroll() {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    positionBand();
  }

  function switchLang(next: Language) {
    runTokenRef.current++; // invalidate any in-flight run
    setLang(next);
    setRun({ kind: "idle" });
  }
  function edit(value: string) {
    runTokenRef.current++; // invalidate any in-flight run
    setDrafts((d) => ({ ...d, [lang]: value }));
    setRun({ kind: "idle" });
  }
  /** Controlled edit that also restores an explicit selection after render. */
  function applyEdit(value: string, selStart: number, selEnd: number) {
    pendingSelRef.current = { s: selStart, e: selEnd };
    edit(value);
  }
  function reset() {
    runTokenRef.current++; // invalidate any in-flight run
    setDrafts((d) => ({ ...d, [lang]: original }));
    setRun({ kind: "idle" });
    taRef.current?.focus();
  }
  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(current);
      ok = true;
    } catch {
      // Async Clipboard API can be blocked (permissions / non-gesture / some
      // embedded contexts). Fall back to the legacy execCommand path.
      try {
        const ta = document.createElement("textarea");
        ta.value = current;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (!ok || !mountedRef.current) return;
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setCopied(false);
    }, 1600);
  }
  async function doRun() {
    const token = ++runTokenRef.current;
    const langAtRun = lang;
    setRun({ kind: "running" });
    const { out, error } = await runJavaScript(current, 2000, (handle) => {
      runHandleRef.current = handle;
    });
    runHandleRef.current = null;
    // Ignore the result if we unmounted, the language changed, or a newer
    // action (run/edit/reset/switch) superseded this run.
    if (!mountedRef.current) return;
    if (runTokenRef.current !== token || langRef.current !== langAtRun) return;
    setRun({ kind: "done", out, error, matches: norm(out) === norm(output) });
  }

  /** Editor keybindings: Tab/Shift+Tab indent, Enter keeps indentation, Esc is
   *  the keyboard escape hatch (blur, so the next Tab leaves the editor), and
   *  Cmd/Ctrl+Enter runs JS. */
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ta = e.currentTarget;
    const { value, selectionStart: ss, selectionEnd: se } = ta;

    // Cmd/Ctrl+Enter → run (JS only).
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (isJS && run.kind !== "running") doRun();
      return;
    }

    // Escape hatch: leave the editor so Tab isn't a keyboard trap.
    if (e.key === "Escape") {
      ta.blur();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault(); // never let Tab move focus while editing
      const lineStart = value.lastIndexOf("\n", ss - 1) + 1;

      if (!e.shiftKey && ss === se) {
        // Collapsed: insert one indent at the caret.
        applyEdit(value.slice(0, ss) + TAB + value.slice(se), ss + TAB.length, ss + TAB.length);
        return;
      }

      const block = value.slice(lineStart, se);
      if (e.shiftKey) {
        // Outdent every line in the selection by up to one indent.
        let removedFirst = 0;
        let removedTotal = 0;
        const out = block
          .split("\n")
          .map((ln, i) => {
            const m = ln.match(/^( {1,2}|\t)/);
            if (!m) return ln;
            if (i === 0) removedFirst = m[0].length;
            removedTotal += m[0].length;
            return ln.slice(m[0].length);
          })
          .join("\n");
        if (removedTotal === 0) return;
        applyEdit(
          value.slice(0, lineStart) + out + value.slice(se),
          Math.max(lineStart, ss - removedFirst),
          se - removedTotal
        );
      } else {
        // Indent every line in the selection.
        const lines = block.split("\n");
        const out = lines.map((ln) => TAB + ln).join("\n");
        const added = out.length - block.length;
        applyEdit(
          value.slice(0, lineStart) + out + value.slice(se),
          ss + TAB.length,
          se + added
        );
      }
      return;
    }

    // Enter: carry the current line's leading whitespace onto the new line.
    if (e.key === "Enter" && !e.shiftKey && ss === se) {
      const lineStart = value.lastIndexOf("\n", ss - 1) + 1;
      const indent = (value.slice(lineStart, ss).match(/^[ \t]*/) || [""])[0];
      if (indent) {
        e.preventDefault();
        const ins = "\n" + indent;
        applyEdit(value.slice(0, ss) + ins + value.slice(se), ss + ins.length, ss + ins.length);
      }
    }
  }

  const showBand = focused && caretLine < lineCount;

  return (
    <div className="dp-editor overflow-hidden rounded-xl border border-line bg-ink">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <div role="group" aria-label="Language" className="inline-flex rounded-lg bg-white/5 p-0.5">
          {languages.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === lang}
              onClick={() => switchLang(l)}
              className={`inline-flex min-h-11 items-center rounded-md px-3 text-xs font-semibold transition-colors ${
                l === lang ? "bg-white/15 text-white shadow-sm" : "text-white/55 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Code copied to clipboard" : "Copy code"}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden="true" className={copied ? "text-output" : ""}>
              {copied ? "✓" : "⧉"}
            </span>
            {copied ? "Copied" : "Copy"}
          </button>
          {edited && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center rounded-md px-2.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Reset
            </button>
          )}
          {isJS ? (
            <button
              type="button"
              onClick={doRun}
              disabled={run.kind === "running"}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-output px-3 text-xs font-bold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              <span aria-hidden="true">{run.kind === "running" ? "◌" : "▶"}</span>
              {run.kind === "running" ? "Running…" : "Run"}
            </button>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-md bg-white/5 px-2.5 text-xs font-semibold text-white/70">
              Python — verified output
            </span>
          )}
        </div>
      </div>

      {/* Beginner hints: how to edit + why Python isn't run live */}
      {(!edited || !isJS) && (
        <div className="space-y-1 border-b border-white/10 px-3 py-1.5 text-xs">
          {!isJS && (
            <p className="text-white/70">
              Python can&apos;t run inside a browser, so this is the exact output this
              code produces. Switch to the JavaScript tab to edit and run it live.
            </p>
          )}
          {!edited && (
            <p className="text-white/60">
              <span aria-hidden="true">✎</span> Click the code to edit
              {isJS && (
                <>
                  {" "}
                  · press <kbd className="dp-kbd">⌘/Ctrl</kbd>+<kbd className="dp-kbd">↵</kbd> to run
                </>
              )}
            </p>
          )}
        </div>
      )}

      {/* Editor: gutter + (active-line band under a highlight layer under a
          transparent textarea). Every layer shares the .dp-code metrics AND the
          same MAX_H cap so the three stay one viewport that scrolls together —
          the textarea is the scroll owner; the gutter + <pre> mirror its
          scrollTop. `items-start` stops a flex item from stretching the row. */}
      <div className="flex items-start">
        <div
          ref={gutterRef}
          aria-hidden="true"
          style={{ maxHeight: MAX_H }}
          className="dp-code shrink-0 select-none overflow-hidden whitespace-pre px-3 py-3 text-right text-white/25"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="dp-gutter-num"
              style={{ height: LINE_H }}
              data-active={focused && i === caretLine}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={bandRef}
            aria-hidden="true"
            className="dp-activeline pointer-events-none absolute inset-x-0"
            data-show={showBand}
            style={{ height: LINE_H, top: PAD }}
          />
          <pre
            ref={preRef}
            aria-hidden="true"
            className="dp-code pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre px-3 py-3"
          >
            <code
              className="dp-code text-[color:#e6e8f2]"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
          <textarea
            ref={taRef}
            value={current}
            onChange={(e) => edit(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={onKeyDown}
            onKeyUp={updateCaret}
            onClick={updateCaret}
            onSelect={updateCaret}
            onFocus={() => {
              setFocused(true);
              updateCaret();
            }}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label={`${lang} code editor`}
            aria-describedby="dp-editor-help"
            // `rows` gives a stable pre-paint height (~line count); the height
            // effect above is the single source of truth once mounted.
            rows={lineCount}
            style={{ maxHeight: MAX_H }}
            className="dp-code relative block w-full resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-transparent caret-white outline-none"
          />
        </div>
      </div>
      <p id="dp-editor-help" className="sr-only">
        Editable code. Tab and Shift+Tab indent. Press Escape, then Tab, to move
        focus out of the editor.
      </p>

      {/* Output */}
      <div className="border-t border-white/10" aria-live="polite" aria-atomic="true">
        <div className="flex items-center gap-2 px-3 py-2">
          <span
            className={`h-2 w-2 rounded-full ${
              run.kind === "done" && run.error ? "bg-here" : "bg-output"
            } ${run.kind === "done" && !run.error && run.matches ? "dp-dot-success" : ""}`}
            aria-hidden="true"
          />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
            {run.kind === "done"
              ? run.error
                ? "Error"
                : "Output"
              : isJS
                ? "Expected output — hit Run to try it"
                : "Expected output"}
          </span>
          {run.kind === "done" && !run.error && run.matches && (
            <span className="dp-match ml-auto text-xs font-bold text-output">
              ✓ matches expected
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <pre className="dp-code px-3 pb-3">
            <code className="text-[color:#e6e8f2]">
              {run.kind === "done"
                ? (run.out || "") + (run.error ? (run.out ? "\n" : "") + "⚠ " + run.error : "")
                : output}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
