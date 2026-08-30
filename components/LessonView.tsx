import Link from "next/link";
import type { Lesson } from "@/content/lessons";
import { CodeRunner } from "@/components/CodeRunner";

/** Full lesson page: short explanation on the left, live editor + output on the
 *  right (stacked on mobile). Designed so you can see it all without hunting. */
export function LessonView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="mx-auto max-w-6xl px-5">
      <div className="py-8 sm:py-10">
        <Link
          href={`/learn#${slug(lesson.pillar)}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> {lesson.pillar}
        </Link>

        <header className="mt-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {lesson.name}
          </h1>
          {lesson.big && (
            <p className="mt-2 inline-block rounded-pill bg-paper px-3 py-1 font-mono text-xs text-muted">
              {lesson.big}
            </p>
          )}
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Left — the teaching, kept short */}
          <div className="space-y-6">
            <Block label="The idea, in plain English">
              <p className="leading-relaxed text-ink">{lesson.easy}</p>
            </Block>

            <Block label="How it works">
              <ol className="space-y-2">
                {lesson.how.map((step, i) => (
                  <li key={i} className="flex gap-3 text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
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
      <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function slug(pillar: string) {
  return pillar
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
