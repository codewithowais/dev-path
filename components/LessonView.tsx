import Link from "next/link";
import type { Lesson } from "@/content/lessons";
import { pillarColor } from "@/content/lessons";
import { CodeRunner } from "@/components/CodeRunner";
import { PillarIcon } from "@/components/PillarIcon";

/** Full lesson page: short explanation on the left, live editor + output on the
 *  right (stacked on mobile). Designed so you can see it all without hunting. */
export function LessonView({ lesson }: { lesson: Lesson }) {
  const color = pillarColor[lesson.pillar];
  return (
    <div className="mx-auto max-w-6xl px-5">
      <div className="py-8 sm:py-10">
        <Link
          href={`/learn#${slug(lesson.pillar)}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> Back to {lesson.pillar}
        </Link>

        <header className="mt-5 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, white))`,
            }}
          >
            <PillarIcon pillar={lesson.pillar} className="h-6 w-6" />
          </span>
          <div>
            <p className="dp-eyebrow" style={{ color }}>
              {lesson.pillar}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {lesson.name}
            </h1>
            {lesson.big && (
              <p
                className="mt-2 inline-block rounded-pill px-3 py-1 font-mono text-xs font-semibold"
                style={{ backgroundColor: `${color}14`, color }}
              >
                {lesson.big}
              </p>
            )}
          </div>
        </header>

        <div
          className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
          style={{ ["--accent" as string]: color }}
        >
          {/* Left — the teaching, kept short */}
          <div className="space-y-6">
            <Block label="The idea, in plain English">
              <p className="leading-relaxed text-ink">{lesson.easy}</p>
            </Block>

            <Block label="How it works">
              <ol className="space-y-2">
                {lesson.how.map((step, i) => (
                  <li key={i} className="flex gap-3 text-ink">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--accent) 15%, white)",
                        color: "var(--accent)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </Block>

            <Block label="When you'd use it">
              <p className="leading-relaxed text-ink">{lesson.when}</p>
            </Block>

            {lesson.mistakes && lesson.mistakes.length > 0 && (
              <Block label="Common beginner mistakes">
                <ul className="space-y-2">
                  {lesson.mistakes.map((m, i) => (
                    <li key={i} className="flex gap-2.5 leading-relaxed text-ink">
                      <span aria-hidden="true" className="text-here">
                        ⚠
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </div>

          {/* Right — the editor, sticky on desktop so it stays in view */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Block label="Try it — edit and run">
              <CodeRunner code={lesson.code} output={lesson.output} />
            </Block>
            {lesson.note && (
              <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-muted">
                <span className="font-semibold text-ink">Note: </span>
                {lesson.note}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="dp-eyebrow flex items-center gap-2 text-muted">
        <span
          aria-hidden="true"
          className="h-3.5 w-1 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
        {label}
      </h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function slug(pillar: string) {
  return pillar
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
