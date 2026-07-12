import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TUBE_VIDEO    = '/london%20tube.mp4';
const TUBE_CLIP_MS  = 1000; // how much of the clip is ever allowed to play
const EXIT_MS       = 550;  // current page sliding out left
const ENTER_MS      = 1200; // destination sliding in from the right — slow, visible glide
const VIDEO_FADE_MS = 320;

const LondonTransitionContext = createContext(null);

export function useLondonTransition() {
  const ctx = useContext(LondonTransitionContext);
  if (!ctx) throw new Error('useLondonTransition must be used inside LondonTransitionProvider');
  return ctx;
}

export function LondonTransitionProvider({ children }) {
  // 'idle' | 'video' — the video layer only needs to exist for that window;
  // the page-slide itself is driven by body classes toggling #main-wrap's
  // transform, so the actual route content underneath never has to know
  // a transition is happening.
  const [showVideo, setShowVideo] = useState(false);
  const videoRef    = useRef(null);
  const activeRef   = useRef(false);
  const srcLoadedRef = useRef(false);
  const timers      = useRef([]);

  const schedule = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const triggerTransition = useCallback((navigate, to) => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearAll();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      navigate(to);
      activeRef.current = false;
      return;
    }

    const v = videoRef.current;

    // Only fetch the clip the first time it's actually needed — without a
    // src attribute the browser never requests it, so visiting unrelated
    // pages doesn't pull in the video for no reason.
    if (!srcLoadedRef.current && v) {
      v.src = TUBE_VIDEO;
      v.load();
      srcLoadedRef.current = true;
    }

    // 1 — current page slides out to the left.
    document.body.classList.add('lt-exit-left');

    // 2 — video layer fades in and the rest of the sequence (route swap,
    // slide-in, cleanup) all runs from here — but only once the clip can
    // actually play. A fixed timer here used to fire regardless of load
    // state, so on any real network delay the whole sequence completed
    // before a single video frame ever rendered. Gate on both the slide
    // timing AND actual readiness, with a safety-net timeout so a stalled
    // load can never hang the page transition.
    let timeElapsed = v ? v.readyState >= 3 : true;
    let videoReady  = v ? v.readyState >= 3 : true;
    let started = false;

    const startClip = () => {
      if (started || !(timeElapsed && videoReady)) return;
      started = true;
      setShowVideo(true);
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }

      // 3 — swap the route while fully hidden behind the video, and snap the
      // (now off-screen) page to the right edge with no transition, so it's
      // positioned to slide IN from the right once the video clears.
      schedule(() => {
        navigate(to);
        document.body.classList.remove('lt-exit-left');
        document.body.classList.add('lt-enter-right-instant');
      }, TUBE_CLIP_MS - 150);

      // 4 — video's done its job: slide the destination in from the right
      // while the video fades out underneath the motion.
      schedule(() => {
        document.body.classList.remove('lt-enter-right-instant');
        document.body.classList.add('lt-enter-right');
        setShowVideo(false);
      }, TUBE_CLIP_MS);

      // 5 — cleanup.
      schedule(() => {
        document.body.classList.remove('lt-enter-right');
        activeRef.current = false;
      }, TUBE_CLIP_MS + ENTER_MS);
    };

    schedule(() => { timeElapsed = true; startClip(); }, EXIT_MS - 200);
    if (v && v.readyState < 3) {
      v.addEventListener('canplay', () => { videoReady = true; startClip(); }, { once: true });
    }
    // Safety net: never let a stalled/slow load hang the transition.
    schedule(() => { videoReady = true; startClip(); }, 1600);
  }, []);

  return (
    <LondonTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      <style>{`
        #main-wrap {
          transition: transform ${EXIT_MS}ms cubic-bezier(0.7, 0, 0.84, 0);
        }
        body.lt-exit-left #main-wrap {
          transform: translateX(-100%);
          transition: transform ${EXIT_MS}ms cubic-bezier(0.7, 0, 0.84, 0);
        }
        body.lt-enter-right-instant #main-wrap {
          transform: translateX(100%);
          transition: none;
        }
        body.lt-enter-right #main-wrap {
          transform: translateX(0);
          transition: transform ${ENTER_MS}ms cubic-bezier(0.33, 1, 0.68, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          #main-wrap { transition: none !important; transform: none !important; }
        }
      `}</style>

      {/* Always mounted — toggling showVideo only animates opacity, so
          videoRef is live well before triggerTransition ever needs it. */}
      <motion.div
        animate={{ opacity: showVideo ? 1 : 0 }}
        transition={{ duration: VIDEO_FADE_MS / 1000, ease: showVideo ? 'easeOut' : 'easeIn' }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 950,
          background: '#05070d',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          onTimeUpdate={e => {
            if (e.currentTarget.currentTime * 1000 >= TUBE_CLIP_MS) e.currentTarget.pause();
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </motion.div>
    </LondonTransitionContext.Provider>
  );
}
