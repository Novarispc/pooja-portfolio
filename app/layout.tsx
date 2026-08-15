import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://pooja-portfolio-delta.vercel.app";
const TITLE = "Pooja Raviendran Kutty — Landscape Architect";
const DESCRIPTION =
  "Portfolio of Pooja Raviendran Kutty, Landscape Architect based in Cambridge, UK. Landscape planning, LVIA, masterplanning, and nature-led design.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: TITLE,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
