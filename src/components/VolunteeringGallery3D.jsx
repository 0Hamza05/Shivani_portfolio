import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Card metadata ─────────────────────────────────────────────────────────────
const CARDS = [
  { img: '/images/volunteering/vol-1.webp',  opt: '/images/volunteering/optimised/vol-op-1.webp',  title: 'Skills Exchange Summit',         org: 'ProBono Network UK',         date: 'Jan 2024', desc: 'Connecting professionals with non-profits through structured skills-sharing workshops that build organisational capacity and lasting partnerships.' },
  { img: '/images/volunteering/vol-2.webp',  opt: '/images/volunteering/optimised/vol-op-2.webp',  title: 'Community Leadership Forum',     org: 'City Futures Foundation',    date: 'Mar 2024', desc: 'Empowering community leaders with practical tools for sustainable change — co-facilitated a cross-sector roundtable on social mobility.' },
  { img: '/images/volunteering/vol-3.webp',  opt: '/images/volunteering/optimised/vol-op-3.webp',  title: 'Youth Mentorship Programme',     org: 'Step Forward London',        date: 'May 2024', desc: 'One-to-one mentoring for young professionals navigating their first career transitions, with a focus on confidence-building and long-term goal-setting.' },
  { img: '/images/volunteering/vol-4.webp',  opt: '/images/volunteering/optimised/vol-op-4.webp',  title: 'Digital Inclusion Workshop',     org: 'Tech For Good Alliance',     date: 'Jun 2024', desc: 'Teaching essential digital skills to adults with limited access to technology — from online safety and government services to job applications.' },
  { img: '/images/volunteering/vol-5.webp',  opt: '/images/volunteering/optimised/vol-op-5.webp',  title: 'Diversity in Finance Panel',     org: 'Future of Finance Forum',    date: 'Aug 2024', desc: 'Speaking on the importance of diverse perspectives and equitable pathways in financial services, and what it means to build a career on your own terms.' },
  { img: '/images/volunteering/vol-6.webp',  opt: '/images/volunteering/optimised/vol-op-6.webp',  title: 'Social Enterprise Bootcamp',    org: 'Impact Hub London',          date: 'Sep 2024', desc: 'Supporting early-stage social enterprises with business model development, financial planning, and the kind of honest feedback that actually helps.' },
  { img: '/images/volunteering/vol-7.webp',  opt: '/images/volunteering/optimised/vol-op-7.webp',  title: 'Charity Finance Summit',        org: 'NCVO',                       date: 'Oct 2024', desc: 'Running practical sessions on financial sustainability and governance for charity leaders navigating cuts, compliance, and complex stakeholder relationships.' },
  { img: '/images/volunteering/vol-8.webp',  opt: '/images/volunteering/optimised/vol-op-8.webp',  title: 'Women in Leadership Breakfast', org: 'Lean In London',             date: 'Nov 2024', desc: 'Facilitating open conversations about visibility, ambition, and resilience in professional settings — and why authenticity is the most underrated strategy.' },
  { img: '/images/volunteering/vol-9.webp',  opt: '/images/volunteering/optimised/vol-op-9.webp',  title: 'Graduate Careers Fair',         org: "King's College London",      date: 'Nov 2024', desc: 'Advising final-year students on career paths in consulting, finance, and the social sector — and on the less obvious questions worth asking at the start.' },
  { img: '/images/volunteering/vol-10.webp', opt: '/images/volunteering/optimised/vol-op-10.webp', title: 'Refugee Employment Drive',       org: 'Refugee Council UK',         date: 'Dec 2024', desc: 'Providing CV clinics, mock interviews, and career guidance to newly arrived refugees entering the UK job market for the first time.' },
  { img: '/images/volunteering/vol-11.webp', opt: '/images/volunteering/optimised/vol-op-11.webp', title: 'ESG Roundtable',                org: 'Sustainable Business Forum', date: 'Jan 2025', desc: 'Exploring the intersection of environmental sustainability and corporate accountability — and what holding firms to account actually looks like.' },
  { img: '/images/volunteering/vol-12.webp', opt: '/images/volunteering/optimised/vol-op-12.webp', title: 'Financial Literacy Day',         org: 'Money A+E',                  date: 'Feb 2025', desc: 'Delivering workshops on budgeting, savings, and debt management to underserved communities across East London.' },
  { img: '/images/volunteering/vol-13.webp', opt: '/images/volunteering/optimised/vol-op-13.webp', title: 'Leadership in Action Series',    org: 'Common Purpose',             date: 'Mar 2025', desc: 'Participating in cross-sector leadership development programmes that connect emerging leaders from business, public services, and the third sector.' },
  { img: '/images/volunteering/vol-14.webp', opt: '/images/volunteering/optimised/vol-op-14.webp', title: 'Innovation for Good Hackathon',  org: 'Nesta',                      date: 'Apr 2025', desc: 'Collaborating with technologists, designers, and policymakers to prototype solutions for pressing social challenges in a 48-hour sprint.' },
  { img: '/images/volunteering/vol-15.webp', opt: '/images/volunteering/optimised/vol-op-15.webp', title: 'School of Finance Programme',    org: 'Young Enterprise',           date: 'Apr 2025', desc: 'Teaching secondary school students about personal finance, enterprise, and career pathways — with real conversations about money, risk, and opportunity.' },
  { img: '/images/volunteering/vol-16.webp', opt: '/images/volunteering/optimised/vol-op-16.webp', title: 'Non-Profit Strategy Day',        org: 'Pilotlight',                 date: 'May 2025', desc: 'Offering strategic advisory sessions to small charities looking to scale their impact sustainably without losing what makes them distinctive.' },
  { img: '/images/volunteering/vol-17.webp', opt: '/images/volunteering/optimised/vol-op-17.webp', title: 'Corporate Volunteering Day',     org: 'Business in the Community',  date: 'May 2025', desc: 'Leading team volunteering initiatives that connect corporate skills with community needs — and prove that skills-based volunteering changes both directions.' },
  { img: '/images/volunteering/vol-18.webp', opt: '/images/volunteering/optimised/vol-op-18.webp', title: 'Impact Investment Conference',   org: 'Big Society Capital',        date: 'Jun 2025', desc: 'Contributing to discussions on how impact-led investment can drive systemic social change — and what it means to measure what actually matters.' },
];

const CLAMP = CARDS.length - 1;

// ── Gallery (3D diagonal line, like the reference) ────────────────────────────
//
// Scene is tilted via  rotateX(-14deg) rotateY(55deg)
// Cards are stacked along the Z axis: card[i] at z = relI * -STEP_Z
// The scene tilt converts that Z-line into the diagonal you see in the reference:
//   more-negative Z  →  upper-right (further / smaller)
//   Z ≈ 0           →  lower-left  (nearest / largest)
//
// Scrolling moves the targetProg, which shifts every card's relI, which shifts
// their Z. The nearest card changes as you scroll — exactly like moving through
// a record-store shelf.

// Cards are at fixed positions in scene space.
// Scrolling moves the SCENE forward/backward along its local Z axis via translateZ.
// This is one DOM write per frame instead of 18.
const STEP_Z = 220;
const BASE_TRANSFORM = 'rotateX(-24deg) rotateY(-55deg)';

function Gallery3D({ onOpen }) {
  const viewportRef   = useRef(null);
  const sceneRef      = useRef(null);  // one scene element updated by RAF
  const progRef       = useRef(0);
  const targetRef     = useRef(0);
  const rafRef        = useRef(null);
  const snapTimer     = useRef(null);
  const isDragging    = useRef(false);
  const hasDragged    = useRef(false);
  const dragStart     = useRef(0);
  const progAtDrag    = useRef(0);
  const [grabbingCursor, setGrabbingCursor] = useState(false);

  // ── RAF loop — one write per frame ─────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      progRef.current += (targetRef.current - progRef.current) * 0.092;
      if (sceneRef.current) {
        const tz = progRef.current * STEP_Z;
        sceneRef.current.style.transform = `${BASE_TRANSFORM} translateZ(${tz}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Snap helper ─────────────────────────────────────────────────────────────
  const scheduleSnap = useCallback(() => {
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      targetRef.current = Math.round(targetRef.current);
    }, 380);
  }, []);

  // ── Wheel (passive: false to allow preventDefault) ───────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    targetRef.current = Math.max(0, Math.min(CLAMP, targetRef.current + e.deltaY / 90));
    scheduleSnap();
  }, [scheduleSnap]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ── Mouse drag ──────────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current  = e.clientY;
    progAtDrag.current = targetRef.current;
    setGrabbingCursor(true);
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dy = e.clientY - dragStart.current;
    if (Math.abs(dy) > 4) hasDragged.current = true;
    targetRef.current = Math.max(0, Math.min(CLAMP, progAtDrag.current - dy / 55));
  };
  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setGrabbingCursor(false);
    targetRef.current  = Math.round(targetRef.current);
  };

  // ── Touch ───────────────────────────────────────────────────────────────────
  const touchStartY   = useRef(0);
  const progAtTouch   = useRef(0);
  const onTouchStart  = (e) => { touchStartY.current = e.touches[0].clientY; progAtTouch.current = targetRef.current; };
  const onTouchMove   = (e) => {
    const dy = e.touches[0].clientY - touchStartY.current;
    targetRef.current = Math.max(0, Math.min(CLAMP, progAtTouch.current - dy / 55));
  };
  const onTouchEnd    = () => { targetRef.current = Math.round(targetRef.current); };

  // ── Card click ──────────────────────────────────────────────────────────────
  const handleCardClick = (idx) => {
    if (hasDragged.current) return;
    onOpen(idx);
  };

  return (
    <div
      ref={viewportRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        top: 'var(--nav-h)',
        // Perspective on the wrapper — children get depth distortion
        perspective: '1000px',
        perspectiveOrigin: '50% 50%',
        background: 'oklch(96.5% 0.003 65)',
        cursor: grabbingCursor ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <style>{`
        /* Card inner: handles hover lift & brightness, separate from RAF positioner */
        .vg-card-inner {
          width: 100%;
          height: 100%;
          border-radius: 6px;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      filter 0.3s ease,
                      box-shadow 0.35s ease;
          box-shadow: 0 8px 28px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06);
          cursor: pointer;
        }
        .vg-card-inner:hover {
          transform: translateZ(50px) scale(1.055);
          filter: brightness(1.08);
          box-shadow: 0 28px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06);
        }
        .vg-card-inner:focus-visible {
          outline: 2px solid oklch(50% 0.16 250);
          outline-offset: 3px;
        }
        .vg-card-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
          -webkit-user-drag: none;
        }
      `}</style>

      {/* ── 3D scene — RAF updates translateZ to scroll through cards ── */}
      <div
        ref={sceneRef}
        style={{
          position: 'absolute',
          left: '18%',
          top: '52%',
          transform: BASE_TRANSFORM,   // RAF overwrites this each frame
          transformStyle: 'preserve-3d',
        }}
      >
        {CARDS.map((card, idx) => (
          // Static position in scene space — never updated after mount
          <div
            key={card.img}
            style={{
              position: 'absolute',
              width: '220px',
              height: '340px',
              marginLeft: '-110px',
              marginTop: '-170px',
              transform: `translate3d(0px, 0px, ${idx * -STEP_Z}px)`,
            }}
          >
            {/* Inner: CSS hover handles scale / brightness */}
            <div
              className="vg-card-inner"
              role="button"
              tabIndex={0}
              aria-label={`View ${card.title} — ${card.org}`}
              onClick={() => handleCardClick(idx)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(idx); } }}
            >
              <img
                src={card.opt}
                alt={card.title}
                loading={idx < 6 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Edge fade — bleeds background over cards at edges */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        linear-gradient(to top,    oklch(96.5% 0.003 65) 0%, transparent 12%),
        linear-gradient(to bottom, oklch(96.5% 0.003 65) 0%, transparent 8%)
      ` }} />

      {/* ── Labels ── */}
      <div style={{ position: 'absolute', top: '22px', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Courier New', monospace", fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'oklch(60% 0.008 55)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        Stage 10 · Volunteering · {CARDS.length} memories
      </div>

      <div style={{ position: 'absolute', bottom: '26px', right: '32px', fontFamily: "'Courier New', monospace", fontSize: '0.54rem', letterSpacing: '0.16em', color: 'oklch(62% 0.008 55)', pointerEvents: 'none' }}>
        scroll or drag to explore · click to open
      </div>

      <Link
        to="/"
        onClick={e => e.stopPropagation()}
        style={{ position: 'absolute', bottom: '26px', left: '32px', fontFamily: "'Courier New', monospace", fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'oklch(52% 0.008 55)', textDecoration: 'none', transition: 'color 0.18s ease' }}
        onMouseEnter={e => e.currentTarget.style.color = 'oklch(22% 0.006 55)'}
        onMouseLeave={e => e.currentTarget.style.color = 'oklch(52% 0.008 55)'}
      >
        ← All Pillars
      </Link>
    </div>
  );
}

// ── Mobile flat grid ──────────────────────────────────────────────────────────
function FlatGrid({ onOpen }) {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-h) + 32px)', paddingBottom: '64px', background: 'oklch(97% 0.004 65)' }}>
      <style>{`
        .vg-flat-card { transition: transform 0.28s ease, box-shadow 0.28s ease; cursor: pointer; }
        .vg-flat-card:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(0,0,0,0.13) !important; }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '0 16px', maxWidth: '600px', margin: '0 auto' }}>
        {CARDS.map((card, idx) => (
          <button
            key={card.img}
            className="vg-flat-card"
            onClick={() => onOpen(idx)}
            aria-label={`View ${card.title}`}
            style={{ border: 'none', padding: '6px 6px 26px', background: '#fff', boxShadow: '0 4px 18px rgba(0,0,0,0.08)', textAlign: 'left' }}
          >
            <img src={card.opt} alt={card.title} loading={idx < 6 ? 'eager' : 'lazy'} draggable={false} style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }} />
            <div style={{ marginTop: '7px', fontFamily: "'Courier New', monospace", fontSize: '0.48rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'oklch(56% 0.008 55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.org}</div>
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '48px' }}>
        <Link to="/" style={{ fontFamily: "'Courier New', monospace", fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'oklch(52% 0.008 55)', textDecoration: 'none' }}>← All Pillars</Link>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ openIdx, setOpenIdx }) {
  const card = openIdx !== null ? CARDS[openIdx] : null;

  useEffect(() => {
    if (openIdx === null) return;
    const handle = (e) => {
      if (e.key === 'ArrowRight') setOpenIdx(i => Math.min(i + 1, CLAMP));
      if (e.key === 'ArrowLeft')  setOpenIdx(i => Math.max(i - 1, 0));
      if (e.key === 'Escape')     setOpenIdx(null);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [openIdx, setOpenIdx]);

  return (
    <AnimatePresence>
      {openIdx !== null && card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={() => setOpenIdx(null)}
          style={{ position: 'fixed', inset: 0, background: 'oklch(93% 0.006 65 / 0.88)', backdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', width: '100%', maxWidth: '1020px', maxHeight: '88vh', background: '#fff', boxShadow: '0 48px 120px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)', overflow: 'hidden' }}
          >
            {/* Photo */}
            <div style={{ flex: '0 0 52%', position: 'relative', overflow: 'hidden', background: 'oklch(92% 0.005 65)' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={card.img}
                  src={card.img}
                  alt={card.title}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </AnimatePresence>

              <style>{`
                .vg-nav-btn { position:absolute; top:50%; transform:translateY(-50%); width:40px; height:40px; border-radius:50%; border:1px solid rgba(0,0,0,0.12); background:rgba(255,255,255,0.85); color:oklch(28% 0.008 55); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.9rem; backdrop-filter:blur(8px); transition:background 0.2s ease; }
                .vg-nav-btn:hover { background:#fff; border-color:rgba(0,0,0,0.24); }
                .vg-nav-btn:disabled { opacity:0; pointer-events:none; }
                .vg-cnt-btn { background:none; border:none; font-family:'Courier New',monospace; font-size:0.6rem; letter-spacing:0.14em; cursor:pointer; padding:0; color:inherit; transition:opacity 0.18s ease; }
                .vg-cnt-btn:disabled { opacity:0.28; cursor:default; }
                .vg-cnt-btn:not(:disabled):hover { opacity:0.6; }
              `}</style>

              <button className="vg-nav-btn" onClick={e => { e.stopPropagation(); setOpenIdx(i => Math.max(i-1,0)); }} disabled={openIdx===0} aria-label="Previous" style={{ left:'12px' }}>←</button>
              <button className="vg-nav-btn" onClick={e => { e.stopPropagation(); setOpenIdx(i => Math.min(i+1,CLAMP)); }} disabled={openIdx===CLAMP} aria-label="Next" style={{ right:'12px' }}>→</button>
            </div>

            {/* Info */}
            <div style={{ flex: 1, padding: '48px 44px 40px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '36px' }}>
                <button onClick={() => setOpenIdx(null)} aria-label="Close" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: 'oklch(58% 0.008 55)', lineHeight: 1, transition: 'color 0.18s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'oklch(20% 0.006 55)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'oklch(58% 0.008 55)'}
                >✕</button>
              </div>

              <div style={{ fontFamily: "'Courier New', monospace", fontSize: '0.54rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'oklch(56% 0.010 62)', marginBottom: '14px' }}>
                {card.org} · {card.date}
              </div>

              <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(1.5rem, 2.4vw, 2.1rem)', fontWeight: 400, color: 'oklch(16% 0.006 55)', marginBottom: '26px', lineHeight: 1.25 }}>
                {card.title}
              </h2>

              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: '1.08rem', lineHeight: 1.88, color: 'oklch(36% 0.008 55)', flex: 1, margin: 0 }}>
                {card.desc}
              </p>

              <div style={{ borderTop: '1px solid oklch(90% 0.005 65)', paddingTop: '20px', marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Courier New', monospace", fontSize: '0.6rem', letterSpacing: '0.12em', color: 'oklch(56% 0.008 55)' }}>
                <span>{String(openIdx+1).padStart(2,'0')} / {String(CARDS.length).padStart(2,'0')}</span>
                <span style={{ display: 'flex', gap: '18px' }}>
                  <button className="vg-cnt-btn" onClick={() => setOpenIdx(i => Math.max(i-1,0))} disabled={openIdx===0}>← PREV</button>
                  <button className="vg-cnt-btn" onClick={() => setOpenIdx(i => Math.min(i+1,CLAMP))} disabled={openIdx===CLAMP}>NEXT →</button>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────
export default function VolunteeringGallery3D() {
  const [openIdx, setOpenIdx] = useState(null);
  const isMobile = window.innerWidth < 600;

  return (
    <>
      {isMobile
        ? <FlatGrid onOpen={setOpenIdx} />
        : <Gallery3D onOpen={setOpenIdx} />
      }
      <Modal openIdx={openIdx} setOpenIdx={setOpenIdx} />
    </>
  );
}
