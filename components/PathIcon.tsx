// One line-icon per learning path, in the same visual language as PillarIcon
// (24px viewBox, currentColor stroke, round joins). Keyed by the path id in
// content/paths.ts. Falls back to a waypoint pin for any unknown id.

const ICONS: Record<string, React.ReactNode> = {
  // Compass — "not sure yet, start here"
  foundations: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  // Browser window — the part people see
  frontend: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M9.5 6.5h.01" />
    </>
  ),
  // Server stack — the engine behind the app
  backend: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  // Stacked layers — both sides
  fullstack: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  // Spark / intelligence
  "ai-engineer": (
    <>
      <path d="M12 3.5 13.9 9 19 10.9 13.9 12.8 12 18l-1.9-5.2L5 10.9 10.1 9 12 3.5Z" />
      <path d="m18.5 15 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
    </>
  ),
  // Infinity loop — DevOps
  devops: (
    <path d="M9 12a3 3 0 1 1-3 3c0-3 4.5-6 6-6s6 3 6 6a3 3 0 1 1-3-3" />
  ),
  // Phone
  "mobile-developer": (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <path d="M10.5 18h3" />
    </>
  ),
  // Bar chart
  "data-analyst": <path d="M4 20V10m5 10V4m5 16v-7m5 7V7M3 20h18" />,
  // Scatter + trend
  "data-scientist-ml": (
    <>
      <path d="M4 4v16h16" />
      <path d="m7 15 3-4 3 2 4-6" />
      <path d="M7 15h.01M13 13h.01M17 7h.01" />
    </>
  ),
  // Shield
  cybersecurity: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  // Cloud
  "cloud-engineer": (
    <path d="M7 18a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.5 1.5A3.5 3.5 0 0 1 17.5 18H7Z" />
  ),
  // Check badge — QA
  "qa-test-automation": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 5-5" />
    </>
  ),
  // Gamepad
  "game-developer": (
    <>
      <rect x="2" y="7" width="20" height="10" rx="5" />
      <path d="M7 11v2M6 12h2M15.5 11.5h.01M18 13.5h.01" />
    </>
  ),
  // Pen + ruler — design to code
  "uiux-to-developer": (
    <>
      <path d="m14 4 6 6L9 21H3v-6L14 4Z" />
      <path d="m11.5 6.5 6 6" />
    </>
  ),
  // Target — decide what to build & why
  "product-manager": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  // Clipboard with a check — testing the product
  "product-qa": (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="m8.5 13 2.5 2.5 4.5-4.5" />
    </>
  ),
  // Sprint cycle — iterate in short loops (Agile / Scrum)
  "scrum-master": (
    <>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v4h-4" />
    </>
  ),
};

const FALLBACK = (
  <>
    <circle cx="12" cy="9" r="3" />
    <path d="M12 12v9" strokeDasharray="0.1 3.4" />
  </>
);

export function PathIcon({ id, className }: { id: string; className?: string }) {
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
      {ICONS[id] ?? FALLBACK}
    </svg>
  );
}
