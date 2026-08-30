import type { Metadata } from "next";
import { GrowthTree } from "@/components/GrowthTree";
import { RoleTree } from "@/components/RoleTree";
import { TitleGuide } from "@/components/TitleGuide";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Grow — where your career can go",
  description:
    "Climb the software career ladder from Student to Senior, then see it branch into building (IC) or leading people (Manager). Plus confusing job titles explained in plain words.",
};

export default function GrowPage() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="dp-stagger py-14 sm:py-20">
        <p className="dp-eyebrow text-here">Grow</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Where can my career go?
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Everyone climbs the same ladder first. After Senior, you choose your
          path. You can keep building things yourself, or lead a team of people.
          Neither is better — they are just different.
        </p>
      </section>

      <section aria-labelledby="ladder-heading" className="pb-8">
        <header className="max-w-2xl">
          <p className="dp-eyebrow text-here">The ladder</p>
          <h2
            id="ladder-heading"
            className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            The shared ladder
          </h2>
        </header>
        <div className="mt-8">
          <GrowthTree />
        </div>
      </section>

      <section aria-labelledby="role-trees-heading" className="py-14">
        <header className="max-w-2xl">
          <p className="dp-eyebrow text-primary">Specialize</p>
          <h2
            id="role-trees-heading"
            className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Role-specific growth trees
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            Pick a specialty to open the path that teaches it.
          </p>
        </header>
        <Reveal variant="scale" className="mt-8">
          <RoleTree />
        </Reveal>
      </section>

      <section aria-labelledby="titles-heading" className="py-14">
        <header className="max-w-2xl">
          <p className="dp-eyebrow text-here">Decoder</p>
          <h2
            id="titles-heading"
            className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Confusing titles, in plain words
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            The job-title soup, decoded. Short, honest, no fluff. Tap to expand.
          </p>
        </header>
        <Reveal className="mt-8">
          <TitleGuide />
        </Reveal>
      </section>
    </div>
  );
}
