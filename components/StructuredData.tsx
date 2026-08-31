// components/StructuredData.tsx
// Server components that emit JSON-LD structured data for SEO + AIEO (AI answer
// engines). Each renders a single <script type="application/ld+json"> tag.
//
// `siteUrl` is centralized here and reused by sitemap.ts, robots.ts, llms.txt,
// and every page's canonical/OG metadata so every absolute URL agrees.

import type { Lesson } from "@/content/lessons";
import type { Path } from "@/content/paths";

/** Canonical origin for the deployed site. Mirrors app/layout.tsx. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dev-path-by-codewithowais.vercel.app";

/** Join the site origin with a path, guaranteeing exactly one slash. */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? siteUrl : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

const ORG_ID = `${siteUrl}/#organization`;
const SITE_ID = `${siteUrl}/#website`;

/** Renders one JSON-LD script tag. Kept private; helpers below wrap it. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes the payload; JSON-LD is safe to inline this way.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization behind DevPath (solo project by codewithowais). */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": ORG_ID,
        name: "DevPath",
        alternateName: "DevPath by codewithowais",
        url: siteUrl,
        description:
          "A free, beginner-friendly hub for learning to code and growing a tech career, in plain words.",
        founder: {
          "@type": "Person",
          name: "codewithowais",
          url: "https://github.com/codewithowais",
        },
        sameAs: [
          "https://github.com/codewithowais",
          "https://github.com/codewithowais/dev-path",
        ],
      }}
    />
  );
}

/** WebSite node with a SearchAction pointing at the Learn browser. */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": SITE_ID,
        url: siteUrl,
        name: "DevPath",
        alternateName: "DevPath by codewithowais",
        description:
          "Figure out what to learn, see where your job title can grow, and understand data structures, algorithms, and design patterns — explained like a patient friend.",
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/learn?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export type Crumb = { name: string; url: string };

/** BreadcrumbList from an ordered list of {name, url} crumbs (absolute urls). */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export type FaqItem = { question: string; answer: string };

/** FAQPage — a strong AIEO signal that makes Q&A content directly citable. */
export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

/** LearningResource + Article for a single lesson. */
export function LearningResourceJsonLd({
  lesson,
  url,
}: {
  lesson: Lesson;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["LearningResource", "Article"],
        "@id": `${url}#lesson`,
        url,
        name: lesson.name,
        headline: `${lesson.name} — ${lesson.pillar}`,
        description: lesson.easy.slice(0, 300),
        articleSection: lesson.pillar,
        educationalLevel: "Beginner",
        learningResourceType: "Concept explainer with runnable code",
        teaches: lesson.name,
        about: { "@type": "Thing", name: lesson.pillar },
        inLanguage: "en",
        isAccessibleForFree: true,
        keywords: [lesson.pillar, lesson.name, "beginner", "tutorial"],
        programmingLanguage: Object.keys(lesson.code),
        author: {
          "@type": "Person",
          name: "codewithowais",
          url: "https://github.com/codewithowais",
        },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
      }}
    />
  );
}

/** Course + HowTo for a career path roadmap. */
export function CourseJsonLd({ path, url }: { path: Path; url: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["Course", "HowTo"],
        "@id": `${url}#course`,
        url,
        name: `${path.name} roadmap`,
        description: path.blurb,
        educationalLevel: "Beginner",
        inLanguage: "en",
        isAccessibleForFree: true,
        provider: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `${path.steps.length} steps`,
        },
        // HowTo view of the same ordered roadmap.
        step: path.steps.map(([title, description], i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: title,
          text: description,
        })),
      }}
    />
  );
}

export type ListItemInput = { name: string; url: string; description?: string };

/** ItemList / CollectionPage of links (used for the Learn index). */
export function ItemListJsonLd({
  items,
  name,
  description,
  url,
}: {
  items: ListItemInput[];
  name: string;
  description?: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name,
        ...(description ? { description } : {}),
        isPartOf: { "@id": SITE_ID },
        inLanguage: "en",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            url: item.url,
            ...(item.description ? { description: item.description } : {}),
          })),
        },
      }}
    />
  );
}
