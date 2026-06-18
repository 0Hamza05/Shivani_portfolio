import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { projects } from '../data/projects';

// ─── Page-flip sound ─────────────────────────────────────────────────────────
function playPageFlip() {
  try {
    const audio = new Audio('/page%20flip.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (_) {}
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FAMILY  = projects.find(p => p.slug === 'family');
const IMGS    = FAMILY?.blogImages ?? [];

// 4 spreads — content kept empty for now, populated later
const SPREADS = [
  { left: { type: 'blank' }, right: { type: 'blank' } },
  { left: { type: 'blank' }, right: { type: 'blank' } },
  { left: { type: 'blank' }, right: { type: 'blank' } },
  { left: { type: 'blank' }, right: { type: 'fin'   } },
];

// ─── Palette — soft, warm, girly ──────────────────────────────────────────────
const C = {
  // pages
  page1:   '#fdf4f7',   // blush-tinted white
  page2:   '#fef6f0',   // warm peach-white (alternating recto/verso)
  // cover
  coverA:  '#d4778e',   // rose — left half
  coverB:  '#c96882',   // deeper rose — right half
  coverEdge:'#b85475',  // spine/edge
  // accents
  rose:    '#d4778e',
  roseDeep:'#a84f68',
  roseDim: 'rgba(212,119,142,0.22)',
  peach:   '#f5b8a8',
  // text on pages
  ink:     '#3d1f2d',   // deep plum
  inkMid:  '#7a4458',   // mid rose-plum
  inkDim:  '#b08090',   // dusty rose
  // nav / UI
  navRing: 'rgba(212,119,142,0.38)',
  navFill: 'rgba(212,119,142,0.10)',
  navHover:'rgba(212,119,142,0.22)',
  // room
  room:    '#0b0608',   // very dark with a faint violet warmth
};

// ─── Shared page container ────────────────────────────────────────────────────
const PAGE = (bg = C.page1) => ({
  width: '100%', height: '100%',
  background: bg,
  boxSizing: 'border-box',
  position: 'relative',
});

// ─── Page renderers ───────────────────────────────────────────────────────────

// A blank page — just paper with a tiny corner flourish
function Blank({ bg }) {
  return (
    <div style={PAGE(bg)}>
      {/* Subtle lined-paper texture — very faint horizontal rules */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none' }}
        preserveAspectRatio="none"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={i}
            x1="8%" x2="92%"
            y1={`${10 + i * 6}%`} y2={`${10 + i * 6}%`}
            stroke={C.rose} strokeWidth="0.6"
          />
        ))}
      </svg>
      {/* Tiny corner flourish */}
      <svg
        style={{ position: 'absolute', bottom: 12, right: 14, opacity: 0.28, pointerEvents: 'none' }}
        width="28" height="28" viewBox="0 0 28 28" fill="none"
      >
        <path d="M4 24 Q14 4 24 14" stroke={C.rose} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <circle cx="4"  cy="24" r="1.8" fill={C.rose}/>
        <circle cx="24" cy="14" r="1.8" fill={C.rose}/>
        <circle cx="14" cy="8"  r="1.2" fill={C.peach} opacity="0.7"/>
      </svg>
    </div>
  );
}

// Final page — "back to gallery" with a sweet ornament
function Fin() {
  return (
    <div style={{ ...PAGE(C.page1), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 36 }}>
      {/* Ornament */}
      <svg width="52" height="28" viewBox="0 0 52 28" fill="none">
        <path d="M2 14 Q13 2 26 14 Q39 26 50 14" stroke={C.rose} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65"/>
        <circle cx="26" cy="14" r="3" fill={C.peach} opacity="0.9"/>
        <circle cx="10" cy="10" r="1.5" fill={C.rose} opacity="0.5"/>
        <circle cx="42" cy="18" r="1.5" fill={C.rose} opacity="0.5"/>
      </svg>

      <span style={{
        fontFamily: "'EB Garamond', serif",
        fontSize: '0.72rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: C.inkDim,
      }}>
        with love
      </span>

      <Link
        to="/"
        style={{
          marginTop: 6,
          fontFamily: "'EB Garamond', serif",
          fontSize: '0.75rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.inkMid,
          borderBottom: `1px solid ${C.roseDim}`,
          paddingBottom: 2,
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = C.roseDeep; }}
        onMouseLeave={e => { e.currentTarget.style.color = C.inkMid;  }}
      >
        ← Back to gallery
      </Link>

      {/* Page number */}
      <span style={{
        position: 'absolute', bottom: 12, right: 16,
        fontFamily: "'EB Garamond', serif",
        fontSize: '0.6rem', letterSpacing: '0.1em',
        color: C.inkDim, opacity: 0.4,
      }}>viii</span>
    </div>
  );
}

// Routes page type → component
function PageContent({ page, pageNum = 0 }) {
  const bg = pageNum % 2 === 0 ? C.page1 : C.page2;
  switch (page?.type) {
    case 'blank': return <Blank bg={bg} />;
    case 'fin':   return <Fin />;
    default:      return <Blank bg={bg} />;
  }
}

// ─── Cover halves ─────────────────────────────────────────────────────────────
// The polka-dot pattern is a CSS radial-gradient repeating tile.
// Left half: plain rose, no text.  Right half: title + details.
const DOT_PATTERN = `radial-gradient(circle, rgba(255,220,230,0.42) 2.2px, transparent 2.2px)`;

function CoverHalf({ side }) {
  const isRight = side === 'right';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: isRight
        ? `${DOT_PATTERN}, linear-gradient(135deg, ${C.coverB} 0%, ${C.coverA} 100%)`
        : `${DOT_PATTERN}, linear-gradient(135deg, ${C.coverEdge} 0%, ${C.coverA} 100%)`,
      backgroundSize: '18px 18px, 100% 100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Inner decorative border — slight inset */}
      <div style={{
        position: 'absolute',
        inset: '10px 8px',
        border: '1px solid rgba(255,235,240,0.28)',
        borderRadius: 4,
        pointerEvents: 'none',
      }}/>

      {/* Second inner border for layered effect */}
      <div style={{
        position: 'absolute',
        inset: '16px 14px',
        border: '1px solid rgba(255,235,240,0.14)',
        borderRadius: 2,
        pointerEvents: 'none',
      }}/>

      {isRight && (
        <div style={{ textAlign: 'center', padding: '24px 28px', position: 'relative', zIndex: 1 }}>
          {/* Small flower motif above title */}
          <svg width="36" height="20" viewBox="0 0 36 20" fill="none" style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }}>
            <circle cx="18" cy="10" r="3"   fill="rgba(255,240,245,0.9)"/>
            <circle cx="18" cy="4"  r="2.2" fill="rgba(255,230,240,0.65)"/>
            <circle cx="23" cy="7"  r="2.2" fill="rgba(255,230,240,0.65)"/>
            <circle cx="23" cy="13" r="2.2" fill="rgba(255,230,240,0.65)"/>
            <circle cx="18" cy="16" r="2.2" fill="rgba(255,230,240,0.65)"/>
            <circle cx="13" cy="13" r="2.2" fill="rgba(255,230,240,0.65)"/>
            <circle cx="13" cy="7"  r="2.2" fill="rgba(255,230,240,0.65)"/>
          </svg>

          {/* Title */}
          <div style={{
            fontFamily:    "'Mocha', serif",
            fontSize:      'clamp(1.9rem, 3.8vw, 2.9rem)',
            fontWeight:    400,
            color:         'rgba(255,240,245,0.96)',
            letterSpacing: '0.08em',
            lineHeight:    1,
            marginBottom:  10,
            textShadow:    '0 2px 12px rgba(100,20,50,0.35)',
          }}>
            Family
          </div>

          {/* Thin divider */}
          <div style={{ width: 28, height: 1, background: 'rgba(255,225,235,0.5)', margin: '0 auto 10px' }}/>

          {/* Subtitle */}
          <div style={{
            fontFamily:    "'EB Garamond', serif",
            fontStyle:     'italic',
            fontSize:      '0.72rem',
            letterSpacing: '0.18em',
            color:         'rgba(255,220,235,0.68)',
          }}>
            a little book of us
          </div>
        </div>
      )}

      {/* Spine highlight on left cover */}
      {!isRight && (
        <div style={{
          position: 'absolute',
          right: 0, top: '15%', bottom: '15%',
          width: 2,
          background: 'rgba(255,220,230,0.18)',
          borderRadius: 1,
        }}/>
      )}
    </div>
  );
}

// ─── Flip leaf ────────────────────────────────────────────────────────────────
// CSS 3D page turn using force-reflow trick.
function FlipLeaf({ posStyle, transformOrigin, endRotateY, front, back, onDone, pageNum }) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform   = 'rotateY(0deg)';
    void el.getBoundingClientRect();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform 0.88s cubic-bezier(0.645,0.045,0.355,1)`;
        el.style.transform   = `rotateY(${endRotateY}deg)`;
      });
    });
    const onEnd = (e) => {
      if (e.propertyName === 'transform') onDone();
    };
    el.addEventListener('transitionend', onEnd, { once: true });
    return () => el.removeEventListener('transitionend', onEnd);
  }, []); // intentional — only on mount

  const face = {
    position: 'absolute', inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <div
      ref={ref}
      style={{
        ...posStyle,
        position:        'absolute',
        transformOrigin,
        transformStyle:  'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        transform:       'rotateY(0deg)',
        zIndex:          12,
      }}
    >
      {/* Front face */}
      <div style={face}>
        <PageContent page={front} pageNum={pageNum} />
        {/* Curl shadow on leading edge */}
        <div style={{
          position: 'absolute', top: 0, height: '100%',
          ...(endRotateY < 0
            ? { right: 0, width: 16, background: 'linear-gradient(to left, rgba(160,60,90,0.10), transparent)' }
            : { left:  0, width: 16, background: 'linear-gradient(to right,rgba(160,60,90,0.10), transparent)' }),
          pointerEvents: 'none',
        }}/>
      </div>
      {/* Back face */}
      <div style={{ ...face, transform: 'rotateY(180deg)' }}>
        <PageContent page={back} pageNum={pageNum + 1} />
      </div>
    </div>
  );
}

// ─── Cover leaf ───────────────────────────────────────────────────────────────
function CoverLeaf({ posStyle, transformOrigin, endRotateY, side, onDone, borderRadius }) {
  const ref        = useRef();
  const didAnimate = useRef(false);

  useEffect(() => {
    if (endRotateY === 0 || didAnimate.current) return;
    didAnimate.current = true;
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform   = 'rotateY(0deg)';
    void el.getBoundingClientRect();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform 0.95s cubic-bezier(0.645,0.045,0.355,1)`;
        el.style.transform   = `rotateY(${endRotateY}deg)`;
      });
    });
    const onEnd = (e) => { if (e.propertyName === 'transform') onDone(); };
    el.addEventListener('transitionend', onEnd, { once: true });
    return () => el.removeEventListener('transitionend', onEnd);
  }, [endRotateY]);

  return (
    <div
      ref={ref}
      style={{
        ...posStyle,
        position:             'absolute',
        transformOrigin,
        transformStyle:       'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        transform:            'rotateY(0deg)',
        zIndex:               20,
        backfaceVisibility:   'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderRadius,
        overflow:             'hidden',
      }}
    >
      <CoverHalf side={side} />
    </div>
  );
}

// ─── Nav button ───────────────────────────────────────────────────────────────
function NavBtn({ onClick, disabled, label, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 42, height: 42,
        borderRadius: '50%',
        border: `1px solid ${disabled ? 'rgba(212,119,142,0.12)' : C.navRing}`,
        background: disabled ? 'transparent' : C.navFill,
        color: disabled ? 'rgba(180,80,120,0.20)' : C.rose,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem',
        transition: 'all 0.18s ease',
        outline: 'none',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.navHover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = C.navFill;  }}
    >
      {children}
    </button>
  );
}

// ─── Keyboard handler ─────────────────────────────────────────────────────────
function KeyboardHandler({ onLeft, onRight }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  onLeft();
      if (e.key === 'ArrowRight') onRight();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onLeft, onRight]);
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FamilyFlipbook() {
  const location = useLocation();

  // When navigated from the member selector, `location.state.spread` carries the
  // target spread index. Clamp to valid range; fall back to 0 for direct visits.
  const startSpread = (() => {
    const s = location.state?.spread;
    if (typeof s !== 'number') return 0;
    return Math.max(0, Math.min(Math.round(s), SPREADS.length - 1));
  })();

  // Skip the cover-opening animation when arriving from the member nav so
  // the user lands instantly on the right page without waiting.
  const skipIntro = location.state !== null && typeof location.state === 'object';

  const [phase,      setPhase]      = useState(skipIntro ? 'reading' : 'intro');
  const [spreadIdx,  setSpreadIdx]  = useState(startSpread);
  const [flipState,  setFlipState]  = useState(null);      // null | { dir, target }
  const [coverDone,  setCoverDone]  = useState(skipIntro ? 2 : 0);

  // Trigger the opening animation after the entrance — skipped on deep links
  useEffect(() => {
    if (skipIntro) return;
    const t = setTimeout(() => setPhase('opening'), 550);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (coverDone >= 2) setPhase('reading');
  }, [coverDone]);


  function flipForward() {
    if (flipState || spreadIdx >= SPREADS.length - 1) return;
    playPageFlip();
    setFlipState({ dir: 'fwd', target: spreadIdx + 1 });
  }
  function flipBackward() {
    if (flipState || spreadIdx <= 0) return;
    playPageFlip();
    setFlipState({ dir: 'bwd', target: spreadIdx - 1 });
  }
  function onFlipDone() {
    setSpreadIdx(flipState.target);
    setFlipState(null);
  }

  const cur  = SPREADS[spreadIdx];
  const next = flipState ? SPREADS[flipState.target] : null;

  const leftBase  = (flipState?.dir === 'bwd' && next) ? next.left  : cur.left;
  const rightBase = (flipState?.dir === 'fwd' && next) ? next.right : cur.right;

  const leafConfig = flipState ? {
    posStyle: flipState.dir === 'fwd'
      ? { left: '50%', top: 0, width: '50%', height: '100%' }
      : { left: 0,     top: 0, width: '50%', height: '100%' },
    transformOrigin: flipState.dir === 'fwd' ? 'left center' : 'right center',
    endRotateY:      flipState.dir === 'fwd' ? -180 : 180,
    front: flipState.dir === 'fwd' ? cur.right : cur.left,
    back:  flipState.dir === 'fwd' ? next.left  : next.right,
    pageNum: spreadIdx * 2,
  } : null;

  const canFwd = spreadIdx < SPREADS.length - 1;
  const canBwd = spreadIdx > 0;
  const isOpen = phase === 'reading';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: C.room,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      paddingTop: '2vh',
      overflow: 'hidden',
    }}>
      {/* Soft ambient light — faint pink-rose bloom from below center */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 55% 40% at 50% 66%, rgba(200,80,120,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* ── Title above the book ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1,  y:   0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign:     'center',
          marginBottom:  14,
          userSelect:    'none',
          pointerEvents: 'none',
        }}
      >
        <h1 style={{
          fontFamily:    "'Mocha', serif",
          fontSize:      'clamp(2rem, 4vw, 3rem)',
          fontWeight:    400,
          letterSpacing: '0.10em',
          color:         'rgba(230,160,185,0.88)',
          margin:        0,
          lineHeight:    1,
          textShadow:    '0 2px 20px rgba(180,60,100,0.28)',
        }}>
          Family
        </h1>
        {/* Small decorative rule below the title */}
        <div style={{
          width:        32,
          height:       1,
          background:   'rgba(212,119,142,0.38)',
          margin:       '8px auto 0',
          borderRadius: 1,
        }}/>
      </motion.div>

      {/* ── Book ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.76, opacity: 0, y: 18 }}
        animate={{ scale: 1,    opacity: 1, y:  0 }}
        transition={{ duration: 0.70, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position:    'relative',
          width:       'min(880px, 93vw)',
          height:      'min(520px, 58vh)',
          perspective: '2600px',
          borderRadius:'4px 7px 7px 4px',
          boxShadow: `
            0  60px 100px rgba(0,0,0,0.72),
            0  22px  40px rgba(0,0,0,0.46),
            0   2px   6px rgba(0,0,0,0.38)
          `,
        }}
      >
        {/* ── Left page ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: '50%', height: '100%',
          overflow: 'hidden', borderRadius: '4px 0 0 4px',
          boxShadow: 'inset -10px 0 20px rgba(160,60,90,0.06)',
        }}>
          <PageContent page={leftBase} pageNum={spreadIdx * 2} />
        </div>

        {/* ── Right page ── */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, width: '50%', height: '100%',
          overflow: 'hidden', borderRadius: '0 7px 7px 0',
          boxShadow: 'inset 8px 0 18px rgba(160,60,90,0.04)',
        }}>
          <PageContent page={rightBase} pageNum={spreadIdx * 2 + 1} />
        </div>

        {/* ── Center spine crease ── */}
        <div style={{
          position: 'absolute', left: 'calc(50% - 2px)', top: 0,
          width: 5, height: '100%', zIndex: 4, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(160,60,90,0.16) 0%, rgba(160,60,90,0.04) 100%)',
        }}/>

        {/* ── Spine strip — left edge ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 13, height: '100%', zIndex: 5, pointerEvents: 'none',
          borderRadius: '4px 0 0 4px',
          background: `linear-gradient(to right, ${C.coverEdge}, transparent)`,
        }}/>

        {/* ── Flip leaf ── */}
        {flipState && leafConfig && (
          <FlipLeaf
            posStyle={leafConfig.posStyle}
            transformOrigin={leafConfig.transformOrigin}
            endRotateY={leafConfig.endRotateY}
            front={leafConfig.front}
            back={leafConfig.back}
            onDone={onFlipDone}
            pageNum={leafConfig.pageNum}
          />
        )}

        {/* ── Cover leaves (shown during intro / opening) ── */}
        {(phase === 'intro' || phase === 'opening') && (
          <>
            <CoverLeaf
              posStyle={{ left: 0, top: 0, width: '50%', height: '100%' }}
              transformOrigin="right center"
              endRotateY={phase === 'opening' ? -180 : 0}
              side="left"
              borderRadius="4px 0 0 4px"
              onDone={() => setCoverDone(n => n + 1)}
            />
            <CoverLeaf
              posStyle={{ left: '50%', top: 0, width: '50%', height: '100%' }}
              transformOrigin="left center"
              endRotateY={phase === 'opening' ? 180 : 0}
              side="right"
              borderRadius="0 7px 7px 0"
              onDone={() => setCoverDone(n => n + 1)}
            />
          </>
        )}

        {/* ── Page indicator dots (bottom center of book) ── */}
        {isOpen && (
          <div style={{
            position: 'absolute', bottom: 10, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: 5, alignItems: 'center',
            zIndex: 20, pointerEvents: 'none',
          }}>
            {SPREADS.map((_, i) => (
              <div key={i} style={{
                width:  i === spreadIdx ? 16 : 5,
                height: 5,
                borderRadius: 3,
                background: i === spreadIdx ? C.rose : 'rgba(212,119,142,0.28)',
                transition: 'all 0.3s ease',
              }}/>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Navigation arrows ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 10 }}
        transition={{ duration: 0.4, delay: isOpen ? 0.12 : 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 24 }}
      >
        <NavBtn onClick={flipBackward} disabled={!canBwd || !!flipState} label="Previous page">←</NavBtn>

        <span style={{
          fontFamily: "'EB Garamond', serif",
          fontStyle:  'italic',
          fontSize:   '0.8rem',
          color:      'rgba(212,119,142,0.5)',
          letterSpacing: '0.06em',
          userSelect: 'none',
          minWidth: 60,
          textAlign: 'center',
        }}>
          {spreadIdx + 1} of {SPREADS.length}
        </span>

        <NavBtn onClick={flipForward} disabled={!canFwd || !!flipState} label="Next page">→</NavBtn>
      </motion.div>

      {/* ── Hint ──────────────────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{
          marginTop: 10,
          fontFamily: "'EB Garamond', serif",
          fontStyle: 'italic',
          fontSize: '0.68rem',
          letterSpacing: '0.08em',
          color: '#e8a0be',
          userSelect: 'none',
        }}
      >
        use ← → to turn pages
      </motion.p>

      <KeyboardHandler onLeft={flipBackward} onRight={flipForward} />
    </div>
  );
}
