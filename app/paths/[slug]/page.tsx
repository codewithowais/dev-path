import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { paths, getPath } from "@/content/paths";
import { Roadmap } from "@/components/Roadmap";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return paths.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) return { title: "Path not found" };
  return {
    title: `${path.name} roadmap`,
    description: path.blurb,
  };
}

export default async function PathDetailPage({ params }: Params) {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5">
      <div className="py-10 sm:py-14">
        <Link
          href="/#paths"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> All paths
        </Link>

        <header className="dp-stagger mt-6">
          <span
            className="inline-flex w-fit items-center rounded-pill px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${path.color}1a`, color: path.color }}
          >
            {path.tag}
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {path.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
            {path.blurb}
          </p>
        </header>

        <section className="dp-in mt-10 rounded-card border border-line bg-card p-6 sm:p-8">
          <Roadmap path={path} />
        </section>

        <div className="dp-in mt-8 flex flex-wrap gap-3">
          <Link
            href="/learn"
            className="rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Start learning the concepts
          </Link>
          <Link
            href="/grow"
            className="rounded-pill border border-line bg-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            See where this career goes
          </Link>
        </div>
      </div>
    </div>
  );
}
