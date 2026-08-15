import { ImageResponse } from "next/og";
import { readContent } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Share-card image shown when the site's link is pasted into LinkedIn,
 * X, iMessage, Slack, etc. Generated from the live published hero content
 * (name, role, tagline, coordinate) so it stays in sync automatically —
 * no separate asset to remember to update.
 */
export default async function OgImage() {
  const c = await readContent();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          background: "#f6f2ea",
          color: "#232f22",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#b8825a" }}>
          {c.hero.coord}
        </div>
        <div style={{ display: "flex", fontSize: 78, lineHeight: 1.08, marginTop: 26, marginBottom: 22 }}>
          {c.hero.name.replace(/\n/g, " ")}
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#46593f" }}>{c.hero.role}</div>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "#767a6f", marginTop: 20 }}>
          {c.hero.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
