import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Context ──────────────────────────────────────────────────────────────────
const NotebookTransitionContext = createContext(null);

export function useNotebookTransition() {
  const ctx = useContext(NotebookTransitionContext);
  if (!ctx) throw new Error('useNotebookTransition must be inside NotebookTransitionProvider');
  return ctx;
}

// ─── Static dust particle definitions ─────────────────────────────────────────
// Pre-seeded for consistency. Three drift patterns cycled by index.
const DUST = [
  { left: '11%', top: '34%', r: 1.6, dur: 5.4, del: 0.2, pat: 0 },
  { left: '29%', top: '21%', r: 1.1, dur: 4.2, del: 1.0, pat: 1 },
  { left: '44%', top: '66%', r: 1.9, dur: 6.1, del: 0.4, pat: 2 },
  { left: '61%', top: '17%', r: 1.4, dur: 4.9, del: 1.6, pat: 0 },
  { left: '77%', top: '43%', r: 1.0, dur: 5.8, del: 0.7, pat: 1 },
  { left: '19%', top: '79%', r: 1.7, dur: 3.8, del: 1.2, pat: 2 },
  { left: '54%', top: '29%', r: 1.3, dur: 6.3, del: 0.3, pat: 0 },
  { left: '86%', top: '69%', r: 1.8, dur: 4.3, del: 0.9, pat: 1 },
  { left: '37%', top: '84%', r: 1.0, dur: 5.6, del: 1.8, pat: 2 },
  { left: '71%', top: '54%', r: 1.5, dur: 4.1, del: 0.5, pat: 0 },
  { left: '8%',  top: '55%', r: 1.2, dur: 7.0, del: 2.1, pat: 1 },
  { left: '92%', top: '32%', r: 1.4, dur: 4.7, del: 0.8, pat: 2 },
];

const DUST_ANIM = ['nb-dust-a', 'nb-dust-b', 'nb-dust-c'];

// ─── Provider ─────────────────────────────────────────────────────────────────
export function NotebookTransitionProvider({ children }) {
  const [active,    setActive]    = useState(false);
  const [dissolved, setDissolved] = useState(false);
  const [landed,    setLanded]    = useState(false);
  // Mouse parallax — resets to 0 when inactive
  const [mousePx,   setMousePx]   = useState({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const timers    = useRef([]);

  const schedule = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // ── Mouse parallax: only while overlay is visible ───────────────────────────
  useEffect(() => {
    if (!active) { setMousePx({ x: 0, y: 0 }); return; }
    let raf;
    const handler = (e) => {
      // rAF-throttled so we never set state faster than 60fps
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        setMousePx({
          x: ((e.clientX - cx) / cx) * 10,
          y: ((e.clientY - cy) / cy) *  6,
        });
      });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active]);

  const triggerTransition = useCallback((navigate, to) => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearAll();

    setActive(true);
    setDissolved(false);
    setLanded(false);
    document.body.classList.add('nb-sweeping');

    // Notebook visually at rest by ~640ms — start breathing + flutter
    schedule(() => setLanded(true),  640);

    // Navigate early — new page renders behind the overlay
    schedule(() => navigate(to),      680);

    // Book "opens": warm glow + dissolve veil begins
    schedule(() => {
      setDissolved(true);
      document.body.classList.remove('nb-sweeping');
    }, 960);

    // Unmount after veil completes
    schedule(() => {
      setActive(false);
      setDissolved(false);
      setLanded(false);
      activeRef.current = false;
    }, 2050);
  }, []);

  return (
    <NotebookTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      {/* ── Global styles ── */}
      <style>{`
        /* Navbar: desaturate + darken + slight blur — strips the striped BG */
        body.nb-sweeping nav {
          filter: saturate(0.03) brightness(0.24) blur(1.5px) !important;
        }
        /* Main content: dim + very soft blur to push attention inward */
        body.nb-sweeping #main-wrap {
          filter:  brightness(0.68) blur(0.5px);
          opacity: 0.62;
        }

        /* ── Film grain tile-shift animation ── */
        @keyframes nb-grain {
           0% { transform: translate(  0%,   0%) }
          10% { transform: translate( -4%,  -3%) }
          20% { transform: translate(  3%,  -4%) }
          30% { transform: translate( -2%,   4%) }
          40% { transform: translate(  4%,   2%) }
          50% { transform: translate( -4%,   1%) }
          60% { transform: translate(  2%,  -4%) }
          70% { transform: translate( -3%,   4%) }
          80% { transform: translate(  3%,  -2%) }
          90% { transform: translate( -2%,   3%) }
         100% { transform: translate(  0%,   0%) }
        }
        .nb-grain { animation: nb-grain 0.72s steps(1) infinite; }

        /* ── Ambient shadow flicker ── */
        @keyframes nb-shadow-flicker {
          0%, 100% { opacity: 0.92; transform: scaleX(1.00) scaleY(1.00); }
             28%   { opacity: 0.79; transform: scaleX(1.04) scaleY(0.93); }
             62%   { opacity: 0.96; transform: scaleX(0.96) scaleY(1.04); }
        }
        .nb-shadow-flicker { animation: nb-shadow-flicker 2.6s ease-in-out infinite; }

        /* ── Contact shadow (tighter, faster flicker) ── */
        @keyframes nb-contact-flicker {
          0%, 100% { opacity: 0.72; }
             45%   { opacity: 0.62; }
        }
        .nb-contact-shadow { animation: nb-contact-flicker 1.7s ease-in-out infinite; }

        /* ── Dust float patterns ── */
        @keyframes nb-dust-a {
          0%   { transform: translate(0, 0) scale(1.0); opacity: 0; }
          12%  { opacity: 0.55; }
          88%  { opacity: 0.30; }
          100% { transform: translate(9px, -34px) scale(0.48); opacity: 0; }
        }
        @keyframes nb-dust-b {
          0%   { transform: translate(0, 0) scale(1.0); opacity: 0; }
          12%  { opacity: 0.44; }
          88%  { opacity: 0.22; }
          100% { transform: translate(-12px, -26px) scale(0.40); opacity: 0; }
        }
        @keyframes nb-dust-c {
          0%   { transform: translate(0, 0) scale(1.0); opacity: 0; }
          15%  { opacity: 0.36; }
          85%  { opacity: 0.18; }
          100% { transform: translate(4px, -19px) scale(0.58); opacity: 0; }
        }

        /* ── Ambient bloom pulse behind notebook ── */
        @keyframes nb-bloom {
          0%, 100% { opacity: 0.09; transform: scale(1.00); }
             50%   { opacity: 0.17; transform: scale(1.06); }
        }
        .nb-bloom { animation: nb-bloom 3.4s ease-in-out infinite; }

        /* ── Light shimmer sweep across cover — every ~4s ── */
        @keyframes nb-shimmer {
          0%   { transform: translateX(-90%) skewX(-10deg); opacity: 0; }
          10%  { opacity: 0.18; }
          55%  { opacity: 0.10; }
          100% { transform: translateX(180%) skewX(-10deg); opacity: 0; }
        }
        .nb-shimmer { animation: nb-shimmer 4.2s ease-in-out 1.2s infinite; }

        /* ── Soft opacity breathing on page interior ── */
        @keyframes nb-page-breathe {
          0%, 100% { opacity: 0.80; }
             50%   { opacity: 0.92; }
        }
        .nb-page-breathe { animation: nb-page-breathe 3.2s ease-in-out infinite; }

        /* ── Reduced motion: silent fallback ── */
        @media (prefers-reduced-motion: reduce) {
          .nb-content { display: none !important; }
          body.nb-sweeping nav,
          body.nb-sweeping #main-wrap {
            filter:  none !important;
            opacity: 1   !important;
          }
          .nb-grain, .nb-shadow-flicker, .nb-contact-shadow,
          .nb-bloom, .nb-shimmer, .nb-page-breathe { animation: none !important; }
        }
      `}</style>

      <AnimatePresence>
        {active && (
          <motion.div
            key="nb-overlay"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.20, ease: 'easeOut' }}
            style={{
              position:      'fixed',
              inset:          0,
              zIndex:         850,
              pointerEvents: 'none',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              overflow:       'hidden',
            }}
          >
            {/* ── Backdrop: charcoal-brown; extends beyond viewport for parallax pan ── */}
            <motion.div
              animate={{ x: -mousePx.x * 0.12, y: -mousePx.y * 0.08 }}
              transition={{ type: 'spring', stiffness: 36, damping: 22 }}
              style={{
                position:  'absolute',
                inset:     '-10%',
                width:     '120%',
                height:    '120%',
                background: `
                  radial-gradient(
                    ellipse 100% 92% at 50% 44%,
                    rgba(32, 20, 11, 0.96) 0%,
                    rgba(16, 9,  4,  0.98) 100%
                  )
                `,
              }}
            />

            {/* ── Vignette: heavy corner darkening ── */}
            <div
              style={{
                position:  'absolute',
                inset:      0,
                background: 'radial-gradient(ellipse 62% 58% at 50% 44%, transparent 20%, rgba(5, 2, 1, 0.82) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* ── Ambient bloom: soft warm radial glow behind notebook ── */}
            <div
              className="nb-bloom"
              style={{
                position:  'absolute',
                inset:     '-24%',
                width:     '148%',
                height:    '148%',
                background: 'radial-gradient(ellipse 36% 30% at 50% 43%, rgba(190, 120, 46, 0.22) 0%, transparent 50%)',
                filter:    'blur(24px)',
                pointerEvents: 'none',
              }}
            />

            {/* ── Film grain ── */}
            <div
              className="nb-grain"
              style={{
                position:        'absolute',
                inset:           '-18%',
                width:           '136%',
                height:          '136%',
                opacity:          0.058,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize:  '180px 180px',
                pointerEvents:   'none',
              }}
            />

            {/* ── Floating dust particles ── */}
            {DUST.map((d, i) => (
              <div
                key={i}
                style={{
                  position:      'absolute',
                  left:           d.left,
                  top:            d.top,
                  width:         `${d.r * 2}px`,
                  height:        `${d.r * 2}px`,
                  borderRadius:  '50%',
                  background:    'rgba(218, 182, 126, 0.90)',
                  boxShadow:     `0 0 ${d.r * 2}px rgba(218,182,126,0.40)`,
                  animation:     `${DUST_ANIM[d.pat]} ${d.dur}s ease-in-out ${d.del}s infinite`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* ── Notebook container: camera push-in + mouse parallax (foreground) ── */}
            <motion.div
              className="nb-content"
              initial={{ scale: 0.90 }}
              animate={{
                scale: 1.0,
                x: mousePx.x * 0.30,
                y: mousePx.y * 0.20,
              }}
              transition={{
                scale: { type: 'spring', stiffness: 58, damping: 17 },
                x:     { type: 'spring', stiffness: 42, damping: 22 },
                y:     { type: 'spring', stiffness: 42, damping: 22 },
              }}
              style={{ position: 'relative', marginTop: '-5vh' }}
            >
              {/* Cinematic perspective drift — straightens as book settles */}
              <motion.div
                initial={{ skewY: 1.4 }}
                animate={{ skewY: 0 }}
                transition={{ type: 'spring', stiffness: 70, damping: 20, delay: 0.06 }}
              >
                {/* ── Spring fall: heavy, with rotational inertia ── */}
                <motion.div
                  initial={{ y: -590, rotate: 9.0, opacity: 0 }}
                  animate={{ y: 0,    rotate: 0,   opacity: 1 }}
                  transition={{
                    y:       { type: 'spring', stiffness: 102, damping: 9.2, mass: 1.9 },
                    rotate:  { type: 'spring', stiffness: 180, damping: 18 },
                    opacity: { duration: 0.11, ease: 'easeOut' },
                  }}
                  style={{ position: 'relative' }}
                >
                  {/* ── Landing compression — brief impact squish ── */}
                  <motion.div
                    animate={
                      landed
                        ? {
                            scaleY: [1, 0.978, 1.010, 0.998, 1],
                            scaleX: [1, 1.014, 0.996, 1.002, 1],
                          }
                        : {}
                    }
                    transition={
                      landed
                        ? {
                            duration: 0.40,
                            ease: [0.16, 1, 0.3, 1],
                            times: [0, 0.16, 0.50, 0.78, 1],
                          }
                        : { duration: 0 }
                    }
                    style={{ position: 'relative', transformOrigin: 'center 94%' }}
                  >
                    {/* ── Idle breathing + secondary motion after landing ── */}
                    <motion.div
                      animate={
                        landed && !dissolved
                          ? {
                              y:      [0, -3.0,  0.8,  0],
                              rotate: [0,  0.30, -0.12, 0],
                              scale:  [1,  1.004, 0.999, 1],
                            }
                          : { y: 0, rotate: 0, scale: 1 }
                      }
                      transition={
                        landed && !dissolved
                          ? { repeat: Infinity, duration: 2.7, ease: 'easeInOut' }
                          : { duration: 0 }
                      }
                      style={{ position: 'relative' }}
                    >
                      {/* ── Ambient shadow (large, diffuse, delayed response) ── */}
                      <motion.div
                        className="nb-shadow-flicker"
                        initial={{ opacity: 0, scaleX: 0.38, scaleY: 0.48 }}
                        animate={{
                          opacity: dissolved ? 0    : 0.90,
                          scaleX:  dissolved ? 0.50 : 1,
                          scaleY:  dissolved ? 0.42 : 1,
                        }}
                        transition={{
                          opacity: { type: 'spring', stiffness: 68, damping: 12, delay: 0.14 },
                          scaleX:  { type: 'spring', stiffness: 68, damping: 12, delay: 0.08 },
                          scaleY:  { type: 'spring', stiffness: 68, damping: 12, delay: 0.08 },
                        }}
                        style={{
                          position:      'absolute',
                          bottom:        '-34px',
                          left:          '5%',
                          width:         '90%',
                          height:        '38px',
                          background:    'radial-gradient(ellipse, rgba(0,0,0,0.84) 0%, transparent 68%)',
                          filter:        'blur(18px)',
                          pointerEvents: 'none',
                          transformOrigin: 'center',
                        }}
                      />

                      {/* ── Contact shadow (tight, close to surface, more delayed) ── */}
                      <motion.div
                        className="nb-contact-shadow"
                        initial={{ opacity: 0, scaleX: 0.32 }}
                        animate={{
                          opacity: dissolved ? 0    : 0.65,
                          scaleX:  dissolved ? 0.28 : 1,
                        }}
                        transition={{
                          opacity: { type: 'spring', stiffness: 82, damping: 14, delay: 0.22 },
                          scaleX:  { type: 'spring', stiffness: 82, damping: 14, delay: 0.18 },
                        }}
                        style={{
                          position:      'absolute',
                          bottom:        '-9px',
                          left:          '16%',
                          width:         '68%',
                          height:        '12px',
                          background:    'radial-gradient(ellipse, rgba(0,0,0,0.68) 0%, transparent 65%)',
                          filter:        'blur(5px)',
                          pointerEvents: 'none',
                          transformOrigin: 'center',
                        }}
                      />

                      {/* ── THE NOTEBOOK ── */}
                      <motion.div
                        animate={{
                          boxShadow: dissolved
                            ? '0 0 0 1px rgba(255,218,130,0.10), 0 18px 36px rgba(0,0,0,0.46), 0 0 100px rgba(218,158,64,0.38), 0 0 180px rgba(192,128,42,0.15)'
                            : '0 0 0 1px rgba(255,218,120,0.07), 0 52px 84px rgba(0,0,0,0.85), 0 14px 24px rgba(0,0,0,0.58), -6px 0 20px rgba(0,0,0,0.46) inset',
                        }}
                        transition={{ duration: 0.30, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          position:    'relative',
                          width:       'min(390px, 88vw)',
                          aspectRatio: '14/10',
                          borderRadius: '4px 14px 14px 4px',
                          background:  `
                            linear-gradient(
                              152deg,
                              #55391e 0%,
                              #3f2a12 22%,
                              #32200d 44%,
                              #44301a 68%,
                              #22160a 100%
                            )
                          `,
                          overflow: 'hidden',
                        }}
                      >
                        {/* ── Spine ── */}
                        <div
                          style={{
                            position:  'absolute',
                            left:       0, top: 0, bottom: 0,
                            width:     '26px',
                            background: 'linear-gradient(to right, #150c04, #1f1209, #170d05)',
                            borderRight: '1px solid rgba(255,188,75,0.04)',
                            boxShadow:   '9px 0 15px rgba(0,0,0,0.38) inset',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Ruled lines (breathing opacity) ── */}
                        <div
                          className="nb-page-breathe"
                          style={{
                            position:        'absolute',
                            left:            '32px', right: 0, top: '54px', bottom: '18px',
                            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 18px, rgba(255,208,118,0.058) 18px, rgba(255,208,118,0.058) 19px)',
                            pointerEvents:   'none',
                          }}
                        />

                        {/* ── Left margin rule ── */}
                        <div
                          style={{
                            position:  'absolute',
                            left:      '64px', top: '32px', bottom: '14px',
                            width:     '1px',
                            background: 'rgba(208,138,80,0.10)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Paper discoloration spots ── */}
                        {/* Aged paper never has uniform colour — subtle dark/warm patches */}
                        <div
                          style={{
                            position:  'absolute',
                            inset:      0,
                            background: `
                              radial-gradient(ellipse 24% 18% at 36% 26%, rgba(28,14,4,0.20)  0%, transparent 100%),
                              radial-gradient(ellipse 16% 12% at 74% 70%, rgba(22,10,3,0.16)  0%, transparent 100%),
                              radial-gradient(ellipse 19% 10% at 56% 84%, rgba(18, 8,2,0.13)  0%, transparent 100%),
                              radial-gradient(ellipse  9%  7% at 84% 20%, rgba(32,16,5,0.18)  0%, transparent 100%),
                              radial-gradient(ellipse 12%  8% at 48% 50%, rgba(20,10,3,0.10)  0%, transparent 100%)
                            `,
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Paper grain texture (on-surface noise) ── */}
                        <div
                          style={{
                            position:        'absolute',
                            inset:            0,
                            opacity:          0.065,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.74' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
                            backgroundSize:  '120px 120px',
                            mixBlendMode:    'multiply',
                            pointerEvents:   'none',
                          }}
                        />

                        {/* ── Paper wrinkle overlays (micro-relief shadow lines) ── */}
                        {/* Wrinkle 1 — diagonal across upper third */}
                        <div
                          style={{
                            position:  'absolute',
                            left:      '30px', right: '40px',
                            top:       '28%',
                            height:    '1px',
                            transform: 'rotate(-0.7deg)',
                            background: 'linear-gradient(to right, transparent, rgba(10,5,1,0.16), rgba(10,5,1,0.10), transparent)',
                            pointerEvents: 'none',
                          }}
                        />
                        {/* Wrinkle 2 — gentle lower-half diagonal */}
                        <div
                          style={{
                            position:  'absolute',
                            left:      '60px', right: '20px',
                            top:       '68%',
                            height:    '1px',
                            transform: 'rotate(0.5deg)',
                            background: 'linear-gradient(to right, transparent 10%, rgba(8,4,1,0.14), rgba(8,4,1,0.08), transparent 90%)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Handwritten scribbles: barely visible cursive marks ── */}
                        <motion.svg
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.60, duration: 0.35 }}
                          style={{
                            position:  'absolute',
                            left:      '70px',
                            top:       '72px',
                            width:     '215px',
                            height:    '82px',
                            pointerEvents: 'none',
                            overflow: 'visible',
                          }}
                          aria-hidden="true"
                        >
                          {/* Cursive line 1 */}
                          <path
                            d="M 4 12 Q 28 3 54 13 T 110 11 T 162 12 T 204 13"
                            stroke="#4a2c0e" fill="none"
                            strokeWidth="1.5" strokeLinecap="round" opacity="0.11"
                          />
                          {/* Cursive line 2 */}
                          <path
                            d="M 4 30 Q 22 21 48 30 T 100 29 T 148 30"
                            stroke="#4a2c0e" fill="none"
                            strokeWidth="1.2" strokeLinecap="round" opacity="0.09"
                          />
                          {/* Cursive line 3 — faintest */}
                          <path
                            d="M 4 48 Q 34 40 64 49 T 118 47 T 170 49"
                            stroke="#3e2408" fill="none"
                            strokeWidth="1.0" strokeLinecap="round" opacity="0.07"
                          />
                          {/* Ink blot */}
                          <circle cx="170" cy="29" r="2.4" fill="#3a2008" opacity="0.13" />
                          {/* Short erratic mark beside blot */}
                          <path
                            d="M 178 28 Q 184 23 190 28"
                            stroke="#3e2408" fill="none"
                            strokeWidth="1.3" strokeLinecap="round" opacity="0.08"
                          />
                          {/* Faint under-line doodle */}
                          <path
                            d="M 4 66 L 88 66"
                            stroke="#3e2408" fill="none"
                            strokeWidth="0.9" strokeLinecap="round" opacity="0.06"
                          />
                        </motion.svg>

                        {/* ── Tape strip A: staggered entrance, worn translucent tape ── */}
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.54, duration: 0.30, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            position:     'absolute',
                            top:          '24px',
                            left:         '70px',
                            width:        '82px',
                            height:       '15px',
                            transform:    'rotate(-2.5deg)',
                            borderRadius: '1px',
                            // Uneven tape: brighter in middle, worn at edges
                            background:   `
                              linear-gradient(
                                90deg,
                                rgba(210,188,124,0.36),
                                rgba(248,224,156,0.54),
                                rgba(234,212,146,0.58),
                                rgba(248,226,158,0.52),
                                rgba(206,184,118,0.38)
                              )
                            `,
                            boxShadow: '0 1px 5px rgba(0,0,0,0.24), 0 0 0 0.5px rgba(196,174,98,0.22)',
                            pointerEvents: 'none',
                          }}
                        >
                          {/* Tape grain texture stripes */}
                          <div
                            style={{
                              position:        'absolute',
                              inset:            0,
                              opacity:          0.32,
                              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(172,150,82,0.28) 4px, rgba(172,150,82,0.28) 5px)',
                              borderRadius:    '1px',
                            }}
                          />
                        </motion.div>

                        {/* ── Tape strip B: delayed, counter-rotation ── */}
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.75, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            position:     'absolute',
                            bottom:       '32px',
                            right:        '42px',
                            width:        '60px',
                            height:       '13px',
                            transform:    'rotate(1.7deg)',
                            borderRadius: '1px',
                            background:   `
                              linear-gradient(
                                90deg,
                                rgba(206,184,118,0.34),
                                rgba(240,218,148,0.42),
                                rgba(228,206,136,0.44),
                                rgba(202,180,112,0.32)
                              )
                            `,
                            boxShadow:    '0 1px 4px rgba(0,0,0,0.18)',
                            pointerEvents: 'none',
                          }}
                        >
                          <div
                            style={{
                              position:        'absolute',
                              inset:            0,
                              opacity:          0.26,
                              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(172,150,82,0.24) 4px, rgba(172,150,82,0.24) 5px)',
                              borderRadius:    '1px',
                            }}
                          />
                        </motion.div>

                        {/* ── Page edges: staggered entrance, then flutter ── */}
                        <motion.div
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.46, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          style={{ position: 'absolute', right: '-1px', top: '6px', bottom: '6px' }}
                        >
                          <motion.div
                            animate={
                              landed && !dissolved
                                ? {
                                    scaleX:  [1, 0.96, 1.02, 0.98, 1],
                                    rotate:  [0, -0.40, 0.22, -0.10, 0],
                                  }
                                : {}
                            }
                            transition={
                              landed
                                ? { repeat: Infinity, duration: 2.1, ease: 'easeInOut', delay: 0.35 }
                                : {}
                            }
                            style={{
                              position:        'absolute',
                              inset:            0,
                              width:           '8px',
                              borderRadius:    '0 5px 5px 0',
                              background:      'repeating-linear-gradient(to bottom, rgba(238,220,188,0.90), rgba(238,220,188,0.90) 1px, rgba(220,204,172,0.75) 1px, rgba(220,204,172,0.75) 2px)',
                              pointerEvents:   'none',
                              transformOrigin: 'left center',
                            }}
                          />
                        </motion.div>

                        {/* ── Corner fold — top right ── */}
                        <div
                          style={{
                            position:     'absolute',
                            top:           0, right: 0,
                            width:        '28px',
                            height:       '28px',
                            background:   'linear-gradient(225deg, rgba(44,26,10,0.97) 0%, transparent 60%)',
                            borderRadius: '0 14px 0 0',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Bottom-right worn corner ── */}
                        <div
                          style={{
                            position:     'absolute',
                            bottom:        0, right: 0,
                            width:        '20px',
                            height:       '20px',
                            background:   'linear-gradient(135deg, rgba(38,22,8,0.90) 0%, transparent 55%)',
                            borderRadius: '0 0 14px 0',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Horizontal crease shadow ── */}
                        <div
                          style={{
                            position:  'absolute',
                            left:      '32px', right: 0,
                            top:       '47%',
                            height:    '1px',
                            background: 'linear-gradient(to right, rgba(0,0,0,0.30), rgba(0,0,0,0.13), transparent)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Vertical micro-crease ── */}
                        <div
                          style={{
                            position:  'absolute',
                            left:      '37%',
                            top:       '32px',
                            bottom:    '16px',
                            width:     '1px',
                            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.16), rgba(0,0,0,0.09), transparent)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Directional light: top-left cinematic source ── */}
                        <div
                          style={{
                            position:  'absolute',
                            inset:      0,
                            background: 'linear-gradient(130deg, rgba(255,212,132,0.10) 0%, transparent 44%)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Periodic shimmer sweep ── */}
                        <div
                          className="nb-shimmer"
                          style={{
                            position:  'absolute',
                            inset:      0,
                            background: 'linear-gradient(105deg, transparent 22%, rgba(255,234,182,0.24) 50%, transparent 78%)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── One-time entry highlight sweep ── */}
                        <motion.div
                          initial={{ x: '-55%', opacity: 0 }}
                          animate={{
                            x:       dissolved ? '140%' : '0%',
                            opacity: dissolved ? 0       : 0.16,
                          }}
                          transition={{
                            x:       { duration: dissolved ? 0.40 : 0.70, ease: [0.25, 0.46, 0.45, 0.94] },
                            opacity: { duration: dissolved ? 0.18 : 0.50, ease: 'easeOut' },
                          }}
                          style={{
                            position:  'absolute',
                            inset:      0,
                            background: 'linear-gradient(105deg, transparent 24%, rgba(255,236,186,0.40) 50%, transparent 76%)',
                            pointerEvents: 'none',
                          }}
                        />

                        {/* ── Warm glow: book "opens" during dissolve ── */}
                        <motion.div
                          animate={{
                            opacity: dissolved ? 0.94 : 0,
                            scale:   dissolved ? 1.07  : 0.82,
                          }}
                          transition={{ duration: 0.27, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            position:  'absolute',
                            inset:      0,
                            background: 'radial-gradient(ellipse 64% 56% at 50% 50%, rgba(255,212,115,0.64) 0%, rgba(238,162,60,0.44) 38%, transparent 68%)',
                            pointerEvents: 'none',
                          }}
                        />
                      </motion.div>
                      {/* ── End notebook body ── */}

                    </motion.div>
                    {/* ── End breathing wrapper ── */}

                  </motion.div>
                  {/* ── End landing compression ── */}

                </motion.div>
                {/* ── End spring fall ── */}

              </motion.div>
              {/* ── End perspective drift ── */}

            </motion.div>
            {/* ── End camera push-in / parallax container ── */}

            {/* ── Dissolve veil: fades in to erase overlay, reveal new page ── */}
            <motion.div
              animate={{ opacity: dissolved ? 1 : 0 }}
              transition={{
                duration: 0.82,
                delay:    dissolved ? 0.24 : 0,
                ease:     'easeIn',
              }}
              style={{
                position:  'absolute',
                inset:      0,
                background: 'radial-gradient(ellipse 100% 92% at 50% 44%, rgba(26,16,8,0.97) 0%, rgba(12,7,3,0.99) 100%)',
                pointerEvents: 'none',
              }}
            />

          </motion.div>
        )}
      </AnimatePresence>
    </NotebookTransitionContext.Provider>
  );
}
