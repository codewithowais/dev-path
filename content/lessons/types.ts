// content/lessons/types.ts
// Shared types + metadata for lessons. Each pillar file imports Lesson from here
// and default-exports its own Lesson[]. This lets separate files (and separate
// contributors) grow independently without touching a single giant file.

export type Language = "JavaScript" | "Python" | "Java" | "Cpp";
export type Pillar =
  | "Data Structures"
  | "Algorithms"
  | "Design Patterns"
  | "System Design"
  | "Cloud"
  | "Data Science"
  | "Generative AI";

export type Lesson = {
  id: string;
  pillar: Pillar;
  name: string;
  /** Plain-English explanation, analogy first. */
  easy: string;
  /** How it works, step by step. */
  how: string[];
  /** When you'd actually reach for this. */
  when: string;
  /** e.g. "O(log n) time · O(1) space". */
  big?: string;
  /** Common beginner mistakes. */
  mistakes?: string[];
  /** Runnable code per language. Extend with Java/Cpp later. */
  code: Partial<Record<Language, string>>;
  /** Verified expected output (identical across languages). */
  output: string;
  /** Optional language-specific quirk note. */
  note?: string;
};

export const pillars: Pillar[] = [
  "Data Structures",
  "Algorithms",
  "Design Patterns",
  "System Design",
  "Cloud",
  "Data Science",
  "Generative AI",
];

export const pillarBlurb: Record<Pillar, string> = {
  "Data Structures": "How to hold your data — the containers you put information in.",
  Algorithms: "How to work with your data — step-by-step recipes to get things done.",
  "Design Patterns": "How to organize big code — proven blueprints for common problems.",
  "System Design": "How to build big systems that stay fast and reliable as they grow.",
  Cloud: "How real apps run on rented computers — scaling, staying up, and shipping safely.",
  "Data Science": "How to find the story hidden in data — the math behind the charts.",
  "Generative AI": "How AI that writes, answers, and creates actually works underneath.",
};
