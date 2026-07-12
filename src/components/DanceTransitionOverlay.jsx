import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Filename contains spaces on disk — URL-encode them.
const DANCE_VIDEO = '/images/dance/dance%20transition%20vid.mp4';
const PLAY_MS      = 2000; // play the clip for exactly 2s
const FADE_IN_MS   = 240;
const FADE_OUT_MS  = 420;

const DanceTransitionContext = createContext(null);

export function useDanceTransition() {
  const ctx = useContext(DanceTransitionContext);
  if (!ctx) throw new Error('useDanceTransition must be used inside DanceTransitionProvider');
  return ctx;
}

export function DanceTransitionProvider({ children }) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef     = useRef(null);
  const activeRef    = useRef(false);
  const srcLoadedRef = useRef(false);
  const timers       = useRef([]);

  const schedule = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const triggerTransition = useCallback((navigate, to = '/work/dance') => {
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

    // Load the clip lazily the first time it's needed.
    if (!srcLoadedRef.current && v) {
      v.src = DANCE_VIDEO;
      v.load();
      srcLoadedRef.current = true;
    }

    // Cover the screen and swap the route while hidden behind it.
    setShowVideo(true);
    schedule(() => navigate(to), 260);

    // The PLAY_MS window used to start counting from trigger time, so a slow
    // load could eat most of it before a frame ever rendered. Start the clock
    // only once the clip can actually play (bounded by a safety-net timeout),
    // so the visible playback window is always the full PLAY_MS.
    let started = false;
    const beginPlayback = () => {
      if (started) return;
      started = true;
      if (v) { v.currentTime = 0; v.play().catch(() => {}); }

      schedule(() => {
        setShowVideo(false);
        if (v) v.pause();
      }, PLAY_MS);

      schedule(() => { activeRef.current = false; }, PLAY_MS + FADE_OUT_MS + 40);
    };

    if (v && v.readyState < 3) {
      v.addEventListener('canplay', beginPlayback, { once: true });
      schedule(beginPlayback, 900); // safety net for a stalled load
    } else {
      beginPlayback();
    }
  }, []);

  return (
    <DanceTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      {/* Always mounted so videoRef is live before triggerTransition runs;
          only opacity animates. */}
      <motion.div
        animate={{ opacity: showVideo ? 1 : 0 }}
        transition={{ duration: (showVideo ? FADE_IN_MS : FADE_OUT_MS) / 1000, ease: showVideo ? 'easeOut' : 'easeIn' }}
        style={{
          position: 'fixed', inset: 0, zIndex: 950,
          background: '#0b0705', overflow: 'hidden',
          pointerEvents: showVideo ? 'auto' : 'none',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          onTimeUpdate={e => { if (e.currentTarget.currentTime * 1000 >= PLAY_MS) e.currentTarget.pause(); }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </motion.div>
    </DanceTransitionContext.Provider>
  );
}
