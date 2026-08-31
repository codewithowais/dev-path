import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { paths, getPath } from "@/content/paths";
import { Roadmap } from "@/components/Roadmap";
import { PathIcon } from "@/components/PathIcon";
import { accentText } from "@/lib/accent";
import {
  CourseJsonLd,
  BreadcrumbJsonLd,
  absoluteUrl,
} from "@/components/StructuredData";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return paths.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) return { title: "Path not found" };
  const url = absoluteUrl(`/paths/${path.id}`);
  const title = `${path.name} roadmap`;
  return {
    title,
    description: path.blurb,
    alternates: { canonical: `/paths/${path.id}` },
    openGraph: {
      type: "article",
      url,
      title,
      description: path.blurb,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: path.blurb,
    },
  };
}

export default async function PathDetailPage({ params }: Params) {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) notFound();

  const url = absoluteUrl(`/paths/${path.id}`);

  return (
    <div className="mx-auto max-w-3xl px-5">
      <CourseJsonLd path={path} url={url} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Paths", url: absoluteUrl("/#paths") },
          { name: path.name, url },
        ]}
      />
      <div className="py-10 sm:py-14">
        <Link
          href="/#paths"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> All paths
        </Link>

        <header className="mt-6 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${path.color}, color-mix(in srgb, ${path.color} 55%, white))`,
            }}
          >
            <PathIcon id={path.id} className="h-6 w-6" />
          </span>
          <div>
            <p className="dp-eyebrow" style={{ color: accentText(path.color) }}>
              {path.steps.length}-step roadmap
            </p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {path.name}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
              {path.blurb}
            </p>
          </div>
        </header>

        <section className="dp-card mt-10 rounded-card border border-line p-6 sm:p-8">
          <Roadmap path={path} />
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/learn"
            className="dp-lift rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(91,75,235,0.8)] transition-colors hover:bg-primary/90"
          >
            Start learning the concepts
          </Link>
          <Link
            href="/grow"
            className="dp-lift rounded-pill border border-line bg-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            See where this career goes
          </Link>
        </div>
      </div>
    </div>
  );
}
