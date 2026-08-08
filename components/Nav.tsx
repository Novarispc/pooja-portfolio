"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const LINKS = ["about", "expertise", "projects", "portfolio", "experience", "education", "milestones", "contact"];

export default function Nav({ avatarUrl, textColor }: { avatarUrl: string | null; textColor?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Overrides the --nav-text / --nav-mute tokens for this subtree only, so
  // every child that already reads those vars (logo, links, theme toggle,
  // hamburger) picks up the custom color automatically. Falls back to the
  // theme default when unset.
  const navStyle = textColor
    ? ({
        "--nav-text": textColor,
        "--nav-mute": `color-mix(in srgb, ${textColor} 78%, transparent)`,
      } as React.CSSProperties)
    : undefined;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route-internal anchor navigation
  function handleLinkClick() {
    setMenuOpen(false);
  }

  return (
    <nav className={`site-nav fixed top-0 inset-x-0 z-50 ${scrolled ? "is-scrolled" : ""}`} style={navStyle}>
      <div className="flex items-center justify-between px-6 sm:px-8 py-4">
        <a href="#hero" className="font-display italic text-xl flex items-center" style={{ color: "var(--nav-text)" }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="inline-block w-8 h-8 rounded-full object-cover mr-2.5 align-middle" style={{ border: "1px solid rgba(255,255,255,0.25)" }} />
          ) : null}
          PRK
        </a>
        <div className="flex items-center gap-8">
          <ul className="hidden md:flex gap-8 text-xs tracking-widest uppercase">
            {LINKS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="nav-link">
                  {id === "milestones" ? "milestone" : id}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
          >
            <span
              className="block w-5 h-[1.5px] transition-transform duration-300"
              style={{ background: "var(--nav-text)", transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }}
            />
            <span
              className="block w-5 h-[1.5px] transition-opacity duration-300"
              style={{ background: "var(--nav-text)", opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-[1.5px] transition-transform duration-300"
              style={{ background: "var(--nav-text)", transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-[max-height,opacity] duration-400 ease-out"
        style={{ maxHeight: menuOpen ? "24rem" : "0px", opacity: menuOpen ? 1 : 0 }}
      >
        <ul className="flex flex-col px-6 pb-6 pt-1 gap-4 text-xs tracking-widest uppercase">
          {LINKS.map((id) => (
            <li key={id}>
              <a href={`#${id}`} onClick={handleLinkClick} className="nav-link block">
                {id === "milestones" ? "milestone" : id}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
