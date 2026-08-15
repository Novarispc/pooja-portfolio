import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon (home-screen bookmark) — same monogram identity as the nav wordmark, larger canvas. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#46593f",
          color: "#f6f2ea",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontFamily: "serif",
        }}
      >
        PRK
      </div>
    ),
    { ...size }
  );
}
