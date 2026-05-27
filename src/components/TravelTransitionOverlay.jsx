import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Cloud image paths ────────────────────────────────────────────────────────
const CLOUD_A = '/clouds/download__1_-removebg-preview.png'; // bulkier mass
const CLOUD_B = '/clouds/images-removebg-preview.png';       // wider, flatter

// ─── Context ──────────────────────────────────────────────────────────────────
const TravelTransitionContext = createContext(null);

export function useTravelTransition() {
  const ctx = useContext(TravelTransitionContext);
  if (!ctx) throw new Error('useTravelTransition must be used inside TravelTransitionProvider');
  return ctx;
}

// ─── Ambient travel sound ─────────────────────────────────────────────────────
// Three filtered-noise bands mixed at very low volume.
// The goal is subconscious atmosphere — felt rather than heard.
// No sharp attack, no loud engine effect.
function playAirplaneSweep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const len = Math.floor(ctx.sampleRate * 2.8);

    function makeNoiseSrc() {
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      return src;
    }

    const src1 = makeNoiseSrc(); // engine presence
    const src2 = makeNoiseSrc(); // distant turbine
    const src3 = makeNoiseSrc(); // air texture

    // Frequencies kept in the low-mid range — nothing harsh above 800Hz
    const bpf1 = ctx.createBiquadFilter();
    bpf1.type = 'bandpass'; bpf1.frequency.value = 110; bpf1.Q.value = 0.9;

    const bpf2 = ctx.createBiquadFilter();
    bpf2.type = 'bandpass'; bpf2.frequency.value = 420; bpf2.Q.value = 1.2;

    const bpf3 = ctx.createBiquadFilter();
    bpf3.type = 'bandpass'; bpf3.frequency.value = 750; bpf3.Q.value = 0.7;

    const g1 = ctx.createGain(); g1.gain.value = 1.00;
    const g2 = ctx.createGain(); g2.gain.value = 0.28; // turbine much quieter
    const g3 = ctx.createGain(); g3.gain.value = 0.08; // air texture barely there

    // Master envelope: slow rise → gentle hold → long fade
    // Peak at 0.13 — present but never startling
    const master = ctx.createGain();
    const t      = ctx.currentTime;
    master.gain.setValueAtTime(0,    t);
    master.gain.linearRampToValueAtTime(0.13, t + 0.65); // slow approach
    master.gain.linearRampToValueAtTime(0.14, t + 1.10); // barely perceptible peak
    master.gain.linearRampToValueAtTime(0.08, t + 1.70); // receding
    master.gain.linearRampToValueAtTime(0,    t + 2.60); // long natural fade

    src1.connect(bpf1); bpf1.connect(g1); g1.connect(master);
    src2.connect(bpf2); bpf2.connect(g2); g2.connect(master);
    src3.connect(bpf3); bpf3.connect(g3); g3.connect(master);
    master.connect(ctx.destination);

    src1.start(); src2.start(); src3.start();

    setTimeout(() => {
      try { src1.stop(); src2.stop(); src3.stop(); ctx.close(); } catch (_) {}
    }, 2900);
  } catch (_) { /* audio unavailable — silent fallback */ }
}

// ─── CloudLayer ───────────────────────────────────────────────────────────────
// Full-viewport container that drifts right → left.
// The narrowed x range ('108%' → '-115%') means less horizontal travel —
// clouds float through, rather than sweep dramatically.
//
// Opacity times [0, 0.06, 0.76, 1.0]: fade in at entry (6%), hold through
// most of the crossing, then begin dissolving early (76%) for a long,
// lingering exit — the transition settles rather than stops.
function CloudLayer({ clouds, blur, duration, delay, peakOpacity, className }) {
  return (
    <motion.div
      className={className}
      style={{
        position:      'absolute',
        top:            0,
        left:           0,
        width:         '100%',
        height:        '100%',
        overflow:      'visible',
        filter:        `blur(${blur}px)`,
        pointerEvents: 'none',
        willChange:    'transform, opacity',
      }}
      initial={{ x: '108%', opacity: 0 }}
      animate={{
        x:       ['108%', '-115%'],
        opacity: [0, peakOpacity, peakOpacity, 0],
      }}
      transition={{
        duration,
        delay,
        x:       { ease: [0.20, 0.00, 0.38, 1.0] },
        // fade starts dissolving at 76% of travel — early enough for a long tail
        opacity: { times: [0, 0.06, 0.76, 1.0], ease: 'linear' },
      }}
    >
      {clouds.map((c, i) => (
        <img
          key={i}
          src={c.src}
          draggable={false}
          style={{
            position:      'absolute',
            top:            c.top,
            left:           c.left,
            width:          c.width,
            height:        'auto',
            pointerEvents: 'none',
            userSelect:    'none',
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── Cloud data ───────────────────────────────────────────────────────────────
// Clouds spread across the full layer width (left: 1%–70%) so as the layer
// drifts right→left, the user sees a continuous procession of clouds rather
// than a single band. Higher left% clouds enter the viewport later, creating
// natural stagger within each layer.

const BG_CLOUDS = [
  { src: CLOUD_A, top:  '2%', left:  '1%', width: '62vw' },
  { src: CLOUD_B, top: '44%', left: '18%', width: '54vw' },
  { src: CLOUD_A, top: '14%', left: '44%', width: '58vw' },
  { src: CLOUD_B, top: '58%', left: '62%', width: '52vw' },
];

const MID_CLOUDS = [
  { src: CLOUD_B, top:  '7%', left:  '1%', width: '50vw' },
  { src: CLOUD_A, top: '50%', left: '14%', width: '44vw' },
  { src: CLOUD_B, top: '24%', left: '34%', width: '38vw' },
  { src: CLOUD_A, top: '62%', left: '50%', width: '46vw' },
  { src: CLOUD_B, top:  '9%', left: '68%', width: '42vw' },
];

const FG_CLOUDS = [
  { src: CLOUD_A, top: '10%', left:  '1%', width: '46vw' },
  { src: CLOUD_B, top: '58%', left: '10%', width: '36vw' },
  { src: CLOUD_A, top: '28%', left: '52%', width: '44vw' },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
export function TravelTransitionProvider({ children }) {
  const [active,  setActive]  = useState(false);
  const activeRef             = useRef(false);
  const timers                = useRef([]);

  useEffect(() => {
    [CLOUD_A, CLOUD_B].forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  const schedule = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const triggerTransition = useCallback((navigate, to = '/work/travel') => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearAll();

    // ── 160ms anticipation pause ──────────────────────────────────────────────
    // Nothing happens immediately after click. The brief stillness before
    // movement begins is what makes a transition feel intentional rather than
    // reactive. All timers run relative to this deferred start.
    const startId = setTimeout(() => {
      setActive(true);
      document.body.classList.add('tt-sweeping');
      playAirplaneSweep();

      // Navigate early — new page renders behind the clouds immediately.
      // The cloud sweep is the reveal; the page just needs to be there.
      schedule(() => navigate(to), 500);

      // Lift page dim as midground finishes (0.06 + 4.0s ≈ 4060ms)
      schedule(() => document.body.classList.remove('tt-sweeping'), 4100);

      // Unmount after background fully dissolves (5.5s + buffer)
      schedule(() => {
        setActive(false);
        activeRef.current = false;
      }, 5700);
    }, 160);

    timers.current.push(startId);
  }, []);

  return (
    <TravelTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      {/* ── Global styles ── */}
      <style>{`
        /* Page drift during sweep — opacity + very slight scale carries
           the atmospheric dissolve. Brightness only subtly reduced.     */
        #main-wrap {
          transition:
            filter    420ms ease,
            transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
            opacity   800ms ease;
        }
        body.tt-sweeping #main-wrap {
          filter:  brightness(0.93);
          opacity: 0.88;
        }

        /* Reduced-motion: no clouds, no movement */
        @media (prefers-reduced-motion: reduce) {
          .tt-layer { display: none !important; }
          body.tt-sweeping #main-wrap {
            filter:    none !important;
            transform: none !important;
            opacity:   1   !important;
          }
        }

        /* Mobile: skip background layer for paint savings */
        @media (max-width: 640px) {
          .tt-layer-bg { display: none !important; }
        }
      `}</style>

      {/* ── Overlay ── */}
      {active && (
        <div
          aria-hidden="true"
          style={{
            position:      'fixed',
            inset:          0,
            zIndex:         900,
            pointerEvents: 'none',
            overflow:      'hidden',
          }}
        >
          {/* ── Atmospheric depth: vignette ───────────────────────────────────
              Soft edge-darkening creates a sense of enclosure — like the
              corners of a memory or a camera lens falling off at the border.
              Tied to the background layer's 2.80s duration.              */}
          <motion.div
            style={{
              position:   'absolute',
              inset:       0,
              background: 'radial-gradient(ellipse 88% 80% at 50% 50%, transparent 34%, rgba(5, 3, 1, 0.22) 100%)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 5.50,
              times:    [0, 0.05, 0.76, 1.0],
              ease:     'linear',
            }}
          />

          {/* ── Atmospheric depth: warm glow ──────────────────────────────────
              A barely-there luminous bloom at the centre — the quality of
              light through cloud cover at altitude. Opacity is intentionally
              very low; this should be felt, not noticed.                  */}
          <motion.div
            style={{
              position:   'absolute',
              inset:       0,
              background: 'radial-gradient(ellipse 54% 50% at 50% 46%, rgba(248, 236, 208, 0.22) 0%, transparent 66%)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 5.50,
              times:    [0, 0.06, 0.72, 1.0],
              ease:     'linear',
            }}
          />

          {/* Layer A — background: largest, very diffuse (blur 62px, opacity 0.36)
              At this blur level the cloud shape is completely dissolved.
              What remains is soft warm luminous mass — depth, not object.  */}
          <CloudLayer
            className="tt-layer tt-layer-bg"
            clouds={BG_CLOUDS}
            blur={62}
            duration={5.50}
            delay={0}
            peakOpacity={0.36}
          />

          {/* Layer B — midground: main atmospheric event (blur 28px, opacity 0.54)
              Edges are soft enough to feel like haze rather than a shape.
              This is the layer the eye follows through the transition.      */}
          <CloudLayer
            className="tt-layer tt-layer-mid"
            clouds={MID_CLOUDS}
            blur={28}
            duration={4.00}
            delay={0.06}
            peakOpacity={0.54}
          />

          {/* Layer C — foreground: closest and fastest (blur 11px, opacity 0.48)
              Slightly sharper than midground — creates the sense of something
              passing immediately in front. Still atmospheric, not graphic.  */}
          <CloudLayer
            className="tt-layer tt-layer-fg"
            clouds={FG_CLOUDS}
            blur={11}
            duration={2.80}
            delay={0.04}
            peakOpacity={0.48}
          />
        </div>
      )}
    </TravelTransitionContext.Provider>
  );
}
