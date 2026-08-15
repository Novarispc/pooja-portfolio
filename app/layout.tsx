import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pooja Raviendran Kutty — Landscape Architect",
  description:
    "Portfolio of Pooja Raviendran Kutty, Landscape Architect based in Cambridge, UK. Landscape planning, LVIA, masterplanning, and nature-led design.",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    // First-time visitors (no stored preference) always get light mode,
    // regardless of OS/browser dark-mode setting. Once someone uses the
    // toggle, their explicit choice is remembered from then on.
    var stored = localStorage.getItem('prk-theme');
    var theme = stored || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint so the page never flashes the wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
