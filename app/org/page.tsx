import type { Metadata } from "next";
import Link from "next/link";
import { OrgChart } from "@/components/OrgChart";
import { roleCategories, roleTrees } from "@/content/career";
import { absoluteUrl } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Org — how a software team is organized",
  description:
    "A plain-English org chart of a typical software development organization: the departments — from building the product to data, infrastructure, quality, and leadership — and the roles inside each.",
  alternates: { canonical: "/org" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/org"),
    title: "Org — how a software team is organized",
    description:
      "A plain-English org chart of a typical software development organization: the departments and the roles inside each.",
  },
};

export default function OrgPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 xl:max-w-7xl">
      <section className="dp-stagger py-14 sm:py-20">
        <p className="dp-eyebrow text-primary">Org</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          How a software team is organized
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Every software organization is built from the same handful of parts.
          Here&apos;s the shape of a typical one — the {roleCategories.length}{" "}
          departments that make up an engineering org, and the{" "}
          {roleTrees.length} roles that live inside them. It&apos;s a map of who
          does what, not a ladder — for the climb, see{" "}
          <Link
            href="/grow"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Grow
          </Link>
          .
        </p>
      </section>

      <section aria-label="Software organization chart" className="pb-16 sm:pb-20">
        <OrgChart />
      </section>
    </div>
  );
}
