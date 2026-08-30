import Link from "next/link";
import { BrandSignature } from "@/components/Brand";

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
          <div className="mt-5">
            <BrandSignature />
          </div>
        </div>

        <nav aria-label="Footer" className="flex gap-10 text-sm">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Explore
            </span>
            <Link
              href="/"
              className="w-fit text-muted transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] hover:text-ink"
            >
              Paths
            </Link>
            <Link
              href="/grow"
              className="w-fit text-muted transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] hover:text-ink"
            >
              Grow
            </Link>
            <Link
              href="/learn"
              className="w-fit text-muted transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] hover:text-ink"
            >
              Learn
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Project
            </span>
            <a
              href="https://github.com/codewithowais/dev-path"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-muted transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] hover:text-ink"
            >
              Source on GitHub
            </a>
            <a
              href="https://github.com/codewithowais"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-muted transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] hover:text-ink"
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
              className="font-semibold text-ink transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] hover:text-primary"
            >
              codewithowais
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
