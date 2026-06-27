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

const SCROLL_PAGE_DIR = '/images/life-in-india/scroll-page';

// Each photo's box is sized close to its own natural aspect ratio (checked
// against each file's real dimensions) so object-fit: cover only trims a
// sliver off the edges instead of cropping deep into the shot. Sharu is the
// one near-square photo, so it gets the one circular treatment — every
// other box stays a portrait/landscape rounded-rectangle matching its photo.
const FAMILY_MEMBERS = [
  { name: 'Mom', image: `${SCROLL_PAGE_DIR}/Mom.jpeg`, shape: { w: 124, h: 142, r: 14 } },
  { name: 'Nani', image: `${SCROLL_PAGE_DIR}/Nani.jpeg`, shape: { w: 158, h: 118, r: 16 } },
  { name: 'Nanu', image: `${SCROLL_PAGE_DIR}/Nanu.jpeg`, shape: { w: 144, h: 108, r: 14 } },
  { name: 'Mamu', image: `${SCROLL_PAGE_DIR}/Mamu.jpeg`, shape: { w: 168, h: 126, r: 18 } },
  { name: 'Sharu', image: `${SCROLL_PAGE_DIR}/Sharu.jpeg`, shape: { w: 112, h: 112, r: 56 } },
  { name: 'img-1', image: `${SCROLL_PAGE_DIR}/img-1.jpeg`, shape: { w: 120, h: 143, r: 12 } },
  { name: 'img-2', image: `${SCROLL_PAGE_DIR}/img-2.jpeg`, shape: { w: 92, h: 154, r: 12 } },
  { name: 'img-3', image: `${SCROLL_PAGE_DIR}/img-3.jpeg`, shape: { w: 146, h: 120, r: 18 } },
  { name: 'img-4', image: `${SCROLL_PAGE_DIR}/img-4.jpeg`, shape: { w: 104, h: 139, r: 12 } },
  { name: 'img-5', image: `${SCROLL_PAGE_DIR}/img-5.jpeg`, shape: { w: 86, h: 164, r: 10 } },
];

// Varied near/mid/far multipliers per photo (not a strict repeating cycle)
// so the ring reads as scattered depth rather than one neat circle. These
// are starting preferences for the layout solver below, not final values —
// it grows or shrinks each one as needed to clear the title and avoid
// overlaps, regardless of which slot ends up with the biggest photo.
const RADIUS_MULTIPLIERS = [0.7, 1.1, 0.85, 1.3, 0.95, 1.2, 0.75, 1.05, 1.35, 0.9];

const SIZE_SCALE = { desktop: 1, tablet: 0.8, mobile: 0.48 };

// Approximate on-screen size of the "Me" photo per breakpoint (matches the
// CSS clamp() values used where it's rendered) — only needed so the layout
// solver below can keep family photos clear of it.
const ME_SIZE = {
  desktop: { w: 175, h: 232 },
  tablet: { w: 135, h: 178 },
  mobile: { w: 116, h: 153 },
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

// Computes a final resting offset (px from "Me"'s center) for every family
// photo such that none of their boxes overlap each other, the "Me" photo,
// the title band at the top of the stage, or the stage edges.
//
// Each photo is placed along its own ray from center (angle fixed, spread
// evenly around a sweep that leaves a gap above "Me" for the title); a cap
// is computed per-ray for how far out that photo can go before its box
// would cross the title/stage bounds, then a relaxation pass nudges any
// still-overlapping pair further out (within their caps) until clear.
function computeFamilyLayout(breakpoint, stageW, stageH) {
  const count = FAMILY_MEMBERS.length;
  const sizeScale = SIZE_SCALE[breakpoint];
  const shapes = FAMILY_MEMBERS.map(m => ({ w: m.shape.w * sizeScale, h: m.shape.h * sizeScale }));
  const me = ME_SIZE[breakpoint];
  const margin = breakpoint === 'mobile' ? 8 : breakpoint === 'tablet' ? 12 : 16;
  const titleClearance = breakpoint === 'mobile' ? 74 : 96;
  const sideMargin = breakpoint === 'mobile' ? 6 : 12;
  const bottomMargin = 16;
  const halfH = stageH / 2;
  const halfW = stageW / 2;

  const sweep = breakpoint === 'mobile' ? 220 : breakpoint === 'tablet' ? 290 : 305;
  const startAngle = 180 - sweep / 2;
  const baseRadius = breakpoint === 'mobile' ? 150 : breakpoint === 'tablet' ? 220 : 270;

  const angles = FAMILY_MEMBERS.map((_, i) => startAngle + (sweep / (count - 1)) * i);

  function maxSafeRadius(angleDeg, w, h) {
    const rad = (angleDeg * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad); // position = (r*sin, -r*cos)
    let maxR = baseRadius * 3; // generous absolute ceiling
    if (cos > 0.001) maxR = Math.min(maxR, Math.max(0, (halfH - titleClearance - h / 2) / cos));
    if (cos < -0.001) maxR = Math.min(maxR, Math.max(0, (halfH - bottomMargin - h / 2) / -cos));
    if (Math.abs(sin) > 0.001) maxR = Math.min(maxR, Math.max(0, (halfW - sideMargin - w / 2) / Math.abs(sin)));
    return maxR;
  }

  const rays = angles.map((angle, i) => {
    const rad = (angle * Math.PI) / 180;
    const cap = maxSafeRadius(angle, shapes[i].w, shapes[i].h);
    return { sin: Math.sin(rad), cos: Math.cos(rad), cap, r: Math.min(baseRadius * RADIUS_MULTIPLIERS[i], cap) };
  });

  function boxFor(i) {
    const ray = rays[i];
    return boxAround(ray.sin * ray.r, -ray.cos * ray.r, shapes[i].w, shapes[i].h);
  }

  const meBox = boxAround(0, 0, me.w, me.h);

  for (let iter = 0; iter < 400; iter++) {
    let moved = false;
    for (let i = 0; i < count; i++) {
      const box = boxFor(i);
      let conflict = boxesOverlap(box, meBox, margin);
      if (!conflict) {
        for (let j = 0; j < count; j++) {
          if (j !== i && boxesOverlap(box, boxFor(j), margin)) { conflict = true; break; }
        }
      }
      if (conflict && rays[i].r < rays[i].cap - 0.5) {
        rays[i].r = Math.min(rays[i].cap, rays[i].r + 4);
        moved = true;
      }
    }
    if (!moved) break;
  }

  return rays.map(ray => ({ x: ray.sin * ray.r, y: -ray.cos * ray.r }));
}

function FamilyMember({ member, index, scrollYProgress, offset, shape }) {
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

  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 - index, pointerEvents: 'none' }}>
      <motion.div
        ref={photoRef}
        style={{
          x, y, scale,
          opacity: opacity.get(),
          width: `${shape.w}px`,
          height: `${shape.h}px`,
          borderRadius: `${shape.r}px`,
          overflow: 'hidden',
          border: `3px solid ${GOLD}`,
          boxShadow: '0 10px 26px rgba(60, 40, 20, 0.22)',
          willChange: 'transform, opacity',
        }}
      >
        <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
      </motion.div>
    </div>
  );
}

function StaticFamilyMember({ member, offset, shape }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        width: `${shape.w}px`,
        height: `${shape.h}px`,
        borderRadius: `${shape.r}px`,
        overflow: 'hidden',
        border: `3px solid ${GOLD}`,
        boxShadow: '0 10px 26px rgba(60,40,20,0.22)',
      }}
    >
      <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function PhaseTwoCard({ title, caption, image, onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={{
        position: 'relative',
        width: 'min(420px, 90vw)',
        height: '320px',
        borderRadius: '14px',
        overflow: 'hidden',
        display: 'block',
        border: 'none',
        padding: 0,
        font: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 18px 44px rgba(60, 40, 20, 0.18)',
        flexShrink: 0,
      }}
    >
      <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(40,24,16,0) 45%, rgba(40,24,16,0.78) 100%)',
        }}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '24px 26px' }}>
        <h3 style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: '1.7rem', color: CARD_CREAM, letterSpacing: '0.02em' }}>
          {title}
        </h3>
        <p style={{ margin: '6px 0 0', fontFamily: "'EB Garamond', serif", fontSize: '0.92rem', lineHeight: 1.5, color: 'rgba(251, 244, 232, 0.85)' }}>
          {caption}
        </p>
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

  useEffect(() => {
    const onResize = () => {
      setBreakpoint(getBreakpoint());
      setStageSize({ w: window.innerWidth, h: window.innerHeight - 54 });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const offsets = computeFamilyLayout(breakpoint, stageSize.w, stageSize.h);
  const sizeScale = SIZE_SCALE[breakpoint];
  const shapes = FAMILY_MEMBERS.map(m => ({ w: Math.round(m.shape.w * sizeScale), h: Math.round(m.shape.h * sizeScale), r: Math.round(m.shape.r * sizeScale) }));
  const trackHeight = breakpoint === 'mobile' ? '220vh' : '280vh';

  const sectionTitle = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 24px 0', textAlign: 'center', zIndex: 21 }}>
      <h1 style={{ margin: 0, fontFamily: "'Cote Lumiere'", fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: INK }}>
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
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, width: 130, height: 172, borderRadius: '18px', overflow: 'hidden', border: `4px solid ${TERRACOTTA}`, boxShadow: '0 16px 40px rgba(60,40,20,0.28)' }}>
            <img src={ME_IMAGE} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {FAMILY_MEMBERS.map((member, i) => (
            <StaticFamilyMember key={member.name} member={member} offset={offsets[i]} shape={shapes[i]} />
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
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                width: 'clamp(112px, 14vw, 180px)',
                height: 'clamp(148px, 18.5vw, 238px)',
                borderRadius: '18px',
                overflow: 'hidden',
                border: `4px solid ${TERRACOTTA}`,
                boxShadow: '0 16px 40px rgba(60, 40, 20, 0.28)',
              }}
            >
              <img src={ME_IMAGE} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            </div>

            {FAMILY_MEMBERS.map((member, i) => (
              <FamilyMember key={member.name} member={member} index={i} scrollYProgress={scrollYProgress} offset={offsets[i]} shape={shapes[i]} />
            ))}
          </div>
        </div>
      )}

      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center', padding: '60px 24px 40px' }}>
        <PhaseTwoCard
          title="School"
          caption="Uniforms, chalk dust, and the friendships that started it all."
          image="/images/life-in-india/optimised/life-in-india-op-2.webp"
          onOpen={() => setOpenPost('school')}
        />
        <PhaseTwoCard
          title="Family"
          caption="The people who made the house feel like home."
          image="/images/family/optimised/family-op-1.webp"
          onOpen={() => setOpenPost('family')}
        />
      </section>

      <AnimatePresence>
        {openPost && (
          <BlogPopup post={openPost === 'school' ? SCHOOL_POST : FAMILY_POST} onClose={() => setOpenPost(null)} />
        )}
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
