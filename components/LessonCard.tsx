"use client";

import { useState } from "react";
import type { Lesson, Language } from "@/content/lessons";
import { availableLanguages } from "@/content/lessons";
import { LangToggle } from "@/components/LangToggle";
import { CodeBlock } from "@/components/CodeBlock";

type Props = {
  lesson: Lesson;
};

export function LessonCard({ lesson }: Props) {
  const languages = availableLanguages(lesson);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Language>(languages[0]);
  const panelId = `lesson-${lesson.id}-panel`;
  const headingId = `lesson-${lesson.id}-heading`;

  return (
    <article className="rounded-card border border-line bg-card">
      <h3 id={headingId} className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 rounded-card px-5 py-4 text-left"
        >
          <span className="font-display text-lg font-bold text-ink">
            {lesson.name}
          </span>
          <span className="flex items-center gap-3">
            {lesson.big && (
              <span className="hidden font-mono text-xs text-muted sm:inline">
                {lesson.big.split("·")[0].trim()}
              </span>
            )}
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease)] ${
                open ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </span>
        </button>
      </h3>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className="dp-in-fade dp-stagger border-t border-line px-5 pb-6 pt-5"
        >
          {/* 1. The idea in plain English */}
          <Section label="The idea, in plain English">
            <p className="leading-relaxed text-ink">{lesson.easy}</p>
          </Section>

          {/* 2. How it works, step by step */}
          <Section label="How it works">
            <ol className="ml-1 space-y-2">
              {lesson.how.map((step, i) => (
                <li key={i} className="flex gap-3 text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* 3. When you'd use it */}
          <Section label="When you'd use it">
            <p className="leading-relaxed text-ink">{lesson.when}</p>
          </Section>

          {/* 4. Complexity */}
          {lesson.big && (
            <Section label="Complexity (speed & memory)">
              <p className="font-mono text-sm leading-relaxed text-ink">
                {lesson.big}
              </p>
            </Section>
          )}

          {/* 5. Common mistakes */}
          {lesson.mistakes && lesson.mistakes.length > 0 && (
            <Section label="Common beginner mistakes">
              <ul className="space-y-2">
                {lesson.mistakes.map((m, i) => (
                  <li key={i} className="flex gap-2.5 leading-relaxed text-ink">
                    <span aria-hidden="true" className="text-here">
                      ⚠
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* 6. Code + expected output */}
          <Section label="The code">
            {languages.length > 1 && (
              <div className="mb-3">
                <LangToggle
                  languages={languages}
                  active={lang}
                  onChange={setLang}
                  idBase={`lesson-${lesson.id}`}
                />
              </div>
            )}
            <CodeBlock code={lesson.code[lang] ?? ""} label={lang} />

            {/* The green EXPECTED OUTPUT block */}
            <div className="mt-3 overflow-hidden rounded-xl border border-output/30 bg-output-soft">
              <div className="flex items-center gap-2 border-b border-output/20 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-output" aria-hidden="true" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-output">
                  Expected output
                </span>
              </div>
              <div className="overflow-x-auto">
                <pre className="p-4 text-sm leading-relaxed">
                  <code className="font-mono text-ink">{lesson.output}</code>
                </pre>
              </div>
            </div>
          </Section>

          {lesson.note && (
            <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-muted">
              <span className="font-semibold text-ink">Note: </span>
              {lesson.note}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 first:mt-0">
      <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}
