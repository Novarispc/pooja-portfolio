/**
 * Decorative topographic contour lines — a nod to the site-survey and
 * viewshed drawings central to landscape planning work. Pure SVG, no
 * interactivity; the drift animation and reduced-motion guard live in
 * globals.css (.contour-field).
 */
export default function ContourLines({ className = "" }: { className?: string }) {
  const lines = [
    { d: "M-100,60 C120,20 260,100 420,58 C580,16 700,90 860,54 C1020,18 1160,88 1340,50 C1420,44 1480,60 1560,52", delay: "0s", opacity: 0.32 },
    { d: "M-100,120 C100,150 240,80 400,124 C560,168 690,96 840,132 C1000,168 1140,100 1300,128 C1400,140 1470,120 1560,132", delay: "-6s", opacity: 0.22 },
    { d: "M-100,190 C140,220 280,160 440,196 C600,232 720,168 880,200 C1040,232 1180,172 1340,198 C1420,210 1480,196 1560,204", delay: "-13s", opacity: 0.26 },
    { d: "M-100,255 C110,225 260,290 420,252 C580,214 710,278 870,248 C1030,218 1160,272 1320,246 C1410,232 1480,248 1560,240", delay: "-21s", opacity: 0.18 },
    { d: "M-100,320 C130,350 270,296 430,326 C590,356 710,300 870,328 C1030,356 1170,304 1330,326 C1420,338 1480,326 1560,332", delay: "-29s", opacity: 0.24 },
    { d: "M-100,385 C120,358 250,412 410,380 C570,348 700,404 860,376 C1020,348 1160,398 1320,374 C1410,362 1480,376 1560,368", delay: "-37s", opacity: 0.16 },
  ];

  return (
    <svg
      className={`contour-field ${className}`}
      viewBox="0 0 1400 440"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {lines.map((line, i) => (
        <path
          key={i}
          d={line.d}
          fill="none"
          stroke="var(--sage-mid)"
          strokeWidth="1"
          strokeDasharray="10 7"
          style={{ opacity: line.opacity, animationDelay: line.delay }}
        />
      ))}
    </svg>
  );
}
