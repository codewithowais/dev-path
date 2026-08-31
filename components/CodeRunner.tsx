"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror, {
  EditorView,
  EditorState,
  Prec,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
} from "@uiw/react-codemirror";
import {
  HighlightStyle,
  syntaxHighlighting,
  bracketMatching,
  indentOnInput,
  indentUnit,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";
import type { Language } from "@/content/lessons";

type Props = {
  code: Partial<Record<Language, string>>;
  /** Verified expected output (identical across languages). */
  output: string;
};

type RunState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; out: string; error?: string; matches: boolean };

const MAX_H = 440; // editor viewport height before it scrolls

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

/** On-brand syntax palette, matched to the old Prism token colours so the
 *  editor looks like the same product after the CodeMirror migration. */
const brandHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword, t.self, t.null, t.bool], color: "#c792ea" },
  { tag: [t.string, t.special(t.string), t.regexp, t.character], color: "#c3e88d" },
  { tag: [t.number, t.integer, t.float, t.constant(t.name), t.standard(t.name)], color: "#f78c6c" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: "#82aaff" },
  { tag: [t.operator, t.derefOperator, t.arithmeticOperator, t.logicOperator, t.compareOperator, t.bitwiseOperator], color: "#89ddff" },
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: "#6b7394", fontStyle: "italic" },
  { tag: [t.className, t.typeName, t.namespace, t.definition(t.typeName)], color: "#ffcb6b" },
  { tag: [t.propertyName, t.attributeName], color: "#f78c6c" },
  { tag: [t.punctuation, t.separator, t.bracket, t.paren, t.brace, t.squareBracket, t.angleBracket], color: "#8b95b8" },
  { tag: [t.variableName, t.definition(t.variableName), t.labelName], color: "#e6e8f2" },
]);

/** Compact dark theme: background = --color-ink, muted gutter, subtle violet
 *  active-line wash, readable selection, white caret. Metrics use an integer
 *  line-height so long snippets stay on a clean grid. */
const brandTheme = EditorView.theme(
  {
    "&": {
      color: "#e6e8f2",
      backgroundColor: "var(--color-ink)",
      fontSize: "13px",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": {
      fontFamily: "var(--font-mono), ui-monospace, monospace",
      lineHeight: "21px",
      maxHeight: `${MAX_H}px`,
    },
    ".cm-content": {
      padding: "12px 0",
      caretColor: "#fff",
    },
    ".cm-line": { padding: "0 12px" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#fff", borderLeftWidth: "2px" },
    // drawSelection() renders selection as .cm-selectionBackground layers.
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgba(130, 170, 255, 0.28)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(130, 120, 235, 0.10)" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#6b7394",
      border: "none",
    },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 14px", minWidth: "2.2ch" },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "rgba(255, 255, 255, 0.8)",
    },
    ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
      backgroundColor: "rgba(130, 170, 255, 0.22)",
      outline: "1px solid rgba(130, 170, 255, 0.45)",
      color: "inherit",
    },
  },
  { dark: true }
);

export function CodeRunner({ code, output }: Props) {
  const languages = useMemo(() => Object.keys(code) as Language[], [code]);
  const [lang, setLang] = useState<Language>(languages[0]);
  const [drafts, setDrafts] = useState<Partial<Record<Language, string>>>({});
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  // Guards for late/aborted runs (see doRun + the unmount cleanup effect).
  const mountedRef = useRef(true);
  const runTokenRef = useRef(0);
  const langRef = useRef<Language>(lang);
  const runHandleRef = useRef<RunHandle | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [view, setView] = useState<EditorView | null>(null);

  const original = code[lang] ?? "";
  const current = drafts[lang] ?? original;
  const isJS = lang === "JavaScript";
  const edited = current !== original;

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
  function reset() {
    runTokenRef.current++; // invalidate any in-flight run
    setDrafts((d) => ({ ...d, [lang]: original }));
    setRun({ kind: "idle" });
    view?.focus();
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

  // Cmd/Ctrl+Enter in the editor fires a DOM event; this listener runs the
  // latest code. Going through the DOM keeps the (lang-keyed) keymap free of any
  // stale `current`/`run` closure and free of React refs.
  const runFromKeyboard = useCallback(() => {
    if (isJS && run.kind !== "running") doRun();
    // doRun/isJS/run are read fresh on every keypress via this re-bound listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJS, run.kind, current, output]);
  useEffect(() => {
    if (!view) return;
    const el = view.dom;
    const handler = () => runFromKeyboard();
    el.addEventListener("dp-run", handler);
    return () => el.removeEventListener("dp-run", handler);
  }, [view, runFromKeyboard]);

  // Extensions are keyed to the language only; the Cmd/Ctrl+Enter handler just
  // dispatches a DOM event that the listener above turns into a run.
  const extensions = useMemo(
    () => [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      indentUnit.of("  "),
      EditorState.tabSize.of(2),
      EditorView.contentAttributes.of({
        "aria-label": `${lang} code editor`,
        "aria-describedby": "dp-editor-help",
      }),
      lang === "Python" ? python() : javascript(),
      syntaxHighlighting(brandHighlight),
      brandTheme,
      // Highest precedence so Run + the Escape tab-trap escape win; Tab still
      // indents (indentWithTab), and Escape blurs so Tab isn't a hard trap.
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            preventDefault: true,
            run: (v) => {
              v.dom.dispatchEvent(new CustomEvent("dp-run"));
              return true;
            },
          },
          {
            key: "Escape",
            run: (view) => {
              view.contentDOM.blur();
              return true;
            },
          },
          indentWithTab,
        ])
      ),
      keymap.of([...defaultKeymap, ...historyKeymap]),
    ],
    [lang]
  );

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
              className="dp-press inline-flex min-h-11 items-center gap-1.5 rounded-md bg-output px-3 text-xs font-bold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
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

      {/* Editor — CodeMirror renders its own text, cursor, and selection, so the
          old transparent-textarea alignment class of bug is gone entirely. */}
      <CodeMirror
        value={current}
        onChange={edit}
        extensions={extensions}
        theme="none"
        basicSetup={false}
        indentWithTab={false}
        maxHeight={`${MAX_H}px`}
        className="dp-cm"
        onCreateEditor={(v) => setView(v)}
      />
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
