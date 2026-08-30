import Link from "next/link";
import { PathsExplorer } from "@/components/PathsExplorer";
import { Reveal } from "@/components/Reveal";
import { paths } from "@/content/paths";
import { lessons } from "@/content/lessons";
import { roleTrees } from "@/content/career";
import { BrandChip } from "@/components/Brand";

const STATS = [
  { value: `${lessons.length}`, label: "lessons" },
  { value: `${paths.length}`, label: "learning paths" },
  { value: `${roleTrees.length}`, label: "career trees" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
        <div className="dp-stagger">
          <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-card px-3 py-1 text-sm font-semibold text-muted dp-shadow-sm">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-output opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-output" />
            </span>
            For total beginners &amp; the career-confused
          </span>
          <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.03] tracking-tight text-ink sm:text-6xl">
            Learn to code and grow your career,{" "}
            <span className="dp-gradient-text">in plain words.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            New to coding? Start here. Every idea is explained in plain words —
            with an everyday example, code you can run right on the page, and the
            exact result to expect.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#paths"
              className="dp-lift rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(91,75,235,0.8)] transition-colors hover:bg-primary/90"
            >
              Find your path <span aria-hidden="true">↓</span>
            </Link>
            <Link
              href="/learn"
              className="dp-lift rounded-pill border border-line bg-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
            >
              Start learning
            </Link>
          </div>

          {/* Credibility stats */}
          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold text-ink">
                  {s.value}
                  <span
                    aria-hidden="true"
                    className="ml-2 align-middle text-sm font-medium text-muted"
                  >
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <BrandChip />
          </div>
        </div>

        {/* Decorative wayfinder route — echoes the "learning as a journey" idea */}
        <Reveal variant="scale" className="hidden lg:block">
          <RouteMap />
        </Reveal>
      </section>

      {/* Paths */}
      <section id="paths" className="scroll-mt-24 pb-6">
        <header className="max-w-2xl">
          <p className="dp-eyebrow text-primary">Paths</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            What should I learn?
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            Pick a goal and follow an ordered roadmap — learn this, then this.
            Tap any track to open its full journey.
          </p>
        </header>
        <Reveal className="mt-8">
          <PathsExplorer />
        </Reveal>
      </section>

      {/* Cross-links to Grow & Learn */}
      <Reveal variant="up" className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-2">
        <Link
          href="/grow"
          className="dp-lift dp-card group relative overflow-hidden rounded-card border border-line p-6 transition-colors hover:border-here/50"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-here/10 blur-2xl transition-opacity duration-[var(--dp-dur)] group-hover:bg-here/20"
          />
          <p className="dp-eyebrow text-here">Grow</p>
          <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">
            Where can my career go?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Climb from Student to Senior. Then pick your next step: keep
            building, or lead a team.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-here">
            See the growth tree
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
        <Link
          href="/learn"
          className="dp-lift dp-card group relative overflow-hidden rounded-card border border-line p-6 transition-colors hover:border-primary/50"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-[var(--dp-dur)] group-hover:bg-primary/20"
          />
          <p className="dp-eyebrow text-primary">Learn</p>
          <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">
            Understand the hard stuff
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Data structures, algorithms, design patterns, and more. Each one has
            an everyday example and code you can run.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Open the lessons
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </Reveal>
    </div>
  );
}

/** A small illustrated "route" with three waypoints: Start → Learn → Grow. */
function RouteMap() {
  const stops = [
    { x: 60, y: 200, label: "Start", color: "#5F3DC4" },
    { x: 175, y: 120, label: "Learn", color: "#5B4BEB" },
    { x: 300, y: 60, label: "Grow", color: "#FF8A3D" },
  ];
  return (
    <div className="dp-card relative aspect-[4/3] w-full overflow-hidden rounded-card border border-line p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(25,28,51,0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <svg viewBox="0 0 360 270" className="relative h-full w-full" role="img" aria-label="A path from Start to Learn to Grow">
        <path
          d="M60 200 C 110 200, 120 120, 175 120 S 260 90, 300 60"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 9"
        />
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#5F3DC4" />
            <stop offset="0.5" stopColor="#5B4BEB" />
            <stop offset="1" stopColor="#FF8A3D" />
          </linearGradient>
        </defs>
        {stops.map((s, i) => (
          <g key={s.label}>
            <circle cx={s.x} cy={s.y} r="16" fill="white" stroke={s.color} strokeWidth="3" />
            <circle cx={s.x} cy={s.y} r="6" fill={s.color} />
            <text
              x={s.x}
              y={s.y + 38}
              textAnchor="middle"
              className="font-display"
              fontSize="15"
              fontWeight="700"
              fill="#191c33"
            >
              {s.label}
            </text>
            {i === 0 && (
              <text x={s.x} y={s.y - 26} textAnchor="middle" fontSize="11" fill="#5b6079">
                you are here
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
