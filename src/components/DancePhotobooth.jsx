import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { projects } from '../data/projects';

const INK     = 'oklch(27% 0.035 40)';
const INK_DIM = 'oklch(42% 0.03 45)';
const GOLD    = '#c9a04f';

const dance = projects.find(p => p.slug === 'dance');
const MEDIA = (dance?.blogImages || dance?.gridImages || []);
const isVideo = (src) => /\.(mp4|webm|mov|m4v)$/i.test(src || '');

// Pinned photos — scattered, tilted prints held up with push pins. Positions
// are % of the board area; desktop and mobile are tuned separately.
const PINS = [
  { src: MEDIA[0], w: 210, rot: -6, pin: '#e0574a', pos: { x: 4,  y: 4  }, posM: { x: 3,  y: 2  } },
  { src: MEDIA[3], w: 184, rot: 5,  pin: '#3a7be0', pos: { x: 46, y: 1  }, posM: { x: 52, y: 4  } },
  { src: MEDIA[2], w: 224, rot: 3,  pin: '#c9a04f', pos: { x: 14, y: 34 }, posM: { x: 6,  y: 34 } },
  { src: MEDIA[4], w: 192, rot: -5, pin: '#d95a86', pos: { x: 52, y: 40 }, posM: { x: 50, y: 40 } },
  { src: MEDIA[5], w: 200, rot: 6,  pin: '#5aa06a', pos: { x: 26, y: 68 }, posM: { x: 20, y: 70 } },
];

function PushPin({ color }) {
  return (
    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 3, filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.3))', pointerEvents: 'none' }}>
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="9" r="7" fill={color} />
        <circle cx="8.6" cy="6.6" r="2.4" fill="rgba(255,255,255,0.55)" />
        <rect x="10.2" y="13" width="1.6" height="7" rx="0.8" fill="rgba(0,0,0,0.32)" />
      </svg>
    </div>
  );
}

function PinnedPhoto({ item, index, isMobile, reduce }) {
  const [hovered, setHovered] = useState(false);
  const pos = isMobile ? item.posM : item.pos;
  const w = Math.round(item.w * (isMobile ? 0.66 : 1));
  const h = Math.round(w * 0.82);

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.85, y: -14, rotate: item.rot * 1.8 }}
      animate={{ opacity: 1, scale: hovered ? 1.04 : 1, y: hovered ? -6 : 0, rotate: hovered ? item.rot * 0.5 : item.rot }}
      transition={reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 220, damping: 18, delay: 0.15 + index * 0.12 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
        width: w, zIndex: hovered ? 20 : 10 - index,
        background: '#fff', padding: 8, borderRadius: 2,
        boxShadow: hovered
          ? '0 20px 34px rgba(50,32,14,0.28)'
          : '0 8px 18px rgba(50,32,14,0.20)',
        cursor: 'default',
      }}
    >
      <PushPin color={item.pin} />
      <div style={{ width: '100%', height: h, overflow: 'hidden', background: '#111' }}>
        {isVideo(item.src)
          ? <video src={item.src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <img src={item.src} alt="" loading="lazy" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      </div>
    </motion.div>
  );
}

export default function DancePhotobooth() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const paragraphs = (dance?.description || '').split('\n\n');

  return (
    <main style={{
      position: 'relative', minHeight: '100vh', width: '100%',
      paddingTop: 'var(--nav-h)', background: 'var(--bg)',
    }}>
      {/* Centered title */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', padding: 'clamp(40px, 7vh, 84px) 24px clamp(6px, 1.5vh, 16px)' }}
      >
        <h1 style={{ margin: 0, fontFamily: "'EB Garamond', serif", fontWeight: 400, fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', color: INK, lineHeight: 1 }}>
          Dance
        </h1>
        <div style={{ width: 54, height: 2, background: GOLD, opacity: 0.6, margin: '20px auto 0' }} />
      </motion.header>

      {/* Body: widened text (nudged right) + pinned photos */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start', gap: isMobile ? 0 : 'clamp(20px, 3vw, 48px)',
        padding: isMobile ? '20px 24px 60px' : '20px 40px 90px',
        maxWidth: 1400, margin: '0 auto',
      }}>
        {/* Text — widened column, shifted a little right */}
        <section style={{
          flex: isMobile ? 'none' : '1.7 1 0',
          paddingLeft: isMobile ? 0 : 'clamp(32px, 4.5vw, 88px)',
          paddingRight: isMobile ? 0 : 'clamp(8px, 1.5vw, 24px)',
        }}>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {paragraphs.map((p, i) => (
              <p key={i} style={{ margin: '0 0 1.15em', maxWidth: 820, fontFamily: "'EB Garamond', serif", fontSize: 'clamp(1rem, 1.4vw, 1.16rem)', lineHeight: 1.85, color: INK_DIM }}>
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

        {/* Pinned photos */}
        <section style={{
          flex: isMobile ? 'none' : '1 1 0',
          alignSelf: 'stretch', width: isMobile ? '100%' : 'auto',
          marginTop: isMobile ? 40 : 0,
        }}>
          <div style={{ position: 'relative', width: '100%', height: isMobile ? '118vw' : 'min(74vh, 620px)' }}>
            {PINS.map((item, i) => (
              <PinnedPhoto key={i} item={item} index={i} isMobile={isMobile} reduce={reduce} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
