"use client";

import { useMemo, useRef, useState } from "react";
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

/** Runs a snippet of JS in a Web Worker so infinite loops can be killed and
 *  the page thread never freezes. Only console.log/error output is captured. */
function runJavaScript(code: string, timeoutMs = 2000): Promise<{ out: string; error?: string }> {
  return new Promise((resolve) => {
    const src = `
      const logs = [];
      const fmt = (a) => typeof a === 'string' ? a
        : (a && typeof a === 'object') ? JSON.stringify(a) : String(a);
      console.log = (...a) => logs.push(a.map(fmt).join(' '));
      console.error = console.log;
      console.info = console.log;
      console.warn = console.log;
      self.onmessage = (e) => {
        try {
          new Function(e.data)();
          self.postMessage({ out: logs.join('\\n') });
        } catch (err) {
          self.postMessage({ out: logs.join('\\n'), error: String((err && err.message) || err) });
        }
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
    const done = (r: { out: string; error?: string }) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(
      () => done({ out: "", error: "Timed out — check for an infinite loop." }),
      timeoutMs
    );
    worker.onmessage = (e) => done(e.data as { out: string; error?: string });
    worker.onerror = (e) => done({ out: "", error: e.message || "Something went wrong." });
    worker.postMessage(code);
  });
}

const norm = (s: string) => s.replace(/\r\n/g, "\n").replace(/\s+$/gm, "").replace(/\n+$/, "");

export function CodeRunner({ code, output }: Props) {
  const languages = useMemo(() => Object.keys(code) as Language[], [code]);
  const [lang, setLang] = useState<Language>(languages[0]);
  const [drafts, setDrafts] = useState<Partial<Record<Language, string>>>({});
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const original = code[lang] ?? "";
  const current = drafts[lang] ?? original;
  const isJS = lang === "JavaScript";
  const lineCount = current.split("\n").length;

  function switchLang(next: Language) {
    setLang(next);
    setRun({ kind: "idle" });
  }
  function edit(value: string) {
    setDrafts((d) => ({ ...d, [lang]: value }));
    setRun({ kind: "idle" });
  }
  function reset() {
    setDrafts((d) => ({ ...d, [lang]: original }));
    setRun({ kind: "idle" });
  }
  async function doRun() {
    setRun({ kind: "running" });
    const { out, error } = await runJavaScript(current);
    setRun({ kind: "done", out, error, matches: norm(out) === norm(output) });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-ink">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <div
          role="tablist"
          aria-label="Language"
          className="inline-flex rounded-lg bg-white/5 p-0.5"
        >
          {languages.map((l) => (
            <button
              key={l}
              role="tab"
              type="button"
              aria-selected={l === lang}
              onClick={() => switchLang(l)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                l === lang ? "bg-white/15 text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {(drafts[lang] ?? original) !== original && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md px-2.5 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Reset
            </button>
          )}
          {isJS ? (
            <button
              type="button"
              onClick={doRun}
              disabled={run.kind === "running"}
              className="inline-flex items-center gap-1.5 rounded-md bg-output px-3 py-1 text-xs font-bold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              <span aria-hidden="true">▶</span>
              {run.kind === "running" ? "Running…" : "Run"}
            </button>
          ) : (
            <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/50">
              Python — verified output
            </span>
          )}
        </div>
      </div>

      {/* Editor: line-number gutter + editable textarea */}
      <div className="flex max-h-[420px] overflow-auto">
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none whitespace-pre px-3 py-3 text-right font-mono text-sm leading-relaxed text-white/25"
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
        </div>
        <textarea
          ref={taRef}
          value={current}
          onChange={(e) => edit(e.target.value)}
          onScroll={(e) => {
            if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={`${lang} code editor`}
          className="min-h-[160px] flex-1 resize-y bg-transparent py-3 pr-4 font-mono text-sm leading-relaxed text-[color:#e6e8f2] outline-none"
        />
      </div>

      {/* Output */}
      <div className="border-t border-white/10">
        <div className="flex items-center gap-2 px-3 py-2">
          <span
            className={`h-2 w-2 rounded-full ${
              run.kind === "done" && run.error ? "bg-here" : "bg-output"
            }`}
            aria-hidden="true"
          />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white/50">
            {run.kind === "done"
              ? run.error
                ? "Error"
                : "Output"
              : isJS
                ? "Expected output — hit Run to try it"
                : "Expected output"}
          </span>
          {run.kind === "done" && !run.error && run.matches && (
            <span className="ml-auto text-xs font-bold text-output">✓ matches expected</span>
          )}
        </div>
        <div className="overflow-x-auto px-1 pb-1">
          <pre className="px-3 pb-3 text-sm leading-relaxed">
            <code className="font-mono text-[color:#e6e8f2]">
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
