"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Paths", hint: "What to learn" },
  { href: "/grow", label: "Grow", hint: "Where your career goes" },
  { href: "/learn", label: "Learn", hint: "The lessons" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/paths");
  return pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape while it's open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          onClick={() => setOpen(false)}
        >
          <WayfinderMark />
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Dev<span className="text-primary">Path</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-pill px-4 py-2 text-sm font-semibold transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-line/60 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-[background-color,transform] duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] hover:bg-line/60 active:scale-95 sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] ${
              open ? "rotate-90" : "rotate-0"
            }`}
          >
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu — kept mounted so aria-controls always resolves; toggled via `hidden`. */}
      <ul
        id="mobile-menu"
        hidden={!open}
        className="flex flex-col gap-1 border-t border-line px-5 pb-4 pt-2 sm:hidden"
      >
        {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col rounded-xl px-4 py-3 transition-colors duration-[var(--dp-dur-fast)] ease-[var(--dp-ease)] ${
                    active ? "bg-primary-soft text-primary" : "text-ink hover:bg-line/50"
                  }`}
                >
                  <span className="text-base font-semibold">{link.label}</span>
                  <span className="text-sm text-muted">{link.hint}</span>
                </Link>
              </li>
            );
          })}
      </ul>
    </header>
  );
}

/** The wayfinder mark — a waypoint pin on a path. */
function WayfinderMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white transition-transform duration-[var(--dp-dur-fast)] ease-[var(--dp-ease-spring)] group-hover:scale-105">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 19c3-6 5-2 8-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="0.1 3.2"
        />
        <circle
          cx="16"
          cy="7"
          r="3.2"
          stroke="currentColor"
          strokeWidth="2"
          className="origin-center transition-transform duration-[var(--dp-dur)] ease-[var(--dp-ease-spring)] [transform-box:fill-box] group-hover:scale-125"
        />
      </svg>
    </span>
  );
}
