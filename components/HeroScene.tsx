/**
 * Hero backdrop — a "survey reveal": concentric, irregular contour rings
 * draw themselves in around the coordinate marker on load (echoing the
 * "52.2053° N, 0.1218° E" eyebrow above the headline), then drift in a
 * very slow ambient rotation while the site marker pulses like a located
 * GPS point. Pure CSS keyframes — no JS, no client component needed.
 * Reduced-motion gets a static, fully-drawn version (see globals.css).
 */
export default function HeroScene({ className = "" }: { className?: string }) {
  const rings = [
    { d: "M925,180 L901,206 L860,226 L817,208 L792,180 L818,153 L860,135 L904,152 Z", opacity: 0.5, delay: "0.05s" },
    { d: "M985,180 L938,229 L860,266 L778,232 L729,180 L780,130 L860,96 L944,127 Z", opacity: 0.42, delay: "0.22s" },
    { d: "M1055,180 L982,252 L860,307 L731,256 L655,180 L735,107 L860,56 L992,103 Z", opacity: 0.34, delay: "0.4s" },
    { d: "M1135,180 L1032,273 L860,343 L678,278 L571,180 L684,85 L860,20 L1045,80 Z", opacity: 0.26, delay: "0.58s" },
    { d: "M1230,180 L1091,280 L860,356 L616,286 L472,180 L624,78 L860,7 L1110,72 Z", opacity: 0.18, delay: "0.76s" },
  ];

  return (
    <svg
      className={`hero-contour ${className}`}
      viewBox="0 0 1400 440"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className="hero-scene-rings">
        {rings.map((r, i) => (
          <path
            key={i}
            d={r.d}
            fill="none"
            stroke="var(--sage-mid)"
            strokeWidth="1"
            pathLength={1}
            style={{ opacity: r.opacity, animationDelay: r.delay }}
          />
        ))}
      </g>

      <g className="hero-scene-pin">
        <line x1="860" y1="162" x2="860" y2="198" stroke="var(--clay)" strokeWidth="1" opacity="0.7" />
        <line x1="842" y1="180" x2="878" y2="180" stroke="var(--clay)" strokeWidth="1" opacity="0.7" />
        <circle className="ping" cx="860" cy="180" r="4" />
        <circle className="ping" cx="860" cy="180" r="4" />
        <circle className="ping" cx="860" cy="180" r="4" />
        <circle className="core" cx="860" cy="180" r="3.5" fill="var(--clay)" />
      </g>
    </svg>
  );
}
