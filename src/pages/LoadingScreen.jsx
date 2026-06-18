import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────
const TEXT             = "Loading....";
const CHARS            = TEXT.split('');
const STAGGER          = 0.032;                // tighter — slight letter overlap
const DRUM_DURATION    = 0.56;                 // responsive yet unhurried
const EASE             = [0.76, 0, 0.24, 1];  // strong in, luxurious deceleration
const LOOP_STAGGER     = 0.046;               // fluid ripple across the word
const LOADING_TOTAL_MS = 5000;
// Loop begins once every character has settled (+200ms buffer)
const LOOP_START_MS    = Math.round(((CHARS.length - 1) * STAGGER + DRUM_DURATION) * 1000 + 200);

// ─── DrumSlot ─────────────────────────────────────────────────────────────────
// Each character lives in a clipped slot (overflow: hidden).
// The motion.span is the drum: glides up from 120% on entry (fade + sharpen + settle rotation),
// exits upward on loop (fade out + soften + counter-rotate), resets below, repeats.
// All transitions are explicit tween — zero spring physics.

function DrumSlot({ char, entryDelay, looping, loopDelay }) {
  const controls = useAnimation();
  const mounted  = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    async function sequence() {
      // ── Phase 1: initial reveal — glide up, fade + sharpen in, settle ──────
      await controls.start({
        y:       '0%',
        opacity: 1,
        filter:  'blur(0px)',
        rotate:  0,
        transition: {
          y:       { type: 'tween', delay: entryDelay, duration: DRUM_DURATION,        ease: EASE      },
          opacity: { type: 'tween', delay: entryDelay, duration: DRUM_DURATION * 0.60, ease: 'easeOut' },
          filter:  { type: 'tween', delay: entryDelay, duration: DRUM_DURATION * 0.55, ease: 'easeOut' },
          rotate:  { type: 'tween', delay: entryDelay, duration: DRUM_DURATION,        ease: EASE      },
        },
      });

      if (!mounted.current || !looping) return;

      // ── Phase 2: continuous premium roll ───────────────────────────────────
      while (mounted.current) {
        // Exit — shoot upward, fade out, soften, slight counter-rotation
        await controls.start({
          y:       '-120%',
          opacity: 0,
          filter:  'blur(1.5px)',
          rotate:  -0.5,
          transition: {
            y:       { type: 'tween', delay: loopDelay,                         duration: DRUM_DURATION * 0.68, ease: EASE      },
            opacity: { type: 'tween', delay: loopDelay + DRUM_DURATION * 0.22,  duration: DRUM_DURATION * 0.28, ease: 'easeIn'  },
            filter:  { type: 'tween', delay: loopDelay + DRUM_DURATION * 0.12,  duration: DRUM_DURATION * 0.28, ease: 'easeIn'  },
            rotate:  { type: 'tween', delay: loopDelay,                         duration: DRUM_DURATION * 0.68, ease: EASE      },
          },
        });
        if (!mounted.current) break;

        // Instant reposition below the slot
        controls.set({ y: '120%', opacity: 0, filter: 'blur(2px)', rotate: 0.8 });

        // Enter — glide up from deeper below, fade + sharpen, settle rotation
        await controls.start({
          y:       '0%',
          opacity: 1,
          filter:  'blur(0px)',
          rotate:  0,
          transition: {
            y:       { type: 'tween',                               duration: DRUM_DURATION * 0.82, ease: EASE      },
            opacity: { type: 'tween', delay: DRUM_DURATION * 0.08,  duration: DRUM_DURATION * 0.48, ease: 'easeOut' },
            filter:  { type: 'tween', delay: DRUM_DURATION * 0.08,  duration: DRUM_DURATION * 0.42, ease: 'easeOut' },
            rotate:  { type: 'tween',                               duration: DRUM_DURATION * 0.82, ease: EASE      },
          },
        });
        if (!mounted.current) break;

        // Settled — let the text breathe before the next spin
        await new Promise(r => setTimeout(r, 900 + loopDelay * 350));
      }
    }
    sequence();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looping]);

  const sharedTextStyle = {
    fontFamily: "'Mocha', 'EB Garamond', serif",
    fontSize:   'clamp(2.4rem, 6.5vw, 5.5rem)',
    fontWeight: 500,
    color:      'var(--fg)',
    lineHeight: 1.15,
    display:    'block',
    userSelect: 'none',
  };

  return (
    // Slot window — clipped to exactly one line height.
    // translateZ(0) promotes to its own GPU layer for crisp compositing.
    <span
      style={{
        display:            'inline-block',
        overflow:           'hidden',
        fontSize:           'clamp(2.4rem, 6.5vw, 5.5rem)',
        height:             '1.15em',
        verticalAlign:      'bottom',
        position:           'relative',
        transform:          'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <motion.span
        animate={controls}
        initial={{ y: '120%', opacity: 0, filter: 'blur(2px)', rotate: 0.8 }}
        style={{
          display:            'block',
          position:           'relative',
          willChange:         'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Ghost above — whisper of the outgoing char as drum exits upward */}
        <span aria-hidden="true" style={{ ...sharedTextStyle, opacity: 0.10, position: 'absolute', top: '-1.15em', left: 0 }}>
          {char}
        </span>
        {/* Main copy */}
        <span style={sharedTextStyle}>{char}</span>
        {/* Ghost below — whisper of the incoming char before it enters */}
        <span aria-hidden="true" style={{ ...sharedTextStyle, opacity: 0.10, position: 'absolute', top: '1.15em', left: 0 }}>
          {char}
        </span>
      </motion.span>
    </span>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export default function LoadingScreen() {
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLooping(true), LOOP_START_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'var(--bg)',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          200,
      }}
    >
      <p
        role="status"
        aria-label="Loading"
        style={{ display: 'flex', alignItems: 'flex-end', margin: 0, gap: 0 }}
      >
        {CHARS.map((char, i) => (
          <DrumSlot
            key={i}
            char={char}
            entryDelay={i * STAGGER}
            looping={looping}
            loopDelay={i * LOOP_STAGGER}
          />
        ))}
      </p>

      {/* Progress line — fills over the full 5 s */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: LOADING_TOTAL_MS / 1000, ease: 'linear' }}
        style={{
          position:        'absolute',
          bottom:          0,
          left:            0,
          width:           '100%',
          height:          '1px',
          backgroundColor: 'var(--fg)',
          opacity:         0.1,
          transformOrigin: 'left center',
        }}
      />
    </motion.div>
  );
}
