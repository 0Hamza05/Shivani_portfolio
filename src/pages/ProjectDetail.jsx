import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../data/projects';
import { useEffect, useState, useRef } from 'react';

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

// Focused Editorial Carousel Component with fluid spring physics and touch swipe support
function PillarCarousel({ images, title, onZoom }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div style={{ width: '100%', margin: '48px 0', position: 'relative' }}>
      {/* Interactive Swipeable Carousel Area */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          width: '100%', 
          height: '460px', 
          position: 'relative', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {images.map((img, idx) => {
            // Calculate offsets relative to the active slide for adjacent slide previews
            let offset = idx - currentIndex;
            
            // Loop slides infinitely
            if (offset < -1) offset += images.length;
            if (offset > 1) offset -= images.length;
            
            // Only render current, prev, and next slides for premium 120fps performance
            const isVisible = Math.abs(offset) <= 1;
            if (!isVisible) return null;

            const isVideo = isVideoUrl(img);
            const isActive = idx === currentIndex;

            return (
              <motion.div
                key={img}
                initial={{ 
                  opacity: 0, 
                  scale: 0.8,
                  x: offset * 320,
                  zIndex: 1
                }}
                animate={{ 
                  opacity: isActive ? 1 : 0.35, 
                  scale: isActive ? 1 : 0.86,
                  x: offset * 320,
                  zIndex: isActive ? 10 : 5
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8,
                  x: offset * 320
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 260, 
                  damping: 30 
                }}
                onClick={() => {
                  if (isActive) {
                    onZoom(img);
                  } else {
                    setCurrentIndex(idx);
                  }
                }}
                style={{
                  position: 'absolute',
                  width: 'min(480px, 80vw)',
                  height: '380px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 16px 48px 16px',
                  boxShadow: isActive 
                    ? '0 24px 50px rgba(69, 42, 35, 0.12)' 
                    : '0 8px 24px rgba(69, 42, 35, 0.04)',
                  border: '1px solid rgba(69, 42, 35, 0.06)',
                  cursor: isActive ? 'zoom-in' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Visual Media Wrapper */}
                <div style={{ 
                  width: '100%', 
                  flex: 1, 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  backgroundColor: '#f7f7f4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isVideo ? (
                    <video 
                      src={img} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f7f7f4' }} 
                    />
                  ) : (
                    <img 
                      src={img} 
                      alt={`${title} slide`} 
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
                    />
                  )}
                </div>

                {/* Polaroid-style exhibition caption */}
                <div style={{ 
                  marginTop: '16px', 
                  fontFamily: "'EB Garamond', serif", 
                  fontSize: '0.9rem', 
                  color: 'var(--fg)', 
                  textAlign: 'center', 
                  opacity: isActive ? 0.8 : 0.3,
                  letterSpacing: '0.05em',
                  textTransform: 'lowercase'
                }}>
                  {title} &mdash; memory {idx + 1}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Elegant minimalist navigation controls */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '32px', 
        marginTop: '-12px' 
      }}>
        <button 
          onClick={handlePrev}
          style={carouselButtonStyle}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label="Previous image"
        >
          ←
        </button>

        <div style={{ 
          fontFamily: "'EB Garamond', serif", 
          fontSize: '1.1rem', 
          color: 'var(--fg)', 
          opacity: 0.8,
          letterSpacing: '0.1em'
        }}>
          {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>

        <button 
          onClick={handleNext}
          style={carouselButtonStyle}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label="Next image"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
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

      {/* Main Content Layout (Centered & Elegant) */}
      <div style={{ 
        padding: isMobile ? '48px 24px 80px' : '72px 48px 100px', 
        maxWidth: '1200px', 
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

        {/* Focused Editorial Carousel */}
        {project.gridImages.length > 0 && (
          <PillarCarousel 
            images={project.gridImages}
            title={project.title}
            onZoom={setActiveImage}
          />
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
