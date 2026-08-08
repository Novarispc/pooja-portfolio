"use client";

import { createElement, useEffect, useRef, useState } from "react";

/**
 * Wraps a section so it fades/slides in once scrolled into view. Falls back
 * to always-visible if IntersectionObserver is unavailable, and the CSS
 * itself no-ops the transition under prefers-reduced-motion.
 */
export default function Reveal({
  children,
  as = "div",
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  as?: "section" | "div" | "footer";
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    { ref, id, className: `reveal ${visible ? "is-visible" : ""} ${className}`, style },
    children
  );
}
