/**
 * Hero backdrop — three quiet contour rings around the coordinate marker
 * (echoes the "52.2053° N, 0.1218° E" eyebrow above the headline). One
 * subtle, slow breathing fade is the only motion — no draw-in sequence,
 * no rotation, no pulsing pings. Pure CSS, no JS.
 */
export default function HeroScene({ className = "" }: { className?: string }) {
  const rings = [
    { d: "M925,180 L901,206 L860,226 L817,208 L792,180 L818,153 L860,135 L904,152 Z", opacity: 0.3 },
    { d: "M1055,180 L982,252 L860,307 L731,256 L655,180 L735,107 L860,56 L992,103 Z", opacity: 0.2 },
    { d: "M1230,180 L1091,280 L860,356 L616,286 L472,180 L624,78 L860,7 L1110,72 Z", opacity: 0.12 },
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
          <path key={i} d={r.d} fill="none" stroke="var(--sage-mid)" strokeWidth="1" style={{ opacity: r.opacity }} />
        ))}
      </g>

      <g className="hero-scene-pin">
        <line x1="860" y1="164" x2="860" y2="196" stroke="var(--clay)" strokeWidth="1" opacity="0.6" />
        <line x1="844" y1="180" x2="876" y2="180" stroke="var(--clay)" strokeWidth="1" opacity="0.6" />
        <circle cx="860" cy="180" r="3" fill="var(--clay)" />
      </g>
    </svg>
  );
}
