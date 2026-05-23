import { projects } from '../data/projects';
import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TravelMap from '../components/TravelMap';
import { travelDestinations } from '../data/travelDestinations';

const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?|$)/i;
const carouselButtonStyle = {
  border: '1px solid var(--border)',
  background: 'rgba(255, 255, 255, 0.8)',
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  color: 'var(--fg)',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
};

function isVideoUrl(url) {
  return VIDEO_RE.test(url || '');
}

// Vintage Celluloid Film Strip Component with smooth horizontal scroll and drag-to-grab support
function PillarFilmStrip({ images, title, onZoom }) {
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

// Start from the first image on mount (or when images change)
useEffect(() => {
  const el = scrollRef.current;
  if (el) {
    el.scrollLeft = 0;
  }
}, [images]);

  const checkScrollLimits = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };




  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      checkScrollLimits();
      window.addEventListener('resize', checkScrollLimits);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScrollLimits);
      window.removeEventListener('resize', checkScrollLimits);
    };
  }, [images]);

  const handleMouseDown = (e) => {
    isDown.current = true;
    hasDragged.current = false;
    scrollRef.current.classList.add('active');
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftVal.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    scrollRef.current?.classList.remove('active');
  };

  const handleMouseUp = () => {
    isDown.current = false;
    scrollRef.current?.classList.remove('active');
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const handlePrev = () => {
    scrollRef.current?.scrollBy({ left: -460, behavior: 'smooth' });
  };

  const handleNext = () => {
    scrollRef.current?.scrollBy({ left: 460, behavior: 'smooth' });
  };

  if (!images || images.length === 0) return null;

  const sprocketStyle = {
    height: '14px',
    backgroundColor: '#111111',
    backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, var(--bg) 18px, var(--bg) 28px)',
    width: '100%',
    position: 'absolute',
    left: 0,
    zIndex: 2,
  };

  return (
    <div style={{ width: '100vw', maxWidth: 'none', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', marginTop: '64px', marginBottom: '64px', overflow: 'hidden', flexShrink: 0 }}>
      <style>{`
        .film-track::-webkit-scrollbar {
          display: none;
        }
        .film-track {
          scrollbar-width: none;
          cursor: grab;
        }
        .film-track.active {
          cursor: grabbing;
        }
        .film-frame {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
        }
        .film-frame:hover {
          transform: scale(1.018) translateY(-3px);
          filter: brightness(1.05) contrast(1.02);
        }
      `}</style>

      {/* Film Strip Main Track Wrapper */}
      <div 
        style={{ 
          width: '100%',
          backgroundColor: '#151515', 
          position: 'relative',
          padding: '28px 0',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22), inset 0 0 50px rgba(0, 0, 0, 0.95)',
          borderTop: '2px solid #222',
          borderBottom: '2px solid #222',
        }}
      >
        {/* Top Sprockets */}
        <div style={{ ...sprocketStyle, top: '6px' }} />

        {/* Horizontal Scroll Track */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="film-track"
          style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            padding: '16px 12vw',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            userSelect: 'none',
          }}
        >
          {images.map((img, idx) => {
            const isVideo = isVideoUrl(img);
            const frameNumber = String(idx + 1).padStart(2, '0');
            const filmStocks = ['KODAK 400TX', 'ILFORD HP5', 'FUJI PRO 400H', 'TRI-X PAN'];
            const stockName = filmStocks[idx % filmStocks.length];

            return (
              <div
                key={img}
                onClick={() => {
                  if (!hasDragged.current) onZoom(img);
                }}
                style={{
                  flex: '0 0 auto',
                  width: 'min(440px, 80vw)',
                  height: '240px',
                  backgroundColor: '#111111',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '14px 10px 10px 10px',
                  position: 'relative',
                  borderLeft: '5px solid #0a0a0a',
                  borderRight: '5px solid #0a0a0a',
                  boxShadow: 'inset 0 0 24px rgba(0,0,0,0.85)',
                  cursor: 'zoom-in',
                }}
                className="film-frame"
              >
                {/* Media Container */}
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  overflow: 'hidden', 
                  backgroundColor: '#050505',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '2px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                }}>
                  {isVideo ? (
                    <video 
                      src={img} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
                    />
                  ) : (
                    <img 
                      src={img} 
                      alt={`${title} frame ${frameNumber}`} 
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
                    />
                  )}
                </div>

                {/* Kodak/Exhibition markings */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '5px 4px 0 4px',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '0.62rem',
                  fontWeight: 'bold',
                  color: '#bf760d', // Vintage amber gold
                  letterSpacing: '0.18em',
                  opacity: 0.85,
                }}>
                  <span>{stockName}</span>
                  <span>▷ {frameNumber}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sprockets */}
        <div style={{ ...sprocketStyle, bottom: '6px' }} />
      </div>

      {/* Elegant vintage buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '24px', 
        marginTop: '20px' 
      }}>
        <button 
          onClick={handlePrev}
          disabled={!canScrollLeft}
          style={{
            ...carouselButtonStyle,
            opacity: canScrollLeft ? 1 : 0.25,
            pointerEvents: canScrollLeft ? 'auto' : 'none',
          }}
          onMouseEnter={e => { if (canScrollLeft) { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label="Scroll left"
        >
          ←
        </button>

        <span style={{ 
          fontFamily: "'EB Garamond', serif", 
          fontSize: '0.9rem', 
          color: 'var(--fg-dim)', 
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Film Reel
        </span>

        <button 
          onClick={handleNext}
          disabled={!canScrollRight}
          style={{
            ...carouselButtonStyle,
            opacity: canScrollRight ? 1 : 0.25,
            pointerEvents: canScrollRight ? 'auto' : 'none',
          }}
          onMouseEnter={e => { if (canScrollRight) { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label="Scroll right"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ─── Vintage Voice Note Player ───────────────────────────────────────────────
function VoiceNotePlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(p => !p);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  return (
    <div style={{
      maxWidth: '760px',
      width: '100%',
      margin: '0 auto 48px auto',
      backgroundColor: 'rgba(191, 118, 13, 0.04)',
      border: '1px solid rgba(191, 118, 13, 0.2)',
      borderRadius: '12px',
      padding: '22px 28px',
    }}>
      {/* Label */}
      <div style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '0.58rem',
        letterSpacing: '0.3em',
        color: '#bf760d',
        fontWeight: 'bold',
        marginBottom: '18px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '0.7rem' }}>◉</span> Voice Note
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Play / Pause */}
        <button
          onClick={toggle}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '1.5px solid var(--fg)',
            background: isPlaying ? 'var(--fg)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isPlaying ? 'var(--bg)' : 'var(--fg)',
            fontSize: '1rem',
            flexShrink: 0,
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Scrubber + time */}
        <div style={{ flex: 1 }}>
          {/* Progress bar */}
          <div
            onClick={handleSeek}
            style={{
              width: '100%',
              height: '3px',
              backgroundColor: 'var(--border)',
              borderRadius: '2px',
              cursor: 'pointer',
              position: 'relative',
              marginBottom: '9px',
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0, top: 0,
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#bf760d',
              borderRadius: '2px',
              transition: 'width 0.1s linear',
            }} />
            {/* Playhead dot */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#bf760d',
              transition: 'left 0.1s linear',
              boxShadow: '0 0 4px rgba(191,118,13,0.4)',
            }} />
          </div>
          {/* Time display */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '0.62rem',
            color: 'var(--fg-dim)',
            letterSpacing: '0.05em',
          }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setCurrentTime(audioRef.current.currentTime);
          setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setIsPlaying(false); setProgress(0); setCurrentTime(0); }}
      />
    </div>
  );
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const project = projects.find(p => p.slug === slug);
  const [activeImage, setActiveImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect to external URL if provided
  useEffect(() => {
    if (project?.redirectUrl) {
      window.location.href = project.redirectUrl;
    }
  }, [project?.redirectUrl]);

  if (!project) {
    return (
      <div style={{ paddingTop: 'calc(var(--nav-h) + 100px)', textAlign: 'center', minHeight: '100vh' }}>
        <p style={{ marginBottom: '24px', fontFamily: "'EB Garamond', serif", fontSize: '1.5rem' }}>Blog not found.</p>
        <Link to="/" style={{ fontSize: '0.8rem', letterSpacing: '0.15em', borderBottom: '1px solid var(--fg)', paddingBottom: '2px' }}>RETURN TO GALLERY</Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', position: 'relative' }}
    >
      {project.slug !== 'travel' && (
        <>
      {/* Hero Banner Image */}
      <div style={{ height: '70vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
        {(() => {
          const isVideo = isVideoUrl(project.cover);
          if (isVideo) {
            return (
              <video
                src={project.cover}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            );
          }
          return (
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              src={project.cover} 
              alt={project.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          );
        })()}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center'
        }}>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 400, color: 'var(--fg)' }}
          >
            {project.title}
          </motion.h1>
        </div>
            </div>
    </>
)}

      {/* Main Content Layout (Centered & Elegant) */}
      <div style={{ 
        padding: isMobile ? '48px 24px 80px' : '72px 48px 100px', 
        maxWidth: project.slug === 'travel'
            ? '100%'
            : '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Editorial Description text */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ 
            maxWidth: '760px', 
            width: '100%',
            fontSize: isMobile ? '1.15rem' : '1.25rem', 
            lineHeight: '1.9', 
            color: 'var(--fg)', 
            fontFamily: "'EB Garamond', serif",
            textAlign: 'center',
            marginBottom: '32px'
          }}
        >
          {project.description.split('\n').map((paragraph, index) => (
            paragraph.trim() ? <p key={index} style={{ marginBottom: '24px' }}>{paragraph}</p> : null
          ))}
        </motion.div>

        

        {/* Voice Note Player — shown only when project has a voiceNote */}
        {project.voiceNote && (
          <VoiceNotePlayer src={project.voiceNote} />
        )}
        
        {/* Related Blog Suggestion */}
        {(() => {
          const relatedMap = {
            university: 'friends',
            'uni-link': 'friends',
            // add more mappings as needed
          };
          const relatedSlug = relatedMap[project.slug];
          const relatedProj = relatedSlug ? projects.find(p => p.slug === relatedSlug) : null;
          if (!relatedProj) return null;
          return (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'fixed',
                right: '24px',
                top: 'calc(var(--nav-h) + 120px)',
                width: '200px',
                cursor: 'pointer',
                zIndex: 1000,
              }}
              onClick={() => {
                // navigate to related blog
                navigate(`/work/${relatedSlug}`);
              }}
            >
              <img
                src={relatedProj.cover}
                alt={relatedProj.title}
                style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              />
              <div
                style={{
                  marginTop: '6px',
                  textAlign: 'center',
                  fontFamily: "'EB Garamond', serif",
                  fontSize: '0.85rem',
                  color: 'var(--fg)',
                  letterSpacing: '0.1em',
                }}
              >
                Friends in {project.title}
              </div>
            </motion.div>
          );
        })()}

        {/* Focused Editorial Film Strip horizontal scroll */}
       {project.slug !== 'travel' &&
  ((project.blogImages || project.gridImages || []).length > 0) && (
          <PillarFilmStrip 
            images={project.blogImages || project.gridImages}
            title={project.title}
            onZoom={setActiveImage}
          />
        )}

        {project.slug === 'travel' && (
  <div
    style={{
  width: "100vw",

  marginLeft: "calc(-50vw + 50%)",

  display: "flex",

  alignItems: "flex-start",

  gap: "64px",

  paddingLeft: "64px",
  paddingRight: "64px",

  marginTop: "24px"
}}
  >
    {/* LEFT MAP COLUMN */}
    <div
      style={{
  width: "45%",

  position: "fixed",

  left: "64px",

  top: "calc(var(--nav-h) + 32px)",

  height: "calc(100vh - var(--nav-h) - 64px)",

  display: "flex",

  alignItems: "center",

  justifyContent: "center"
}}
    >
      <TravelMap />
    </div>

    {/* RIGHT CONTENT COLUMN */}
    <div
      style={{
  flex: 1,

  marginLeft: "52%",

  display: "flex",
  flexDirection: "column",

  gap: "220px",

  paddingBottom: "200px",

  paddingRight: "64px"
}}
    >
      {travelDestinations.map((destination) => (
        <section
          key={destination.id}
          id={destination.id}

          style={{
            minHeight: "90vh",

            scrollMarginTop: "120px"
          }}
        >
          <h2
            style={{
              fontFamily: "'EB Garamond', serif",

              fontSize: "clamp(2.8rem, 5vw, 5rem)",

              marginBottom: "24px"
            }}
          >
            {destination.title}
          </h2>

          <p
            style={{
              maxWidth: "700px",

              lineHeight: 1.9,

              color: "var(--fg-dim)",

              fontSize: "1.05rem"
            }}
          >
            Cinematic travel story section for {destination.title}.
          </p>
        </section>
      ))}
    </div>
  </div>
)}
        
        {/* Footer Nav */}
        <div style={{ width: '100%', maxWidth: '760px', marginTop: '64px', paddingTop: '40px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              fontSize: '0.7rem', 
              letterSpacing: '0.2em', 
              color: 'var(--fg-dim)', 
              transition: 'all 0.3s ease',
              padding: '12px 24px',
              border: '1px solid var(--border)',
              display: 'inline-block',
              textTransform: 'uppercase',
              borderRadius: '24px'
            }} 
            onMouseEnter={e => { e.target.style.color = 'var(--fg)'; e.target.style.borderColor = 'var(--fg)'; }} 
            onMouseLeave={e => { e.target.style.color = 'var(--fg-dim)'; e.target.style.borderColor = 'var(--border)'; }}
          >
            BACK TO ALL PILLARS
          </Link>
        </div>
      </div>

      {/* Full Screen Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(15px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                maxWidth: '90vw', 
                maxHeight: '85vh', 
                padding: '16px 16px 32px 16px', 
                backgroundColor: '#ffffff', 
                borderRadius: '8px', 
                boxShadow: '0 24px 60px rgba(69, 42, 35, 0.15)',
                border: '1px solid rgba(69, 42, 35, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button 
                  onClick={() => setActiveImage(null)}
                  style={{ 
                    border: 'none', 
                    background: 'none', 
                    fontSize: '1.2rem', 
                    cursor: 'pointer',
                    color: 'var(--fg-dim)'
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ borderRadius: '4px', overflow: 'hidden', maxWidth: '100%', maxHeight: '70vh' }}>
                {isVideoUrl(activeImage) ? (
                  <video 
                    src={activeImage} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    controls
                    style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block' }} 
                  />
                ) : (
                  <img 
                    src={activeImage} 
                    alt="Pillar preview" 
                    style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', objectFit: 'contain' }} 
                  />
                )}
              </div>
              <div style={{ 
                marginTop: '16px', 
                fontFamily: "'EB Garamond', serif", 
                fontSize: '1rem', 
                color: 'var(--fg-dim)', 
                letterSpacing: '0.05em' 
              }}>
                {project.title}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
