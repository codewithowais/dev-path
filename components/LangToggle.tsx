import type { Language } from "@/content/lessons";

type Props = {
  languages: Language[];
  active: Language;
  onChange: (lang: Language) => void;
  /** Unique id so the label associates with the right lesson. */
  idBase: string;
};

export function LangToggle({ languages, active, onChange, idBase }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Choose a language"
      className="inline-flex rounded-pill border border-line bg-paper p-1"
    >
      {languages.map((lang) => {
        const isActive = lang === active;
        return (
          <button
            key={lang}
            id={`${idBase}-tab-${lang}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(lang)}
            className={`rounded-pill px-3.5 py-1.5 text-sm font-semibold transition-all duration-[var(--dp-dur)] ease-[var(--dp-ease)] ${
              isActive
                ? "bg-card text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
