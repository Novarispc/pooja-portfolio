import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser-tab favicon — a single-letter monogram in the site's sage green, matching the nav's "PRK" wordmark identity. */
export default function Icon() {
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
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
