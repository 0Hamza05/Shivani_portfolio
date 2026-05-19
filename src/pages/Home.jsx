import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
          <Link 
            to={`/work/${item.project.slug}`} 
            onClick={onClick} 
            draggable={false} 
            onDragStart={e => e.preventDefault()}
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
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
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

function checkBoundariesChanged(oldX, oldY, newX, newY, winSize) {
  const w = winSize?.w || window.innerWidth;
  const h = winSize?.h || window.innerHeight;

  // 1. Column range shift
  const oldStartCol = Math.floor(oldX / COL_W) - 1;
  const oldEndCol = Math.floor((oldX + w) / COL_W) + 1;
  const newStartCol = Math.floor(newX / COL_W) - 1;
  const newEndCol = Math.floor((newX + w) / COL_W) + 1;
  
  if (oldStartCol !== newStartCol || oldEndCol !== newEndCol) return true;

  // 2. Coarse vertical row range check (updates once per 300px instead of continuously on parallax values)
  const oldRowIndex = Math.floor(oldY / 300);
  const newRowIndex = Math.floor(newY / 300);
  
  if (oldRowIndex !== newRowIndex) return true;

  return false;
}

function Column({ colIndex, pos, winSize, onClick }) {
  const type = ((colIndex % 4) + 4) % 4; 
  const pattern = COL_PATTERNS[type];
  const speed = COL_SPEEDS[type];
  
  const effY = pos.y * speed;
  const startRow = Math.floor(effY / COL_H) - 1;
  const endRow = Math.floor((effY + winSize.h) / COL_H) + 1;
  
  const visibleChunks = [];
  for (let r = startRow; r <= endRow; r++) {
    visibleChunks.push(r);
  }

  return (
    <div 
      className="parallax-column"
      data-speed={speed}
      style={{
        position: 'absolute',
        left: colIndex * COL_W,
        top: 0,
        width: COL_W,
        height: '100%',
        transform: `translate3d(0, ${-pos.y * speed}px, 0)`,
        willChange: 'transform',
      }}
    >
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
  );
}

// Cache position in module-level memory so it persists across React route changes
let savedPos = null;

const LERP_SPEED = 0.08; // Butter-smooth easing rate
const DECELERATION = 0.95; // Decay rate for velocity inertia

export default function Home() {
  const containerRef = useRef(null);
  const gridWrapperRef = useRef(null);
  const [pos, setPosState] = useState(() => {
    return savedPos || { x: 0, y: 0 };
  });
  const posRef = useRef(pos);
  const targetPos = useRef({ x: pos.x, y: pos.y });
  const renderedPosRef = useRef({ x: pos.x, y: pos.y });

  // Helper to trigger state change and update the rendered boundary reference
  const updateRenderedPos = (newX, newY) => {
    renderedPosRef.current = { x: newX, y: newY };
    setPosState({ x: newX, y: newY });
    savedPos = { x: newX, y: newY };
  };

  // Initialize ref on first render if starting with cached position
  useEffect(() => {
    posRef.current = pos;
    targetPos.current = { ...pos };
    renderedPosRef.current = { ...pos };
  }, []);

  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const velocity = useRef({ x: 0, y: 0 });
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const handleResize = () => {
      const newSize = { w: window.innerWidth, h: window.innerHeight };
      setWinSize(newSize);
      updateRenderedPos(posRef.current.x, posRef.current.y);
    };
    window.addEventListener('resize', handleResize);
    
    // Only center if we don't have a saved position
    if (!savedPos) {
      const initialPos = {
        x: -window.innerWidth / 2 + (COL_W * 4) / 2,
        y: -window.innerHeight / 2 + COL_H / 2
      };
      posRef.current = initialPos;
      targetPos.current = { ...initialPos };
      updateRenderedPos(initialPos.x, initialPos.y);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation for premium user experience
  useEffect(() => {
    const handleKeyDown = (e) => {
      const STEP = 250;
      if (e.key === 'ArrowUp') {
        targetPos.current.y -= STEP;
      } else if (e.key === 'ArrowDown') {
        targetPos.current.y += STEP;
      } else if (e.key === 'ArrowLeft') {
        targetPos.current.x -= STEP;
      } else if (e.key === 'ArrowRight') {
        targetPos.current.x += STEP;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      targetPos.current.x += e.deltaX;
      targetPos.current.y += e.deltaY;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: true });
    }
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Register pointer move and up events globally on window for fluid drag and click bubble
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = lastMouse.current.x - e.clientX;
      const dy = lastMouse.current.y - e.clientY;
      
      // Filter out micro pointer shakes to protect standard click events
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged.current = true;
      }

      const now = performance.now();
      const dt = Math.max(1, now - lastTime.current);
      
      velocity.current = {
        x: dx / dt,
        y: dy / dt
      };
      
      // Accumulate pointer delta to target position (avoid layout thrashing)
      targetPos.current.x += dx;
      targetPos.current.y += dy;
      
      lastMouse.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Unified physical simulation and animation loop
  useEffect(() => {
    let rafId;
    let lastLoopTime = performance.now();
    const lastPosForSpeed = { x: posRef.current.x, y: posRef.current.y };
    let smoothSpeed = 0;

    const loop = () => {
      const now = performance.now();
      const dt = Math.max(1, Math.min(64, now - lastLoopTime));
      lastLoopTime = now;

      // 1. Decelerate dragging inertia velocity when released
      if (!isDragging.current) {
        if (Math.abs(velocity.current.x) > 0.001 || Math.abs(velocity.current.y) > 0.001) {
          targetPos.current.x += velocity.current.x * dt;
          targetPos.current.y += velocity.current.y * dt;
          
          const frictionFactor = Math.pow(DECELERATION, dt / 16.67);
          velocity.current.x *= frictionFactor;
          velocity.current.y *= frictionFactor;
        } else {
          velocity.current = { x: 0, y: 0 };
        }
      }

      // 2. Smoothly interpolate current visual position towards target position
      const dx = targetPos.current.x - posRef.current.x;
      const dy = targetPos.current.y - posRef.current.y;
      
      // Responsive active tracking (0.38) vs graceful glide (0.08)
      const currentLerp = isDragging.current ? 0.38 : LERP_SPEED;
      
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        const speedMultiplier = dt / 16.67;
        const actualLerp = 1 - Math.pow(1 - currentLerp, speedMultiplier);
        posRef.current.x += dx * actualLerp;
        posRef.current.y += dy * actualLerp;
      } else {
        posRef.current.x = targetPos.current.x;
        posRef.current.y = targetPos.current.y;
      }

      // 3. Direct DOM transform updates (guarantees instantaneous rendering during drag/scroll)
      if (gridWrapperRef.current) {
        gridWrapperRef.current.style.transform = `translate3d(${-posRef.current.x}px, 0, 0)`;
      }
      if (containerRef.current) {
        const cols = containerRef.current.querySelectorAll('.parallax-column');
        cols.forEach(col => {
          const speed = parseFloat(col.getAttribute('data-speed')) || 1.0;
          col.style.transform = `translate3d(0, ${-posRef.current.y * speed}px, 0)`;
        });
      }

      // 4. Compute speed for the dynamic scale
      const deltaX = posRef.current.x - lastPosForSpeed.x;
      const deltaY = posRef.current.y - lastPosForSpeed.y;
      lastPosForSpeed.x = posRef.current.x;
      lastPosForSpeed.y = posRef.current.y;

      const instantSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const scaleSpeedLerp = 1 - Math.pow(1 - 0.1, dt / 16.67);
      smoothSpeed = smoothSpeed + (instantSpeed - smoothSpeed) * scaleSpeedLerp;

      if (containerRef.current) {
        const scale = 1 - Math.min(smoothSpeed * 0.003, 0.1);
        containerRef.current.style.setProperty('--dynamic-scale', scale);
      }

      // 5. Throttled Boundary Update check for React re-rendering
      if (checkBoundariesChanged(renderedPosRef.current.x, renderedPosRef.current.y, posRef.current.x, posRef.current.y, winSize)) {
        updateRenderedPos(posRef.current.x, posRef.current.y);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [winSize]);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    hasDragged.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    lastTime.current = performance.now();
    
    // Snaps inertia target instantly to prevent click-jump stutter
    targetPos.current = { x: posRef.current.x, y: posRef.current.y };
  };

  const handleClick = (e) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Determine currently visible column range
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
      >
        <div 
          ref={gridWrapperRef}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            transform: `translate3d(${-pos.x}px, 0, 0)`, 
            willChange: 'transform' 
          }}
        >
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
