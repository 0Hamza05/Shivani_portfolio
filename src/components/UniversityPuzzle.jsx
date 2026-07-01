import { useState, useEffect, useRef, useMemo, useId } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { universityPieces, PUZZLE_GRID, PUZZLE_TABS } from '../data/universityPieces';

// ─── Theme (site palette + three brand-adjacent glows, kept soft) ───────────
const INK      = 'oklch(27% 0.035 40)';
const INK_DIM  = 'oklch(42% 0.03 45)';
const CREAM    = 'oklch(97% 0.012 75)';
const GOLD     = '#c9a04f';
const ACCENTS  = {
  blue:   'oklch(78% 0.09 245)',
  yellow: 'oklch(88% 0.11 95)',
  pink:   'oklch(80% 0.10 12)',
};

// ─── Jigsaw geometry ────────────────────────────────────────────────────────
// Every piece lives in its own local 420×420 box; the square "body" of the
// piece occupies the centred 300×300 region (60…360) and the interlocking
// tabs poke out into the 60px margin on each side. Generating each piece in
// an identically padded local frame keeps the maths simple: a piece is placed
// on the stage at (cellX-60, cellY-60) and its neighbours' complementary
// edges line up automatically.
const CELL = 300;
const PAD = 60;
const BOX = CELL + PAD * 2; // 420
const T0 = PAD;             // body top-left in local coords (60)
const T1 = PAD + CELL;      // body bottom-right (360)

// Symmetric jigsaw knob profile as (u = fraction along edge, v = fraction of
// edge length perpendicular). Symmetric about u=0.5 so a shared seam matches
// regardless of which neighbour draws it / in which direction.
function knobPath(ax, ay, tvx, tvy, ox, oy, cfg) {
  // point at (u along edge, v outward*cfg)
  const P = (u, v) => {
    const d = v * CELL * cfg;
    return `${(ax + tvx * u + ox * d).toFixed(2)} ${(ay + tvy * u + oy * d).toFixed(2)}`;
  };
  return (
    `L ${P(0.35, 0)} ` +
    `C ${P(0.28, 0)} ${P(0.28, 0.17)} ${P(0.5, 0.21)} ` +
    `C ${P(0.72, 0.17)} ${P(0.72, 0)} ${P(0.65, 0)} ` +
    `L ${P(1, 0)} `
  );
}

// Build one piece's clip-path 'd' in its local box. cfg = {top,right,bottom,left}
// where 0 = straight border edge, +1 = tab out, -1 = tab in (blank).
function piecePath(cfg) {
  // corners of the body, clockwise from top-left
  const TL = `${T0} ${T0}`;
  let d = `M ${TL} `;
  // top: TL→TR, travel +x, outward up (0,-1)
  d += cfg.top === 0 ? `L ${T1} ${T0} ` : knobPath(T0, T0, CELL, 0, 0, -1, cfg.top);
  // right: TR→BR, travel +y, outward right (1,0)
  d += cfg.right === 0 ? `L ${T1} ${T1} ` : knobPath(T1, T0, 0, CELL, 1, 0, cfg.right);
  // bottom: BR→BL, travel -x, outward down (0,1)
  d += cfg.bottom === 0 ? `L ${T0} ${T1} ` : knobPath(T1, T1, -CELL, 0, 0, 1, cfg.bottom);
  // left: BL→TL, travel -y, outward left (-1,0)
  d += cfg.left === 0 ? `L ${T0} ${T0} ` : knobPath(T0, T1, 0, -CELL, -1, 0, cfg.left);
  return d + 'Z';
}

// Resolve each piece's four edge configs from the shared seam tables.
function configFor(c, r) {
  const { cols, rows } = PUZZLE_GRID;
  const { hTab, vTab } = PUZZLE_TABS;
  return {
    top:    r === 0 ? 0 : -hTab[c],           // complementary to cell above's bottom
    bottom: r === rows - 1 ? 0 : hTab[c],
    left:   c === 0 ? 0 : -vTab[r][c - 1],    // complementary to cell to the left's right
    right:  c === cols - 1 ? 0 : vTab[r][c],
  };
}

// Off-screen entrance offsets (in stage px) per named origin.
const ENTRANCE = {
  'top-left':  { x: -900, y: -640, rot: -22 },
  'top':       { x: 60,   y: -820, rot: 14 },
  'top-right': { x: 900,  y: -640, rot: 22 },
  'left':      { x: -1000, y: 40,  rot: -16 },
  'right':     { x: 1000, y: -20,  rot: 16 },
  'bottom':    { x: -40,  y: 820,  rot: -12 },
};

function PuzzlePiece({ piece, index, onOpen, reduce }) {
  const cfg = useMemo(() => configFor(piece.cell.c, piece.cell.r), [piece.cell.c, piece.cell.r]);
  const d = useMemo(() => piecePath(cfg), [cfg]);

  // Local box origin on the stage (body cell minus the tab padding).
  const left = piece.cell.c * CELL - PAD;
  const top = piece.cell.r * CELL - PAD;

  const from = ENTRANCE[piece.from] || ENTRANCE.top;
  const accent = ACCENTS[piece.accent] || ACCENTS.blue;
  const [hovered, setHovered] = useState(false);

  const open = () => onOpen(piece);

  return (
    <motion.div
      initial={reduce ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                       : { opacity: 0, x: from.x, y: from.y, rotate: from.rot, scale: 0.82 }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      transition={reduce ? { duration: 0.3 } : {
        // organic momentum: a spring with a touch of overshoot, staggered
        type: 'spring', stiffness: 42, damping: 11, mass: 1.05,
        delay: 0.45 + index * 0.14,
        opacity: { duration: 0.5, delay: 0.45 + index * 0.14 },
      }}
      style={{
        position: 'absolute',
        left, top,
        width: BOX, height: BOX,
        willChange: 'transform',
        zIndex: hovered ? 30 : 10,
      }}
    >
      {/* Hover lift / scale wrapper (separate from the entrance transform so
          the two never fight over the same motion values). */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={`${piece.title} — open story`}
        onClick={open}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        animate={{ y: hovered ? -10 : 0, scale: hovered ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="uni-piece"
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          cursor: 'pointer',
          clipPath: `path('${d}')`,
          WebkitClipPath: `path('${d}')`,
          // Soft depth so the seams read even when perfectly assembled.
          filter: hovered
            ? `drop-shadow(0 22px 34px rgba(60,40,20,0.30)) drop-shadow(0 0 22px ${accent})`
            : 'drop-shadow(0 8px 16px rgba(60,40,20,0.22))',
          outline: 'none',
          willChange: 'transform, filter',
        }}
      >
        {piece.media.type === 'video' ? (
          <video
            src={piece.media.src}
            poster={piece.media.poster}
            autoPlay muted loop playsInline
            style={mediaStyle}
          />
        ) : (
          <img src={piece.media.src} alt={piece.title} loading="lazy" draggable={false} style={mediaStyle} />
        )}
        {/* Cohesive colour grade + hover-lightening overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(150deg, ${accent}, transparent 62%)`,
          opacity: hovered ? 0.16 : 0.34,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(40,26,18,0.14))',
          opacity: hovered ? 0.35 : 0.6,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }} />
      </motion.div>
    </motion.div>
  );
}

const mediaStyle = {
  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
  userSelect: 'none', pointerEvents: 'none',
};

// ─── Popup / chapter modal ──────────────────────────────────────────────────
function StoryModal({ piece, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const accent = ACCENTS[piece.accent] || ACCENTS.blue;
  const { popup } = piece;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={`${piece.title} story`}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'rgba(38,26,18,0.42)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="uni-modal"
        style={{
          position: 'relative',
          width: 'min(760px, 100%)', maxHeight: '88vh', overflowY: 'auto',
          background: CREAM, borderRadius: '22px',
          boxShadow: `0 40px 100px rgba(40,24,16,0.4), 0 0 0 1px rgba(201,160,79,0.18)`,
        }}
      >
        <button
          onClick={onClose} aria-label="Close story"
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 3,
            width: '40px', height: '40px', borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.9)', color: INK, fontSize: '1.4rem',
            lineHeight: 1, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(60,40,20,0.2)',
          }}
        >×</button>

        {/* Hero media */}
        <div style={{ position: 'relative', width: '100%', height: 'clamp(220px, 34vh, 340px)', overflow: 'hidden', borderRadius: '22px 22px 0 0' }}>
          {piece.media.type === 'video' ? (
            <video src={piece.media.src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={piece.media.src} alt={piece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 40%, rgba(40,26,18,0.55)), linear-gradient(120deg, ${accent}, transparent 60%)`, opacity: 0.9, mixBlendMode: 'multiply' }} />
          <div style={{ position: 'absolute', left: '32px', bottom: '22px', right: '72px' }}>
            <div style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', marginBottom: '6px' }}>
              {piece.category}
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', lineHeight: 1 }}>
              {piece.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
          {popup.intro && (
            <p style={{ margin: '0 0 1.1em', fontFamily: "'EB Garamond', serif", fontSize: 'clamp(1.05rem, 2vw, 1.28rem)', lineHeight: 1.5, color: INK }}>
              {popup.intro}
            </p>
          )}
          {popup.paragraphs?.map((p, i) => (
            <p key={i} style={{ margin: '0 0 1em', fontFamily: "'EB Garamond', serif", fontSize: '1.02rem', lineHeight: 1.75, color: INK_DIM }}>
              {p}
            </p>
          ))}

          {popup.quote && (
            <blockquote style={{
              margin: '1.6em 0', padding: '4px 0 4px 22px',
              borderLeft: `3px solid ${accent}`,
              fontFamily: "'Cote Lumiere'", fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
              lineHeight: 1.35, color: INK,
            }}>
              {popup.quote}
            </blockquote>
          )}

          {popup.gallery?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(popup.gallery.length, 3)}, 1fr)`, gap: '10px', marginTop: '1.4em' }}>
              {popup.gallery.map((src, i) => (
                <div key={i} style={{ aspectRatio: '4 / 5', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 22px rgba(60,40,20,0.16)' }}>
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

// ─── Floating "View Story" cursor label ─────────────────────────────────────
function CursorLabel({ visible }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed', left: pos.x, top: pos.y, zIndex: 200,
            transform: 'translate(18px, 14px)', pointerEvents: 'none',
            padding: '7px 14px', borderRadius: '999px',
            background: 'rgba(40,26,18,0.9)', color: '#fff',
            fontFamily: "'EB Garamond', serif", fontStyle: 'italic',
            fontSize: '0.82rem', letterSpacing: '0.06em', whiteSpace: 'nowrap',
            boxShadow: '0 6px 18px rgba(40,24,16,0.3)',
          }}
        >
          View story
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function UniversityPuzzle() {
  const reduce = useReducedMotion();
  const { cols, rows } = PUZZLE_GRID;
  const stageW = cols * CELL; // 900
  const stageH = rows * CELL; // 600

  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);     // pieces have started assembling
  const [active, setActive] = useState(null);    // open modal piece
  const [hoveringPiece, setHoveringPiece] = useState(false);

  // Fit the puzzle to ~60% of the viewport, leaving generous whitespace.
  useEffect(() => {
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const f = Math.min((vw * 0.62) / stageW, (vh * 0.56) / stageH);
      setScale(Math.max(0.28, Math.min(f, 1.15)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [stageW, stageH]);

  // Anticipation beat, then reveal.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), reduce ? 0 : 380);
    return () => clearTimeout(t);
  }, [reduce]);

  // Heading fades in once the pieces have (roughly) settled.
  const headingDelay = reduce ? 0.15 : 0.45 + universityPieces.length * 0.14 + 0.5;

  return (
    <main
      style={{
        position: 'relative', minHeight: '100vh', width: '100%',
        overflow: 'hidden',
        paddingTop: 'var(--nav-h)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'var(--bg)',
      }}
    >
      <style>{`
        @keyframes uniBlob1 { 0%,100%{ transform: translate3d(-6%, -4%, 0) scale(1); } 50%{ transform: translate3d(6%, 5%, 0) scale(1.15); } }
        @keyframes uniBlob2 { 0%,100%{ transform: translate3d(5%, 6%, 0) scale(1.1); } 50%{ transform: translate3d(-5%, -6%, 0) scale(0.95); } }
        @keyframes uniBlob3 { 0%,100%{ transform: translate3d(0, 4%, 0) scale(1); } 50%{ transform: translate3d(4%, -5%, 0) scale(1.12); } }
        .uni-piece:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 4px; }
        @media (prefers-reduced-motion: reduce) {
          .uni-blob { animation: none !important; }
        }
      `}</style>

      {/* Animated, barely-there background wash */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="uni-blob" style={blobStyle('42vw', '52vh', ACCENTS.blue, '8%', '2%', 'uniBlob1', 26)} />
        <div className="uni-blob" style={blobStyle('46vw', '46vh', ACCENTS.pink, '58%', '44%', 'uniBlob2', 32)} />
        <div className="uni-blob" style={blobStyle('38vw', '40vh', ACCENTS.yellow, '30%', '-6%', 'uniBlob3', 30)} />
      </div>

      {/* Heading (fades in after assembly) */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: headingDelay, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginTop: 'clamp(18px, 4vh, 46px)', padding: '0 20px' }}
      >
        <h1 style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(2.6rem, 7vw, 5rem)', color: INK, lineHeight: 0.98 }}>
          University
        </h1>
      </motion.header>

      {/* Puzzle stage */}
      <div style={{
        position: 'relative', zIndex: 4,
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', padding: '18px 0 40px',
      }}>
        <div style={{ width: stageW * scale, height: stageH * scale, position: 'relative', overflow: 'visible' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: stageW, height: stageH,
            transform: `scale(${scale})`, transformOrigin: 'top left',
          }}>
            {ready && universityPieces.map((piece, i) => (
              <PuzzlePiece
                key={piece.slug}
                piece={piece}
                index={i}
                reduce={reduce}
                onOpen={setActive}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: headingDelay + 0.2 }}
        style={{ position: 'relative', zIndex: 5, padding: '0 24px 46px' }}
      >
        <Link to="/" style={{
          fontFamily: "'EB Garamond', serif", fontSize: '0.75rem', letterSpacing: '0.16em',
          textTransform: 'uppercase', color: INK_DIM, borderBottom: `1px solid ${GOLD}`,
          paddingBottom: '2px', textDecoration: 'none',
        }}>← Back to gallery</Link>
      </motion.div>

      <CursorLabelBridge setHoveringPiece={setHoveringPiece} />
      <CursorLabel visible={hoveringPiece && !active} />

      <AnimatePresence>
        {active && <StoryModal piece={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </main>
  );
}

// Tracks whether the pointer is over any puzzle piece (for the cursor label),
// without adding per-piece state plumbing.
function CursorLabelBridge({ setHoveringPiece }) {
  useEffect(() => {
    const over = (e) => setHoveringPiece(!!(e.target.closest && e.target.closest('.uni-piece')));
    const out = (e) => { if (!e.relatedTarget || !(e.relatedTarget.closest && e.relatedTarget.closest('.uni-piece'))) setHoveringPiece(false); };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    return () => { document.removeEventListener('pointerover', over); document.removeEventListener('pointerout', out); };
  }, [setHoveringPiece]);
  return null;
}

function blobStyle(w, h, color, left, top, anim, dur) {
  return {
    position: 'absolute', width: w, height: h, left, top,
    background: `radial-gradient(circle at 50% 50%, ${color}, transparent 68%)`,
    filter: 'blur(60px)', opacity: 0.5, borderRadius: '50%',
    animation: `${anim} ${dur}s ease-in-out infinite`,
    willChange: 'transform',
  };
}
