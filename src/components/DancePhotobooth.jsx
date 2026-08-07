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

// Film-reel strip — the same five curated shots, now in a straight vertical
// line inside a filmstrip frame (dark strip + sprocket holes down each
// edge), each still presented in its own white polaroid-style mount.
const FRAME_SRCS = [MEDIA[0], MEDIA[3], MEDIA[2], MEDIA[4], MEDIA[5]];

function FilmFrame({ src, index, reduce }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0, scale: hovered ? 1.03 : 1 }}
      transition={reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 220, damping: 20, delay: 0.15 + index * 0.12 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        width: '100%', zIndex: hovered ? 5 : 1,
        background: '#fff', padding: 8, borderRadius: 2,
        boxShadow: hovered
          ? '0 16px 28px rgba(50,32,14,0.26)'
          : '0 6px 14px rgba(50,32,14,0.18)',
        cursor: 'default',
      }}
    >
      <div style={{ width: '100%', aspectRatio: '1 / 0.82', overflow: 'hidden', background: '#111' }}>
        {isVideo(src)
          ? <video src={src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <img src={src} alt="" loading="lazy" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
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

      {/* Body: widened text (nudged right) + film reel */}
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

        {/* Film reel — straight vertical strip of frames */}
        <section style={{
          flex: isMobile ? 'none' : '1 1 0',
          alignSelf: 'flex-start', width: isMobile ? '100%' : 'auto',
          marginTop: isMobile ? 40 : 0,
          display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end',
        }}>
          <div
            className="film-strip"
            style={{
              width: isMobile ? 'min(78vw, 280px)' : 240,
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: '18px 22px',
            }}
          >
            {FRAME_SRCS.map((src, i) => (
              <FilmFrame key={i} src={src} index={i} reduce={reduce} />
            ))}
          </div>
        </section>
      </div>

      <style>{`
        /* Dark filmstrip body with round sprocket-hole perforations tiled
           down each edge — the page background shows through the holes. */
        .film-strip {
          position: relative;
          background: linear-gradient(180deg, #241b14, #16100b);
          border-radius: 10px;
          box-shadow: 0 10px 26px rgba(40,26,14,0.28);
        }
        .film-strip::before,
        .film-strip::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 16px;
          background-image: radial-gradient(circle at 8px 8px, var(--bg) 4px, transparent 4.6px);
          background-size: 16px 24px;
          background-repeat: repeat-y;
          background-position: 0 6px;
        }
        .film-strip::before { left: 2px; }
        .film-strip::after  { right: 2px; }
      `}</style>
    </main>
  );
}
