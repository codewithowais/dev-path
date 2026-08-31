"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging without exposing it to the reader.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="dp-eyebrow text-primary">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        This page hit a snag
      </h1>
      <p className="mt-4 text-lg text-muted">
        Nothing you did caused it. Try again, or head back home and pick up where
        you left off.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="dp-lift rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(91,75,235,0.8)] transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="dp-lift dp-card rounded-pill border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
