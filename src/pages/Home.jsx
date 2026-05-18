import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';

// Deterministic pseudo-random number generator
function getRandomGen(seed) {
  let currentSeed = seed;
  return function() {
    let x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  }
}

const COL_W = 400;
const COL_H = 1200;

// 4 distinct vertical column patterns
const COL_PATTERNS = [
  [{ h: 400 }, { h: 534 }, { h: 266 }], // Col 0
  [{ h: 700 }, { h: 500 }],             // Col 1
  [{ h: 334 }, { h: 466 }, { h: 400 }], // Col 2
  [{ h: 500 }, { h: 700 }],             // Col 3
];

// Parallax speed multipliers for each of the 4 column types
const COL_SPEEDS = [1.0, 1.35, 0.8, 1.15]; 

const allPhotos = projects.flatMap(proj => 
  proj.gridImages.map((imgUrl, idx) => ({
    project: proj,
    imgUrl: imgUrl,
    uniqueId: `${proj.id}-${idx}`
  }))
);

function getColumnChunkItems(colIndex, chunkY, pattern) {
  const seed = (colIndex + 10000) * 100000 + (chunkY + 10000) + allPhotos.length * 123;
  const rand = getRandomGen(seed);

  let shuffled = [...allPhotos];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const GAP = 6;
  let currentY = 0;
  return pattern.map((slot, index) => {
    const photo = shuffled[index % shuffled.length];
    const item = {
      id: `${colIndex}-${chunkY}-${index}`,
      project: photo.project,
      cover: photo.imgUrl,
      top: currentY + GAP / 2,
      left: GAP / 2,
      width: COL_W - GAP,
      height: slot.h - GAP
    };
    currentY += slot.h;
    return item;
  });
}

function ColumnChunk({ colIndex, chunkY, pattern, onClick }) {
  const items = useMemo(() => getColumnChunkItems(colIndex, chunkY, pattern), [colIndex, chunkY, pattern]);
  
  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: chunkY * COL_H,
      width: COL_W,
      height: COL_H,
    }}>
      {items.map(item => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.left,
            top: item.top,
            width: item.width,
            height: item.height,
          }}
        >
          <Link to={`/work/${item.project.slug}`} onClick={onClick} draggable={false} style={{ display: 'block', width: '100%', height: '100%' }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: 'var(--border)',
                position: 'relative',
                borderRadius: '8px',
              }}
              className="project-card-wrapper"
            >
              {(() => {
                const isVideo = item.cover && item.cover.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);
                if (isVideo) {
                  return (
                    <video
                      src={item.cover}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: 'none',
                      }}
                      className="project-img"
                    />
                  );
                }
                return (
                  <img
                    src={item.cover}
                    alt={item.project.title}
                    loading="lazy"
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                    className="project-img"
                  />
                );
              })()}
              <div className="project-overlay">
                <p className="project-title">{item.project.title}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

function Column({ colIndex, pos, winSize, onClick }) {
  const type = ((colIndex % 4) + 4) % 4; 
  const pattern = COL_PATTERNS[type];
  const speed = COL_SPEEDS[type];
  
  // Apply parallax speed
  const effY = pos.y * speed;
  
  // Calculate which vertical chunks are visible for this specific column
  const startRow = Math.floor(effY / COL_H) - 1;
  const endRow = Math.floor((effY + winSize.h) / COL_H) + 1;
  
  const visibleChunks = [];
  for (let r = startRow; r <= endRow; r++) {
    visibleChunks.push(r);
  }

  return (
    <div style={{
      position: 'absolute',
      left: colIndex * COL_W,
      top: 0,
      width: COL_W,
      height: '100%',
    }}>
      <div style={{ transform: `translateY(${-effY}px)`, willChange: 'transform' }}>
        {visibleChunks.map(chunkY => (
          <ColumnChunk 
            key={`${colIndex}-${chunkY}`}
            colIndex={colIndex}
            chunkY={chunkY}
            pattern={pattern}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
}

// Cache position in module-level memory so it persists across React route changes
let savedPos = null;

export default function Home() {
  const containerRef = useRef(null);
  const [pos, setPosState] = useState(() => {
    return savedPos || { x: 0, y: 0 };
  });
  const posRef = useRef(pos);

  // Initialize ref on first render if starting with cached position
  useEffect(() => {
    posRef.current = pos;
  }, []);

  const setPos = (newPos) => {
    setPosState(prev => {
      const p = typeof newPos === 'function' ? newPos(prev) : newPos;
      posRef.current = p;
      savedPos = p; // Keep cache updated in real time
      return p;
    });
  };

  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const velocity = useRef({ x: 0, y: 0 });
  const lastTime = useRef(performance.now());
  const rafRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    // Only center if we don't have a saved position
    if (!savedPos) {
      setPos({ x: -window.innerWidth / 2 + (COL_W * 4) / 2, y: -window.innerHeight / 2 + COL_H / 2 });
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      setPos(p => ({ x: p.x + e.deltaX, y: p.y + e.deltaY }));
    };

    const container = containerRef.current;
    if(container) {
      container.addEventListener('wheel', handleWheel, { passive: true });
    }
    return () => {
      if(container) container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Universal velocity loop for dynamic spacing (scaling)
  useEffect(() => {
    let rafId;
    const lastPos = { x: posRef.current.x, y: posRef.current.y };
    let smoothSpeed = 0;

    const loop = () => {
      const dx = posRef.current.x - lastPos.x;
      const dy = posRef.current.y - lastPos.y;
      lastPos.x = posRef.current.x;
      lastPos.y = posRef.current.y;

      const instantSpeed = Math.sqrt(dx * dx + dy * dy);
      
      // Interpolate for smooth decay
      smoothSpeed = smoothSpeed + (instantSpeed - smoothSpeed) * 0.1;

      if (containerRef.current) {
        // Map speed to scale factor. Shrink up to 10% (0.9 scale) for a beautiful spacing effect
        const scale = 1 - Math.min(smoothSpeed * 0.003, 0.1);
        containerRef.current.style.setProperty('--dynamic-scale', scale);
      }

      rafId = requestAnimationFrame(loop);
    };
    
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    hasDragged.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    lastTime.current = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = lastMouse.current.x - e.clientX;
    const dy = lastMouse.current.y - e.clientY;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDragged.current = true;
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastTime.current);
    
    velocity.current = {
      x: dx / dt,
      y: dy / dt
    };
    
    setPos(p => ({ x: p.x + dx, y: p.y + dy }));
    
    lastMouse.current = { x: e.clientX, y: e.clientY };
    lastTime.current = now;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    
    const applyInertia = () => {
      if (Math.abs(velocity.current.x) < 0.05 && Math.abs(velocity.current.y) < 0.05) return;
      
      setPos(p => ({
        x: p.x + velocity.current.x * 16,
        y: p.y + velocity.current.y * 16
      }));
      
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;
      
      rafRef.current = requestAnimationFrame(applyInertia);
    };
    
    rafRef.current = requestAnimationFrame(applyInertia);
  };

  const handleClick = (e) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Determine which columns are visible on X axis
  const startCol = Math.floor(pos.x / COL_W) - 1;
  const endCol = Math.floor((pos.x + winSize.w) / COL_W) + 1;

  const visibleCols = [];
  for (let c = startCol; c <= endCol; c++) {
    visibleCols.push(c);
  }

  return (
    <>
      <style>{`
        .project-card-wrapper {
          transform: scale(var(--dynamic-scale, 1));
          transform-origin: center;
          will-change: transform;
        }
        .project-card-wrapper .project-img {
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .project-card-wrapper:hover .project-img {
          transform: scale(1.05);
        }
        .project-card-wrapper .project-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 60%);
          opacity: 0;
          transition: opacity 0.4s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
        }
        .project-card-wrapper:hover .project-overlay {
          opacity: 1;
        }
        .project-title {
          font-family: 'Great Vibes', cursive;
          font-size: 2.4rem;
          font-weight: 400;
          color: var(--fg);
          letter-spacing: 0.01em;
          transform: translateY(8px);
          transition: transform 0.4s ease;
          margin: 0;
          text-transform: none;
        }
        .project-card-wrapper:hover .project-title {
          transform: translateY(0);
        }
        .project-category {
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          color: var(--fg-dim);
          margin-top: 4px;
          transform: translateY(8px);
          transition: transform 0.4s ease 0.04s;
        }
        .project-card-wrapper:hover .project-category {
          transform: translateY(0);
        }
        
        .infinite-vignette {
          position: fixed;
          inset: 0;
          pointer-events: none;
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.02);
          z-index: 5;
        }
      `}</style>

      <div className="infinite-vignette" />

      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          touchAction: 'none',
          zIndex: 1
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: `translateX(${-pos.x}px)`, willChange: 'transform' }}>
          {visibleCols.map(c => (
            <Column 
              key={c}
              colIndex={c} 
              pos={pos} 
              winSize={winSize}
              onClick={handleClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}
