"use client";

import { useState } from "react";

type Props = {
  code: string;
  label: string;
};

export function CodeBlock({ code, label }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; fail quietly.
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-ink">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white/60">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="font-mono text-[color:#e6e8f2]">{code}</code>
        </pre>
      </div>
    </div>
  );
}
