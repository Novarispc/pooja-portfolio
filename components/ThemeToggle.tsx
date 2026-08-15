"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // The layout's inline script already set data-theme on <html> before
    // paint (defaulting first-time visitors to light, regardless of OS
    // preference) — read that back as the source of truth instead of
    // re-deriving it here, so this button can never disagree with what's
    // actually applied.
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    setTheme(current || "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("prk-theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light / dark theme"
      title="Toggle light / dark theme"
      className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
      style={{ borderColor: "var(--nav-mute)", color: "var(--nav-mute)" }}
    >
      {theme === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
