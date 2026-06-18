import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VolunteeringCarousel({ images, title, description }) {
  const [openIdx, setOpenIdx] = useState(null);
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);

  // ── Drag-scroll ───────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftVal.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 4) hasDragged.current = true;
    trackRef.current.scrollLeft = scrollLeftVal.current - walk;
  };
  const onRelease = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  // ── Keyboard nav in popup ─────────────────────────────────────────────────
  useEffect(() => {
    if (openIdx === null) return;
    const handle = (e) => {
      if (e.key === 'ArrowRight') setOpenIdx(i => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft')  setOpenIdx(i => Math.max(i - 1, 0));
      if (e.key === 'Escape')     setOpenIdx(null);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [openIdx, images.length]);

  const prev = () => setOpenIdx(i => Math.max(i - 1, 0));
  const next = () => setOpenIdx(i => Math.min(i + 1, images.length - 1));

  if (!images || images.length === 0) return null;

  return (
    <>
      <style>{`
        .vol-track::-webkit-scrollbar { display: none; }
        .vol-track { scrollbar-width: none; }
        .vol-card {
          transition:
            transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.32s ease;
        }
        .vol-card:hover {
          transform: translateY(-10px) !important;
          box-shadow: 0 24px 52px rgba(0,0,0,0.14) !important;
        }
        .vol-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.28);
          background: rgba(0,0,0,0.38);
          color: rgba(255,255,255,0.82);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          backdrop-filter: blur(6px);
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .vol-nav-btn:hover {
          background: rgba(0,0,0,0.58);
          border-color: rgba(255,255,255,0.5);
        }
        .vol-nav-btn:disabled {
          opacity: 0;
          pointer-events: none;
        }
        .vol-counter-btn {
          background: none;
          border: none;
          font-family: 'Courier New', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          cursor: pointer;
          transition: opacity 0.18s ease;
          padding: 0;
          color: inherit;
        }
        .vol-counter-btn:disabled {
          opacity: 0.28;
          cursor: default;
        }
        .vol-counter-btn:not(:disabled):hover {
          opacity: 0.75;
        }
      `}</style>

      {/* ── Carousel ─────────────────────────────────────────────────────── */}
      <div style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginTop: '52px',
        marginBottom: '56px',
      }}>
        <div
          ref={trackRef}
          className="vol-track"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onRelease}
          onMouseLeave={onRelease}
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            padding: '16px 72px 36px',
            cursor: 'grab',
            userSelect: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {images.map((src, idx) => (
            <motion.div
              key={src}
              className="vol-card"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(idx * 0.045, 0.42),
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => { if (!hasDragged.current) setOpenIdx(idx); }}
              style={{
                flexShrink: 0,
                width: '216px',
                background: 'oklch(97.8% 0.004 65)',
                padding: '7px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
                cursor: 'pointer',
              }}
            >
              <img
                src={src}
                alt={`${title} — memory ${idx + 1}`}
                loading={idx < 7 ? 'eager' : 'lazy'}
                draggable={false}
                style={{
                  width: '100%',
                  height: '280px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Popup ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {openIdx !== null && (
          <motion.div
            key="vol-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
            onClick={() => setOpenIdx(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'oklch(11% 0.013 52 / 0.93)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
            }}
          >
            <motion.div
              key="vol-panel"
              initial={{ opacity: 0, scale: 0.95, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 18 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1060px',
                maxHeight: '88vh',
                background: 'oklch(15.5% 0.010 52)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              {/* Photo column */}
              <div style={{
                flex: '0 0 56%',
                position: 'relative',
                overflow: 'hidden',
                background: 'oklch(10% 0.008 52)',
              }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[openIdx]}
                    src={images[openIdx]}
                    alt=""
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </AnimatePresence>

                <button
                  className="vol-nav-btn"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  disabled={openIdx === 0}
                  aria-label="Previous photo"
                  style={{ left: '14px' }}
                >←</button>

                <button
                  className="vol-nav-btn"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  disabled={openIdx === images.length - 1}
                  aria-label="Next photo"
                  style={{ right: '14px' }}
                >→</button>
              </div>

              {/* Text column */}
              <div style={{
                flex: 1,
                padding: '48px 44px 40px',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                gap: '0',
              }}>
                {/* Close */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                  <button
                    onClick={() => setOpenIdx(null)}
                    aria-label="Close"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'oklch(56% 0.008 55)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      lineHeight: 1,
                      padding: '4px',
                      transition: 'color 0.18s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'oklch(80% 0.008 55)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'oklch(56% 0.008 55)'}
                  >✕</button>
                </div>

                {/* Label */}
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.57rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'oklch(52% 0.014 60)',
                  marginBottom: '14px',
                }}>
                  Stage 10 · Volunteering
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)',
                  fontWeight: 400,
                  color: 'oklch(90% 0.008 62)',
                  marginBottom: '28px',
                  lineHeight: 1.25,
                }}>
                  {title}
                </h2>

                {/* Blog text */}
                <div style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: '1.05rem',
                  lineHeight: 1.92,
                  color: 'oklch(72% 0.008 58)',
                  flex: 1,
                }}>
                  {description.split('\n').map((para, i) =>
                    para.trim()
                      ? <p key={i} style={{ marginBottom: '18px', marginTop: 0 }}>{para}</p>
                      : null
                  )}
                </div>

                {/* Counter + nav */}
                <div style={{
                  borderTop: '1px solid oklch(22% 0.008 52)',
                  paddingTop: '20px',
                  marginTop: '28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.62rem',
                  letterSpacing: '0.14em',
                  color: 'oklch(46% 0.008 55)',
                }}>
                  <span>
                    {String(openIdx + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(images.length).padStart(2, '0')}
                  </span>
                  <span style={{ display: 'flex', gap: '20px' }}>
                    <button className="vol-counter-btn" onClick={prev} disabled={openIdx === 0}>← PREV</button>
                    <button className="vol-counter-btn" onClick={next} disabled={openIdx === images.length - 1}>NEXT →</button>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
