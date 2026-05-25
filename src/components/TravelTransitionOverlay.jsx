import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Context ──────────────────────────────────────────────────────────────────
const TravelTransitionContext = createContext(null);

export function useTravelTransition() {
  const ctx = useContext(TravelTransitionContext);
  if (!ctx) throw new Error('useTravelTransition must be used inside TravelTransitionProvider');
  return ctx;
}

// ─── Airplane sound synthesis ─────────────────────────────────────────────────
// Three independent filtered-noise bands layered to produce a convincing
// flyover: low engine rumble + turbine whine + high-frequency air rush.
// No audio asset required.
function playAirplaneSweep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx  = new AC();
    const len  = Math.floor(ctx.sampleRate * 2.4);

    // Generate an independent noise buffer for each band
    function makeNoiseSrc() {
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      return src;
    }

    const src1 = makeNoiseSrc(); // engine rumble
    const src2 = makeNoiseSrc(); // turbine whine
    const src3 = makeNoiseSrc(); // air-rush presence

    const bpf1 = ctx.createBiquadFilter();
    bpf1.type = 'bandpass'; bpf1.frequency.value = 120; bpf1.Q.value = 1.0;

    const bpf2 = ctx.createBiquadFilter();
    bpf2.type = 'bandpass'; bpf2.frequency.value = 480; bpf2.Q.value = 1.4;

    const bpf3 = ctx.createBiquadFilter();
    bpf3.type = 'bandpass'; bpf3.frequency.value = 1100; bpf3.Q.value = 0.8;

    const g1 = ctx.createGain(); g1.gain.value = 1.00; // rumble is dominant
    const g2 = ctx.createGain(); g2.gain.value = 0.45; // whine is secondary
    const g3 = ctx.createGain(); g3.gain.value = 0.18; // presence is subtle

    // Master gain envelope: approach → peak as it passes → recede
    const master = ctx.createGain();
    const t      = ctx.currentTime;
    master.gain.setValueAtTime(0,    t);
    master.gain.linearRampToValueAtTime(0.22, t + 0.32); // plane approaches
    master.gain.linearRampToValueAtTime(0.25, t + 0.85); // loudest as it passes overhead
    master.gain.linearRampToValueAtTime(0.15, t + 1.40); // beginning to recede
    master.gain.linearRampToValueAtTime(0,    t + 2.10); // gone

    src1.connect(bpf1); bpf1.connect(g1); g1.connect(master);
    src2.connect(bpf2); bpf2.connect(g2); g2.connect(master);
    src3.connect(bpf3); bpf3.connect(g3); g3.connect(master);
    master.connect(ctx.destination);

    src1.start(); src2.start(); src3.start();

    setTimeout(() => {
      try { src1.stop(); src2.stop(); src3.stop(); ctx.close(); } catch (_) {}
    }, 2400);
  } catch (_) { /* audio unavailable — silent fallback */ }
}

// ─── CloudShape ───────────────────────────────────────────────────────────────
// A pill-shaped base + overlapping circles along the top edge.
// Together they form a recognisable cumulus silhouette.
// At high blur (bg layer) the shape dissolves into pure luminous mass.
// At low blur (fg layer) the individual puffs read clearly.
function CloudShape({ baseW, baseH, puffs, color }) {
  return (
    <div style={{ position: 'relative', width: baseW, height: baseH }}>
      {/* Flat base — the cloud floor */}
      <div style={{
        position:     'absolute',
        inset:         0,
        borderRadius: '999px',
        background:    color,
      }} />
      {/* Puffs — bumpy top edge */}
      {puffs.map((p, i) => (
        <div key={i} style={{
          position:     'absolute',
          width:         p.s,
          height:        p.s,
          borderRadius: '50%',
          background:    color,
          top:           p.t, // negative = extends above base
          left:          p.l,
        }} />
      ))}
    </div>
  );
}

// ─── CloudLayer ───────────────────────────────────────────────────────────────
// Full-viewport container that translates right → left, carrying its clouds
// with it. Speed difference between layers creates parallax depth.
//
// x: '115%' starts the layer one-viewport-width off screen to the right.
// x: '-130%' ends it one-viewport-width off screen to the left.
// (percentages are of the element's own width = 100vw)
//
// Opacity keyframes with times: [0, 0.08, 0.88, 1.0] mean the layer fades in
// very quickly at entry, holds at peak for the crossing, and fades out briefly
// before exit — so it's fully opaque for most of its on-screen journey.
function CloudLayer({ clouds, cloudColor, blur, duration, delay, peakOpacity, className }) {
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
      initial={{ x: '115%', opacity: 0 }}
      animate={{
        x:       ['115%', '-130%'],
        opacity: [0, peakOpacity, peakOpacity, 0],
      }}
      transition={{
        duration,
        delay,
        // x: nearly linear — clouds move at consistent perceived speed
        x:       { ease: [0.18, 0.00, 0.42, 1.0] },
        // opacity: fast fade-in, long hold, brief fade-out
        opacity: { times: [0, 0.08, 0.88, 1.0], ease: 'linear' },
      }}
    >
      {clouds.map((c, i) => (
        <div key={i} style={{ position: 'absolute', top: c.top, left: c.left }}>
          <CloudShape
            baseW={c.baseW}
            baseH={c.baseH}
            puffs={c.puffs}
            color={cloudColor}
          />
        </div>
      ))}
    </motion.div>
  );
}

// ─── Cloud data ───────────────────────────────────────────────────────────────
// Each cloud: { top, left } = position within layer (% strings)
//             baseW, baseH  = cloud body dimensions (px)
//             puffs          = [{ s: size, t: top (neg = above base), l: left }]
//
// Clouds at different `left` positions within the same layer appear at
// slightly different times as the layer sweeps — natural-looking stagger.

// Background — large, slow, heavy blur. Two masses at different heights.
const BG_CLOUDS = [
  {
    top: '5%', left: '5%',
    baseW: 520, baseH: 128,
    puffs: [
      { s: 196, t: -114, l: 18 },
      { s: 250, t: -146, l: 132 },
      { s: 205, t: -120, l: 300 },
      { s: 163, t: -96,  l: 390 },
    ],
  },
  {
    top: '50%', left: '22%',
    baseW: 420, baseH: 108,
    puffs: [
      { s: 160, t: -93,  l: 14 },
      { s: 196, t: -114, l: 104 },
      { s: 160, t: -93,  l: 246 },
    ],
  },
];

// Midground — medium speed, 18px blur. Three clouds — the main visual event.
const MID_CLOUDS = [
  {
    top: '14%', left: '3%',
    baseW: 480, baseH: 116,
    puffs: [
      { s: 176, t: -102, l: 14  },
      { s: 226, t: -132, l: 106 },
      { s: 186, t: -108, l: 270 },
      { s: 146, t: -85,  l: 380 },
    ],
  },
  {
    top: '55%', left: '18%',
    baseW: 330, baseH: 86,
    puffs: [
      { s: 126, t: -73, l: 10 },
      { s: 158, t: -92, l: 84 },
      { s: 126, t: -73, l: 194 },
    ],
  },
  {
    top: '32%', left: '48%',
    baseW: 258, baseH: 68,
    puffs: [
      { s: 96,  t: -56, l: 10 },
      { s: 122, t: -71, l: 64 },
      { s: 96,  t: -56, l: 146 },
    ],
  },
];

// Foreground — fastest, 6px blur. Two crisp wisps close to the viewer.
// Positions kept low enough that puffs clear the viewport top edge.
const FG_CLOUDS = [
  {
    top: '16%', left: '2%',
    baseW: 360, baseH: 90,
    puffs: [
      { s: 132, t: -77, l: 10  },
      { s: 166, t: -97, l: 86  },
      { s: 136, t: -79, l: 216 },
      { s: 106, t: -62, l: 294 },
    ],
  },
  {
    top: '62%', left: '10%',
    baseW: 270, baseH: 70,
    puffs: [
      { s: 102, t: -59, l: 10 },
      { s: 128, t: -74, l: 74 },
      { s: 102, t: -59, l: 168 },
    ],
  },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
export function TravelTransitionProvider({ children }) {
  const [active,  setActive]  = useState(false);
  const activeRef             = useRef(false);
  const timers                = useRef([]);

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
    setActive(true);
    document.body.classList.add('tt-sweeping');
    playAirplaneSweep();

    // Navigate at t=620ms. At that point all three layers are at peak opacity
    // and their clouds are mid-crossing — maximum coverage.
    schedule(() => navigate(to), 620);

    // Lift the page dim as the midground finishes (delay:0.06 + dur:1.3 = ~1360ms)
    schedule(() => document.body.classList.remove('tt-sweeping'), 1400);

    // Unmount after the background layer fully exits (dur:1.8s → done at ~1800ms)
    schedule(() => {
      setActive(false);
      activeRef.current = false;
    }, 1900);
  }, []);

  return (
    <TravelTransitionContext.Provider value={{ triggerTransition }}>
      {children}

      {/* ── Global styles ── */}
      <style>{`
        /* Subtle page dim while clouds sweep over — makes clouds pop */
        #main-wrap {
          transition: filter 320ms ease;
        }
        body.tt-sweeping #main-wrap {
          filter: brightness(0.86);
        }

        /* Reduced-motion: skip clouds entirely */
        @media (prefers-reduced-motion: reduce) {
          .tt-layer { display: none !important; }
          body.tt-sweeping #main-wrap { filter: none !important; }
        }

        /* Mobile: drop background layer (saves paint) */
        @media (max-width: 640px) {
          .tt-layer-bg { display: none !important; }
        }
      `}</style>

      {/* ── Cloud overlay ── */}
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
          {/* Layer A — background: large, slow, blur 48px */}
          <CloudLayer
            className="tt-layer tt-layer-bg"
            clouds={BG_CLOUDS}
            cloudColor="rgba(246, 242, 232, 1)"
            blur={48}
            duration={1.80}
            delay={0}
            peakOpacity={0.62}
          />

          {/* Layer B — midground: main event, blur 18px */}
          <CloudLayer
            className="tt-layer tt-layer-mid"
            clouds={MID_CLOUDS}
            cloudColor="rgba(252, 250, 244, 1)"
            blur={18}
            duration={1.30}
            delay={0.06}
            peakOpacity={0.90}
          />

          {/* Layer C — foreground: fastest, crispest, blur 6px */}
          <CloudLayer
            className="tt-layer tt-layer-fg"
            clouds={FG_CLOUDS}
            cloudColor="rgba(255, 254, 252, 1)"
            blur={6}
            duration={0.85}
            delay={0.04}
            peakOpacity={0.80}
          />
        </div>
      )}
    </TravelTransitionContext.Provider>
  );
}
