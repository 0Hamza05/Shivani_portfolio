import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../data/projects';
import { useEffect, useState } from 'react';

function Polaroid({ src, title, index, onZoom, isMobile }) {
  const angles = [-6, 4, -2, 8, -4];
  const angle = angles[index % angles.length];
  const isVideo = src && src.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);

  // Desktop: Stacked & absolute draggable
  // Mobile: Flex grid element with touch tilt
  const desktopStyle = {
    position: 'absolute',
    width: '260px',
    padding: '12px 12px 24px 12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 24px rgba(69, 42, 35, 0.08)',
    border: '1px solid rgba(69, 42, 35, 0.05)',
    borderRadius: '4px',
    cursor: 'grab',
    transformOrigin: 'center',
    zIndex: 10 + index,
    left: `${10 + (index * 15)}px`,
    top: `${40 + (index * 60)}px`,
  };

  const mobileStyle = {
    width: '100%',
    maxWidth: '280px',
    margin: '0 auto',
    padding: '12px 12px 24px 12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 24px rgba(69, 42, 35, 0.06)',
    border: '1px solid rgba(69, 42, 35, 0.05)',
    borderRadius: '4px',
    cursor: 'pointer',
    transformOrigin: 'center',
  };

  return (
    <motion.div
      drag={!isMobile}
      dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
      whileHover={{ 
        scale: 1.03, 
        rotate: isMobile ? angle : angle + (index % 2 === 0 ? 3 : -3) 
      }}
      initial={{ opacity: 0, y: 50, rotate: angle }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index, type: "spring", stiffness: 100 }}
      onClick={() => onZoom(src)}
      style={isMobile ? mobileStyle : desktopStyle}
    >
      <div style={{ 
        width: '100%', 
        height: '200px', 
        overflow: 'hidden', 
        backgroundColor: 'var(--border)', 
        borderRadius: '2px',
        position: 'relative'
      }}>
        {isVideo ? (
          <video 
            src={src} 
            autoPlay 
            loop 
            muted 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <img 
            src={src} 
            alt="Pillar memory" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
          />
        )}
      </div>
      <div style={{ 
        marginTop: '12px', 
        fontFamily: "'EB Garamond', serif", 
        fontSize: '0.85rem', 
        color: 'var(--fg)', 
        textAlign: 'center', 
        opacity: 0.8,
        letterSpacing: '0.05em'
      }}>
        {title}
      </div>
    </motion.div>
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

  // Filter out the cover image if it is inside gridImages to avoid duplicates
  const otherImages = project.gridImages.filter(img => img !== project.cover);

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
          const isVideo = project.cover && project.cover.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);
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

      {/* Main Content Layout */}
      <div style={{ 
        padding: isMobile ? '60px 24px 100px' : '80px 48px 120px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {isMobile ? (
          // Mobile: Layout text first, then polaroid gallery grid below
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--fg)', fontFamily: "'EB Garamond', serif" }}
            >
              {project.description.split('\n').map((paragraph, index) => (
                paragraph.trim() ? <p key={index} style={{ marginBottom: '24px' }}>{paragraph}</p> : null
              ))}
            </motion.div>

            {otherImages.length > 0 && (
              <div>
                <h3 style={{ 
                  fontFamily: "'EB Garamond', serif", 
                  fontSize: '1.4rem', 
                  color: 'var(--fg)', 
                  marginBottom: '24px',
                  textAlign: 'center',
                  fontWeight: 400
                }}>
                  PILLAR GALLERY
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                  gap: '32px',
                  justifyContent: 'center'
                }}>
                  {otherImages.map((img, idx) => (
                    <Polaroid 
                      key={idx}
                      src={img}
                      title={project.title}
                      index={idx}
                      onZoom={setActiveImage}
                      isMobile={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Desktop: Beautiful side-by-side layout with sticky interactive polaroids
          <div style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ 
                flex: '1', 
                maxWidth: '650px', 
                fontSize: '1.25rem', 
                lineHeight: '1.9', 
                color: 'var(--fg)', 
                fontFamily: "'EB Garamond', serif" 
              }}
            >
              {project.description.split('\n').map((paragraph, index) => (
                paragraph.trim() ? <p key={index} style={{ marginBottom: '32px' }}>{paragraph}</p> : null
              ))}
            </motion.div>

            {otherImages.length > 0 && (
              <div style={{ 
                width: '320px', 
                position: 'sticky', 
                top: '120px', 
                height: '520px',
                zIndex: 10
              }}>
                <p style={{ 
                  fontFamily: "'EB Garamond', serif", 
                  fontSize: '0.85rem', 
                  color: 'var(--fg-dim)', 
                  letterSpacing: '0.15em',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  📌 Interactive Scrapbook
                </p>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {otherImages.map((img, idx) => (
                    <Polaroid 
                      key={idx}
                      src={img}
                      title={project.title}
                      index={idx}
                      onZoom={setActiveImage}
                      isMobile={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Footer Nav */}
        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
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
              textTransform: 'uppercase'
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
              backgroundColor: 'rgba(240, 158, 167, 0.25)', // soft transparent pink overlay
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
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
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
                {activeImage.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
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
