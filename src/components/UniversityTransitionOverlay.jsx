import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── University "cap toss" transition ───────────────────────────────────────
// The graduation cap-throwing clip fills the whole screen (the portrait clip is
// tiled side by side to cover the width). After ~1.5s — the cap toss — the video
// launches upward off the top while the University page slides up into view.

const CAP_VIDEO = '/images/university/uni-1.mp4';
const VIDEO_AR  = 720 / 1280;   // portrait clip aspect (w/h)
const PLAY_MS   = 1500;         // how long the clip plays before it launches up
export const SLIDE_MS = 950;    // upward launch of video + page — exported so
                                 // UniversityPuzzle can hold its own entrance
                                 // until this reveal has actually finished.
// Class the transition adds to <body> for exactly the SLIDE_MS window while
// the page is physically sliding into view — read by UniversityPuzzle on
// mount to detect "I arrived via the cap-toss transition."
export const RISE_CLASS = 'ut-rise';

const UniversityTransitionContext = createContext(null);

export function useUniversityTransition() {
  const ctx = useContext(UniversityTransitionContext);
  if (!ctx) throw new Error('useUniversityTransition must be used inside UniversityTransitionProvider');
  return ctx;
}

export function UniversityTransitionProvider({ children }) {
  const [active, setActive] = useState(false);
  const [thrown, setThrown] = useState(false);
  const videosRef   = useRef([]);
  const activeRef   = useRef(false);
  const launchedRef = useRef(false);
  const timedRef    = useRef(false);
  const timers      = useRef([]);
  const pendingRef  = useRef({ navigate: null, to: null });

  const schedule = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // Cap thrown → mount the destination page and launch the video up + slide
  // the page up into view at the same instant. Mounting exactly here (rather
  // than early, while still hidden) means the puzzle's own fly-in-from-the-
  // sides entrance animation plays out DURING and AFTER the reveal, instead
  // of finishing off-screen before the user ever sees it.
  const launch = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    const { navigate, to } = pendingRef.current;
    navigate?.(to);
    setThrown(true);
    document.body.classList.remove('ut-below');
    document.body.classList.add('ut-rise');
    // Stop decoding immediately — several tiled copies of the same clip were
    // still actively playing (just visually sliding away) for another full
    // second after this point, and that concurrent decode load was heavy
    // enough to stall the main thread, making the puzzle's fly-in entrance
    // (mounting right now, underneath) stutter and appear to snap straight
    // to its resting position instead of animating in smoothly.
    videosRef.current.forEach(v => { if (v) v.pause(); });
    schedule(() => {
      document.body.classList.remove('ut-rise');
      setActive(false);
      activeRef.current = false;
    }, SLIDE_MS + 60);
  }, []);

  // Start the ~1.5s countdown once the clip is actually playing.
  const armTimer = useCallback(() => {
    if (timedRef.current) return;
    timedRef.current = true;
    schedule(() => launch(), PLAY_MS);
  }, [launch]);

  const triggerTransition = useCallback((navigate, to = '/work/university') => {
    if (activeRef.current) return;
    activeRef.current = true;
    launchedRef.current = false;
    timedRef.current = false;
    clearAll();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { navigate(to); activeRef.current = false; return; }

    pendingRef.current = { navigate, to };
    setThrown(false);
    setActive(true);                              // mounts the tiled videos (played in effect below)
    document.body.classList.add('ut-below');      // page waits below the fold, not yet mounted

    // Fallback in case the clip never fires "playing".
    schedule(() => armTimer(), 400);
    schedule(() => launch(), PLAY_MS + 2200);
  }, [launch, armTimer]);

  // Start every tiled copy once mounted.
  useEffect(() => {
    if (!active) return;
    videosRef.current.forEach(v => {
      if (!v) return;
      v.src = CAP_VIDEO;
      v.currentTime = 0;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  }, [active]);

  // How many portrait copies are needed to cover the viewport width.
  const cols = typeof window !== 'undefined'
    ? Math.ceil(window.innerWidth / (window.innerHeight * VIDEO_AR)) + 1
    : 3;

  return (
    <UniversityTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      <style>{`
        /* 100vh (a fixed viewport-height offset), not 100% — #main-wrap's own
           content height can be taller than one screen, and translateY(100%)
           would then travel further than the viewport, burning most of the
           950ms before any content — including the puzzle's fly-in — is
           actually visible. A fixed vh offset always reveals from the first
           frame of the rise. */
        body.ut-below #main-wrap { transform: translateY(100vh); transition: none; }
        body.ut-rise  #main-wrap { transform: translateY(0); transition: transform ${SLIDE_MS}ms cubic-bezier(0.16, 1, 0.3, 1); }
        @media (prefers-reduced-motion: reduce) {
          .ut-layer { display: none !important; }
          body.ut-below #main-wrap, body.ut-rise #main-wrap { transform: none !important; transition: none !important; }
        }
      `}</style>

      {active && (
        <motion.div
          className="ut-layer"
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: thrown ? '-100%' : 0 }}
          transition={{ duration: SLIDE_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 900,
            background: '#0a0a12', overflow: 'hidden', pointerEvents: 'none',
            display: 'flex', justifyContent: 'center', alignItems: 'stretch',
          }}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <video
              key={i}
              ref={(el) => { videosRef.current[i] = el; }}
              muted playsInline preload="auto"
              onPlaying={i === 0 ? armTimer : undefined}
              style={{ height: '100%', width: 'auto', flexShrink: 0, objectFit: 'cover', display: 'block' }}
            />
          ))}
        </motion.div>
      )}
    </UniversityTransitionContext.Provider>
  );
}
