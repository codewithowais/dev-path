// content/lessons/index.ts
// Combines the per-pillar lesson files into one list and re-exports the shared
// types/helpers. Components import from "@/content/lessons" and get everything.

import type { Lesson, Language, Pillar } from "./types";
import programmingBasics from "./programming-basics";
import dataStructures from "./data-structures";
import algorithms from "./algorithms";
import databases from "./databases";
import webInternet from "./web-internet";
import designPatterns from "./design-patterns";
import systemDesign from "./system-design";
import cloud from "./cloud";
import dataScience from "./data-science";
import genai from "./genai";

export * from "./types";

export const lessons: Lesson[] = [
  ...programmingBasics,
  ...dataStructures,
  ...algorithms,
  ...databases,
  ...webInternet,
  ...designPatterns,
  ...systemDesign,
  ...cloud,
  ...dataScience,
  ...genai,
];

export function lessonsByPillar(pillar: Pillar): Lesson[] {
  return lessons.filter((l) => l.pillar === pillar);
}

export function availableLanguages(lesson: Lesson): Language[] {
  return Object.keys(lesson.code) as Language[];
}
