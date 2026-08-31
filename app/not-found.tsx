import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="dp-eyebrow text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-4 text-lg text-muted">
        It may have moved, or the link was mistyped. Here&apos;s the way back.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="dp-lift rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(91,75,235,0.8)] transition-colors hover:bg-primary/90"
        >
          Find your path
        </Link>
        <Link
          href="/learn"
          className="dp-lift dp-card rounded-pill border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
        >
          Browse lessons
        </Link>
        <Link
          href="/grow"
          className="dp-lift dp-card rounded-pill border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
        >
          See career growth
        </Link>
      </div>
    </div>
  );
}
