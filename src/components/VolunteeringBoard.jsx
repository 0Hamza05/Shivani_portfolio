import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { volunteeringBoard, NOTE_COLORS } from '../data/volunteeringBoard';

const INK      = 'oklch(27% 0.035 40)';
const INK_DIM  = 'oklch(42% 0.03 45)';
const CREAM    = 'oklch(97% 0.012 75)';
const GOLD     = '#c9a04f';

// ─── Attachments (pin / tape / clip / binder) ───────────────────────────────
function Attachment({ type, color }) {
  const common = { position: 'absolute', zIndex: 3, pointerEvents: 'none' };
  if (type === 'pushpin') {
    return (
      <div style={{ ...common, top: -11, left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.28))' }}>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="9" r="7" fill={color} />
          <circle cx="8.6" cy="6.6" r="2.4" fill="rgba(255,255,255,0.55)" />
          <rect x="10.2" y="13" width="1.6" height="7" rx="0.8" fill="rgba(0,0,0,0.35)" />
        </svg>
      </div>
    );
  }
  if (type === 'clip') {
    return (
      <div style={{ ...common, top: -15, left: '68%', transform: 'translateX(-50%) rotate(-10deg)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
        <svg width="18" height="40" viewBox="0 0 18 40" fill="none">
          <rect x="3" y="2.4" width="12" height="34" rx="6" stroke={color} strokeWidth="2.4" />
          <rect x="6" y="6" width="6" height="22" rx="3" stroke={color} strokeWidth="2.4" />
        </svg>
      </div>
    );
  }
  if (type === 'binder') {
    return (
      <div style={{ ...common, top: -12, left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.3))' }}>
        <svg width="34" height="20" viewBox="0 0 34 20">
          <rect x="6" y="6" width="22" height="13" rx="2" fill={color} />
          <path d="M9 6 L4 1 M25 6 L30 1" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="6" y="6" width="22" height="4" rx="1" fill="rgba(255,255,255,0.18)" />
        </svg>
      </div>
    );
  }
  // washi / masking tape — a translucent torn strip across the top edge
  const tapeCream = type === 'tape';
  return (
    <div style={{
      ...common, top: -10, left: '50%',
      width: tapeCream ? 74 : 66, height: 26,
      transform: 'translateX(-50%) rotate(-4deg)',
      background: color,
      opacity: tapeCream ? 0.75 : 0.68,
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
      // frayed / cut ends
      clipPath: 'polygon(4% 0, 96% 6%, 100% 92%, 2% 100%)',
      backdropFilter: 'saturate(1.1)',
    }} />
  );
}

// ─── Photo presentations ────────────────────────────────────────────────────
function PhotoBody({ item, isMobile }) {
  const { style, image, caption } = item;
  const width = Math.round(item.width * (isMobile ? 0.62 : 1));
  const img = (h) => (
    <img src={image} alt={item.popup?.title || ''} loading="lazy" draggable={false}
      style={{ width: '100%', height: h, objectFit: 'cover', display: 'block', userSelect: 'none', pointerEvents: 'none' }} />
  );

  if (style === 'polaroid') {
    return (
      <div style={{ width, background: '#fff', padding: '10px 10px 34px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        {img(width * 0.92)}
        {caption && <div style={{ marginTop: 10, textAlign: 'center', fontFamily: "'Cote Lumiere'", fontSize: '1.05rem', color: INK }}>{caption}</div>}
      </div>
    );
  }
  if (style === 'instant') {
    return (
      <div style={{ width, background: '#fbfbf9', padding: '9px 9px 40px', borderRadius: 3, boxShadow: '0 2px 5px rgba(0,0,0,0.07)' }}>
        {img(width * 1.02)}
        {caption && <div style={{ marginTop: 12, textAlign: 'center', fontFamily: "'Cote Lumiere'", fontSize: '1rem', color: INK_DIM }}>{caption}</div>}
      </div>
    );
  }
  if (style === 'postcard') {
    return (
      <div style={{ width, background: '#fff', padding: 6, borderRadius: 4, boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
        <div style={{ border: '1px solid rgba(60,40,20,0.14)', padding: 4 }}>{img(width * 0.6)}</div>
      </div>
    );
  }
  if (style === 'snapshot') {
    return (
      <div style={{ width, background: '#fff', padding: 7, borderRadius: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.07)' }}>
        <div style={{ borderRadius: 6, overflow: 'hidden' }}>{img(width * 0.82)}</div>
      </div>
    );
  }
  // print — thin white border
  return (
    <div style={{ width, background: '#fff', padding: 6, boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
      {img(width * 0.72)}
    </div>
  );
}

function NoteBody({ item, isMobile }) {
  const c = NOTE_COLORS[item.color] || NOTE_COLORS.yellow;
  return (
    <div style={{
      width: isMobile ? 124 : 168, minHeight: isMobile ? 112 : 150, padding: isMobile ? '15px 14px' : '20px 18px',
      background: `linear-gradient(165deg, ${c.bg}, ${c.edge})`,
      boxShadow: '0 3px 8px rgba(0,0,0,0.10)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      // faint peel at the bottom corner
      clipPath: 'polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)',
    }}>
      <div style={{ fontFamily: "'Cote Lumiere'", fontSize: isMobile ? '1.15rem' : '1.5rem', lineHeight: 1.15, color: INK }}>{item.text}</div>
      {item.sub && <div style={{ marginTop: 8, fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: isMobile ? '0.78rem' : '0.9rem', color: INK_DIM }}>{item.sub}</div>}
    </div>
  );
}

// ─── A single draggable board item ──────────────────────────────────────────
function BoardItem({ item, index, boardRef, bumpZ, z, onOpen, reduce, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const draggedRef = useRef(false);
  const pos = isMobile && item.posMobile ? item.posMobile : item.pos;

  const clickable = item.kind === 'photo';

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={boardRef}
      onPointerDown={() => { draggedRef.current = false; bumpZ(item.id); }}
      onDrag={(e, info) => { if (Math.hypot(info.offset.x, info.offset.y) > 4) draggedRef.current = true; }}
      whileDrag={{ scale: 1.06, zIndex: 9999 }}
      initial={reduce
        ? { opacity: 1, scale: 1, x: 0, y: 0 }
        : { opacity: 0, scale: 0.6, y: -40, rotate: item.rotate * 2.2 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      transition={reduce ? { duration: 0.25 } : {
        type: 'spring', stiffness: 260, damping: 15, mass: 0.9,
        delay: 0.25 + index * 0.11,
      }}
      style={{
        position: 'absolute',
        left: `${pos.x}%`, top: `${pos.y}%`,
        zIndex: z,
        cursor: 'grab',
        touchAction: 'none',
        willChange: 'transform',
      }}
      whileHover={{ zIndex: 500 }}
    >
      {/* rotation + hover-lift layer (kept separate from the drag transform) */}
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => { if (clickable && !draggedRef.current) onOpen(item); }}
        onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(item); } }}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={clickable ? `${item.popup?.title} — open story` : undefined}
        className="vol-item"
        animate={{
          rotate: hovered ? item.rotate * 0.4 : item.rotate,
          y: hovered ? -8 : 0,
          scale: hovered ? 1.04 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{
          position: 'relative',
          filter: hovered
            ? 'drop-shadow(0 18px 26px rgba(60,40,20,0.26))'
            : 'drop-shadow(0 6px 12px rgba(60,40,20,0.16))',
          outline: 'none',
        }}
      >
        {/* micro-float — a barely-there idle drift, paused while interacting */}
        <div>
          <Attachment type={item.attach} color={item.attachColor} />
          {item.kind === 'photo' ? <PhotoBody item={item} isMobile={isMobile} /> : <NoteBody item={item} isMobile={isMobile} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Story modal ────────────────────────────────────────────────────────────
function StoryModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const p = item.popup;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }} onClick={onClose}
      role="dialog" aria-modal="true" aria-label={`${p.title} story`}
      style={{
        position: 'fixed', inset: 0, zIndex: 600, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
        background: 'rgba(38,26,18,0.42)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: 'min(720px, 100%)', maxHeight: '88vh', overflowY: 'auto',
          background: CREAM, borderRadius: '20px',
          boxShadow: '0 40px 100px rgba(40,24,16,0.4), 0 0 0 1px rgba(201,160,79,0.18)',
        }}
      >
        <button onClick={onClose} aria-label="Close story" style={{
          position: 'absolute', top: 16, right: 16, zIndex: 3, width: 40, height: 40, borderRadius: '50%',
          border: 'none', background: 'rgba(255,255,255,0.9)', color: INK, fontSize: '1.4rem', lineHeight: 1,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(60,40,20,0.2)',
        }}>×</button>

        <div style={{ width: '100%', height: 'clamp(220px, 34vh, 330px)', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
          <img src={item.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', alignItems: 'baseline', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(1.9rem, 4.5vw, 2.9rem)', color: INK, lineHeight: 1 }}>{p.title}</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: '22px', fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.9rem', color: GOLD, letterSpacing: '0.04em' }}>
            {p.date && <span>{p.date}</span>}
            {p.date && p.org && <span aria-hidden style={{ opacity: 0.5 }}>·</span>}
            {p.org && <span>{p.org}</span>}
          </div>
          {p.story?.map((para, i) => (
            <p key={i} style={{ margin: '0 0 1em', fontFamily: "'EB Garamond', serif", fontSize: '1.04rem', lineHeight: 1.75, color: INK_DIM }}>{para}</p>
          ))}
          {p.gallery?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(p.gallery.length, 3)}, 1fr)`, gap: '10px', marginTop: '1.4em' }}>
              {p.gallery.map((src, i) => (
                <div key={i} style={{ aspectRatio: '4 / 5', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 22px rgba(60,40,20,0.16)' }}>
                  <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function VolunteeringBoard() {
  const reduce = useReducedMotion();
  const boardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 760);
  const [active, setActive] = useState(null);
  const [zMap, setZMap] = useState({});
  const topZ = useRef(20);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const bumpZ = (id) => setZMap((m) => ({ ...m, [id]: ++topZ.current }));

  return (
    <main style={{
      position: 'relative', minHeight: '100vh', width: '100%',
      paddingTop: 'var(--nav-h)', overflowX: 'hidden',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <style>{`
        .vol-item:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 6px; border-radius: 4px; }
      `}</style>

      {/* Heading */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginTop: 'clamp(16px, 3.5vh, 40px)', padding: '0 20px' }}
      >
        <h1 style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(2.4rem, 6.5vw, 4.6rem)', color: INK, lineHeight: 1 }}>
          Volunteering
        </h1>
      </motion.header>

      {/* Board */}
      <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center', padding: 'clamp(16px, 3vh, 34px) clamp(10px, 3vw, 40px) 60px' }}>
        <div
          ref={boardRef}
          style={{
            position: 'relative',
            width: 'min(1180px, 96vw)',
            height: isMobile ? '168vh' : 'min(70vh, 660px)',
            borderRadius: '16px',
            // Warm canvas: a soft top-lit wash that deepens toward the edges so
            // the surface reads as a real, slightly domed piece of paper/board.
            background: `
              radial-gradient(140% 115% at 50% -8%, oklch(99% 0.012 88), oklch(95.5% 0.02 74) 55%, oklch(92% 0.032 66) 100%)`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.55),
              inset 0 0 0 1px rgba(120,85,45,0.10),
              inset 0 0 60px rgba(120,80,40,0.05),
              0 1px 2px rgba(60,40,20,0.10),
              0 34px 80px rgba(70,45,20,0.16)`,
            overflow: 'hidden',
          }}
        >
          {/* Fine linen / canvas weave */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6,
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(120,88,50,0.035) 0 1px, transparent 1px 5px),
              repeating-linear-gradient(90deg, rgba(120,88,50,0.03) 0 1px, transparent 1px 5px)`,
          }} />
          {/* Organic paper grain (fractal noise) */}
          <svg aria-hidden width="100%" height="100%" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.5, mixBlendMode: 'soft-light' }}>
            <filter id="volGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#volGrain)" />
          </svg>
          {/* Soft vignette for depth */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: 'radial-gradient(125% 115% at 50% 42%, transparent 52%, rgba(75,48,20,0.09) 100%)',
          }} />
          {/* Warm centre glow, barely there */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: 'radial-gradient(60% 50% at 50% 38%, rgba(255,238,205,0.35), transparent 70%)',
          }} />

          {volunteeringBoard.map((item, i) => (
            <BoardItem
              key={item.id}
              item={item}
              index={i}
              boardRef={boardRef}
              bumpZ={bumpZ}
              z={zMap[item.id] || 10 + i}
              onOpen={setActive}
              reduce={reduce}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Back link */}
      <div style={{ position: 'relative', zIndex: 5, padding: '0 24px 46px' }}>
        <Link to="/" style={{
          fontFamily: "'EB Garamond', serif", fontSize: '0.75rem', letterSpacing: '0.16em',
          textTransform: 'uppercase', color: INK_DIM, borderBottom: `1px solid ${GOLD}`, paddingBottom: '2px', textDecoration: 'none',
        }}>← Back to gallery</Link>
      </div>

      <AnimatePresence>
        {active && <StoryModal item={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </main>
  );
}
