import { titleGuide } from "@/content/career";

export function TitleGuide() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {titleGuide.map((qa) => (
        <details
          key={qa.term}
          className="dp-lift group rounded-card border border-line bg-card p-5 open:shadow-md open:shadow-black/5"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold text-ink">
              {qa.term}
            </h3>
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {qa.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
