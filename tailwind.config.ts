import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F5F1E9",
        card: "#EAE5DA",
        invert: "#243423",
        headtext: "#253224",
        bodytext: "#2F342D",
        mute: "#7A7D74",
        sage: "#4A5E48",
        sagemid: "#6B8268",
        sagelight: "#A8BAA0",
        sagepale: "#DDE8DA",
        clay: "#BE8D65",
        claylight: "#D9AC87",
        navsurface: "#3D5039",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
