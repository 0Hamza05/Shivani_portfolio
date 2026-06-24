// Flat, hand-cut SVG butterfly matching the paper-memento icon language used
// elsewhere (BookIcon, PlantIcon, etc.) — same flat fills, no gradients/glow.
// Wings flap via a CSS scaleX squash on a single shared keyframe (cheap,
// GPU-friendly); flight is driven separately by whichever page mounts this.

// Inject once per page via <style>{BUTTERFLY_FLAP_CSS}</style> — keeps the
// keyframe definition in one place even though many <Butterfly> instances
// can be on screen at once.
export const BUTTERFLY_FLAP_CSS = `
  @keyframes bfly-flap {
    0%, 100% { transform: scaleX(1); }
    50%      { transform: scaleX(0.32); }
  }
  .bfly-wings {
    transform-box: view-box;
    transform-origin: 50px 50px;
    animation: bfly-flap var(--flap-duration, 0.65s) ease-in-out infinite;
    will-change: transform;
  }
  @media (prefers-reduced-motion: reduce) {
    .bfly-wings { animation: none; }
  }
`;

const UPPER_WING = 'M50 46 C62 18 92 14 92 34 C92 52 66 54 50 46 Z';
const LOWER_WING = 'M50 54 C60 64 80 66 78 82 C76 94 56 86 50 54 Z';

export default function Butterfly({
  size = 26,
  wingColor = '#F0A6C8',
  wingAccent = '#F7C6DE',
  bodyColor = '#6b4a55',
  flapDuration = 0.65,
  flap = true,
  style,
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))', ...style }}
      aria-hidden="true"
    >
      <g
        className={flap ? 'bfly-wings' : undefined}
        style={flap ? { '--flap-duration': `${flapDuration}s` } : undefined}
      >
        <path d={UPPER_WING} fill={wingColor} />
        <path d={LOWER_WING} fill={wingAccent} />
        <g transform="translate(100,0) scale(-1,1)">
          <path d={UPPER_WING} fill={wingColor} />
          <path d={LOWER_WING} fill={wingAccent} />
        </g>
      </g>
      <ellipse cx="50" cy="50" rx="2.4" ry="18" fill={bodyColor} />
      <path d="M48 33 C44 26 40 22 36 20" stroke={bodyColor} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M52 33 C56 26 60 22 64 20" stroke={bodyColor} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
