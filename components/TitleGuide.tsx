import { titleGuide } from "@/content/career";

export function TitleGuide() {
  return (
    // Masonry columns (not a grid) so opening one card never stretches its
    // neighbour — each card keeps its own height and the column just reflows.
    <div className="gap-4 [column-fill:balance] sm:columns-2 sm:[column-gap:1rem]">
      {titleGuide.map((qa) => (
        <details
          key={qa.term}
          className="dp-shadow-sm group mb-4 break-inside-avoid rounded-card border border-line bg-card p-5 transition-colors open:border-primary/40 hover:border-primary/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold text-ink">
              {qa.term}
            </h3>
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] group-open:rotate-45 group-open:border-primary group-open:bg-primary group-open:text-white"
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
