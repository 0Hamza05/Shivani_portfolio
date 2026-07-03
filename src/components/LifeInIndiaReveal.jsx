import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { projects } from '../data/projects';

const INK = '#3a2a22';
const INK_DIM = 'rgba(58, 42, 34, 0.65)';
const GOLD = '#c9a04f';
const TERRACOTTA = '#c0654a';
const CARD_CREAM = '#fbf4e8';

const ME_IMAGE = '/images/life-in-india/optimised/life-in-india-op-1.webp';

const FAMILY_PHOTOS_DIR = '/images/family/optimised';
const SCROLL_PAGE_DIR = '/images/life-in-india/scroll-page';

// Every photo box shares the same portrait aspect ratio (~0.82) so the
// gallery reads as one consistent frame style — only the overall size
// varies per photo, not the shape. Corner radius scales with size so the
// rounding looks consistent across the smaller and bigger frames.
const PHOTO_ASPECT = 0.82;
const photoShape = (w, circle = false) => circle
  ? { w, h: w, r: w / 2 }
  : { w, h: Math.round(w / PHOTO_ASPECT), r: Math.round(w * 0.14) };

// Both photo folders combined, interleaved one-for-one so the two sources
// mix around the ring instead of each clumping on its own side. The
// `family-op` folder has more entries (12 vs 10), so it supplies the last
// two slots once the scroll-page folder runs out.
const FAMILY_PHOTO_FILES = [
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-1.webp', name: 'Family 1' },
  { dir: SCROLL_PAGE_DIR, file: 'Mom_result.webp', name: 'Mom' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-2.webp', name: 'Family 2', wOverride: 160 },
  { dir: SCROLL_PAGE_DIR, file: 'Nani_result.webp', name: 'Nani' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-3.webp', name: 'Family 3' },
  { dir: SCROLL_PAGE_DIR, file: 'Nanu_result.webp', name: 'Nanu' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-4.webp', name: 'Family 4' },
  { dir: SCROLL_PAGE_DIR, file: 'Mamu_result.webp', name: 'Mamu' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-5.webp', name: 'Family 5' },
  { dir: SCROLL_PAGE_DIR, file: 'Sharu_result.webp', name: 'Sharu' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-6.webp', name: 'Family 6', wOverride: 160 },
  { dir: SCROLL_PAGE_DIR, file: 'img-1_result.webp', name: 'img-1' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-7.webp', name: 'Family 7' },
  { dir: SCROLL_PAGE_DIR, file: 'img-2_result_result.webp', name: 'img-2', circle: true },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-8.webp', name: 'Family 8', circle: true },
  { dir: SCROLL_PAGE_DIR, file: 'img-3_result.webp', name: 'img-3' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-9.webp', name: 'Family 9' },
  { dir: SCROLL_PAGE_DIR, file: 'img-4_result.webp', name: 'img-4' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-10.webp', name: 'Family 10' },
  { dir: SCROLL_PAGE_DIR, file: 'img-5_result.webp', name: 'img-5' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-11.webp', name: 'Family 11' },
  { dir: FAMILY_PHOTOS_DIR, file: 'family-op-12.webp', name: 'Family 12' },
];

// Bell-curve width by array position, purely for size variety — actual
// placement order (biggest-first) is computed separately in
// computeFamilyLayout, so this index order doesn't determine where a photo
// ends up. The `+ i * 0.37` term keeps every width unique so no two photos
// are ever an exact size match.
const FAMILY_MIN_W = 60;
const FAMILY_MAX_W = 122;
function bellWidth(i, count) {
  const center = (count - 1) / 2;
  const t = 1 - Math.abs(i - center) / center;
  return Math.round(FAMILY_MIN_W + t * (FAMILY_MAX_W - FAMILY_MIN_W) + i * 0.37);
}

const FAMILY_MEMBERS = FAMILY_PHOTO_FILES.map((f, i) => ({
  name: f.name,
  image: `${f.dir}/${f.file}`,
  circle: f.circle ?? false,
  shape: photoShape(f.wOverride ?? bellWidth(i, FAMILY_PHOTO_FILES.length), f.circle),
}));

// A small fixed tilt per photo (deterministic hash, not Math.random, so the
// layout is reproducible across renders) for the pinned-snapshot scrapbook
// feel rather than a tidy geometric ring.
const PHOTO_ROTATIONS = FAMILY_PHOTO_FILES.map((_, i) => {
  const hash = Math.sin(i * 12.9898) * 43758.5453;
  const frac = hash - Math.floor(hash);
  return Math.round((frac * 18 - 9) * 10) / 10; // -9deg .. 9deg
});

const SIZE_SCALE = { desktop: 1, tablet: 0.8, mobile: 0.48 };

// Approximate on-screen size of the "Me" photo per breakpoint (matches the
// CSS clamp() values used where it's rendered) — only needed so the layout
// solver below can keep family photos clear of it.
const ME_SIZE = {
  desktop: { w: 175, h: 175 },
  tablet: { w: 135, h: 135 },
  mobile: { w: 116, h: 116 },
};

// All photos share the same scroll window so they emerge together rather
// than cascading one after another.
const STAGGER = 0;
const WINDOW = 0.85;

function getBreakpoint() {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 700) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'desktop';
}

function boxAround(x, y, w, h) {
  return { left: x - w / 2, right: x + w / 2, top: y - h / 2, bottom: y + h / 2 };
}

function boxesOverlap(a, b, margin) {
  return !(a.right + margin < b.left || a.left - margin > b.right || a.bottom + margin < b.top || a.top - margin > b.bottom);
}

function rotatedHalfExtents(w, h, deg) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return { hw: (w * c + h * s) / 2, hh: (w * s + h * c) / 2 };
}

// Computes a final resting offset (px from "Me"'s center) for every family
// photo using greedy spiral placement — the same family of algorithm word-
// cloud layouts use. Biggest photos are placed first, each spiraling
// outward from a golden-angle-staggered start point until it lands on a
// spot clear of "Me", the title band, the stage edges, and every photo
// already placed; smaller photos fill in the gaps afterward.
//
// This reads as an organic scattered scrapbook rather than a geometric
// ring. An earlier version placed every photo along its own fixed-angle
// ray from center — with 20+ photos that forced too many similarly-sized
// ones onto the same radius cap near the bottom edge, flattening them into
// a visible straight line instead of a natural scatter.
function computeFamilyLayout(breakpoint, stageW, stageH, aspectRatios) {
  const count = FAMILY_MEMBERS.length;
  const sizeScale = SIZE_SCALE[breakpoint];
  const shapes = FAMILY_MEMBERS.map((m, i) => {
    const w = m.shape.w * sizeScale;
    const ratio = aspectRatios?.[i] ?? (m.circle ? 1 : PHOTO_ASPECT);
    return { w, h: w / ratio };
  });
  const me = ME_SIZE[breakpoint];
  const margin = breakpoint === 'mobile' ? 6 : breakpoint === 'tablet' ? 10 : 14;
  const titleClearance = breakpoint === 'mobile' ? 70 : 92;
  const sideMargin = breakpoint === 'mobile' ? 2 : 10;
  const bottomMargin = 14;
  const halfH = stageH / 2;
  const halfW = stageW / 2;

  const placedBoxes = [boxAround(0, 0, me.w, me.h)];
  const offsets = new Array(count);

  // Largest-first so big photos claim open space near the center while it's
  // still available; smaller ones are easier to tuck into whatever's left.
  const order = shapes.map((_, i) => i).sort((a, b) => shapes[b].w * shapes[b].h - shapes[a].w * shapes[a].h);
  const GOLDEN_ANGLE = 137.50776;

  order.forEach((i, k) => {
    const { w, h } = shapes[i];
    const { hw, hh } = rotatedHalfExtents(w, h, PHOTO_ROTATIONS[i]);

    function fits(x, y) {
      const box = { left: x - hw, right: x + hw, top: y - hh, bottom: y + hh };
      if (box.top < -halfH + titleClearance) return false;
      if (box.bottom > halfH - bottomMargin) return false;
      if (box.left < -halfW + sideMargin) return false;
      if (box.right > halfW - sideMargin) return false;
      return placedBoxes.every(p => !boxesOverlap(box, p, margin));
    }

    // Each photo's spiral starts at a different angle (golden-angle offset
    // per placement order) so they don't all probe the same direction first.
    let angle = (k * GOLDEN_ANGLE) % 360;
    let radius = Math.max(me.w, me.h) / 2 + Math.max(hw, hh) * 0.5;
    let found = null;
    for (let step = 0; step < 6000 && !found; step++) {
      const rad = (angle * Math.PI) / 180;
      const x = Math.sin(rad) * radius;
      const y = -Math.cos(rad) * radius;
      if (fits(x, y)) found = { x, y };
      angle += 15;
      if (angle >= 360) { angle -= 360; radius += 4; }
    }
    if (!found) found = { x: 0, y: halfH - bottomMargin - hh }; // exhausted search space, shouldn't trigger in practice

    offsets[i] = found;
    placedBoxes.push({ left: found.x - hw, right: found.x + hw, top: found.y - hh, bottom: found.y + hh });
  });

  return offsets;
}

function FamilyMember({ member, index, scrollYProgress, offset, shape, rotation, onOpen }) {
  const start = index * STAGGER;
  const end = Math.min(start + WINDOW, 0.95);
  const x = useTransform(scrollYProgress, [start, end], [0, offset.x]);
  const y = useTransform(scrollYProgress, [start, end], [0, offset.y]);
  const scale = useTransform(scrollYProgress, [start, end], [0.5, 1]);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

  // Opacity is applied via a direct ref subscription rather than the style
  // prop — with this many sibling motion values sharing one scrollYProgress,
  // the style-prop binding for `opacity` specifically stopped receiving
  // updates after the first commit (x/y/scale kept updating fine). Manual
  // subscription sidesteps whatever internal batching caused that.
  const photoRef = useRef(null);
  useMotionValueEvent(opacity, 'change', latest => {
    if (photoRef.current) photoRef.current.style.opacity = latest;
  });

  // The outer wrapper stays pointer-events:none (it spans the whole stage
  // and shouldn't block anything while photos are mid-flight); the inner
  // box opts back into pointer-events so it alone is clickable once visible.
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 - index, pointerEvents: 'none' }}>
      <motion.div
        ref={photoRef}
        onClick={() => onOpen(member.image, member.name)}
        role="button"
        tabIndex={0}
        aria-label={`View photo of ${member.name}`}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(member.image, member.name); } }}
        style={{
          x, y, scale,
          rotate: rotation,
          opacity: opacity.get(),
          width: `${shape.w}px`,
          height: `${shape.h}px`,
          borderRadius: `${shape.r}px`,
          overflow: 'hidden',
          boxShadow: '0 10px 26px rgba(60, 40, 20, 0.22)',
          willChange: 'transform, opacity',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
      >
        <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: member.circle ? 'cover' : 'contain' }} draggable={false} />
      </motion.div>
    </div>
  );
}

function StaticFamilyMember({ member, offset, shape, rotation, onOpen }) {
  return (
    <div
      onClick={() => onOpen(member.image, member.name)}
      role="button"
      tabIndex={0}
      aria-label={`View photo of ${member.name}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(member.image, member.name); } }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${rotation}deg)`,
        width: `${shape.w}px`,
        height: `${shape.h}px`,
        borderRadius: `${shape.r}px`,
        overflow: 'hidden',
        boxShadow: '0 10px 26px rgba(60,40,20,0.22)',
        cursor: 'pointer',
      }}
    >
      <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: member.circle ? 'cover' : 'contain' }} />
    </div>
  );
}

function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'rgba(20, 14, 10, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        cursor: 'zoom-out',
      }}
    >
      <motion.img
        src={image.src}
        alt={image.alt}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '86vh',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: '8px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
          cursor: 'default',
        }}
      />
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          color: INK,
          fontSize: '1.3rem',
          lineHeight: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
    </motion.div>
  );
}

// A flat diamond "pip", matching the site's hand-cut flat-SVG icon
// language (see Butterfly.jsx) rather than reaching for an emoji suit.
function CardPip({ color }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={color} />
    </svg>
  );
}

function CardCorner({ title, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ fontFamily: "'Cote Lumiere'", fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: accent }}>
        {title}
      </span>
      <CardPip color={accent} />
    </div>
  );
}

// Styled like a real playing card: cream stock, rounded corners, mirrored
// rank+pip in opposite corners, and the photo sitting inset as the card's
// "face art" rather than bleeding full-frame — with a gentle dealt tilt
// that straightens and lifts on hover.
function PhaseTwoCard({ title, caption, image, accent, rotate, onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 'clamp(200px, 30vw, 252px)',
        aspectRatio: '5 / 7',
        background: CARD_CREAM,
        border: '1px solid rgba(58, 42, 34, 0.16)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 16px 18px',
        font: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: hovered ? '0 28px 56px rgba(60, 40, 20, 0.3)' : '0 14px 32px rgba(60, 40, 20, 0.2)',
        transform: `rotate(${hovered ? 0 : rotate}deg) translateY(${hovered ? -10 : 0}px)`,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
        zIndex: hovered ? 2 : 1,
        flexShrink: 0,
      }}
    >
      <CardCorner title={title} accent={accent} />

      <div style={{ flex: 1, margin: '10px 0', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${accent}` }}>
        <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <p style={{ margin: '0 0 8px', fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: '0.78rem', lineHeight: 1.4, color: INK_DIM, textAlign: 'center' }}>
        {caption}
      </p>

      <div style={{ alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>
        <CardCorner title={title} accent={accent} />
      </div>
    </button>
  );
}

// Reuses the existing "family" project's own description/photos so the
// popup content stays in sync with that data instead of duplicating it.
const familyProject = projects.find(p => p.slug === 'family');

const SCHOOL_POST = {
  title: 'School',
  images: ['/images/life-in-india/optimised/life-in-india-op-2.webp'],
  paragraphs: [
    'Uniforms, chalk dust, and the friendships that started it all.',
    'Long bus rides, exam-week nerves, and the kind of friendships that only got stronger with distance and time — school was the first place that felt like mine outside the house.',
  ],
};

const FAMILY_POST = {
  title: 'Family',
  images: familyProject ? familyProject.gridImages.slice(0, 6) : [],
  paragraphs: familyProject ? familyProject.description.split('\n\n') : [],
};

function BlogPopup({ post, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(30, 20, 14, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(640px, 100%)',
          maxHeight: '84vh',
          overflowY: 'auto',
          background: CARD_CREAM,
          borderRadius: '16px',
          boxShadow: '0 30px 70px rgba(40, 24, 16, 0.35)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 2,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.85)',
            color: INK,
            fontSize: '1.1rem',
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>

        {post.images[0] && (
          <div style={{ width: '100%', height: '260px', overflow: 'hidden' }}>
            <img src={post.images[0]} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ padding: '28px 32px 36px' }}>
          <h3 style={{ margin: '0 0 14px', fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: '2rem', color: INK }}>
            {post.title}
          </h3>
          {post.paragraphs.map((p, i) => (
            <p key={i} style={{ margin: '0 0 0.8em', fontFamily: "'EB Garamond', serif", fontSize: '1rem', lineHeight: 1.65, color: INK_DIM }}>
              {p}
            </p>
          ))}

          {post.images.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '20px' }}>
              {post.images.slice(1).map((src, i) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LifeInIndiaReveal() {
  const trackRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [breakpoint, setBreakpoint] = useState(getBreakpoint());
  const [stageSize, setStageSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: (typeof window !== 'undefined' ? window.innerHeight : 800) - 54,
  }));
  const [openPost, setOpenPost] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const openLightbox = (src, alt) => setLightbox({ src, alt });
  const [imgRatios, setImgRatios] = useState(null);

  useEffect(() => {
    const onResize = () => {
      setBreakpoint(getBreakpoint());
      setStageSize({ w: window.innerWidth, h: window.innerHeight - 54 });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    Promise.all(
      FAMILY_MEMBERS.map(m => new Promise(resolve => {
        if (m.circle) { resolve(1); return; }
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
        img.onerror = () => resolve(PHOTO_ASPECT);
        img.src = m.image;
      }))
    ).then(setImgRatios);
  }, []);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const offsets = computeFamilyLayout(breakpoint, stageSize.w, stageSize.h, imgRatios);
  const sizeScale = SIZE_SCALE[breakpoint];
  const shapes = FAMILY_MEMBERS.map((m, i) => {
    const w = Math.round(m.shape.w * sizeScale);
    const r = Math.round(m.shape.r * sizeScale);
    const ratio = imgRatios?.[i] ?? (m.circle ? 1 : PHOTO_ASPECT);
    const h = Math.round(w / ratio);
    return { w, h, r };
  });
  const trackHeight = breakpoint === 'mobile' ? '220vh' : '280vh';

  const sectionTitle = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 24px 0', textAlign: 'center', zIndex: 21 }}>
      <h1 style={{ margin: 0, fontFamily: "'EB Garamond', serif", fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: INK }}>
        Life in India
      </h1>
    </div>
  );

  return (
    // Top padding clears the fixed navbar so the pinned stage is already in
    // position the instant the page loads — no separate scrollable intro
    // section before the pin engages.
    <main style={{ backgroundColor: 'var(--bg)', paddingTop: 'var(--nav-h)' }}>
      {shouldReduceMotion ? (
        <div style={{ position: 'relative', height: '70vh', minHeight: '460px' }}>
          {sectionTitle}
          <div
            onClick={() => openLightbox(ME_IMAGE, 'Me')}
            role="button"
            tabIndex={0}
            aria-label="View photo of Me"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(ME_IMAGE, 'Me'); } }}
            style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, width: 130, height: 130, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 16px 40px rgba(60,40,20,0.28)', cursor: 'pointer' }}
          >
            <img src={ME_IMAGE} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {FAMILY_MEMBERS.map((member, i) => (
            <StaticFamilyMember key={member.name} member={member} offset={offsets[i]} shape={shapes[i]} rotation={PHOTO_ROTATIONS[i]} onOpen={openLightbox} />
          ))}
        </div>
      ) : (
        <div ref={trackRef} style={{ position: 'relative', height: trackHeight }}>
          <div
            style={{
              position: 'sticky',
              top: 'var(--nav-h)',
              height: 'calc(100vh - var(--nav-h))',
              overflow: 'hidden',
            }}
          >
            {sectionTitle}
            <div
              onClick={() => openLightbox(ME_IMAGE, 'Me')}
              role="button"
              tabIndex={0}
              aria-label="View photo of Me"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(ME_IMAGE, 'Me'); } }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                width: 'clamp(112px, 14vw, 180px)',
                height: 'clamp(112px, 14vw, 180px)',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(60, 40, 20, 0.28)',
                cursor: 'pointer',
              }}
            >
              <img src={ME_IMAGE} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            </div>

            {FAMILY_MEMBERS.map((member, i) => (
              <FamilyMember key={member.name} member={member} index={i} scrollYProgress={scrollYProgress} offset={offsets[i]} shape={shapes[i]} rotation={PHOTO_ROTATIONS[i]} onOpen={openLightbox} />
            ))}
          </div>
        </div>
      )}

      <section style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(24px, 5vw, 56px)', padding: '70px 24px 50px' }}>
        <PhaseTwoCard
          title="School"
          caption="Uniforms, chalk dust, and the friendships that started it all."
          image="/images/life-in-india/optimised/life-in-india-op-2.webp"
          accent={TERRACOTTA}
          rotate={-6}
          onOpen={() => setOpenPost('school')}
        />
        <PhaseTwoCard
          title="Family"
          caption="The people who made the house feel like home."
          image="/images/family/optimised/family-op-1.webp"
          accent={GOLD}
          rotate={6}
          onOpen={() => setOpenPost('family')}
        />
      </section>

      <AnimatePresence>
        {openPost && (
          <BlogPopup post={openPost === 'school' ? SCHOOL_POST : FAMILY_POST} onClose={() => setOpenPost(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && <ImageLightbox image={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>

      <div style={{ textAlign: 'center', padding: '0 24px 60px' }}>
        <Link
          to="/"
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: INK_DIM,
            borderBottom: `1px solid ${GOLD}`,
            paddingBottom: '2px',
            textDecoration: 'none',
          }}
        >
          ← Back to gallery
        </Link>
      </div>
    </main>
  );
}
