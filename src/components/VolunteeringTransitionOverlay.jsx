import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Matches the shelf tilt used by the real gallery (VolunteeringGallery3D's
// BASE_TRANSFORM) so the dive lands on the exact angle the destination cards
// already sit at — the transition and the page are one continuous gesture.
const SHELF_TRANSFORM = { rotateX: -24, rotateY: -55 };

// Single source of truth for the dive-in length. Every other beat (ghosts,
// vignette, navigate, dim-clear) is derived from this so nothing finishes
// early and sits frozen waiting for the rest — that frozen gap is what read
// as a "blank screen" before.
const DIVE_MS  = 620;
const EXIT_MS  = 240;

const VolunteeringTransitionContext = createContext(null);

export function useVolunteeringTransition() {
  const ctx = useContext(VolunteeringTransitionContext);
  if (!ctx) throw new Error('useVolunteeringTransition must be used inside VolunteeringTransitionProvider');
  return ctx;
}

const FADE_EXIT = { opacity: 0, transition: { duration: EXIT_MS / 1000, ease: 'easeIn' } };

// Ghost cards — represent the cards further back in the shelf, drifting
// toward the upper-right (the same direction "further back in Z" reads as
// in the real gallery) and dissolving into blur as they recede. Their whole
// in-out cycle fits inside the dive window so nothing is left hanging after.
function GhostCard({ src, depth, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.85, 0], x: depth * 110, y: depth * -72 }}
      exit={FADE_EXIT}
      transition={{ duration: DIVE_MS / 1000, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: '50%', top: '50%',
        width: '260px', height: '380px',
        marginLeft: '-130px', marginTop: '-190px',
        borderRadius: '6px',
        overflow: 'hidden',
        filter: `blur(${3 + depth * 6}px)`,
        transform: `rotateX(${SHELF_TRANSFORM.rotateX}deg) rotateY(${SHELF_TRANSFORM.rotateY}deg) translateZ(${-depth * 260}px)`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      }}
    >
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </motion.div>
  );
}

export function VolunteeringTransitionProvider({ children }) {
  const [dive, setDive] = useState(null); // { src, rect, ghostSrcs }
  const activeRef = useRef(false);
  const timers = useRef([]);

  const schedule = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const triggerTransition = useCallback((navigate, to, { src, rect, startIndex, ghostSrcs }) => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearAll();

    // Warm the browser's cache for the destination gallery's own copy of this
    // card right now, as early as possible — the gallery references the same
    // file path, so by the time it mounts (~1s away) the image paints
    // instantly instead of leaving the freshly-revealed page looking blank
    // while it fetches.
    [src, ...ghostSrcs].forEach(url => { const img = new window.Image(); img.src = url; });

    // Computed once, up front — not read live inside JSX on every render,
    // which let Framer Motion's animate target drift mid-flight and made the
    // dive stall partway instead of ever reaching its real target.
    const target = { left: window.innerWidth / 2 - 150, top: window.innerHeight / 2 - 230 };

    // Brief anticipation pause before motion starts — same beat used by the
    // travel cloud-sweep, so intentional transitions feel consistent site-wide.
    const startId = setTimeout(() => {
      setDive({ src, rect, ghostSrcs, target });
      document.body.classList.add('vt-diving');

      // Navigate well before the dive finishes so the destination is mounted
      // and ready behind the overlay, never something the reveal has to wait on.
      schedule(() => navigate(to, { state: { startIndex } }), DIVE_MS * 0.55);

      // Clear the dim AND start the exit fade at the exact same moment the
      // dive-in lands — no static hold in between, motion stays continuous
      // straight through to the destination page.
      schedule(() => {
        document.body.classList.remove('vt-diving');
        setDive(null);
      }, DIVE_MS);

      schedule(() => { activeRef.current = false; }, DIVE_MS + EXIT_MS + 40);
    }, 180);

    timers.current.push(startId);
  }, []);

  return (
    <VolunteeringTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      <style>{`
        #main-wrap {
          transition: filter ${EXIT_MS}ms ease, opacity ${EXIT_MS}ms ease;
        }
        body.vt-diving #main-wrap {
          filter: brightness(0.75) saturate(0.85) blur(1.5px);
          opacity: 0.7;
        }
        /* Freeze the home grid's continuous marquee/bounce so the dive isn't
           competing with an already-moving background — this was the main
           reason the transition read as invisible. */
        body.vt-diving .mc-col-inner,
        body.vt-diving .mc-bounce {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .vt-layer { display: none !important; }
          body.vt-diving #main-wrap {
            filter: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <AnimatePresence>
        {dive && (
          <div
            className="vt-layer"
            aria-hidden="true"
            style={{ position: 'fixed', inset: 0, zIndex: 900, pointerEvents: 'none', overflow: 'hidden', perspective: '1300px', perspectiveOrigin: '50% 50%' }}
          >
            {/* Vignette — same device the travel transition uses to give the
                overlay atmosphere instead of being a flat sticker on top. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1] }}
              exit={FADE_EXIT}
              transition={{ duration: DIVE_MS / 1000, times: [0, 0.22, 1], ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse 80% 75% at 50% 50%, transparent 28%, rgba(20, 12, 4, 0.38) 100%)',
              }}
            />

            {dive.ghostSrcs.map((src, i) => (
              <GhostCard key={src} src={src} depth={i + 1} delay={0.05 * i} />
            ))}

            <motion.img
              src={dive.src}
              alt=""
              initial={{
                left: dive.rect.left, top: dive.rect.top,
                width: dive.rect.width, height: dive.rect.height,
                rotateX: 0, rotateY: 0, scale: 1, borderRadius: 10,
              }}
              animate={{
                left: dive.target.left, top: dive.target.top,
                width: 300, height: 460,
                rotateX: SHELF_TRANSFORM.rotateX, rotateY: SHELF_TRANSFORM.rotateY,
                scale: 1.18, borderRadius: 6,
              }}
              exit={{ opacity: 0, scale: 1.34, transition: { duration: EXIT_MS / 1000, ease: 'easeIn' } }}
              transition={{ duration: DIVE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'fixed', objectFit: 'cover', boxShadow: '0 36px 90px rgba(0,0,0,0.4)' }}
            />
          </div>
        )}
      </AnimatePresence>
    </VolunteeringTransitionContext.Provider>
  );
}
