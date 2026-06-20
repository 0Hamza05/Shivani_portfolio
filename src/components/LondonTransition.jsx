import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const PHOTOS = {
  bigBen:      '/images/life-in-london/optimised/life-in-london-op-2.webp',
  bridge:      '/images/life-in-london/optimised/life-in-london-op-6.webp',
  shard:       '/images/life-in-london/optimised/life-in-london-op-4.webp',
  eye:         '/images/life-in-london/optimised/life-in-london-op-3.webp',
  canaryWharf: '/images/life-in-london/optimised/life-in-london-op-9.webp',
};
const HERO = '/images/life-in-london/optimised/life-in-london-op-1.webp';

const NAVY      = '#0a0e1a';
const NAVY_EDGE = '#050710';
const GOLD_BACK  = 'rgba(201,168,117,0.34)';
const GOLD_MID   = 'rgba(201,168,117,0.58)';
const GOLD_FRONT = 'rgba(201,168,117,0.92)';

const EASE = [0.22, 1, 0.36, 1];

export default function LondonTransition({ onComplete }) {
  const [phase, setPhase] = useState(0);

  const prefersReduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => {
    [HERO, ...Object.values(PHOTOS)].forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  useEffect(() => {
    if (prefersReduced) { setTimeout(onComplete, 400); return; }
    const ts = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 3100),
      setTimeout(() => setPhase(3), 5100),
      setTimeout(() => setPhase(4), 6700),
      setTimeout(() => setPhase(5), 8200),
      setTimeout(onComplete, 9500),
    ];
    return () => ts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawn      = phase >= 1;
  const separated  = phase >= 2;
  const lit        = phase >= 3;
  const dissolving = phase >= 4;
  const revealed   = phase >= 5;

  const draw = (delay, duration = 0.9) => ({
    initial:    { pathLength: 0 },
    animate:    { pathLength: drawn ? 1 : 0 },
    transition: { duration, delay, ease: EASE },
  });

  return (
    <motion.div
      animate={{ opacity: revealed ? 0 : 1 }}
      transition={{ duration: revealed ? 1.3 : 0, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: NAVY,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        perspective: '1400px', perspectiveOrigin: '50% 46%',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 85% 75% at 50% 48%, transparent 40%, ${NAVY_EDGE} 100%)`,
      }} />

      {/* ─── 3D skyline scene ─── */}
      <motion.div
        animate={{
          scale:   dissolving ? 2.4 : separated ? 1.08 : 1,
          z:       dissolving ? 360 : separated ? 60 : 0,
          opacity: dissolving ? 0 : 1,
        }}
        transition={{
          scale:   { duration: dissolving ? 2.0 : 1.8, ease: EASE },
          z:       { duration: dissolving ? 2.0 : 1.8, ease: EASE },
          opacity: { duration: 1.3, ease: 'easeInOut', delay: dissolving ? 0.3 : 0 },
        }}
        style={{
          position: 'relative',
          width: 'min(92vw, 1400px)',
          aspectRatio: '1600 / 640',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* back plane — Canary Wharf cluster */}
        <motion.div
          animate={{ z: separated ? -130 : -30 }}
          transition={{ duration: 1.8, ease: EASE }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <svg viewBox="0 0 1600 640" style={{ width: '100%', height: '100%' }}>
            <defs>
              <clipPath id="lt-clip-cw">
                <rect x="70" y="320" width="58" height="240" />
                <rect x="160" y="260" width="66" height="300" />
                <polygon points="160,260 193,205 226,260" />
                <rect x="250" y="360" width="50" height="200" />
              </clipPath>
            </defs>
            <motion.g animate={{ opacity: lit ? 1 : 0 }} transition={{ duration: 1.1, ease: 'easeInOut' }}>
              <image href={PHOTOS.canaryWharf} x="60" y="200" width="250" height="360" clipPath="url(#lt-clip-cw)" preserveAspectRatio="xMidYMid slice" />
            </motion.g>
            <g fill="none" stroke={GOLD_BACK} strokeWidth="1.6">
              <motion.rect x="70" y="320" width="58" height="240" {...draw(0.30, 1.0)} />
              <motion.rect x="160" y="260" width="66" height="300" {...draw(0.38, 1.0)} />
              <motion.polygon points="160,260 193,205 226,260" {...draw(0.70, 0.7)} />
              <motion.rect x="250" y="360" width="50" height="200" {...draw(0.46, 1.0)} />
              <motion.rect x="1430" y="420" width="46" height="140" opacity={0.55} {...draw(0.90, 0.9)} />
              <motion.rect x="1490" y="450" width="40" height="110" opacity={0.55} {...draw(0.96, 0.9)} />
              <motion.rect x="1540" y="400" width="44" height="160" opacity={0.55} {...draw(1.02, 0.9)} />
            </g>
          </svg>
        </motion.div>

        {/* mid plane — The Shard + London Eye */}
        <motion.div
          animate={{ z: separated ? -20 : -10 }}
          transition={{ duration: 1.8, ease: EASE }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <svg viewBox="0 0 1600 640" style={{ width: '100%', height: '100%' }}>
            <defs>
              <clipPath id="lt-clip-shard">
                <polygon points="900,560 980,560 940,180" />
              </clipPath>
              <clipPath id="lt-clip-eye">
                <circle cx="1190" cy="400" r="140" />
              </clipPath>
            </defs>
            <motion.g animate={{ opacity: lit ? 1 : 0 }} transition={{ duration: 1.1, ease: 'easeInOut' }}>
              <image href={PHOTOS.shard} x="895" y="175" width="90" height="390" clipPath="url(#lt-clip-shard)" preserveAspectRatio="xMidYMid slice" />
              <image href={PHOTOS.eye} x="1045" y="255" width="290" height="290" clipPath="url(#lt-clip-eye)" preserveAspectRatio="xMidYMid slice" />
            </motion.g>
            <g fill="none" stroke={GOLD_MID} strokeWidth="1.8">
              <motion.polygon points="900,560 980,560 940,180" {...draw(1.30, 1.0)} />
              <motion.line x1="920" y1="560" x2="940" y2="180" opacity={0.5} {...draw(1.50, 0.9)} />
              <motion.line x1="960" y1="560" x2="940" y2="180" opacity={0.5} {...draw(1.50, 0.9)} />
              <motion.circle cx="1190" cy="400" r="140" {...draw(1.60, 1.1)} />
              <motion.line x1="1190" y1="400" x2="1190" y2="260" {...draw(2.00, 0.6)} />
              <motion.line x1="1190" y1="400" x2="1311" y2="330" {...draw(2.00, 0.6)} />
              <motion.line x1="1190" y1="400" x2="1311" y2="470" {...draw(2.00, 0.6)} />
              <motion.line x1="1190" y1="400" x2="1190" y2="540" {...draw(2.00, 0.6)} />
              <motion.line x1="1190" y1="400" x2="1069" y2="470" {...draw(2.00, 0.6)} />
              <motion.line x1="1190" y1="400" x2="1069" y2="330" {...draw(2.00, 0.6)} />
              <motion.line x1="1190" y1="400" x2="1100" y2="560" opacity={0.6} {...draw(2.10, 0.7)} />
              <motion.line x1="1190" y1="400" x2="1280" y2="560" opacity={0.6} {...draw(2.10, 0.7)} />
            </g>
          </svg>
        </motion.div>

        {/* front plane — Big Ben + Tower Bridge + horizon */}
        <motion.div
          animate={{ z: separated ? 95 : 20 }}
          transition={{ duration: 1.8, ease: EASE }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <svg viewBox="0 0 1600 640" style={{ width: '100%', height: '100%' }}>
            <defs>
              <clipPath id="lt-clip-bigben">
                <rect x="430" y="300" width="40" height="260" />
                <polygon points="430,300 450,225 470,300" />
                <circle cx="450" cy="335" r="15" />
              </clipPath>
              <clipPath id="lt-clip-bridge">
                <rect x="560" y="380" width="28" height="180" />
                <rect x="700" y="380" width="28" height="180" />
                <rect x="588" y="455" width="112" height="10" />
              </clipPath>
            </defs>
            <motion.g animate={{ opacity: lit ? 1 : 0 }} transition={{ duration: 1.1, ease: 'easeInOut' }}>
              <image href={PHOTOS.bigBen} x="420" y="215" width="60" height="345" clipPath="url(#lt-clip-bigben)" preserveAspectRatio="xMidYMid slice" />
              <image href={PHOTOS.bridge} x="550" y="360" width="190" height="200" clipPath="url(#lt-clip-bridge)" preserveAspectRatio="xMidYMid slice" />
            </motion.g>
            <g fill="none" stroke={GOLD_FRONT} strokeWidth="2">
              <motion.line x1="0" y1="560" x2="1600" y2="560" opacity={0.45} {...draw(0, 1.0)} />
              <motion.rect x="430" y="300" width="40" height="260" {...draw(0.70, 0.9)} />
              <motion.polygon points="430,300 450,225 470,300" {...draw(1.00, 0.6)} />
              <motion.circle cx="450" cy="335" r="15" {...draw(1.10, 0.6)} />
              <motion.rect x="560" y="380" width="28" height="180" {...draw(1.00, 0.9)} />
              <motion.rect x="556" y="368" width="36" height="14" {...draw(1.30, 0.5)} />
              <motion.rect x="700" y="380" width="28" height="180" {...draw(1.05, 0.9)} />
              <motion.rect x="696" y="368" width="36" height="14" {...draw(1.35, 0.5)} />
              <motion.rect x="588" y="455" width="112" height="10" {...draw(1.40, 0.7)} />
              <motion.line x1="574" y1="368" x2="588" y2="455" opacity={0.6} {...draw(1.50, 0.5)} />
              <motion.line x1="714" y1="368" x2="700" y2="455" opacity={0.6} {...draw(1.50, 0.5)} />
            </g>
          </svg>
        </motion.div>
      </motion.div>

      {/* hero dissolve */}
      <motion.img
        src={HERO}
        alt=""
        aria-hidden="true"
        animate={{ opacity: dissolving ? 1 : 0 }}
        transition={{ duration: 1.8, ease: EASE, delay: dissolving ? 0.2 : 0 }}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', pointerEvents: 'none',
        }}
      />

      {/* caption */}
      <motion.div
        animate={{ opacity: separated && !dissolving ? 1 : 0, y: separated ? 0 : 14 }}
        transition={{ duration: 1.0, ease: EASE }}
        style={{
          position: 'absolute', bottom: '11%', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px',
          pointerEvents: 'none',
        }}
      >
        <p style={{
          margin: 0,
          fontFamily: "'EB Garamond', serif",
          color: 'rgba(214,190,150,0.92)',
          fontSize: '1.0rem',
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Life in London
        </p>
        <div style={{
          width: '54px', height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(201,168,117,0.6), transparent)',
        }} />
        <p style={{
          margin: 0,
          fontFamily: "'EB Garamond', serif",
          color: 'rgba(180,160,125,0.5)',
          fontSize: '0.64rem',
          letterSpacing: '0.36em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Stage 9
        </p>
      </motion.div>
    </motion.div>
  );
}
