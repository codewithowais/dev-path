import type { Metadata } from "next";
import {
  pillars,
  pillarBlurb,
  lessonsByPillar,
} from "@/content/lessons";
import { LessonCard } from "@/components/LessonCard";

export const metadata: Metadata = {
  title: "Learn — data structures, algorithms & design patterns",
  description:
    "Beginner-friendly lessons on data structures, algorithms, and design patterns. Every one has an everyday analogy, step-by-step how-it-works, runnable JavaScript & Python code, and its verified expected output.",
};

function slug(pillar: string) {
  return pillar.toLowerCase().replace(/\s+/g, "-");
}

export default function LearnPage() {
  // Only show pillars that actually have lessons yet.
  const activePillars = pillars.filter((p) => lessonsByPillar(p).length > 0);

  return (
    <div className="mx-auto max-w-4xl px-5">
      <section className="py-14 sm:py-16">
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-primary">
          Learn
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          The hard stuff, made simple
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Every lesson starts with an everyday analogy, walks through how it works
          step by step, and ends with runnable code and the exact output you
          should expect. Tap any lesson to open it.
        </p>

        {/* Jump nav */}
        <nav aria-label="Lesson categories" className="mt-8 flex flex-wrap gap-2">
          {activePillars.map((pillar) => (
            <a
              key={pillar}
              href={`#${slug(pillar)}`}
              className="rounded-pill border border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary/50"
            >
              {pillar}
            </a>
          ))}
        </nav>
      </section>

      {activePillars.map((pillar) => {
        const items = lessonsByPillar(pillar);
        return (
          <section
            key={pillar}
            id={slug(pillar)}
            aria-labelledby={`${slug(pillar)}-heading`}
            className="scroll-mt-24 pb-12"
          >
            <header className="border-b border-line pb-4">
              <h2
                id={`${slug(pillar)}-heading`}
                className="font-display text-2xl font-bold text-ink"
              >
                {pillar}
              </h2>
              <p className="mt-1 text-muted">{pillarBlurb[pillar]}</p>
            </header>
            <div className="mt-5 space-y-3">
              {items.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
