// content/lessons/index.ts
// Combines the per-pillar lesson files into one list and re-exports the shared
// types/helpers. Components import from "@/content/lessons" and get everything.

import type { Lesson, Language, Pillar } from "./types";
import dataStructures from "./data-structures";
import algorithms from "./algorithms";
import designPatterns from "./design-patterns";

export * from "./types";

export const lessons: Lesson[] = [
  ...dataStructures,
  ...algorithms,
  ...designPatterns,
];

export function lessonsByPillar(pillar: Pillar): Lesson[] {
  return lessons.filter((l) => l.pillar === pillar);
}

export function availableLanguages(lesson: Lesson): Language[] {
  return Object.keys(lesson.code) as Language[];
}
