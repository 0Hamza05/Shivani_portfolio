import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { projects } from '../data/projects';

const INK     = 'oklch(27% 0.035 40)';
const INK_DIM = 'oklch(42% 0.03 45)';
const GOLD    = '#c9a04f';

const dance = projects.find(p => p.slug === 'dance');
// The "film reel" media — photos and clips, in order.
const MEDIA = (dance?.blogImages || dance?.gridImages || []);
const isVideo = (src) => /\.(mp4|webm|mov|m4v)$/i.test(src || '');

// ─── Strip geometry (px) ────────────────────────────────────────────────────
const FRAMES = 4;
const FRAME_W = 122;
const FRAME_GAP = 6;
const STRIP_PAD_X = 9;
const STRIP_PAD_TOP = 9;
const STRIP_PAD_BOT = 16;
const STRIP_W = FRAME_W + STRIP_PAD_X * 2;
// Each frame's height follows its media's real aspect ratio, so the whole
// image is seen (never cropped). Clamped so the strip stays a sane length.
const FRAME_H_MIN = 60;
const FRAME_H_MAX = 100;
const frameHeight = (ratio) => {
  const h = ratio ? FRAME_W / ratio : FRAME_W * 0.75; // fallback 4:3
  return Math.round(Math.min(FRAME_H_MAX, Math.max(FRAME_H_MIN, h)));
};

// ─── Machine geometry ───────────────────────────────────────────────────────
const WOOD_PAD = 18;
const WELL_W = 300;
const WELL_H = 544;
const BOOTH_W = WELL_W + WOOD_PAD * 2;   // 336
const BOOTH_H = WELL_H + WOOD_PAD * 2;   // 580
const ROLLER_Y = 40;                     // roller top, relative to well
const ROLLER_H = 22;
const FEED_Y = ROLLER_Y + 6;             // strip top tucks just behind the roller

function Frame({ src, h }) {
  // contain (on white photo-paper) so the whole frame is always visible; since
  // h follows the media ratio, matched shots fill edge-to-edge with no bars.
  const common = {
    width: '100%', height: h, objectFit: 'contain', display: 'block',
    background: '#fff',
  };
  return (
    <div style={{ width: FRAME_W, height: h, overflow: 'hidden', background: '#fff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.07)' }}>
      {isVideo(src)
        ? <video src={src} autoPlay muted loop playsInline style={common} />
        : <img src={src} alt="" loading="lazy" draggable={false} style={common} />}
    </div>
  );
}

// One printed photo-strip: feeds down from behind the roller, then hangs with
// a gentle sway. The parent swaps it out (slides down + fades) to print the next.
function PhotoStrip({ startIndex, reduce, ratios }) {
  const frames = Array.from({ length: FRAMES }, (_, i) => MEDIA[(startIndex + i) % MEDIA.length]);
  const heights = frames.map(src => frameHeight(ratios[src]));
  const stripH = heights.reduce((a, b) => a + b, 0) + (FRAMES - 1) * FRAME_GAP + STRIP_PAD_TOP + STRIP_PAD_BOT;
  return (
    <motion.div
      initial={reduce ? { y: 6, opacity: 0 } : { y: -stripH - 10 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduce
        ? { duration: 0.4 }
        : { y: { duration: 2.6, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.6 } }}
      style={{ position: 'absolute', top: FEED_Y, left: '50%', marginLeft: -STRIP_W / 2, zIndex: 2, width: STRIP_W }}
    >
      {/* Sway is a CSS animation (not Framer) so AnimatePresence isn't blocked
          from unmounting this strip by an infinitely-repeating child animation. */}
      <div
        className={reduce ? undefined : 'dance-sway'}
        style={{
          width: STRIP_W, background: '#fdfdfb',
          padding: `${STRIP_PAD_TOP}px ${STRIP_PAD_X}px ${STRIP_PAD_BOT}px`,
          boxShadow: '0 16px 26px rgba(0,0,0,0.4), 0 3px 8px rgba(0,0,0,0.3)',
          transformOrigin: '50% 0%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: FRAME_GAP }}>
          {frames.map((src, i) => <Frame key={i} src={src} h={heights[i]} />)}
        </div>
      </div>
    </motion.div>
  );
}

// The vintage machine: wood surround + recessed brushed-brass well with a
// feed roller at the top and an output tray at the bottom.
function Machine({ printing, paused, onToggle, children }) {
  return (
    <div style={{
      position: 'relative', width: BOOTH_W, height: BOOTH_H, borderRadius: 12,
      // wood surround
      background: `
        repeating-linear-gradient(92deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 9px),
        linear-gradient(125deg, #6f4a2c, #99693d 40%, #5c3d24 75%, #7c522f)`,
      boxShadow: '0 40px 80px rgba(40,24,10,0.4), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(0,0,0,0.25)',
      padding: WOOD_PAD,
    }}>
      {/* recessed brass well */}
      <div style={{
        position: 'relative', width: WELL_W, height: WELL_H, borderRadius: 6, overflow: 'hidden',
        background: `
          linear-gradient(140deg, #cdb888 0%, #a8926a 20%, #ddcaa0 42%, #9c8760 66%, #c6b183 100%)`,
        boxShadow: 'inset 0 0 34px rgba(50,34,12,0.5), inset 0 3px 8px rgba(30,20,8,0.55), inset 0 -2px 6px rgba(255,240,210,0.25)',
      }}>
        {/* brushed-metal scratches */}
        <svg aria-hidden width="100%" height="100%" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.16, mixBlendMode: 'overlay' }}>
          <filter id="brassGrain"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#brassGrain)" />
        </svg>
        {/* faint diagonal scuffs */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.5,
          backgroundImage: 'repeating-linear-gradient(58deg, rgba(255,245,220,0.05) 0 1px, transparent 1px 6px), repeating-linear-gradient(-58deg, rgba(40,26,10,0.05) 0 1px, transparent 1px 7px)',
        }} />

        {/* the hanging strip lives here */}
        {children}

        {/* feed roller (drawn over the strip's top so it looks fed through) */}
        <div style={{ position: 'absolute', top: ROLLER_Y, left: 14, right: 14, height: ROLLER_H, zIndex: 3 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: ROLLER_H / 2,
            background: 'linear-gradient(180deg, #6b5a3f 0%, #3a2e1c 48%, #1d160c 100%)',
            boxShadow: '0 3px 7px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,235,190,0.35)',
          }} />
          {/* roller sheen */}
          <div style={{ position: 'absolute', top: 4, left: 12, right: 12, height: 3, borderRadius: 2, background: 'rgba(255,240,205,0.35)' }} />
          {/* end knobs */}
          {[-9, WELL_W - 28 - 9].map((x, i) => (
            <div key={i} style={{
              position: 'absolute', top: -3, left: i === 0 ? -9 : 'auto', right: i === 1 ? -9 : 'auto',
              width: 20, height: ROLLER_H + 6, borderRadius: 5,
              background: 'radial-gradient(circle at 40% 35%, #7a6743, #241a0e)',
              boxShadow: '0 3px 6px rgba(0,0,0,0.5)',
            }} />
          ))}
        </div>

        {/* status light */}
        <motion.div
          animate={{ opacity: printing && !paused ? [0.4, 1, 0.4] : 0.55 }}
          transition={{ duration: 1, repeat: printing && !paused ? Infinity : 0 }}
          style={{ position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: '50%', background: '#8fd18f', boxShadow: '0 0 8px rgba(120,210,120,0.8)', zIndex: 4 }}
        />

        {/* output tray at the bottom */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, zIndex: 4,
          background: 'linear-gradient(180deg, rgba(60,40,16,0.0), rgba(60,40,16,0.28) 40%, #b39b6f 60%, #8f7a52 100%)',
        }}>
          <div style={{ position: 'absolute', top: '58%', left: 16, right: 16, height: 2, background: 'rgba(255,240,205,0.35)', borderRadius: 2 }} />
        </div>

        {/* pause / play control */}
        <button
          onClick={onToggle}
          aria-label={paused ? 'Resume photo printing' : 'Pause photo printing'}
          style={{
            position: 'absolute', left: 16, bottom: 16, zIndex: 6,
            width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(28,20,10,0.62)', backdropFilter: 'blur(3px)',
            color: '#f3ead6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {paused
            ? <svg width="15" height="15" viewBox="0 0 12 12" fill="currentColor"><path d="M2 1 L11 6 L2 11 Z" /></svg>
            : <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1.5" width="2.8" height="9" rx="0.6" /><rect x="7.2" y="1.5" width="2.8" height="9" rx="0.6" /></svg>}
        </button>
      </div>
    </div>
  );
}

export default function DancePhotobooth() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900);
  const [paused, setPaused] = useState(false);
  const [ratios, setRatios] = useState({}); // media src -> width/height
  const [cycle, setCycle] = useState(0);       // which strip is printing
  const [vp, setVp] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  const boothRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 900);
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scale the whole machine so it fills the viewport height under the navbar
  // (bounded by the right column's width). All internal geometry scales as one.
  const NAV_H = 54;
  const boothScale = (() => {
    if (isMobile) return Math.min(1, (vp.w - 40) / BOOTH_W);
    const byH = (vp.h - NAV_H - 24) / BOOTH_H;
    const byW = (vp.w * 0.46 - 40) / BOOTH_W;
    return Math.max(0.8, Math.min(byH, byW, 2.4));
  })();

  // Measure each media item's natural aspect ratio so frames can show the
  // whole image instead of cropping it.
  useEffect(() => {
    MEDIA.forEach(src => {
      if (isVideo(src)) {
        const v = document.createElement('video');
        v.preload = 'metadata'; v.muted = true;
        v.onloadedmetadata = () => v.videoWidth && setRatios(r => ({ ...r, [src]: v.videoWidth / v.videoHeight }));
        v.src = src;
      } else {
        const img = new Image();
        img.onload = () => img.naturalWidth && setRatios(r => ({ ...r, [src]: img.naturalWidth / img.naturalHeight }));
        img.src = src;
      }
    });
  }, []);

  // Print a fresh strip on a steady cadence (~2.6s to feed out + a hold),
  // paused by the pause button so the machine genuinely stops.
  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => setCycle(c => c + 1), 6400);
    return () => clearInterval(id);
  }, [paused, reduce]);

  // Pausing also freezes the video frames.
  useEffect(() => {
    const vids = boothRef.current?.querySelectorAll('video') || [];
    vids.forEach(v => { if (paused) v.pause(); else v.play().catch(() => {}); });
  }, [paused, cycle]);

  const paragraphs = (dance?.description || '').split('\n\n');
  const startIndex = (cycle * 2) % MEDIA.length;

  return (
    <main style={{
      position: 'relative', minHeight: '100vh', width: '100%',
      paddingTop: 'var(--nav-h)', background: 'var(--bg)',
      display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'flex-start',
    }}>
      <style>{`
        @keyframes danceSway { 0%,100%{ transform: rotate(0deg); } 34%{ transform: rotate(0.8deg); } 67%{ transform: rotate(-0.6deg); } }
        .dance-sway { animation: danceSway 6.5s ease-in-out infinite; animation-delay: 2.6s; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .dance-sway { animation: none; } }
      `}</style>

      {/* LEFT — text */}
      <section style={{
        flex: isMobile ? 'none' : '1 1 54%',
        padding: isMobile ? 'clamp(28px,7vw,44px) 24px 8px' : 'clamp(56px, 9vh, 104px) clamp(40px, 5vw, 88px) 80px',
        maxWidth: isMobile ? 'none' : 680,
      }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: '0.72rem', color: GOLD, marginBottom: 12 }}>
            Indian Classical Dance
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', color: INK, lineHeight: 1 }}>
            Dance
          </h1>
          <div style={{ width: 52, height: 2, background: GOLD, opacity: 0.6, margin: '20px 0 26px' }} />
          {paragraphs.map((p, i) => (
            <p key={i} style={{ margin: '0 0 1.15em', maxWidth: 620, fontFamily: "'EB Garamond', serif", fontSize: 'clamp(0.98rem, 1.5vw, 1.1rem)', lineHeight: 1.8, color: INK_DIM }}>
              {p}
            </p>
          ))}
          <Link to="/" style={{
            display: 'inline-block', marginTop: 18,
            fontFamily: "'EB Garamond', serif", fontSize: '0.75rem', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: INK_DIM, borderBottom: `1px solid ${GOLD}`, paddingBottom: 2, textDecoration: 'none',
          }}>← Back to gallery</Link>
        </motion.div>
      </section>

      {/* RIGHT — photobooth machine */}
      <section style={{
        flex: isMobile ? 'none' : '1 1 46%',
        display: 'flex', justifyContent: 'center',
        position: isMobile ? 'relative' : 'sticky',
        top: isMobile ? 'auto' : 'var(--nav-h)',
        height: isMobile ? 'auto' : 'calc(100vh - var(--nav-h))',
        alignItems: 'center',
        padding: isMobile ? '10px 24px 60px' : '0 24px',
      }}>
        <div ref={boothRef} style={{ width: BOOTH_W * boothScale, height: BOOTH_H * boothScale, position: 'relative' }}>
          <div style={{ transform: `scale(${boothScale})`, transformOrigin: 'top left', width: BOOTH_W, height: BOOTH_H }}>
            <Machine
              printing={!paused}
              paused={paused}
              onToggle={() => setPaused(p => !p)}
            >
              <PhotoStrip key={cycle} startIndex={startIndex} reduce={reduce} ratios={ratios} />
            </Machine>
          </div>
        </div>
      </section>
    </main>
  );
}
