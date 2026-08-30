import type { Path } from "@/content/paths";

type Props = {
  path: Path;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function PathCard({ path, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(path.id)}
      aria-pressed={selected}
      className={`group flex h-full flex-col rounded-card border-2 bg-card p-5 text-left transition-all ${
        selected
          ? "border-[color:var(--accent)] shadow-lg shadow-black/5"
          : "border-line hover:border-[color:var(--accent)]/50 hover:shadow-md hover:shadow-black/5"
      }`}
      style={{ ["--accent" as string]: path.color }}
    >
      <span
        className="inline-flex w-fit items-center rounded-pill px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: `${path.color}1a`,
          color: path.color,
        }}
      >
        {path.tag}
      </span>
      <h3 className="mt-3 font-display text-xl font-bold text-ink">{path.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{path.blurb}</p>
      <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-ink">
        {path.steps.length} steps
        <span
          aria-hidden="true"
          className="text-[color:var(--accent)] transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </button>
  );
}
