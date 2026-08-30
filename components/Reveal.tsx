"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Variant = "up" | "scale" | "left" | "right" | "fade";

type Props = {
  children: ReactNode;
  variant?: Variant;
  /** transition-delay in ms, for hand-tuned staggering */
  delay?: number;
  className?: string;
};

/**
 * Reveals its children as they scroll into view (fade + a small move).
 * SSR-safe: content renders visible by default, so it's NEVER hidden if JS is
 * off. Elements already on screen at mount show instantly (no flash); only
 * below-the-fold ones animate in. Fully disabled under prefers-reduced-motion.
 */
export function Reveal({ children, variant = "up", delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;

    // Already visible → show immediately, no animation.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      el.setAttribute("data-reveal", "in");
      return;
    }
    el.setAttribute("data-reveal", "out");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-reveal", "in");
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-variant={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
