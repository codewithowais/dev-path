import Link from "next/link";
import { PathsExplorer } from "@/components/PathsExplorer";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="py-14 sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-card px-3 py-1 text-sm font-semibold text-muted">
          <span className="h-2 w-2 rounded-full bg-output" aria-hidden="true" />
          For total beginners &amp; the career-confused
        </span>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-6xl">
          Learn to code and grow your career,{" "}
          <span className="text-primary">in plain words.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Figure out what to learn, see where your job title can go next, and
          understand data structures, algorithms, and design patterns explained
          like a patient friend — with runnable code and the exact output you
          should expect.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#paths"
            className="rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Find your path
          </Link>
          <Link
            href="/learn"
            className="rounded-pill border border-line bg-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            Start learning
          </Link>
        </div>
      </section>

      {/* Paths */}
      <section id="paths" className="scroll-mt-24 pb-6">
        <header className="max-w-2xl">
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-primary">
            Paths
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            What should I learn?
          </h2>
          <p className="mt-2 text-muted">
            Starter tracks, each an ordered roadmap: learn this, then this. Tap
            one to open its full journey.
          </p>
        </header>
        <div className="mt-8">
          <PathsExplorer />
        </div>
      </section>

      {/* Cross-links to Grow & Learn */}
      <section className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-2">
        <Link
          href="/grow"
          className="dp-lift group rounded-card border border-line bg-card p-6 hover:border-here/50 hover:shadow-md hover:shadow-black/5"
        >
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-here">
            Grow
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-ink">
            Where can my career go?
          </h3>
          <p className="mt-2 text-sm text-muted">
            Climb the ladder from Student to Senior — then see it branch into
            building (IC) or leading people (Manager).
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-here">
            See the growth tree
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
        <Link
          href="/learn"
          className="dp-lift group rounded-card border border-line bg-card p-6 hover:border-primary/50 hover:shadow-md hover:shadow-black/5"
        >
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-primary">
            Learn
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-ink">
            Understand the hard stuff
          </h3>
          <p className="mt-2 text-sm text-muted">
            Data structures, algorithms, and design patterns — each with an
            everyday analogy, runnable code, and its expected output.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Open the lessons
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
      </section>
    </div>
  );
}
