import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg font-bold">
            Dev<span className="text-primary">Path</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Learn to code and grow your career, explained in plain words — with
            runnable code and the exact output you should expect.
          </p>
        </div>

        <nav aria-label="Footer" className="flex gap-10 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-ink">Explore</span>
            <Link href="/" className="text-muted hover:text-ink">
              Paths
            </Link>
            <Link href="/grow" className="text-muted hover:text-ink">
              Grow
            </Link>
            <Link href="/learn" className="text-muted hover:text-ink">
              Learn
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-ink">Project</span>
            <a
              href="https://github.com/codewithowais/dev-path"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink"
            >
              Source on GitHub
            </a>
            <a
              href="https://github.com/codewithowais"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink"
            >
              @codewithowais
            </a>
          </div>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Built for beginners. No jargon without a plain-English translation.</p>
          <p>
            Made by{" "}
            <a
              href="https://github.com/codewithowais"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink hover:text-primary"
            >
              codewithowais
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
