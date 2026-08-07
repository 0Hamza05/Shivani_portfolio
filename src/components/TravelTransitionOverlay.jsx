import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Split-flap "departure board" travel transition ─────────────────────────
// Clicking a travel link drops an airport departure board over the screen; the
// split-flap tiles clatter through characters and lock into place, hold a beat,
// then the board lifts away to reveal the travel page underneath.

const TravelTransitionContext = createContext(null);

export function useTravelTransition() {
  const ctx = useContext(TravelTransitionContext);
  if (!ctx) throw new Error('useTravelTransition must be used inside TravelTransitionProvider');
  return ctx;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

// Same warm pastel palette used everywhere else on the site (About, Dance,
// Volunteering) — light peachy tiles instead of a dark airport board, with
// dark ink lettering for contrast rather than light-on-dark.
const INK      = 'oklch(27% 0.035 40)';  // lettering / header text
const INK_DIM  = 'oklch(42% 0.03 45)';   // gate-status line
const GOLD     = '#c9a04f';
const PASTEL_1 = 'oklch(95% 0.035 70)';  // tile/board — lightest peach
const PASTEL_2 = 'oklch(89% 0.045 66)';  // tile/board — mid peach
const PASTEL_3 = 'oklch(83% 0.05 62)';   // tile/board — deepest (still pastel) peach

// One split-flap tile: shuffles random characters until its lock time, then
// settles on the target letter with a final flap.
function Flap({ target, lockAt, w, h, fs, active }) {
  const [ch, setCh] = useState(' ');
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => setCh(rand()), 55);
    const to = setTimeout(() => { clearInterval(iv); setCh(target === ' ' ? ' ' : target); }, lockAt);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, [active, target, lockAt]);

  return (
    <div style={{
      position: 'relative', width: w, height: h, borderRadius: 4,
      background: `linear-gradient(180deg, ${PASTEL_1} 0%, ${PASTEL_2} 49%, ${PASTEL_3} 50%, ${PASTEL_2} 100%)`,
      boxShadow: 'inset 0 0 0 1px rgba(120,80,50,0.16), 0 2px 4px rgba(120,80,50,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      <span key={ch + Math.random()} className="dep-flap" style={{
        fontFamily: "'Courier New', ui-monospace, monospace", fontWeight: 700,
        fontSize: fs, color: INK, lineHeight: 1, letterSpacing: '0.02em',
      }}>{ch === ' ' ? ' ' : ch}</span>
      {/* centre seam */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(120,80,50,0.22)' }} />
    </div>
  );
}

function FlapWord({ text, base, step, size, active }) {
  const chars = text.split('');
  const dims = size === 'lg'
    ? { w: 'clamp(30px, 6.6vw, 52px)', h: 'clamp(42px, 9vw, 70px)', fs: 'clamp(1.3rem, 3.4vw, 2.3rem)', gap: 'clamp(3px,0.7vw,6px)' }
    : { w: 'clamp(16px, 3.4vw, 26px)', h: 'clamp(22px, 4.6vw, 36px)', fs: 'clamp(0.72rem, 1.7vw, 1.15rem)', gap: 'clamp(2px,0.4vw,4px)' };
  return (
    <div style={{ display: 'flex', gap: dims.gap, justifyContent: 'center' }}>
      {chars.map((c, i) => (
        <Flap key={i} target={c} lockAt={base + i * step} w={dims.w} h={dims.h} fs={dims.fs} active={active} />
      ))}
    </div>
  );
}

export function TravelTransitionProvider({ children }) {
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const activeRef = useRef(false);
  const timers = useRef([]);

  const schedule = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const triggerTransition = useCallback((navigate, to = '/work/travel') => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearAll();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { navigate(to); activeRef.current = false; return; }

    setLeaving(false);
    setActive(true);
    document.body.classList.add('tt-boarding');

    // Route swaps behind the board while the flaps are still settling.
    schedule(() => navigate(to), 900);
    // Board holds, then lifts away.
    schedule(() => { setLeaving(true); document.body.classList.remove('tt-boarding'); }, 2100);
    schedule(() => { setActive(false); activeRef.current = false; }, 2800);
  }, []);

  return (
    <TravelTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      <style>{`
        @keyframes depFlap { 0% { transform: rotateX(-88deg); opacity: 0.35; } 100% { transform: rotateX(0deg); opacity: 1; } }
        .dep-flap { display: inline-block; transform-origin: 50% 50%; animation: depFlap 0.11s ease-out; backface-visibility: hidden; }
        #main-wrap { transition: filter 500ms ease; }
        body.tt-boarding #main-wrap { filter: brightness(0.9); }
        @media (prefers-reduced-motion: reduce) {
          .tt-board { display: none !important; }
          body.tt-boarding #main-wrap { filter: none !important; }
        }
      `}</style>

      {active && (
        <motion.div
          aria-hidden="true"
          className="tt-board"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1, y: leaving ? -26 : 0 }}
          transition={{ duration: leaving ? 0.6 : 0.32, ease: leaving ? [0.7, 0, 0.84, 0] : 'easeOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 900, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(14px, 3vh, 28px)', overflow: 'hidden',
            background: `radial-gradient(120% 100% at 50% 0%, ${PASTEL_1} 0%, ${PASTEL_2} 60%, ${PASTEL_3} 100%)`,
          }}
        >
          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, color: INK_DIM,
              fontFamily: "'EB Garamond', serif", fontStyle: 'italic', letterSpacing: '0.34em',
              textTransform: 'uppercase', fontSize: 'clamp(0.62rem, 1.4vw, 0.82rem)' }}>
            <span aria-hidden style={{ fontStyle: 'normal', color: GOLD }}>✈</span> Departures
          </motion.div>

          {/* main split-flap word */}
          <FlapWord text="TRAVEL" base={380} step={135} size="lg" active={active && !leaving} />

          {/* status line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,2vw,20px)', marginTop: 2 }}>
            <FlapWord text="NOW BOARDING" base={560} step={80} size="sm" active={active && !leaving} />
          </div>

          {/* blinking gate marker */}
          <motion.div
            animate={{ opacity: [1, 1, 0.15, 0.15] }}
            transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.55, 1] }}
            style={{ color: INK_DIM, fontFamily: "'Courier New', monospace", fontSize: 'clamp(0.6rem,1.3vw,0.78rem)', letterSpacing: '0.3em' }}
          >
            GATE 07 · ON TIME
          </motion.div>
        </motion.div>
      )}
    </TravelTransitionContext.Provider>
  );
}
