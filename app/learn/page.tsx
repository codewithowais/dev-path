import type { Metadata } from "next";
import { lessons, pillars, pillarBlurb } from "@/content/lessons";
import { LessonBrowser, type LessonItem } from "@/components/LessonBrowser";
import { OverallProgress } from "@/components/LessonProgress";
import { ItemListJsonLd, absoluteUrl } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Learn — data structures, algorithms, design & more",
  description:
    "194 beginner-friendly lessons across 10 topics — each with an everyday analogy, a live code editor you can run, and verified expected output in JavaScript & Python.",
  alternates: { canonical: "/learn" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/learn"),
    title: "Learn — data structures, algorithms, design & more",
    description:
      "194 beginner-friendly lessons across 10 topics — each with an everyday analogy, a live code editor you can run, and verified expected output in JavaScript & Python.",
  },
};

/** First sentence of the analogy, trimmed to a card-sized blurb. */
function blurbOf(easy: string): string {
  const first = easy.split(/(?<=[.!?])\s/)[0] ?? easy;
  return first.length > 110 ? first.slice(0, 107).trimEnd() + "…" : first;
}

export default function LearnPage() {
  const items: LessonItem[] = lessons.map((l) => ({
    id: l.id,
    name: l.name,
    pillar: l.pillar,
    blurb: blurbOf(l.easy),
    big: l.big,
  }));

  const activePillars = pillars.filter((p) => items.some((l) => l.pillar === p));

  const listItems = lessons.map((l) => ({
    name: `${l.name} — ${l.pillar}`,
    url: absoluteUrl(`/learn/${l.id}`),
    description: blurbOf(l.easy),
  }));

  return (
    <div className="mx-auto max-w-6xl px-5">
      <ItemListJsonLd
        url={absoluteUrl("/learn")}
        name="Learn — beginner coding lessons"
        description={`${lessons.length} beginner-friendly lessons across ${activePillars.length} topics, each with an everyday analogy, a runnable code editor, and verified output in JavaScript & Python.`}
        items={listItems}
      />
      <section className="dp-stagger py-14 sm:py-20">
        <p className="dp-eyebrow text-primary">Learn</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          The hard stuff, made simple
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {lessons.length} lessons across {activePillars.length} topics. Every
          lesson gives you an everyday example, a code editor you can run, and
          the exact result to expect. Search or browse, then open one.
        </p>
        <OverallProgress ids={lessons.map((l) => l.id)} className="mt-6" />
      </section>

      <LessonBrowser items={items} pillars={activePillars} pillarBlurb={pillarBlurb} />
    </div>
  );
}
