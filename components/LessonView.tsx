import Link from "next/link";
import type { Lesson } from "@/content/lessons";
import { pillarColor, lessonsByPillar } from "@/content/lessons";
import { CodeRunner } from "@/components/CodeRunner";
import { PillarIcon } from "@/components/PillarIcon";
import { accentText } from "@/lib/accent";

/** Full lesson page: short explanation on the left, live editor + output on the
 *  right (stacked on mobile). Designed so you can see it all without hunting. */
export function LessonView({ lesson }: { lesson: Lesson }) {
  const color = pillarColor[lesson.pillar];
  const siblings = lessonsByPillar(lesson.pillar);
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
  return (
    <div className="mx-auto max-w-6xl px-5">
      <div className="py-10 sm:py-14">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Link
            href={`/learn#${slug(lesson.pillar)}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span> Back to {lesson.pillar}
          </Link>
          <span aria-hidden="true" className="text-line">
            ·
          </span>
          <Link
            href="/learn"
            className="inline-flex items-center transition-colors hover:text-ink"
          >
            All lessons
          </Link>
        </div>

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
            <p className="dp-eyebrow" style={{ color: accentText(color) }}>
              {lesson.pillar}
            </p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {lesson.name}
            </h1>
            {lesson.big && (
              <p
                className="mt-2 inline-block rounded-pill px-3 py-1 font-mono text-xs font-semibold"
                style={{ backgroundColor: `${color}14`, color: accentText(color) }}
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
                        color: accentText(color),
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
              <CodeRunner key={lesson.id} code={lesson.code} output={lesson.output} />
            </Block>
            {lesson.note && (
              <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-muted">
                <span className="font-semibold text-ink">Note: </span>
                {lesson.note}
              </p>
            )}
          </div>
        </div>

        {/* Prev / next within this pillar — keep learners moving in order */}
        <nav
          aria-label={`More in ${lesson.pillar}`}
          className="mt-12 border-t border-line pt-6"
          style={{ ["--accent" as string]: color }}
        >
          {idx >= 0 && (
            <p className="dp-eyebrow mb-4 text-muted">
              Lesson {idx + 1} of {siblings.length} in {lesson.pillar}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <LessonNavCard lesson={prev} direction="prev" />
            <LessonNavCard lesson={next} direction="next" />
          </div>
        </nav>

        <p className="mt-8 text-sm text-muted">
          Not sure this is the right topic?{" "}
          <Link href="/" className="font-semibold text-primary hover:text-ink">
            See the learning paths →
          </Link>{" "}
          or{" "}
          <Link href="/grow" className="font-semibold text-primary hover:text-ink">
            where this leads →
          </Link>
        </p>
      </div>
    </div>
  );
}

function LessonNavCard({
  lesson,
  direction,
}: {
  lesson: Lesson | undefined;
  direction: "prev" | "next";
}) {
  const isNext = direction === "next";
  if (!lesson) {
    // Keep the grid balanced with an inert placeholder.
    return <span aria-hidden="true" className="hidden sm:block" />;
  }
  return (
    <Link
      href={`/learn/${lesson.id}`}
      className={`dp-lift dp-card group flex flex-col gap-1 rounded-card border border-line p-4 transition-colors hover:border-[color:var(--accent)]/50 ${
        isNext ? "sm:text-right" : ""
      }`}
    >
      <span
        className={`flex items-center gap-1.5 text-xs font-semibold text-muted ${
          isNext ? "sm:justify-end" : ""
        }`}
      >
        {!isNext && <span aria-hidden="true">←</span>}
        {isNext ? "Next" : "Previous"}
        {isNext && <span aria-hidden="true">→</span>}
      </span>
      <span className="font-display font-bold text-ink transition-colors group-hover:text-[color:var(--accent)]">
        {lesson.name}
      </span>
    </Link>
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
