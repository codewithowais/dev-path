// content/lessons/types.ts
// Shared types + metadata for lessons. Each pillar file imports Lesson from here
// and default-exports its own Lesson[]. This lets separate files (and separate
// contributors) grow independently without touching a single giant file.

export type Language = "JavaScript" | "Python" | "Java" | "Cpp";
export type Pillar =
  | "Programming Basics"
  | "Data Structures"
  | "Algorithms"
  | "Databases"
  | "Web & Internet"
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

// Order here = order shown on the Learn page. Arranged as a beginner journey.
export const pillars: Pillar[] = [
  "Programming Basics",
  "Data Structures",
  "Algorithms",
  "Databases",
  "Web & Internet",
  "Design Patterns",
  "System Design",
  "Cloud",
  "Data Science",
  "Generative AI",
];

/** Accent colour per pillar — used for icon tiles, chips, and lesson headers so
 *  the whole Learn area reads as one colour-coded set. */
export const pillarColor: Record<Pillar, string> = {
  "Programming Basics": "#5B4BEB",
  "Data Structures": "#12B886",
  Algorithms: "#F76707",
  Databases: "#1098AD",
  "Web & Internet": "#4263EB",
  "Design Patterns": "#7048E8",
  "System Design": "#E8590C",
  Cloud: "#0CA5E9",
  "Data Science": "#E64980",
  "Generative AI": "#0CA678",
};

export const pillarBlurb: Record<Pillar, string> = {
  "Programming Basics": "The very first building blocks — the words and rules every program is made of.",
  "Data Structures": "How to hold your data — the containers you put information in.",
  Algorithms: "How to work with your data — step-by-step recipes to get things done.",
  Databases: "How apps remember things — storing, finding, and organizing data that lasts.",
  "Web & Internet": "How the web actually works — what happens between your click and the page.",
  "Design Patterns": "How to organize big code — proven blueprints for common problems.",
  "System Design": "How to build big systems that stay fast and reliable as they grow.",
  Cloud: "How real apps run on rented computers — scaling, staying up, and shipping safely.",
  "Data Science": "How to find the story hidden in data — the math behind the charts.",
  "Generative AI": "How AI that writes, answers, and creates actually works underneath.",
};

/** Higher-level bands over the 10 pillars, shown as light signpost labels on the
 *  Learn page so the journey has visible groups. Order matches `pillars`. */
export const pillarGroups: { label: string; pillars: Pillar[] }[] = [
  { label: "Code foundations", pillars: ["Programming Basics", "Data Structures", "Algorithms"] },
  { label: "Data & the web", pillars: ["Databases", "Web & Internet"] },
  { label: "Design at scale", pillars: ["Design Patterns", "System Design", "Cloud"] },
  { label: "Data & AI", pillars: ["Data Science", "Generative AI"] },
];
