import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ─── Page-flip sound (shared asset) ────────────────────────────────────────
function playPageFlip() {
  try { const a = new Audio('/page%20flip.mp3'); a.volume = 0.6; a.play().catch(() => {}); } catch (_) {}
}

const IMG = '/images/life-in-london/optimised';
const FULL = '/images/life-in-london';

// ─── Travel-journal palette ─────────────────────────────────────────────────
const C = {
  page1:  '#f6efe0',   // warm cream
  page2:  '#f2ebdb',   // slightly cooler cream (alternating recto/verso)
  coverA: '#2c4262',   // navy
  coverB: '#233752',   // deeper navy
  coverEdge: '#1b2b40',
  red:    '#b23a2e',   // muted underground red
  navy:   '#28405f',
  ink:    '#2c2317',
  inkMid: '#5a4a34',
  inkDim: '#9a866a',
  gold:   '#b08a4e',
  navRing:'rgba(44,66,98,0.4)',
  navFill:'rgba(44,66,98,0.08)',
  navHover:'rgba(44,66,98,0.18)',
  room:   '#0d0f14',   // deep near-black with a cool cast
};

// ─── Content ────────────────────────────────────────────────────────────────
// Each item is placed on a page by % (x,y = top-left, w = % of page width).
// Kinds: header | photo | note | caption | tape | stamp | ticket | boarding | sticker
const PAGES = [
  // ── Spread 1 ──────────────────────────────────────────────────────────
  {
    left: {
      items: [
        { kind: 'header', text: 'First Days', sub: 'September', x: 12, y: 8 },
        { kind: 'photo', src: `${IMG}/life-in-london-op-2.webp`, x: 14, y: 26, w: 64, rot: -5, style: 'tape',
          popup: { title: 'The First Week', date: 'September', location: 'Zone 1',
            story: ['Everything felt too fast and too grey and completely exhilarating all at once. I got lost twice before finding the flat, and did not mind at all.',
              'London does not introduce itself gently. It just expects you to keep up — and somehow, within days, I already was.'],
            gallery: [`${FULL}/life-in-london-11.webp`, `${FULL}/life-in-london-12.webp`] } },
        { kind: 'note', text: 'everything felt too fast, and I loved it', color: 'yellow', x: 20, y: 74, rot: 4 },
      ],
      label: 'i',
    },
    right: {
      items: [
        { kind: 'photo', src: `${IMG}/life-in-london-op-11.webp`, x: 12, y: 10, w: 52, rot: 5, style: 'polaroid', caption: 'the flat' },
        { kind: 'ticket', x: 60, y: 20, rot: -8 },
        { kind: 'photo', src: `${IMG}/life-in-london-op-3.webp`, x: 34, y: 52, w: 56, rot: -3, style: 'print',
          popup: { title: 'Sunday Walks', date: 'Winter', location: 'The riverside',
            story: ['A whole city that turns into a slow, deliberate ritual on Sundays — a walk with no destination, a coffee that takes an hour to finish.'] } },
        { kind: 'caption', text: 'getting lost, happily', x: 10, y: 66, rot: -6 },
      ],
      label: 'ii',
    },
  },
  // ── Spread 2 ──────────────────────────────────────────────────────────
  {
    left: {
      items: [
        { kind: 'photo', src: `${IMG}/life-in-london-op-4.webp`, x: 16, y: 12, w: 60, rot: 4, style: 'polaroid', caption: 'friends, again',
          popup: { title: 'Friends, Again', date: 'Spring', location: 'A flat in Zone 2',
            story: ['The people who turned a city into a home. Board games that ran too late, dinners that stretched into the next morning\'s plans.'] } },
        { kind: 'note', text: 'the tube is somehow always both late and on time', color: 'blue', x: 22, y: 68, rot: -5 },
      ],
      label: 'iii',
    },
    right: {
      items: [
        { kind: 'caption', text: 'city lights', x: 12, y: 8, rot: 3 },
        { kind: 'photo', src: `${IMG}/life-in-london-op-6.webp`, x: 30, y: 14, w: 58, rot: -4, style: 'tape',
          popup: { title: 'City Lights', date: 'Autumn', location: 'South Bank',
            story: ['Some evenings the whole city seemed to be performing just for the walk home.'] } },
        { kind: 'photo', src: `${IMG}/life-in-london-op-12.webp`, x: 12, y: 54, w: 48, rot: 6, style: 'print' },
        { kind: 'stamp', x: 66, y: 62, rot: -10 },
      ],
      label: 'iv',
    },
  },
  // ── Spread 3 ──────────────────────────────────────────────────────────
  {
    left: {
      items: [
        { kind: 'header', text: 'Everyday', sub: 'the ordinary magic', x: 12, y: 8 },
        { kind: 'photo', src: `${IMG}/life-in-london-op-7.webp`, x: 16, y: 26, w: 62, rot: -6, style: 'print',
          popup: { title: 'Museum Afternoons', date: 'Winter', location: 'Bloomsbury',
            story: ['Free museums are, quietly, one of the best things about this city. I went in to escape the rain and stayed for three hours.'] } },
        { kind: 'boarding', x: 14, y: 74, rot: 3 },
      ],
      label: 'v',
    },
    right: {
      items: [
        { kind: 'photo', src: `${IMG}/life-in-london-op-8.webp`, x: 14, y: 10, w: 58, rot: 5, style: 'polaroid', caption: 'the good days' },
        { kind: 'photo', src: `${IMG}/life-in-london-op-13.webp`, x: 34, y: 50, w: 54, rot: -4, style: 'tape' },
        { kind: 'caption', text: 'two years, still not over it', x: 10, y: 72, rot: -5 },
      ],
      label: 'vi',
    },
  },
  // ── Spread 4 (closing) ────────────────────────────────────────────────
  {
    left: {
      items: [
        { kind: 'photo', src: `${IMG}/life-in-london-op-9.webp`, x: 16, y: 14, w: 62, rot: 4, style: 'polaroid', caption: 'home, sort of',
          popup: { title: 'Home, Sort Of', date: 'Present day', location: 'My flat',
            story: ['It stopped being "the flat in London" and quietly became "home" somewhere along the way. I couldn\'t tell you the exact day it happened.'] } },
        { kind: 'note', text: 'a city that became a second home ♡', color: 'cream', x: 22, y: 72, rot: -4 },
      ],
      label: 'vii',
    },
    right: { kind: 'fin', label: 'viii' },
  },
];

const NOTE_COLORS = {
  yellow: ['#f3e39a', '#ecd77e'],
  blue:   ['#c3d4e8', '#aec4de'],
  cream:  ['#efe6cf', '#e6d9ba'],
};

// ─── Small memorabilia illustrations ───────────────────────────────────────
function TubeTicket() {
  return (
    <div style={{ width: 92, height: 58, background: '#f4f0e6', borderRadius: 5, border: `1px solid ${C.navy}22`, padding: '6px 8px', boxShadow: '0 2px 5px rgba(0,0,0,0.14)', fontFamily: "'EB Garamond', serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${C.red}`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '46%', left: -2, right: -2, height: 2, background: C.navy }} />
        </div>
        <span style={{ fontSize: '0.42rem', letterSpacing: '0.08em', color: C.inkDim }}>SINGLE</span>
      </div>
      <div style={{ marginTop: 4, fontFamily: "'Cote Lumiere'", fontSize: '0.85rem', color: C.ink }}>ZONE 1–2</div>
      <div style={{ fontSize: '0.5rem', color: C.inkDim }}>£2.80</div>
    </div>
  );
}
function PassportStamp({ size = 74 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 1px 2px rgba(178,58,46,0.2))' }}>
      <circle cx="50" cy="50" r="44" fill="none" stroke={C.red} strokeWidth="2.5" opacity="0.8" />
      <circle cx="50" cy="50" r="37" fill="none" stroke={C.red} strokeWidth="1" opacity="0.55" />
      <path id="lfArc" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
      <text fontSize="10" fill={C.red} opacity="0.85" fontFamily="'EB Garamond', serif" letterSpacing="2">
        <textPath href="#lfArc" startOffset="50%" textAnchor="middle">LONDON</textPath>
      </text>
      <text x="50" y="56" fontSize="13" fill={C.red} opacity="0.9" fontFamily="'Cote Lumiere'" textAnchor="middle">LHR</text>
      <text x="50" y="72" fontSize="8" fill={C.red} opacity="0.7" fontFamily="'EB Garamond', serif" textAnchor="middle" letterSpacing="1">14 SEP</text>
    </svg>
  );
}
function BoardingStrip() {
  return (
    <div style={{ width: 132, background: '#fdfdf6', boxShadow: '0 2px 6px rgba(0,0,0,0.13)', display: 'flex', fontFamily: "'EB Garamond', serif" }}>
      <div style={{ flex: 1, padding: '6px 8px', borderRight: `1.5px dashed ${C.inkDim}55` }}>
        <div style={{ fontSize: '0.42rem', letterSpacing: '0.1em', color: C.navy }}>BOARDING PASS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Cote Lumiere'", fontSize: '0.95rem', color: C.ink }}>DEL <span style={{ fontSize: '0.7rem' }}>✈</span> LHR</div>
        <div style={{ fontSize: '0.46rem', color: C.inkDim }}>S. PAWAR · 12 SEP</div>
      </div>
      <div style={{ width: 30, padding: '6px', fontSize: '0.42rem', color: C.inkDim }}>SEAT<br /><b style={{ color: C.ink }}>24A</b></div>
    </div>
  );
}

// ─── Page item renderers ────────────────────────────────────────────────────
function PhotoItem({ item, onOpen }) {
  const clickable = !!item.popup;
  const inner = (h) => (
    <img src={item.src} alt={item.popup?.title || ''} loading="lazy" draggable={false}
      style={{ width: '100%', height: h, objectFit: 'cover', display: 'block', userSelect: 'none' }} />
  );
  const frame = item.style === 'polaroid'
    ? <div style={{ width: '100%', background: '#fff', padding: '7px 7px 24px', boxShadow: '0 3px 8px rgba(40,30,15,0.16)' }}>
        {inner('auto')}
        {item.caption && <div style={{ marginTop: 6, textAlign: 'center', fontFamily: "'Cote Lumiere'", fontSize: '0.85rem', color: C.ink }}>{item.caption}</div>}
      </div>
    : <div style={{ width: '100%', background: '#fff', padding: 5, boxShadow: '0 3px 8px rgba(40,30,15,0.16)' }}>{inner('auto')}</div>;

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? (e) => { e.stopPropagation(); onOpen(item); } : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(item); } } : undefined}
      className={clickable ? 'lf-photo' : undefined}
      style={{ position: 'relative', cursor: clickable ? 'pointer' : 'default' }}
    >
      {item.style === 'tape' && (
        <div style={{ position: 'absolute', top: -8, left: '50%', width: 46, height: 18, transform: 'translateX(-50%) rotate(-4deg)', background: 'rgba(180,150,90,0.4)', clipPath: 'polygon(4% 0, 96% 6%, 100% 92%, 2% 100%)', zIndex: 2 }} />
      )}
      {frame}
    </div>
  );
}

function NoteItem({ item }) {
  const [a, b] = NOTE_COLORS[item.color] || NOTE_COLORS.cream;
  return (
    <div style={{
      width: '100%', padding: '11px 12px', background: `linear-gradient(165deg, ${a}, ${b})`,
      boxShadow: '0 3px 7px rgba(40,30,15,0.12)', clipPath: 'polygon(0 0,100% 0,100% 86%,86% 100%,0 100%)',
      fontFamily: "'Cote Lumiere'", fontSize: '0.95rem', lineHeight: 1.2, color: C.ink,
    }}>{item.text}</div>
  );
}

function CollageItem({ item, onOpen }) {
  switch (item.kind) {
    case 'header':
      return (
        <div>
          <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.56rem', color: C.gold, marginBottom: 3 }}>{item.sub}</div>
          <div style={{ fontFamily: "'Cote Lumiere'", fontSize: '1.7rem', lineHeight: 1, color: C.ink }}>{item.text}</div>
        </div>
      );
    case 'caption':
      return <div style={{ fontFamily: "'Cote Lumiere'", fontSize: '1.15rem', color: C.inkMid, whiteSpace: 'nowrap' }}>{item.text}</div>;
    case 'photo': return <PhotoItem item={item} onOpen={onOpen} />;
    case 'note': return <NoteItem item={item} />;
    case 'ticket': return <TubeTicket />;
    case 'stamp': return <PassportStamp />;
    case 'boarding': return <BoardingStrip />;
    default: return null;
  }
}

// ─── Page background (cream paper w/ faint lines + corner flourish) ──────────
function paperBg(bg) {
  return { width: '100%', height: '100%', background: bg, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' };
}

function CollagePage({ page, bg, onOpen }) {
  if (!page) return <div style={paperBg(bg)} />;
  if (page.kind === 'fin') return <FinPage bg={bg} label={page.label} />;
  return (
    <div style={paperBg(bg)}>
      {/* faint ruled lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }} preserveAspectRatio="none">
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1="6%" x2="94%" y1={`${8 + i * 5.6}%`} y2={`${8 + i * 5.6}%`} stroke={C.navy} strokeWidth="0.5" />
        ))}
      </svg>
      {page.items.map((it, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
          width: it.w ? `${it.w}%` : 'auto', transform: `rotate(${it.rot || 0}deg)`, zIndex: 5 + i,
        }}>
          <CollageItem item={it} onOpen={onOpen} />
        </div>
      ))}
      {page.label && <span style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: "'EB Garamond', serif", fontSize: '0.55rem', letterSpacing: '0.1em', color: C.inkDim, opacity: 0.5 }}>{page.label}</span>}
    </div>
  );
}

function FinPage({ bg, label }) {
  return (
    <div style={{ ...paperBg(bg), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <svg width="52" height="26" viewBox="0 0 52 28" fill="none">
        <path d="M2 14 Q13 2 26 14 Q39 26 50 14" stroke={C.red} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
        <circle cx="26" cy="14" r="3" fill={C.gold} opacity="0.9" />
      </svg>
      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.inkDim }}>the end, for now</span>
      <Link to="/" style={{ marginTop: 4, fontFamily: "'EB Garamond', serif", fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.inkMid, borderBottom: `1px solid ${C.gold}55`, paddingBottom: 2, textDecoration: 'none' }}>← Back to gallery</Link>
      {label && <span style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: "'EB Garamond', serif", fontSize: '0.55rem', color: C.inkDim, opacity: 0.5 }}>{label}</span>}
    </div>
  );
}

// PageContent for the flip leaf / static pages (left is `left`, right is `right`)
function SidePage({ page, pageNum, onOpen }) {
  const bg = pageNum % 2 === 0 ? C.page1 : C.page2;
  return <CollagePage page={page} bg={bg} onOpen={onOpen} />;
}

// ─── Cover half ─────────────────────────────────────────────────────────────
const DOTS = `radial-gradient(circle, rgba(255,255,255,0.06) 2px, transparent 2px)`;
function CoverHalf({ side }) {
  const isRight = side === 'right';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: isRight ? `${DOTS}, linear-gradient(135deg, ${C.coverB}, ${C.coverA})` : `${DOTS}, linear-gradient(135deg, ${C.coverEdge}, ${C.coverA})`,
      backgroundSize: '20px 20px, 100% 100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: '10px 8px', border: '1px solid rgba(220,180,120,0.28)', borderRadius: 3, pointerEvents: 'none' }} />
      {isRight && (
        <div style={{ textAlign: 'center', padding: '20px 26px', position: 'relative', zIndex: 1 }}>
          {/* small underground-style roundel */}
          <div style={{ width: 30, height: 30, margin: '0 auto 12px', borderRadius: '50%', border: `3px solid ${C.red}`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '44%', left: -4, right: -4, height: 4, background: 'rgba(230,220,200,0.85)' }} />
          </div>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(1.5rem, 3.2vw, 2.3rem)', fontWeight: 400, color: 'rgba(240,232,215,0.96)', letterSpacing: '0.04em', lineHeight: 1.05 }}>Life in<br />London</div>
          <div style={{ width: 26, height: 1, background: 'rgba(220,180,120,0.5)', margin: '10px auto' }} />
          <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.68rem', letterSpacing: '0.16em', color: 'rgba(220,200,170,0.68)' }}>a travel journal</div>
        </div>
      )}
      {!isRight && <div style={{ position: 'absolute', right: 0, top: '15%', bottom: '15%', width: 2, background: 'rgba(220,180,120,0.16)' }} />}
    </div>
  );
}

// ─── Flip / cover leaves (reused mechanic) ──────────────────────────────────
function FlipLeaf({ posStyle, transformOrigin, endRotateY, front, back, onDone, pageNum, onOpen }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.transition = 'none'; el.style.transform = 'rotateY(0deg)';
    void el.getBoundingClientRect();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = 'transform 0.9s cubic-bezier(0.645,0.045,0.355,1)';
      el.style.transform = `rotateY(${endRotateY}deg)`;
    }));
    const onEnd = (e) => { if (e.propertyName === 'transform') onDone(); };
    el.addEventListener('transitionend', onEnd, { once: true });
    return () => el.removeEventListener('transitionend', onEnd);
  }, []); // eslint-disable-line
  const face = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };
  return (
    <div ref={ref} style={{ ...posStyle, position: 'absolute', transformOrigin, transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d', transform: 'rotateY(0deg)', zIndex: 12 }}>
      <div style={face}>
        <SidePage page={front} pageNum={pageNum} onOpen={onOpen} />
        <div style={{ position: 'absolute', top: 0, height: '100%', ...(endRotateY < 0 ? { right: 0, width: 16, background: 'linear-gradient(to left, rgba(30,20,10,0.12), transparent)' } : { left: 0, width: 16, background: 'linear-gradient(to right, rgba(30,20,10,0.12), transparent)' }), pointerEvents: 'none' }} />
      </div>
      <div style={{ ...face, transform: 'rotateY(180deg)' }}>
        <SidePage page={back} pageNum={pageNum + 1} onOpen={onOpen} />
      </div>
    </div>
  );
}

function CoverLeaf({ posStyle, transformOrigin, endRotateY, side, onDone, borderRadius }) {
  const ref = useRef();
  const didAnimate = useRef(false);
  useEffect(() => {
    if (endRotateY === 0 || didAnimate.current) return;
    didAnimate.current = true;
    const el = ref.current; if (!el) return;
    el.style.transition = 'none'; el.style.transform = 'rotateY(0deg)';
    void el.getBoundingClientRect();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = 'transform 0.95s cubic-bezier(0.645,0.045,0.355,1)';
      el.style.transform = `rotateY(${endRotateY}deg)`;
    }));
    const onEnd = (e) => { if (e.propertyName === 'transform') onDone(); };
    el.addEventListener('transitionend', onEnd, { once: true });
    return () => el.removeEventListener('transitionend', onEnd);
  }, [endRotateY]);
  return (
    <div ref={ref} style={{ ...posStyle, position: 'absolute', transformOrigin, transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d', transform: 'rotateY(0deg)', zIndex: 20, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius, overflow: 'hidden' }}>
      <CoverHalf side={side} />
    </div>
  );
}

function NavBtn({ onClick, disabled, label, children }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} style={{
      width: 42, height: 42, borderRadius: '50%', border: `1px solid ${disabled ? 'rgba(44,66,98,0.14)' : C.navRing}`,
      background: disabled ? 'transparent' : C.navFill, color: disabled ? 'rgba(44,66,98,0.22)' : C.inkMid,
      cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.18s ease', outline: 'none',
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.navHover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = C.navFill; }}>{children}</button>
  );
}

// ─── Photo story modal ──────────────────────────────────────────────────────
function StoryModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const p = item.popup;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.26 }} onClick={onClose}
      role="dialog" aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(20,16,10,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ type: 'spring', stiffness: 240, damping: 26 }} onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: 'min(680px, 100%)', maxHeight: '86vh', overflowY: 'auto', background: C.page1, borderRadius: 18, boxShadow: '0 40px 100px rgba(20,12,6,0.5)' }}>
        <button onClick={onClose} aria-label="Close story" style={{ position: 'absolute', top: 14, right: 14, zIndex: 3, width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', color: C.ink, fontSize: '1.3rem', cursor: 'pointer' }}>×</button>
        <div style={{ width: '100%', height: 'clamp(200px, 32vh, 300px)', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
          <img src={item.src} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ padding: 'clamp(22px, 4vw, 38px)' }}>
          <h2 style={{ margin: '0 0 12px', fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(1.8rem, 4.5vw, 2.7rem)', color: C.ink, lineHeight: 1 }}>{p.title}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 20, fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.88rem', color: C.gold }}>
            {p.date && <span>{p.date}</span>}{p.date && p.location && <span aria-hidden style={{ opacity: 0.5 }}>·</span>}{p.location && <span>{p.location}</span>}
          </div>
          {p.story?.map((para, i) => <p key={i} style={{ margin: '0 0 1em', fontFamily: "'EB Garamond', serif", fontSize: '1.02rem', lineHeight: 1.75, color: C.inkMid }}>{para}</p>)}
          {p.gallery?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(p.gallery.length, 3)}, 1fr)`, gap: 10, marginTop: '1.2em' }}>
              {p.gallery.map((src, i) => <div key={i} style={{ aspectRatio: '4/5', borderRadius: 9, overflow: 'hidden', boxShadow: '0 8px 20px rgba(40,24,10,0.16)' }}><img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>)}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function LondonFlipbook() {
  const [phase, setPhase] = useState('intro');       // intro | opening | reading
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [flipState, setFlipState] = useState(null);  // null | { dir, target }
  const [coverDone, setCoverDone] = useState(0);
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => { const t = setTimeout(() => setPhase('opening'), 500); return () => clearTimeout(t); }, []);
  useEffect(() => { if (coverDone >= 2) setPhase('reading'); }, [coverDone]);

  function flipForward() { if (flipState || spreadIdx >= PAGES.length - 1) return; playPageFlip(); setFlipState({ dir: 'fwd', target: spreadIdx + 1 }); }
  function flipBackward() { if (flipState || spreadIdx <= 0) return; playPageFlip(); setFlipState({ dir: 'bwd', target: spreadIdx - 1 }); }
  function onFlipDone() { setSpreadIdx(flipState.target); setFlipState(null); }

  useEffect(() => {
    const fn = (e) => { if (e.key === 'ArrowLeft') flipBackward(); if (e.key === 'ArrowRight') flipForward(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }); // eslint-disable-line

  const cur = PAGES[spreadIdx];
  const next = flipState ? PAGES[flipState.target] : null;
  const leftBase = (flipState?.dir === 'bwd' && next) ? next.left : cur.left;
  const rightBase = (flipState?.dir === 'fwd' && next) ? next.right : cur.right;

  const leafConfig = flipState ? {
    posStyle: flipState.dir === 'fwd' ? { left: '50%', top: 0, width: '50%', height: '100%' } : { left: 0, top: 0, width: '50%', height: '100%' },
    transformOrigin: flipState.dir === 'fwd' ? 'left center' : 'right center',
    endRotateY: flipState.dir === 'fwd' ? -180 : 180,
    front: flipState.dir === 'fwd' ? cur.right : cur.left,
    back: flipState.dir === 'fwd' ? next.left : next.right,
    pageNum: spreadIdx * 2,
  } : null;

  const canFwd = spreadIdx < PAGES.length - 1;
  const canBwd = spreadIdx > 0;
  const isOpen = phase === 'reading';

  return (
    <div style={{ position: 'relative', width: '100%', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 4vh, 48px) 16px 76px' }}>
      <style>{`.lf-photo { transition: transform 0.2s ease; } .lf-photo:hover { transform: scale(1.03); } .lf-photo:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 3px; }`}</style>

      {/* Small tagline — the hero above already shows the page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 18, userSelect: 'none', pointerEvents: 'none' }}>
        <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', letterSpacing: '0.14em', fontSize: 'clamp(0.82rem, 1.6vw, 0.98rem)', color: C.inkDim }}>a travel journal — turn the pages</div>
      </motion.div>

      {/* Book */}
      <motion.div initial={{ scale: 0.82, opacity: 0, y: 18 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', width: 'min(900px, 94vw)', height: 'min(540px, 62vh)', perspective: '2600px', boxShadow: '0 34px 60px rgba(60,42,22,0.24), 0 12px 24px rgba(60,42,22,0.15)' }}>
        {/* left page */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '3px 0 0 3px', boxShadow: 'inset -10px 0 20px rgba(30,20,10,0.06)' }}>
          <SidePage page={leftBase} pageNum={spreadIdx * 2} onOpen={setActivePhoto} />
        </div>
        {/* right page */}
        <div style={{ position: 'absolute', left: '50%', top: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '0 6px 6px 0', boxShadow: 'inset 8px 0 18px rgba(30,20,10,0.05)' }}>
          <SidePage page={rightBase} pageNum={spreadIdx * 2 + 1} onOpen={setActivePhoto} />
        </div>
        {/* spine */}
        <div style={{ position: 'absolute', left: 'calc(50% - 2px)', top: 0, width: 5, height: '100%', zIndex: 4, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(30,20,10,0.18) 0%, rgba(30,20,10,0.04) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 12, height: '100%', zIndex: 5, pointerEvents: 'none', borderRadius: '3px 0 0 3px', background: `linear-gradient(to right, ${C.coverEdge}, transparent)` }} />

        {flipState && leafConfig && (
          <FlipLeaf {...leafConfig} onDone={onFlipDone} onOpen={setActivePhoto} />
        )}

        {(phase === 'intro' || phase === 'opening') && (
          <>
            <CoverLeaf posStyle={{ left: 0, top: 0, width: '50%', height: '100%' }} transformOrigin="right center" endRotateY={phase === 'opening' ? -180 : 0} side="left" borderRadius="3px 0 0 3px" onDone={() => setCoverDone(n => n + 1)} />
            <CoverLeaf posStyle={{ left: '50%', top: 0, width: '50%', height: '100%' }} transformOrigin="left center" endRotateY={phase === 'opening' ? 180 : 0} side="right" borderRadius="0 6px 6px 0" onDone={() => setCoverDone(n => n + 1)} />
          </>
        )}

        {isOpen && (
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 20, pointerEvents: 'none' }}>
            {PAGES.map((_, i) => <div key={i} style={{ width: i === spreadIdx ? 16 : 5, height: 5, borderRadius: 3, background: i === spreadIdx ? C.red : 'rgba(44,66,98,0.3)', transition: 'all 0.3s ease' }} />)}
          </div>
        )}
      </motion.div>

      {/* Nav */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 10 }} transition={{ duration: 0.4, delay: isOpen ? 0.12 : 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
        <NavBtn onClick={flipBackward} disabled={!canBwd || !!flipState} label="Previous page">←</NavBtn>
        <span style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(176,138,78,0.6)', minWidth: 60, textAlign: 'center', userSelect: 'none' }}>{spreadIdx + 1} of {PAGES.length}</span>
        <NavBtn onClick={flipForward} disabled={!canFwd || !!flipState} label="Next page">→</NavBtn>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: isOpen ? 1 : 0 }} transition={{ delay: 1.4, duration: 0.6 }}
        style={{ marginTop: 10, fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.68rem', letterSpacing: '0.08em', color: C.inkDim, userSelect: 'none' }}>
        use ← → to turn pages · tap a photo to read
      </motion.p>

      <AnimatePresence>
        {activePhoto && <StoryModal item={activePhoto} onClose={() => setActivePhoto(null)} />}
      </AnimatePresence>
    </div>
  );
}
