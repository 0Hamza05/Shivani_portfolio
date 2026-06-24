import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Butterfly, { BUTTERFLY_FLAP_CSS } from '../components/Butterfly';

const COUNT_DURATION_MS = 2800;

// Near-white/cream wings (not gradient-matching pastels — those camouflaged
// against the rainbow background almost completely) with a tinted underwing
// accent for variety, so every butterfly stays legible no matter where the
// gradient has cycled to.
const BUTTERFLY_PALETTE = [
  { wing: '#FFFDF7', accent: '#FFE3EC', body: '#5a3d44' }, // cream + pink accent
  { wing: '#FFFCF0', accent: '#FFEFD2', body: '#5a4a30' }, // cream + gold accent
  { wing: '#FAFFF5', accent: '#DFF5E0', body: '#33402f' }, // cream + mint accent
  { wing: '#F8FAFF', accent: '#E1E6FB', body: '#2f3350' }, // cream + lavender accent
  { wing: '#FCF8FF', accent: '#F0DFFA', body: '#4a3552' }, // cream + purple accent
];

const clamp01 = v => Math.min(0.97, Math.max(0.03, v));

// Generates a population of lazy circular flight loops, spread across the
// viewport via a golden-ratio sequence so anchors don't cluster, each with
// its own radius/duration/delay so none of them look synchronized. Delays
// stay short — the welcome screen only lives ~3.2s, so butterflies need to
// be on screen almost immediately to register.
function buildWelcomeButterflies(count) {
  return Array.from({ length: count }, (_, i) => {
    const cx = (i * 0.6180339887) % 1;
    const cy = (i * 0.4142135624) % 1;
    const rx = 0.08 + (i % 4) * 0.025;
    const ry = 0.08 + (i % 5) * 0.022;
    const angleOffset = ((i * 47) % 360) * (Math.PI / 180);
    const x = [0, 1, 2, 3, 0].map(k => clamp01(cx + Math.cos(angleOffset + (k / 4) * Math.PI * 2) * rx));
    const y = [0, 1, 2, 3, 0].map(k => clamp01(cy + Math.sin(angleOffset + (k / 4) * Math.PI * 2) * ry));
    return {
      palette: i % BUTTERFLY_PALETTE.length,
      size: 18 + (i % 6) * 2,
      flap: 0.55 + (i % 5) * 0.045,
      duration: 14 + (i % 7) * 1.4,
      delay: 0.3 + (i % 9) * 0.13,
      rotate: i % 2 === 0 ? [0, -10, 8, -6, 0] : [0, 9, -7, 5, 0],
      x, y,
    };
  });
}

const WELCOME_BUTTERFLIES = buildWelcomeButterflies(20);

function WelcomeButterflies({ shouldReduceMotion }) {
  const [vp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  return WELCOME_BUTTERFLIES.map((b, i) => {
    const c = BUTTERFLY_PALETTE[b.palette];
    const xs = b.x.map(f => f * vp.w);
    const ys = b.y.map(f => f * vp.h);

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.6, x: xs[0], y: ys[0] }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.9, scale: 1, x: xs[0], y: ys[0] }
            : { opacity: [0, 0.9, 0.9, 0.9, 0.9], scale: 1, x: xs, y: ys, rotate: b.rotate }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.8, delay: b.delay }
            : { duration: b.duration, delay: b.delay, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
        }
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        <Butterfly
          size={b.size}
          wingColor={c.wing}
          wingAccent={c.accent}
          bodyColor={c.body}
          flapDuration={b.flap}
          flap={!shouldReduceMotion}
        />
      </motion.div>
    );
  });
}

const SWEEP_MS = 1100; // one pass of the brick train across the track

function LoadingBar({ onComplete }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setTimeout(onComplete, COUNT_DURATION_MS + 450);
    return () => clearTimeout(id);
  }, [onComplete]);

  return (
    <div
      className="loading-bar-track"
      style={{
        position: 'relative',
        width: 'clamp(180px, 30vw, 260px)',
        height: 'clamp(34px, 5vh, 46px)',
        borderRadius: '999px',
        background: '#fff',
        border: '2px solid rgba(20,20,20,0.16)',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.7), inset 0 -3px 5px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.14)',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      <div
        className={shouldReduceMotion ? undefined : 'loading-bar-group'}
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          display: 'flex',
          gap: '6px',
          transform: shouldReduceMotion ? 'translate(40%, -50%)' : undefined,
          '--sweep-ms': `${SWEEP_MS}ms`,
        }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 'clamp(14px, 2.4vw, 20px)',
              height: 'clamp(24px, 3.5vh, 32px)',
              borderRadius: '6px',
              background: 'linear-gradient(180deg, #ff8fbb, #e8378a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.55), inset 0 -2px 3px rgba(0,0,0,0.18)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Welcome({ onDismiss }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 1 }}
      className="welcome-bg"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(45deg, #F09EA7, #F6CA94, #FAFABE, #C1EBC0, #C7CAFF, #CDABEB, #F6C2F3)',
        backgroundSize: '400% 400%',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <style>{`
        @keyframes gradientBG {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .welcome-bg {
          animation: gradientBG 15s ease infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .welcome-bg {
            animation: none;
            background-position: 0% 50%;
          }
        }
        @keyframes loading-bar-sweep {
          from { transform: translate(-150%, -50%); }
          to   { transform: translate(350%, -50%); }
        }
        .loading-bar-group {
          animation: loading-bar-sweep var(--sweep-ms, 1100ms) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-bar-group { animation: none; }
        }
        ${BUTTERFLY_FLAP_CSS}
      `}</style>

      <WelcomeButterflies shouldReduceMotion={shouldReduceMotion} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '100px 32px 64px' }}>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.h1
            initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.5, duration: shouldReduceMotion ? 0 : 1 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em', textTransform: 'lowercase' }}
          >
            welcome to my portfolio
          </motion.h1>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: shouldReduceMotion ? 0 : 1, duration: shouldReduceMotion ? 0 : 1 }}
        >
          <LoadingBar onComplete={onDismiss} />
        </motion.div>
      </div>
    </motion.div>
  );
}
