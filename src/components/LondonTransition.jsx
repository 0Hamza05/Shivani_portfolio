import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const COVER = '/images/life-in-london/optimised/life-in-london-op-1.webp';
const N = 7;

// Skeleton key — 200×340 viewBox
const KEY =
  'M 100 8 a 82 82 0 1 0 0.001 0 Z ' +
  'M 100 48 a 42 42 0 1 0 0.001 0 Z ' +
  'M 86 172 L 86 312 L 114 312 L 114 172 Z ' +
  'M 114 240 L 158 240 L 158 262 L 114 262 Z ' +
  'M 114 278 L 142 278 L 142 298 L 114 298 Z';

// Full-bleed dark mask punched out with key shape
const MASK = 'M -200 -200 L 400 -200 L 400 540 L -200 540 Z ' + KEY;

const EASE      = [0.16, 1, 0.3, 1];
const EASE_RUSH = [0.7, 0, 1, 1];

const PARTICLES = Array.from({ length: 30 }, (_, i) => {
  const r = s => ((s * 9301 + 49297) % 233280) / 233280;
  const s = i + 1;
  return {
    id:     i,
    left:   3  + r(s)      * 94,
    top:    3  + r(s * 7)  * 94,
    size:   0.8 + r(s * 13) * 2.6,
    dur:    5  + r(s * 17) * 7,
    delay:  r(s * 23) * 9,
    driftY: -(22 + r(s * 29) * 85),
    driftX: (r(s * 31) - 0.5) * 55,
    alpha:  0.35 + r(s * 37) * 0.5,
  };
});

export default function LondonTransition({ onComplete }) {
  const [phase, setPhase]   = useState(0);
  const [mobile, setMobile] = useState(false);

  const prefersReduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => { const img = new Image(); img.src = COVER; }, []);

  useEffect(() => {
    setMobile(window.innerWidth < 760);
    const h = () => setMobile(window.innerWidth < 760);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    if (prefersReduced) { setTimeout(onComplete, 400); return; }
    const ts = [
      setTimeout(() => setPhase(1),  500),   // key outline draws + bloom
      setTimeout(() => setPhase(2),  2600),  // slices converge + text
      setTimeout(() => setPhase(3),  4600),  // unlock flash → camera rush
      setTimeout(() => setPhase(4),  6000),  // key dissolves
      setTimeout(() => setPhase(5),  7000),  // fade to black
      setTimeout(onComplete,         8300),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  // Slices spread on both axes so they converge from a "scattered" state
  const mid    = (N - 1) / 2;
  const slices = Array.from({ length: N }, (_, i) => {
    const d   = i - mid;
    const abs = Math.abs(d);
    return {
      i,
      colLeft:    (i / N) * 100,
      colRight:   100 - ((i + 1) / N) * 100,
      scale:      1 + (mid - abs) * 0.055,
      brightness: 0.35 + (mid - abs) * 0.15,
      blur:       abs * 0.9,
      y:          d * 28,
      x:          d * 12,
      delay:      abs * 0.13,
    };
  });

  const kW = mobile ? 162 : 272;
  const kH = mobile ? 275 : 462;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase >= 5 ? 0 : 1 }}
      transition={{ duration: phase >= 5 ? 1.4 : 0.35, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#060609',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: '1200px', perspectiveOrigin: '50% 44%',
        overflow: 'hidden',
      }}
    >
      {/* Cinematic vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse 80% 72% at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)',
      }} />

      {/* Large outer amber bloom */}
      <motion.div
        style={{
          position: 'absolute', zIndex: 0,
          width: '110vmax', height: '110vmax',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,132,58,0.10) 0%, rgba(90,65,18,0.04) 55%, transparent 72%)',
          pointerEvents: 'none',
        }}
        animate={{
          scale:   phase >= 3 ? 4.2 : phase >= 1 ? 1 : 0.25,
          opacity: phase >= 4 ? 0   : phase >= 1 ? 1 : 0,
        }}
        transition={{ duration: phase >= 3 ? 3.2 : 1.6, ease: EASE }}
      />

      {/* Tight inner warm bloom */}
      <motion.div
        style={{
          position: 'absolute', zIndex: 0,
          width: '42vmax', height: '42vmax',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(215,175,80,0.20) 0%, rgba(145,105,35,0.09) 55%, transparent 76%)',
          pointerEvents: 'none',
        }}
        animate={{
          scale:   phase >= 3 ? 6.0 : phase >= 1 ? 1 : 0.25,
          opacity: phase >= 4 ? 0   : phase >= 1 ? 1 : 0,
        }}
        transition={{ duration: phase >= 3 ? 3.2 : 1.1, ease: EASE, delay: 0.15 }}
      />

      {/* Dust particles */}
      {phase >= 1 && PARTICLES.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute', zIndex: 2,
            left: `${p.left}%`, top: `${p.top}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: `rgba(220,190,110,${p.alpha})`,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, p.alpha, 0], x: p.driftX, y: p.driftY }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ─── Key container ─── */}
      <motion.div
        style={{
          position: 'relative', zIndex: 3,
          width: `${kW}px`, height: `${kH}px`,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        animate={{
          opacity:  phase >= 1 ? (phase >= 4 ? 0 : 1) : 0,
          scale:    phase >= 3 ? 5.2 : phase >= 1 ? 1 : 0.46,
          rotateY:  phase >= 3 ? 1   : phase >= 1 ? -5 : -20,
          z:        phase >= 3 ? 520 : 0,
        }}
        transition={{
          opacity:  { duration: 0.9 },
          scale:    { duration: phase >= 3 ? 3.2 : 1.15, ease: phase >= 3 ? EASE_RUSH : EASE },
          rotateY:  { duration: phase >= 3 ? 3.2 : 1.45, ease: EASE },
          z:        { duration: 3.2, ease: EASE_RUSH },
        }}
      >
        {/* Slices — scattered then converge */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {slices.map(({ i, colLeft, colRight, scale, brightness, blur, y, x, delay }) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute', inset: 0,
                clipPath: `inset(0 ${colRight}% 0 ${colLeft}%)`,
                willChange: 'transform, filter, opacity',
              }}
              animate={
                phase >= 2
                  ? { opacity: 1, y: 0, x: 0, scale: 1, filter: 'brightness(1) blur(0px)' }
                  : { opacity: 0, y, x, scale, filter: `brightness(${brightness}) blur(${blur}px)` }
              }
              transition={{
                duration: mobile ? 0.95 : 1.55,
                delay:    phase >= 2 ? delay : 0,
                ease:     EASE,
              }}
            >
              <img
                src={COVER} loading="lazy" alt="" aria-hidden="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
              />
            </motion.div>
          ))}
        </div>

        {/* SVG overlay — mask + animated border */}
        <svg
          viewBox="0 0 200 340"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ltG1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="rgba(248,228,140,0.96)" />
              <stop offset="20%"  stopColor="rgba(202,170,72,0.89)" />
              <stop offset="50%"  stopColor="rgba(255,248,182,0.99)" />
              <stop offset="80%"  stopColor="rgba(222,188,88,0.92)" />
              <stop offset="100%" stopColor="rgba(180,150,58,0.86)" />
            </linearGradient>
            {/* SVG-native clipPath for the shine sweep */}
            <clipPath id="ltKeyClip">
              <path d={KEY} fillRule="evenodd" />
            </clipPath>
            <filter id="ltHalo" x="-40%" y="-32%" width="180%" height="164%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b" />
              <feColorMatrix in="b" type="matrix"
                values="0 0 0 0 0.92 0 0 0 0 0.78 0 0 0 0 0.28 0 0 0 0.7 0" result="g" />
              <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ltEdge" x="-28%" y="-22%" width="156%" height="144%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="b" />
              <feColorMatrix in="b" type="matrix"
                values="0 0 0 0 0.90 0 0 0 0 0.76 0 0 0 0 0.26 0 0 0 0.95 0" result="g" />
              <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Dark mask — everything outside the key */}
          <path d={MASK} fill="#060609" fillRule="evenodd" />

          {/* Solid metallic fill — fades out as photo appears */}
          <motion.path
            d={KEY} fill="url(#ltG1)" fillRule="evenodd"
            animate={{ opacity: phase >= 2 ? 0 : 0.80 }}
            transition={{ duration: 1.2 }}
          />

          {/* Outer soft halo border */}
          <motion.path
            d={KEY} fill="none" stroke="url(#ltG1)" strokeWidth="7"
            fillRule="evenodd" filter="url(#ltHalo)"
            animate={{ opacity: phase >= 4 ? 0 : phase >= 1 ? 0.50 : 0 }}
            transition={{ duration: 1.0 }}
          />

          {/* Primary border — draws itself in */}
          <motion.path
            d={KEY} fill="none" stroke="url(#ltG1)" strokeWidth="2.8"
            fillRule="evenodd" filter="url(#ltEdge)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: phase >= 1 ? 1 : 0,
              opacity:    phase >= 4 ? 0 : phase >= 1 ? 1 : 0,
            }}
            transition={{
              pathLength: { duration: 2.1, ease: [0.4, 0, 0.6, 1], delay: 0.05 },
              opacity:    { duration: 0.35 },
            }}
          />

          {/* Shimmer sweep — plays once when slices converge */}
          {phase >= 2 && phase < 3 && (
            <motion.rect
              width="90" height="340" y="0"
              fill="rgba(255,252,200,0.22)"
              clipPath="url(#ltKeyClip)"
              initial={{ x: -90 }}
              animate={{ x: 290 }}
              transition={{ duration: 1.0, delay: 1.0, ease: [0.4, 0, 0.6, 1] }}
            />
          )}

          {/* Unlock flash — gold pulse when camera starts rushing */}
          {phase >= 3 && (
            <motion.path
              key="flash"
              d={KEY} fill="rgba(255,248,190,0.55)" fillRule="evenodd"
              stroke="rgba(255,252,210,0.95)" strokeWidth="3.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.7, times: [0, 0.22, 1], ease: 'easeOut' }}
            />
          )}
        </svg>
      </motion.div>

      {/* Text block — appears with slices */}
      <motion.div
        style={{
          position: 'absolute', bottom: '10%', zIndex: 4,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px',
          pointerEvents: 'none',
        }}
        animate={{
          opacity: phase >= 2 && phase < 5 ? 1 : 0,
          y:       phase >= 2 ? 0 : 20,
        }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <p style={{
          margin: 0,
          fontFamily: "'EB Garamond', serif",
          color: 'rgba(228, 198, 118, 0.94)',
          fontSize: mobile ? '0.78rem' : '1.00rem',
          letterSpacing: '0.52em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Life in London
        </p>
        <div style={{
          width: mobile ? '44px' : '58px', height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(215,178,88,0.65), transparent)',
        }} />
        <p style={{
          margin: 0,
          fontFamily: "'EB Garamond', serif",
          color: 'rgba(188,155,72,0.52)',
          fontSize: mobile ? '0.58rem' : '0.66rem',
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Stage 9
        </p>
      </motion.div>
    </motion.div>
  );
}
