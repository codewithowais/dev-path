import type { Pillar } from "@/content/lessons";

const PATHS: Record<Pillar, React.ReactNode> = {
  "Programming Basics": (
    <>
      <path d="M8 5 3 12l5 7" />
      <path d="m16 5 5 7-5 7" />
    </>
  ),
  "Data Structures": (
    <>
      <path d="M12 3 21 8l-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  Algorithms: <path d="M3 12h4l2 7 4-15 2 8h6" />,
  Databases: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </>
  ),
  "Web & Internet": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </>
  ),
  "Design Patterns": (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  "System Design": (
    <>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  Cloud: <path d="M7 18a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.5 1.5A3.5 3.5 0 0 1 17.5 18H7Z" />,
  "Data Science": <path d="M5 20V10m5 10V4m5 16v-6m5 6V8M3 20h18" />,
  "Generative AI": (
    <>
      <path d="M12 3.5 13.9 9 19 10.9 13.9 12.8 12 18l-1.9-5.2L5 10.9 10.1 9 12 3.5Z" />
      <path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />
    </>
  ),
  // A passing test: a tick inside a circle.
  "Testing & QA": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  // A target/bullseye: hitting the goal.
  Product: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
};

export function PillarIcon({ pillar, className }: { pillar: Pillar; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[pillar]}
    </svg>
  );
}
