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

// Placeholder relationship labels and a representative spread of the family
// photos already on disk — swap in real names/photos whenever ready.
const FAMILY_MEMBERS = [
  { name: 'Dad',     image: '/images/family/optimised/family-op-1.webp', slot: 'topLeft' },
  { name: 'Mom',     image: '/images/family/optimised/family-op-2.webp', slot: 'topRight' },
  { name: 'Grandma', image: '/images/family/optimised/family-op-3.webp', slot: 'leftMid' },
  { name: 'Grandpa', image: '/images/family/optimised/family-op-4.webp', slot: 'rightMid' },
  { name: 'Sister',  image: '/images/family/optimised/family-op-5.webp', slot: 'bottomLeft' },
  { name: 'Brother', image: '/images/family/optimised/family-op-6.webp', slot: 'bottomRight' },
];

const SLOT_ORDER = ['topLeft', 'topRight', 'leftMid', 'rightMid', 'bottomLeft', 'bottomRight'];

// Each member gets its own slice of the overall scroll progress (staggered),
// so they don't all snap outward in lockstep — closer kin reveal first.
const STAGGER = 0.08;
const WINDOW = 0.5;

function getBreakpoint() {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 700) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'desktop';
}

// Final resting offset (px from center) for each named slot, per breakpoint.
// Desktop/tablet: a balanced radial ring. Mobile: a downward semicircle arc
// so "Me" can stay centered near the top, per the responsive spec.
// Angle (degrees from straight-down) per slot — negative is left of center,
// positive is right, matched by name rather than array position so "topLeft"
// actually lands left of center instead of wherever its index happened to fall.
const MOBILE_ANGLES = {
  topLeft: -72,
  topRight: 72,
  leftMid: -43,
  rightMid: 43,
  bottomLeft: -14,
  bottomRight: 14,
};

function getOffsets(breakpoint) {
  if (breakpoint === 'mobile') {
    const radius = 148;
    const offsets = {};
    SLOT_ORDER.forEach(slot => {
      const rad = (MOBILE_ANGLES[slot] * Math.PI) / 180;
      offsets[slot] = { x: Math.sin(rad) * radius, y: Math.cos(rad) * radius * 0.8 + 70 };
    });
    return offsets;
  }
  const tight = breakpoint === 'tablet' ? 0.74 : 1;
  const spreadX = 260 * tight;
  const spreadXWide = 360 * tight;
  const spreadY = 175 * tight;
  return {
    topLeft: { x: -spreadX, y: -spreadY },
    topRight: { x: spreadX, y: -spreadY },
    leftMid: { x: -spreadXWide, y: 0 },
    rightMid: { x: spreadXWide, y: 0 },
    bottomLeft: { x: -spreadX, y: spreadY },
    bottomRight: { x: spreadX, y: spreadY },
  };
}

function FamilyMember({ member, index, scrollYProgress, offset }) {
  const start = index * STAGGER;
  const end = Math.min(start + WINDOW, 0.92);
  const x = useTransform(scrollYProgress, [start, end], [0, offset.x]);
  const y = useTransform(scrollYProgress, [start, end], [0, offset.y]);
  const scale = useTransform(scrollYProgress, [start, end], [0.5, 1]);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const labelOpacity = useTransform(scrollYProgress, [start + WINDOW * 0.65, end], [0, 1]);

  // Opacity is applied via a direct ref subscription rather than the style
  // prop — with this many sibling motion values sharing one scrollYProgress,
  // the style-prop binding for `opacity` specifically stopped receiving
  // updates after the first commit (x/y/scale kept updating fine). Manual
  // subscription sidesteps whatever internal batching caused that.
  const photoRef = useRef(null);
  const labelRef = useRef(null);
  useMotionValueEvent(opacity, 'change', latest => {
    if (photoRef.current) photoRef.current.style.opacity = latest;
  });
  useMotionValueEvent(labelOpacity, 'change', latest => {
    if (labelRef.current) labelRef.current.style.opacity = latest;
  });

  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 - index, pointerEvents: 'none' }}>
      <motion.div
        ref={photoRef}
        style={{
          x, y, scale,
          opacity: opacity.get(),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(6px, 1vh, 10px)',
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            width: 'clamp(66px, 7.8vw, 104px)',
            height: 'clamp(86px, 10.2vw, 136px)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `3px solid ${GOLD}`,
            boxShadow: '0 10px 26px rgba(60, 40, 20, 0.22)',
          }}
        >
          <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
        </div>
        <span
          ref={labelRef}
          style={{
            opacity: labelOpacity.get(),
            fontFamily: "'EB Garamond', serif",
            fontSize: 'clamp(0.72rem, 1.2vw, 0.92rem)',
            letterSpacing: '0.05em',
            color: INK,
            textShadow: '0 1px 3px rgba(255,255,255,0.6)',
          }}
        >
          {member.name}
        </span>
      </motion.div>
    </div>
  );
}

function StaticFamilyMember({ member, offset }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div style={{ width: 84, height: 110, borderRadius: '12px', overflow: 'hidden', border: `3px solid ${GOLD}`, boxShadow: '0 10px 26px rgba(60,40,20,0.22)' }}>
        <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '0.85rem', color: INK }}>{member.name}</span>
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
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    const onResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const offsets = getOffsets(breakpoint);
  const trackHeight = breakpoint === 'mobile' ? '220vh' : '280vh';

  const sectionTitle = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 24px 0', textAlign: 'center', zIndex: 21 }}>
      <span style={{ display: 'block', fontFamily: "'EB Garamond', serif", fontSize: '0.68rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '10px' }}>
        A Stage of Life
      </span>
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
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 130, height: 172, borderRadius: '18px', overflow: 'hidden', border: `4px solid ${TERRACOTTA}`, boxShadow: '0 16px 40px rgba(60,40,20,0.28)' }}>
              <img src={ME_IMAGE} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK }}>Me</span>
          </div>
          {FAMILY_MEMBERS.map(member => (
            <StaticFamilyMember key={member.name} member={member} offset={offsets[member.slot]} />
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
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
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
              <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(0.85rem, 1.4vw, 1rem)', letterSpacing: '0.08em', textTransform: 'uppercase', color: INK }}>
                Me
              </span>
            </div>

            {FAMILY_MEMBERS.map((member, i) => (
              <FamilyMember key={member.name} member={member} index={i} scrollYProgress={scrollYProgress} offset={offsets[member.slot]} />
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
