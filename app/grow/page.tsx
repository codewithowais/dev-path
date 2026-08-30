import type { Metadata } from "next";
import { GrowthTree } from "@/components/GrowthTree";
import { RoleTree } from "@/components/RoleTree";
import { TitleGuide } from "@/components/TitleGuide";

export const metadata: Metadata = {
  title: "Grow — where your career can go",
  description:
    "Climb the software career ladder from Student to Senior, then see it branch into building (IC) or leading people (Manager). Plus confusing job titles explained in plain words.",
};

export default function GrowPage() {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="dp-stagger py-14 sm:py-16">
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-here">
          Grow
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Where can my career go?
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Everyone climbs the same ladder first. After Senior, you choose: keep
          getting deeper at building (the IC track), or lead a team of people (the
          Manager track). Neither is better — they&apos;re just different.
        </p>
      </section>

      <section aria-labelledby="ladder-heading" className="dp-in pb-8">
        <h2 id="ladder-heading" className="sr-only">
          The career ladder
        </h2>
        <GrowthTree />
      </section>

      <section aria-labelledby="role-trees-heading" className="py-14">
        <header className="dp-in max-w-2xl">
          <h2
            id="role-trees-heading"
            className="font-display text-3xl font-bold text-ink"
          >
            Role-specific growth trees
          </h2>
          <p className="mt-2 text-muted">
            Pick your specialty and see how far it goes.
          </p>
        </header>
        <div className="mt-8">
          <RoleTree />
        </div>
      </section>

      <section aria-labelledby="titles-heading" className="py-14">
        <header className="dp-in max-w-2xl">
          <h2
            id="titles-heading"
            className="font-display text-3xl font-bold text-ink"
          >
            Confusing titles, in plain words
          </h2>
          <p className="mt-2 text-muted">
            The job-title soup, decoded. Short, honest, no fluff. Tap to expand.
          </p>
        </header>
        <div className="mt-8">
          <TitleGuide />
        </div>
      </section>
    </div>
  );
}
