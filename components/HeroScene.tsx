/**
 * Hero backdrop — a single elevation horizon line drifting gently side to
 * side, with the coordinate marker held static above it (echoes the
 * "52.2053° N, 0.1218° E" eyebrow above the headline). One element, one
 * transform, one animation — as simple as this gets. Pure CSS, no JS.
 */
export default function HeroScene({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`hero-contour ${className}`}
      viewBox="0 0 1400 440"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className="hero-scene-lines">
        <path
          d="M-60,215 C160,160 320,255 520,200 C700,150 830,235 1000,185 C1150,150 1280,215 1460,175"
          fill="none"
          stroke="var(--sage-mid)"
          strokeWidth="1"
          opacity="0.3"
        />
        <path
          d="M-60,275 C170,230 330,305 530,265 C710,225 840,290 1010,250 C1160,220 1290,270 1460,240"
          fill="none"
          stroke="var(--sage-mid)"
          strokeWidth="1"
          opacity="0.16"
        />
      </g>

      <g className="hero-scene-pin">
        <line x1="860" y1="164" x2="860" y2="196" stroke="var(--clay)" strokeWidth="1" opacity="0.6" />
        <line x1="844" y1="180" x2="876" y2="180" stroke="var(--clay)" strokeWidth="1" opacity="0.6" />
        <circle cx="860" cy="180" r="3" fill="var(--clay)" />
      </g>
    </svg>
  );
}
