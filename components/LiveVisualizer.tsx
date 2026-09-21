"use client";

import { lessonVisualizers } from "@/components/lessonVisualizers";
import { useLiveCode } from "@/components/LessonCode";

/** Pull the first integer-array literal out of a code sample, e.g.
 *  `const data = [5, 2, 9, 1, 5, 6];` → [5, 2, 9, 1, 5, 6]. */
function firstNumberArray(code?: string): number[] | undefined {
  if (!code) return undefined;
  const m = code.match(/\[\s*-?\d+(?:\s*,\s*-?\d+)+\s*\]/);
  if (!m) return undefined;
  const nums = m[0]
    .slice(1, -1)
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  return nums.length >= 2 ? nums : undefined;
}

/** Renders a lesson's "see it in motion" visualizer bound to the LIVE editor
 *  code (falling back to the lesson's saved code). Editing the numbers in the
 *  CodeRunner re-parses and re-renders the chart: the Viz is keyed by the code
 *  so a change starts it fresh on the new data. */
export function LiveVisualizer({
  lessonId,
  accent,
  complexity,
  initialCode,
}: {
  lessonId: string;
  accent: string;
  complexity?: string;
  initialCode?: string;
}) {
  const live = useLiveCode();
  const code = live ?? initialCode;
  const Viz = lessonVisualizers[lessonId];
  if (!Viz) return null;

  return (
    <section className="mt-10" style={{ ["--accent" as string]: accent }}>
      <h2 className="dp-eyebrow mb-2.5 flex items-center gap-2 text-muted">
        <span
          aria-hidden="true"
          className="h-3.5 w-1 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
        See it in motion
      </h2>
      <Viz
        key={code}
        accent={accent}
        complexity={complexity}
        code={code}
        lessonData={firstNumberArray(code)}
      />
    </section>
  );
}
