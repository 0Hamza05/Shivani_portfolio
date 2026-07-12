import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { londonScrapbook, NOTE_COLORS } from '../data/londonScrapbook';

const INK      = 'oklch(28% 0.03 50)';
const INK_DIM  = 'oklch(44% 0.025 50)';
const CREAM    = 'oklch(97% 0.014 75)';
const GOLD     = '#b08a4e';
const LU_RED   = '#b23a2e';   // London-Underground-adjacent red — generic, not the real roundel
const LU_NAVY  = '#28405f';

// ─── Attachments ─────────────────────────────────────────────────────────
function Attachment({ type, color }) {
  if (!type) return null;
  const common = { position: 'absolute', zIndex: 3, pointerEvents: 'none' };
  if (type === 'pushpin') {
    return (
      <div style={{ ...common, top: -11, left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.28))' }}>
        <svg width="20" height="20" viewBox="0 0 22 22">
          <circle cx="11" cy="9" r="7" fill={color} />
          <circle cx="8.6" cy="6.6" r="2.4" fill="rgba(255,255,255,0.55)" />
          <rect x="10.2" y="13" width="1.6" height="7" rx="0.8" fill="rgba(0,0,0,0.32)" />
        </svg>
      </div>
    );
  }
  if (type === 'clip') {
    return (
      <div style={{ ...common, top: -15, left: '70%', transform: 'translateX(-50%) rotate(-8deg)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
        <svg width="16" height="36" viewBox="0 0 18 40" fill="none">
          <rect x="3" y="2.4" width="12" height="34" rx="6" stroke={color} strokeWidth="2.6" />
          <rect x="6" y="6" width="6" height="22" rx="3" stroke={color} strokeWidth="2.6" />
        </svg>
      </div>
    );
  }
  if (type === 'cornerMounts') {
    // small triangular photo corners, top-left and bottom-right
    return (
      <>
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ ...common, top: -3, left: -3 }}>
          <path d="M0 0 L20 0 L0 20 Z" fill={color} opacity="0.85" />
        </svg>
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ ...common, bottom: -3, right: -3, top: 'auto', left: 'auto' }}>
          <path d="M20 20 L0 20 L20 0 Z" fill={color} opacity="0.85" />
        </svg>
      </>
    );
  }
  // washi / masking tape — translucent torn strip
  const isWashi = type === 'washi';
  return (
    <div style={{
      ...common, top: -10, left: '50%',
      width: isWashi ? 70 : 62, height: 24,
      transform: 'translateX(-50%) rotate(-4deg)',
      background: color, opacity: isWashi ? 0.78 : 0.7,
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
      clipPath: 'polygon(4% 0, 96% 6%, 100% 92%, 2% 100%)',
    }} />
  );
}

// ─── Photo presentations ─────────────────────────────────────────────────
function PhotoBody({ item, isMobile }) {
  const { style, image, caption } = item;
  const width = Math.round(item.width * (isMobile ? 0.64 : 1));
  const img = (h) => (
    <img src={image} alt={item.popup?.title || ''} loading="lazy" draggable={false}
      style={{ width: '100%', height: h, objectFit: 'cover', display: 'block', userSelect: 'none', pointerEvents: 'none' }} />
  );
  if (style === 'polaroid') {
    return (
      <div style={{ width, background: '#fff', padding: '9px 9px 32px', boxShadow: '0 2px 4px rgba(0,0,0,0.07)' }}>
        {img(width * 0.92)}
        {caption && <div style={{ marginTop: 9, textAlign: 'center', fontFamily: "'Cote Lumiere'", fontSize: '1rem', color: INK }}>{caption}</div>}
      </div>
    );
  }
  if (style === 'instant') {
    return (
      <div style={{ width, background: '#fbfbf8', padding: '8px 8px 36px', borderRadius: 3, boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
        {img(width * 1.02)}
        {caption && <div style={{ marginTop: 11, textAlign: 'center', fontFamily: "'Cote Lumiere'", fontSize: '0.95rem', color: INK_DIM }}>{caption}</div>}
      </div>
    );
  }
  if (style === 'square') {
    return (
      <div style={{ width, background: '#fff', padding: 5, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
        <div style={{ borderRadius: 5, overflow: 'hidden', aspectRatio: '1' }}>{img('100%')}</div>
      </div>
    );
  }
  if (style === 'strip') {
    return (
      <div style={{ width, background: '#fdfdfb', padding: '8px 8px 12px', boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[0, 1].map(i => <div key={i} style={{ width: '100%', height: width * 0.72, overflow: 'hidden' }}>{img('100%')}</div>)}
        </div>
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

function NoteBody({ item, isMobile, hovered }) {
  const c = NOTE_COLORS[item.color] || NOTE_COLORS.cream;
  return (
    <div style={{
      position: 'relative',
      width: isMobile ? 118 : 158, minHeight: isMobile ? 106 : 142, padding: isMobile ? '14px 13px' : '19px 17px',
      background: `linear-gradient(165deg, ${c.bg}, ${c.edge})`,
      boxShadow: '0 3px 8px rgba(0,0,0,0.10)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      clipPath: 'polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)',
    }}>
      <div style={{ fontFamily: "'Cote Lumiere'", fontSize: isMobile ? '1.05rem' : '1.3rem', lineHeight: 1.2, color: INK }}>{item.text}</div>
      {item.sub && <div style={{ marginTop: 7, fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: isMobile ? '0.74rem' : '0.85rem', color: INK_DIM }}>{item.sub}</div>}
      {/* peeled-corner highlight, brighter on hover */}
      <div aria-hidden style={{
        position: 'absolute', right: 0, bottom: 0, width: 26, height: 26,
        background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.55) 52%)',
        opacity: hovered ? 1 : 0.5, transition: 'opacity 0.25s ease',
      }} />
    </div>
  );
}

function StickerBody({ item }) {
  return <img src={item.image} alt="" width={item.width} style={{ display: 'block', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.18))', userSelect: 'none', pointerEvents: 'none' }} draggable={false} />;
}

// ─── Tube ticket — flips in place to reveal a note ──────────────────────
function TicketBody({ item, flipped }) {
  const face = {
    width: 128, height: 82, borderRadius: 6, position: 'absolute', inset: 0,
    backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 3px 8px rgba(0,0,0,0.14)',
  };
  return (
    <div style={{ width: 128, height: 82, position: 'relative', perspective: 600 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.45, 0.05, 0.35, 1] }}
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
      >
        {/* front */}
        <div style={{ ...face, background: '#f4f0e6', border: `1px solid ${LU_NAVY}22`, padding: '7px 9px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2.5px solid ${LU_RED}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '48%', left: -2, right: -2, height: 2.5, background: LU_NAVY }} />
            </div>
            <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '0.56rem', letterSpacing: '0.1em', color: INK_DIM }}>SINGLE FARE</span>
          </div>
          <div style={{ marginTop: 'auto', fontFamily: "'Cote Lumiere'", fontSize: '1.15rem', color: INK }}>{item.front.zone}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'EB Garamond', serif", fontSize: '0.68rem', color: INK_DIM }}>
            <span>{item.front.fare}</span>
            <span style={{ fontStyle: 'italic' }}>tap flip →</span>
          </div>
        </div>
        {/* back */}
        <div style={{ ...face, background: '#efe8d8', transform: 'rotateY(180deg)', padding: '10px 11px', justifyContent: 'center' }}>
          <p style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontSize: '0.78rem', lineHeight: 1.35, color: INK }}>{item.back.note}</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Postcard — flips to reveal a handwritten note + postmark ──────────
function PostcardBody({ item, flipped }) {
  const face = {
    width: 190, height: 132, position: 'absolute', inset: 0,
    backfaceVisibility: 'hidden', background: '#fff', padding: 6,
    boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
  };
  return (
    <div style={{ width: 190, height: 132, position: 'relative', perspective: 700 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.45, 0.05, 0.35, 1] }}
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
      >
        <div style={face}>
          <img src={item.image} alt="" loading="lazy" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ ...face, transform: 'rotateY(180deg)', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontSize: '1rem', lineHeight: 1.3, color: INK }}>{item.note}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div aria-hidden style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px dashed ${INK_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'EB Garamond', serif", fontSize: '0.42rem', color: INK_DIM, letterSpacing: '0.05em', textAlign: 'center' }}>
              LONDON<br />POST
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Coffee receipt — hover/tap reveals the café name via a highlighter swipe
function ReceiptBody({ item, revealed }) {
  return (
    <div style={{
      width: 108, padding: '14px 12px', background: '#fdfdf6',
      boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
      clipPath: 'polygon(0 0,100% 0,100% 97%,92% 100%,84% 97%,76% 100%,68% 97%,60% 100%,52% 97%,44% 100%,36% 97%,28% 100%,20% 97%,12% 100%,4% 97%,0 100%)',
      fontFamily: "'EB Garamond', serif", fontSize: '0.62rem', color: INK_DIM, lineHeight: 1.5,
    }}>
      <div style={{ position: 'relative', display: 'inline-block', fontWeight: 600, color: INK, marginBottom: 4 }}>
        <span aria-hidden style={{
          position: 'absolute', left: -2, right: -2, top: '18%', bottom: '10%',
          background: '#f4d35e', opacity: revealed ? 0.65 : 0, transform: `scaleX(${revealed ? 1 : 0})`,
          transformOrigin: 'left', transition: 'transform 0.4s ease, opacity 0.2s ease', zIndex: 0,
        }} />
        <span style={{ position: 'relative', zIndex: 1 }}>{item.cafe}</span>
      </div>
      <div>{item.item}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span>{item.date}</span><span>{item.price}</span>
      </div>
    </div>
  );
}

// ─── Passport stamp ──────────────────────────────────────────────────────
function PassportStamp({ stamp, size = 92 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 3px rgba(178,58,46,0.25))' }}>
      <circle cx="50" cy="50" r="44" fill="none" stroke={LU_RED} strokeWidth="2.5" opacity="0.8" />
      <circle cx="50" cy="50" r="37" fill="none" stroke={LU_RED} strokeWidth="1" opacity="0.6" />
      <path id="stampArcTop" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
      <text fontSize="10" fill={LU_RED} opacity="0.85" fontFamily="'EB Garamond', serif" letterSpacing="2">
        <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">{stamp.city}</textPath>
      </text>
      <text x="50" y="56" fontSize="13" fill={LU_RED} opacity="0.9" fontFamily="'Cote Lumiere'" textAnchor="middle">{stamp.code}</text>
      <text x="50" y="72" fontSize="8" fill={LU_RED} opacity="0.75" fontFamily="'EB Garamond', serif" textAnchor="middle" letterSpacing="1">{stamp.date}</text>
    </svg>
  );
}

// ─── Folded map — a small icon; unfolds into a larger original line-map ──
function MapBody() {
  return (
    <div style={{
      width: 100, height: 76, background: 'linear-gradient(135deg, #e8dfc8, #d9cba8)',
      boxShadow: '0 3px 8px rgba(0,0,0,0.14)', position: 'relative', overflow: 'hidden',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 76" aria-hidden>
        <line x1="33" y1="0" x2="33" y2="76" stroke="rgba(90,70,40,0.25)" strokeWidth="1" />
        <line x1="66" y1="0" x2="66" y2="76" stroke="rgba(90,70,40,0.25)" strokeWidth="1" />
        <line x1="0" y1="38" x2="100" y2="38" stroke="rgba(90,70,40,0.25)" strokeWidth="1" />
        <path d="M10 60 Q40 20 90 30" fill="none" stroke={LU_RED} strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7" />
      </svg>
      <span style={{ position: 'absolute', bottom: 5, left: 8, fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.58rem', color: INK_DIM }}>a map, folded</span>
    </div>
  );
}

function LargeMap() {
  return (
    <svg width="100%" viewBox="0 0 400 300" style={{ background: '#f1e9d2', borderRadius: 10 }}>
      <path d="M20 240 Q120 260 180 200 T 380 150" fill="none" stroke="#7a9db8" strokeWidth="10" opacity="0.55" strokeLinecap="round" />
      <line x1="120" y1="0" x2="120" y2="300" stroke="rgba(90,70,40,0.18)" strokeWidth="1.5" />
      <line x1="260" y1="0" x2="260" y2="300" stroke="rgba(90,70,40,0.18)" strokeWidth="1.5" />
      <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(90,70,40,0.18)" strokeWidth="1.5" />
      <path d="M40 260 Q160 90 360 110" fill="none" stroke={LU_RED} strokeWidth="2" strokeDasharray="5 5" opacity="0.75" />
      <circle cx="200" cy="130" r="6" fill={LU_RED} />
      <text x="212" y="134" fontFamily="'EB Garamond', serif" fontSize="13" fill={INK}>you are here</text>
    </svg>
  );
}

// ─── Entrance variants ───────────────────────────────────────────────────
function entranceFor(entrance, rotate, reduce) {
  if (reduce) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } };
  switch (entrance) {
    case 'slide-left':
      return { initial: { opacity: 0, x: -160, rotate: rotate * 2 }, animate: { opacity: 1, x: 0, rotate }, transition: { type: 'spring', stiffness: 190, damping: 20 } };
    case 'fall':
      return { initial: { opacity: 0, y: -220, rotate: rotate * 1.6 }, animate: { opacity: 1, y: 0, rotate }, transition: { type: 'spring', stiffness: 150, damping: 15 } };
    case 'rotate-in':
      return { initial: { opacity: 0, scale: 0.5, rotate: rotate + 130 }, animate: { opacity: 1, scale: 1, rotate }, transition: { type: 'spring', stiffness: 170, damping: 17 } };
    case 'drop-bounce':
      return { initial: { opacity: 0, y: -100, rotate: rotate * 1.4 }, animate: { opacity: 1, y: 0, rotate }, transition: { type: 'spring', stiffness: 300, damping: 11, mass: 0.9 } };
    case 'fade':
    default:
      return { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1, rotate }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } };
  }
}

// ─── A single draggable board item ───────────────────────────────────────
function BoardItem({ item, index, boardRef, bumpZ, z, onOpenPhoto, onOpenFocus, reduce, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const draggedRef = useRef(false);
  const pos = isMobile && item.posMobile ? item.posMobile : item.pos;

  const isPhoto = item.kind === 'photo';
  const flips = item.kind === 'ticket' || item.kind === 'postcard';
  const focusable = item.kind === 'passport' || item.kind === 'boardingPass' || item.kind === 'map';
  const clickable = isPhoto || flips || focusable;

  const handleClick = () => {
    if (draggedRef.current) return;
    if (isPhoto) onOpenPhoto(item);
    else if (flips) setFlipped(f => !f);
    else if (focusable) onOpenFocus(item);
  };

  const entrance = entranceFor(item.entrance, item.rotate, reduce);

  const body = (() => {
    switch (item.kind) {
      case 'photo': return <PhotoBody item={item} isMobile={isMobile} />;
      case 'note': return <NoteBody item={item} isMobile={isMobile} hovered={hovered} />;
      case 'sticker': return <StickerBody item={item} />;
      case 'ticket': return <TicketBody item={item} flipped={flipped} />;
      case 'postcard': return <PostcardBody item={item} flipped={flipped} />;
      case 'receipt': return <ReceiptBody item={item} revealed={revealed || hovered} />;
      case 'map': return <MapBody item={item} />;
      case 'passport': return <PassportStamp stamp={item.stamp} />;
      case 'boardingPass': return <BoardingPassBody item={item} />;
      default: return null;
    }
  })();

  return (
    <motion.div
      drag
      dragMomentum
      dragElastic={0.14}
      dragConstraints={boardRef}
      onPointerDown={() => { draggedRef.current = false; bumpZ(item.id); }}
      onDrag={(e, info) => { if (Math.hypot(info.offset.x, info.offset.y) > 4) draggedRef.current = true; }}
      whileDrag={{ scale: 1.07, zIndex: 9999, cursor: 'grabbing' }}
      initial={entrance.initial}
      animate={{ ...entrance.animate }}
      transition={{ ...entrance.transition, delay: 0.3 + index * 0.09 }}
      style={{
        position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, zIndex: z,
        cursor: clickable ? 'grab' : 'grab', touchAction: 'none', willChange: 'transform',
      }}
      whileHover={{ zIndex: 500 }}
    >
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={handleClick}
        onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleClick(); } }}
        onTouchEnd={() => { if (item.kind === 'receipt') setRevealed(r => !r); }}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={clickable ? (item.popup?.title || `${item.kind} — interact`) : undefined}
        className="ldn-item"
        animate={{
          rotate: hovered ? item.rotate * 0.4 : item.rotate,
          y: hovered ? -8 : 0,
          scale: hovered ? 1.045 : 1,
          filter: hovered ? 'brightness(1.05)' : 'brightness(1)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{
          position: 'relative', outline: 'none',
          filter: hovered ? 'drop-shadow(0 18px 26px rgba(50,32,14,0.24))' : 'drop-shadow(0 6px 12px rgba(50,32,14,0.15))',
        }}
      >
        <div className={reduce ? undefined : `ldn-idle ldn-idle-${index % 4}`}>
          <Attachment type={item.attach} color={item.attachColor} />
          {body}
        </div>
      </motion.div>
    </motion.div>
  );
}

function BoardingPassBody({ item }) {
  return (
    <div style={{
      width: 176, background: '#fdfdf9', boxShadow: '0 3px 9px rgba(0,0,0,0.13)',
      display: 'flex', fontFamily: "'EB Garamond', serif",
    }}>
      <div style={{ flex: 1, padding: '10px 12px', borderRight: `1.5px dashed ${INK_DIM}55` }}>
        <div style={{ fontSize: '0.56rem', letterSpacing: '0.12em', color: LU_NAVY, marginBottom: 4 }}>BOARDING PASS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Cote Lumiere'", fontSize: '1.2rem', color: INK }}>
          {item.from} <span aria-hidden style={{ fontSize: '0.9rem' }}>✈</span> {item.to}
        </div>
        <div style={{ fontSize: '0.6rem', color: INK_DIM, marginTop: 3 }}>{item.passenger} · {item.date}</div>
      </div>
      <div style={{ width: 40, padding: '10px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.56rem', color: INK_DIM }}>
        <div>SEAT<br /><b style={{ color: INK }}>{item.seat}</b></div>
        <div>GATE<br /><b style={{ color: INK }}>{item.gate}</b></div>
      </div>
    </div>
  );
}

// ─── Focus overlay — enlarges passport / boarding pass / map ────────────
function FocusOverlay({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }} onClick={onClose}
      role="dialog" aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'rgba(40,30,20,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: CREAM, borderRadius: 16, padding: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.35)', maxWidth: 'min(440px, 90vw)' }}
      >
        {item.kind === 'passport' && (
          <div style={{ textAlign: 'center' }}>
            <PassportStamp stamp={item.stamp} size={200} />
            <p style={{ marginTop: 16, fontFamily: "'Cote Lumiere'", fontSize: '1.3rem', color: INK }}>Arrived, and never quite left.</p>
          </div>
        )}
        {item.kind === 'boardingPass' && <div style={{ transform: 'scale(1.6)', transformOrigin: 'center', margin: '40px 20px' }}><BoardingPassBody item={item} /></div>}
        {item.kind === 'map' && <div style={{ width: 'min(380px, 78vw)' }}><LargeMap /></div>}
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', border: 'none',
          background: 'rgba(0,0,0,0.06)', color: INK, fontSize: '1.2rem', cursor: 'pointer',
        }}>×</button>
      </motion.div>
    </motion.div>
  );
}

// ─── Photo story modal ────────────────────────────────────────────────────
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
        position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'rgba(38,26,18,0.42)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }} onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: 'min(720px, 100%)', maxHeight: '88vh', overflowY: 'auto',
          background: CREAM, borderRadius: 20, boxShadow: `0 40px 100px rgba(40,24,16,0.4), 0 0 0 1px rgba(176,138,78,0.18)`,
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
          <h2 style={{ margin: '0 0 14px', fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(1.9rem, 4.5vw, 2.9rem)', color: INK, lineHeight: 1 }}>{p.title}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 22, fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.9rem', color: GOLD, letterSpacing: '0.04em' }}>
            {p.date && <span>{p.date}</span>}
            {p.date && p.location && <span aria-hidden style={{ opacity: 0.5 }}>·</span>}
            {p.location && <span>{p.location}</span>}
          </div>
          {p.story?.map((para, i) => (
            <p key={i} style={{ margin: '0 0 1em', fontFamily: "'EB Garamond', serif", fontSize: '1.04rem', lineHeight: 1.75, color: INK_DIM }}>{para}</p>
          ))}
          {p.gallery?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(p.gallery.length, 3)}, 1fr)`, gap: 10, marginTop: '1.4em' }}>
              {p.gallery.map((src, i) => (
                <div key={i} style={{ aspectRatio: '4 / 5', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 22px rgba(60,40,20,0.16)' }}>
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

// ─── Decorative doodles (arrows, stars, plane, route line) ──────────────
function Decorations() {
  const stroke = 'rgba(70,50,30,0.28)';
  return (
    <svg aria-hidden width="100%" height="100%" viewBox="0 0 1000 700" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'visible' }}>
      <path d="M120 480 C 250 440, 380 500, 470 420" fill="none" stroke={stroke} strokeWidth="1.1" strokeDasharray="2 5" />
      <path d="M640 560 C 700 590, 760 580, 800 540" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M800 540 l -13 1 M800 540 l -4 -12" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <text x="900" y="250" fontFamily="'EB Garamond', serif" fontStyle="italic" fontSize="22" fill={LU_RED} opacity="0.35" transform="rotate(-14 900 250)">✈</text>
      {[[500, 470], [880, 620]].map(([x, y], i) => (
        <g key={i} stroke={GOLD} strokeWidth="1.3" strokeLinecap="round" opacity="0.55">
          <line x1={x - 6} y1={y} x2={x + 6} y2={y} />
          <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
        </g>
      ))}
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function LondonScrapbook() {
  const reduce = useReducedMotion();
  const boardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 760);
  const [activePhoto, setActivePhoto] = useState(null);
  const [activeFocus, setActiveFocus] = useState(null);
  const [zMap, setZMap] = useState({});
  const topZ = useRef(20);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const bumpZ = (id) => setZMap((m) => ({ ...m, [id]: ++topZ.current }));

  return (
    <section style={{
      position: 'relative', width: '100%', overflowX: 'hidden',
      // Premium travel-journal paper — the page IS the scrapbook surface.
      background: `
        radial-gradient(140% 100% at 50% 0%, oklch(97.5% 0.016 78), oklch(94% 0.024 68) 60%, oklch(90.5% 0.03 62) 100%)`,
    }}>
      <style>{`
        .ldn-item:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 6px; border-radius: 4px; }
        @keyframes ldnIdle0 { 0%,100%{ transform: translate3d(0,0,0) rotate(0deg); } 50%{ transform: translate3d(0,-2px,0) rotate(0.4deg); } }
        @keyframes ldnIdle1 { 0%,100%{ transform: translate3d(0,0,0) rotate(0deg); } 50%{ transform: translate3d(1px,0,0) rotate(-0.3deg); } }
        @keyframes ldnIdle2 { 0%,100%{ transform: translate3d(0,0,0); } 50%{ transform: translate3d(0,1.5px,0); } }
        @keyframes ldnIdle3 { 0%,100%{ transform: translate3d(0,0,0) rotate(0deg); } 50%{ transform: translate3d(-1px,-1px,0) rotate(0.3deg); } }
        .ldn-idle-0 { animation: ldnIdle0 7.5s ease-in-out infinite; }
        .ldn-idle-1 { animation: ldnIdle1 8.6s ease-in-out infinite; }
        .ldn-idle-2 { animation: ldnIdle2 6.8s ease-in-out infinite; }
        .ldn-idle-3 { animation: ldnIdle3 9.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { [class*="ldn-idle"] { animation: none !important; } }
      `}</style>

      {/* paper grain */}
      <svg aria-hidden width="100%" height="100%" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.45, mixBlendMode: 'soft-light' }}>
        <filter id="ldnGrain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#ldnGrain)" />
      </svg>
      <Decorations />

      {/* Tagline — fades in after the scrapbook has assembled. No repeated
          "Life in London" heading here; the shared hero above already shows
          the page title. */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: reduce ? 0.15 : 2.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: 'clamp(20px, 4vh, 40px) 20px 8px' }}
      >
        <p style={{ margin: 0, fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 'clamp(0.95rem, 1.9vw, 1.1rem)', color: INK_DIM }}>
          A city that became a second home.
        </p>
      </motion.header>

      {/* Board */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 'clamp(16px, 3vh, 30px) clamp(10px, 3vw, 40px) 70px' }}>
        <div ref={boardRef} style={{ position: 'relative', width: 'min(1200px, 96vw)', height: isMobile ? '190vh' : 'min(78vh, 700px)', zIndex: 2 }}>
          {londonScrapbook.map((item, i) => (
            <BoardItem
              key={item.id}
              item={item}
              index={i}
              boardRef={boardRef}
              bumpZ={bumpZ}
              z={zMap[item.id] || 10 + i}
              onOpenPhoto={setActivePhoto}
              onOpenFocus={setActiveFocus}
              reduce={reduce}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Back link */}
      <div style={{ position: 'relative', zIndex: 5, padding: '0 24px 46px', textAlign: 'center' }}>
        <Link to="/" style={{
          fontFamily: "'EB Garamond', serif", fontSize: '0.75rem', letterSpacing: '0.16em',
          textTransform: 'uppercase', color: INK_DIM, borderBottom: `1px solid ${GOLD}`, paddingBottom: 2, textDecoration: 'none',
        }}>← Back to gallery</Link>
      </div>

      <AnimatePresence>
        {activePhoto && <StoryModal item={activePhoto} onClose={() => setActivePhoto(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeFocus && <FocusOverlay item={activeFocus} onClose={() => setActiveFocus(null)} />}
      </AnimatePresence>
    </section>
  );
}
