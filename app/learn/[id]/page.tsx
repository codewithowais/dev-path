import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lessons, getLesson } from "@/content/lessons";
import { LessonView } from "@/components/LessonView";
import {
  LearningResourceJsonLd,
  BreadcrumbJsonLd,
  absoluteUrl,
} from "@/components/StructuredData";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) return { title: "Lesson not found" };
  const url = absoluteUrl(`/learn/${lesson.id}`);
  const title = `${lesson.name} — ${lesson.pillar}`;
  const description = lesson.easy.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: `/learn/${lesson.id}` },
    openGraph: {
      type: "article",
      url,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LessonPage({ params }: Params) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  const url = absoluteUrl(`/learn/${lesson.id}`);

  return (
    <>
      <LearningResourceJsonLd lesson={lesson} url={url} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Learn", url: absoluteUrl("/learn") },
          { name: lesson.name, url },
        ]}
      />
      <LessonView lesson={lesson} />
    </>
  );
}
