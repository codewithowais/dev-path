import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lessons, getLesson } from "@/content/lessons";
import { LessonView } from "@/components/LessonView";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.name} — ${lesson.pillar}`,
    description: lesson.easy.slice(0, 155),
  };
}

export default async function LessonPage({ params }: Params) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
