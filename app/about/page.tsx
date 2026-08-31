import type { Metadata } from "next";
import Link from "next/link";
import { BrandBadge } from "@/components/Brand";
import { Reveal } from "@/components/Reveal";
import { lessons } from "@/content/lessons";
import { paths } from "@/content/paths";
import { roleTrees, titleGuide } from "@/content/career";

export const metadata: Metadata = {
  title: "About — why DevPath exists",
  description:
    "DevPath makes the first steps into coding and tech careers clear: plain-language explanations, runnable code with the exact output to expect, and honest career maps. A free, open, solo project by codewithowais.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About DevPath — why it exists",
    description:
      "Why DevPath exists and who makes it: plain-language explanations, runnable code with the exact output to expect, and honest career maps. A free, open, solo project.",
    url: "/about",
  },
};

const GH_PROFILE = "https://github.com/codewithowais";
const GH_REPO = "https://github.com/codewithowais/dev-path";

const WHAT = [
  {
    eyebrow: "Paths",
    tone: "text-primary",
    title: "Know what to learn next",
    body: `${paths.length} ordered roadmaps that answer "learn this, then this" — so you are never staring at a blank page wondering where to start.`,
  },
  {
    eyebrow: "Grow",
    tone: "text-here",
    title: "See where a career can go",
    body: `A shared ladder from Student to Senior, then ${roleTrees.length} role-specific growth trees and ${titleGuide.length} confusing job titles decoded in plain words.`,
  },
  {
    eyebrow: "Learn",
    tone: "text-output",
    title: "Understand the hard ideas",
    body: `${lessons.length} lessons on data structures, algorithms, and design patterns — each with an everyday example and code you can run right on the page.`,
  },
];

const PRINCIPLES = [
  {
    title: "Plain language, on purpose",
    body: "Every idea gets an everyday translation before any jargon. The writing follows plain-language guidance (ISO 24495-1:2023): say it so a beginner gets it the first time.",
  },
  {
    title: "Every code sample is verified",
    body: "Each example shows the exact output you should expect, in both JavaScript and Python — so you can check your own result against the real one, not a guess.",
  },
  {
    title: "Honest about careers",
    body: "No hype and no fake ladders. Titles and roles are described the way they actually work, including the parts that are messy or unglamorous.",
  },
  {
    title: "Free and open",
    body: "DevPath is free to use and the source is public on GitHub. If something is unclear or wrong, the code and content are right there to read and improve.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 xl:max-w-7xl 2xl:max-w-[96rem] 2xl:px-8">
      {/* Hero */}
      <section className="dp-stagger py-14 sm:py-20">
        <p className="dp-eyebrow text-primary">About</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Built to make the first steps clear
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Learning to code and figuring out a tech career should not feel like
          decoding a secret language. DevPath exists to explain both in plain
          words — with runnable code, the exact output to expect, and honest
          maps of where the work can take you.
        </p>
      </section>

      {/* What DevPath is */}
      <section aria-labelledby="what-heading" className="pb-6">
        <header className="max-w-2xl">
          <p className="dp-eyebrow text-primary">The idea</p>
          <h2
            id="what-heading"
            className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            What DevPath is
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            Three connected areas, one goal: take you from unsure to a clear
            next step.
          </p>
        </header>

        {/* Feature cards "rise" into place, staggered left-to-right. */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {WHAT.map((item, i) => (
            <Reveal
              key={item.eyebrow}
              variant="rise"
              delay={i * 70}
              className="h-full"
            >
              <div className="dp-card group h-full rounded-card border border-line p-6 transition-colors">
                <p className={`dp-eyebrow ${item.tone}`}>{item.eyebrow}</p>
                <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section aria-labelledby="principles-heading" className="py-14">
        <header className="max-w-2xl">
          <p className="dp-eyebrow text-here">What it stands for</p>
          <h2
            id="principles-heading"
            className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            The principles behind it
          </h2>
        </header>

        {/* Principle statements — text blocks that rise up in sequence (a
            different feel from the feature cards above). */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} variant="up" delay={i * 70} className="h-full">
              <div className="dp-card h-full rounded-card border border-line p-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Made by codewithowais */}
      <section aria-labelledby="maker-heading" className="pb-20">
        <Reveal variant="fade">
        <div className="dp-card rounded-card border border-line p-8 sm:p-10">
          <p className="dp-eyebrow text-primary">The maker</p>
          <h2
            id="maker-heading"
            className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Made by codewithowais
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            DevPath is a solo project by codewithowais — built and maintained by
            one person who wanted the explanation they wish they had at the
            start. It is a work in progress, and it is open: read it, fork it, or
            suggest a fix on GitHub.
          </p>

          <div className="mt-8">
            <BrandBadge />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={GH_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="group dp-lift dp-press rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(91,75,235,0.8)] hover:bg-primary/90"
            >
              GitHub profile{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <a
              href={GH_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="dp-lift dp-press rounded-pill border border-line bg-card px-6 py-3 text-sm font-semibold text-ink hover:border-ink/30"
            >
              View the source
            </a>
          </div>
        </div>
        </Reveal>

        <p className="mt-6 text-center text-sm text-muted">
          Prefer to start doing?{" "}
          <Link
            href="/"
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Find your path
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
