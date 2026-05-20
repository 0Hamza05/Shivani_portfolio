import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
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
const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?|$)/i;

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
  proj.gridImages.map((imgUrl) => ({
    project: proj,
    imgUrl: imgUrl
  }))
);

const GRID_SIZE = 100;
const N_PHOTOS = allPhotos.length;
const randomGrid = new Array(GRID_SIZE * GRID_SIZE);

// Precompute a random distribution of photo indices that avoids immediate local repetition
for (let y = 0; y < GRID_SIZE; y++) {
  for (let x = 0; x < GRID_SIZE; x++) {
    let forbidden = [];
    if (x > 0) forbidden.push(randomGrid[(x - 1) + y * GRID_SIZE]);
    if (y > 0) forbidden.push(randomGrid[x + (y - 1) * GRID_SIZE]);
    
    if (N_PHOTOS > 6) {
      // Avoid repetition within a 2-cell radius for a more natural look
      if (x > 1) forbidden.push(randomGrid[(x - 2) + y * GRID_SIZE]);
      if (y > 1) forbidden.push(randomGrid[x + (y - 2) * GRID_SIZE]);
      if (x > 0 && y > 0) forbidden.push(randomGrid[(x - 1) + (y - 1) * GRID_SIZE]);
      if (x < GRID_SIZE - 1 && y > 0) forbidden.push(randomGrid[(x + 1) + (y - 1) * GRID_SIZE]);
    }

    let candidates = [];
    for (let i = 0; i < N_PHOTOS; i++) {
      if (!forbidden.includes(i)) candidates.push(i);
    }
    
    // Fallback if we filtered out too many candidates
    if (candidates.length === 0) {
      let looseForbidden = [];
      if (x > 0) looseForbidden.push(randomGrid[(x - 1) + y * GRID_SIZE]);
      if (y > 0) looseForbidden.push(randomGrid[x + (y - 1) * GRID_SIZE]);
      for (let i = 0; i < N_PHOTOS; i++) {
        if (!looseForbidden.includes(i)) candidates.push(i);
      }
      if (candidates.length === 0) {
         candidates = [Math.floor(Math.random() * N_PHOTOS)];
      }
    }
    
    randomGrid[x + y * GRID_SIZE] = candidates[Math.floor(Math.random() * candidates.length)];
  }
}

// Global random shuffle so it feels fresh on reload
const globalShuffledPhotos = [...allPhotos].sort(() => Math.random() - 0.5);

function getColumnChunkItems(colIndex, chunkY, pattern) {
  const GAP = 6;
  let currentY = 0;
  return pattern.map((slot, index) => {
    // Calculate global virtual item index in this column
    const itemY = chunkY * pattern.length + index;
    
    // Wrap to the precomputed random grid
    const gx = ((colIndex % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
    const gy = ((itemY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
    
    const photoIndex = randomGrid[gx + gy * GRID_SIZE];
    const photo = globalShuffledPhotos[photoIndex % globalShuffledPhotos.length];
    
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
          {item.project.youtubeUrl ? (
            <a 
              href={item.project.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick} 
              draggable={false} 
              onDragStart={e => e.preventDefault()}
              aria-label={`Watch ${item.project.title} on YouTube`}
              style={{ display: 'block', width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  backgroundColor: item.project.noCrop ? '#000000' : 'var(--border)',
                  position: 'relative',
                  borderRadius: '8px',
                }}
                className="project-card-wrapper"
              >
                <img
                  src={item.cover}
                  alt={item.project.title}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: item.project.noCrop ? 'contain' : 'cover',
                    pointerEvents: 'none',
                  }}
                  className="project-img"
                />
              </div>
            </a>
          ) : (
            <Link 
              to={`/work/${item.project.slug}`} 
              onClick={onClick} 
              draggable={false} 
              onDragStart={e => e.preventDefault()}
              aria-label={`Open ${item.project.title} pillar post`}
              style={{ display: 'block', width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  backgroundColor: item.project.noCrop ? '#000000' : 'var(--border)',
                  position: 'relative',
                  borderRadius: '8px',
                }}
                className="project-card-wrapper"
              >
                {(() => {
                  const isVideo = item.cover && VIDEO_RE.test(item.cover);
                  if (isVideo) {
                    return (
                      <video
                        src={item.cover}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: item.project.noCrop ? 'contain' : 'cover',
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
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: item.project.noCrop ? 'contain' : 'cover',
                        pointerEvents: 'none',
                      }}
                      className="project-img"
                    />
                  );
                })()}
              </div>
            </Link>
          )}
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

function Column({ colIndex, pos, winSize, onClick, registerColumn }) {
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
      ref={(node) => registerColumn(colIndex, node)}
      className="parallax-column"
      data-speed={speed}
      style={{
        position: 'absolute',
        left: colIndex * COL_W,
        top: 0,
        width: COL_W,
        height: '100%',
        willChange: 'transform',
        // NOTE: transform is set exclusively by the RAF loop via direct DOM mutation.
        // Do NOT add a React-state-driven transform here — it would fight the RAF and cause stutter.
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

const LERP_SPEED = 0.12; // Responsive easing rate (raised from 0.075 to reduce lag)
const DECELERATION = 0.945; // Decay rate for velocity inertia
const WHEEL_SCROLL_FACTOR = 0.35; // Controlled scaling factor for mouse wheel and touchpad inputs
const WHEEL_IMPULSE = 0.018;
const DRAG_IMPULSE = 0.075;
const DRAG_LERP = 0.72;
const DRAG_VELOCITY_LERP = 0.32;
const MAX_RELEASE_VELOCITY = 4.2;
const VELOCITY_LERP = 0.085;

export default function Home() {
  const containerRef = useRef(null);
  const gridWrapperRef = useRef(null);
  const columnRefs = useRef(new Map());
  const [pos, setPosState] = useState(() => {
    return savedPos || { x: 0, y: 0 };
  });
  const posRef = useRef(pos);
  const targetPos = useRef({ x: pos.x, y: pos.y });
  const renderedPosRef = useRef({ x: pos.x, y: pos.y });
  const lenisRef = useRef(null);
  const motionRef = useRef({ speed: 0, velocityX: 0, velocityY: 0 });
  const registerColumn = useCallback((colIndex, node) => {
    if (node) {
      columnRefs.current.set(colIndex, node);
    } else {
      columnRefs.current.delete(colIndex);
    }
  }, []);

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
  const winSizeRef = useRef({ w: window.innerWidth, h: window.innerHeight });
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const activePointerId = useRef(null);
  const hasDragged = useRef(false);
  const velocity = useRef({ x: 0, y: 0 });
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const handleResize = () => {
      const newSize = { w: window.innerWidth, h: window.innerHeight };
      winSizeRef.current = newSize;
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
    const lenis = new Lenis({
      eventsTarget: containerRef.current || window,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchInertiaExponent: 1.55,
      gestureOrientation: 'both',
      lerp: LERP_SPEED,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.35,
      infinite: true,
      autoRaf: false,
      virtualScroll: ({ deltaX, deltaY, event }) => {
        if (event.ctrlKey) return false;

        if (event.cancelable) {
          event.preventDefault();
        }

        const scaledDeltaX = deltaX * WHEEL_SCROLL_FACTOR;
        const scaledDeltaY = deltaY * WHEEL_SCROLL_FACTOR;

        targetPos.current.x += scaledDeltaX;
        targetPos.current.y += scaledDeltaY;
        velocity.current.x += scaledDeltaX * WHEEL_IMPULSE;
        velocity.current.y += scaledDeltaY * WHEEL_IMPULSE;
        motionRef.current.velocityX += scaledDeltaX;
        motionRef.current.velocityY += scaledDeltaY;

        return false;
      },
    });

    lenisRef.current = lenis;
    const resize = () => lenis.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Register pointer move and up events globally on window for fluid drag and click bubble
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isPointerDown.current) return;
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;

      const samples = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];

      samples.forEach((sample) => {
        const dx = lastMouse.current.x - sample.clientX;
        const dy = lastMouse.current.y - sample.clientY;
        const movedX = sample.clientX - dragStart.current.x;
        const movedY = sample.clientY - dragStart.current.y;
        const movedDistance = Math.hypot(movedX, movedY);

        if (movedDistance > 7) {
          hasDragged.current = true;
          if (!isDragging.current) {
            isDragging.current = true;
            containerRef.current?.setPointerCapture?.(e.pointerId);
            lenisRef.current?.stop?.();
            document.documentElement.classList.add('is-dragging-gallery');
            targetPos.current = { x: posRef.current.x, y: posRef.current.y };
          }
        }

        if (!isDragging.current) {
          lastMouse.current = { x: sample.clientX, y: sample.clientY };
          lastTime.current = sample.timeStamp || performance.now();
          return;
        }

        if (e.cancelable) {
          e.preventDefault();
        }

        const now = sample.timeStamp || performance.now();
        const dt = Math.max(1, Math.min(34, now - lastTime.current));
        const measuredVelocityX = dx / dt;
        const measuredVelocityY = dy / dt;

        velocity.current.x += (measuredVelocityX - velocity.current.x) * DRAG_VELOCITY_LERP;
        velocity.current.y += (measuredVelocityY - velocity.current.y) * DRAG_VELOCITY_LERP;
        motionRef.current.velocityX += dx * DRAG_IMPULSE * dt;
        motionRef.current.velocityY += dy * DRAG_IMPULSE * dt;

        // Accumulate pointer delta to target position; the RAF loop handles the visual interpolation.
        targetPos.current.x += dx;
        targetPos.current.y += dy;

        lastMouse.current = { x: sample.clientX, y: sample.clientY };
        lastTime.current = now;
      });
    };

    const handlePointerUp = (e) => {
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
      isPointerDown.current = false;
      isDragging.current = false;
      activePointerId.current = null;
      velocity.current.x = Math.max(-MAX_RELEASE_VELOCITY, Math.min(MAX_RELEASE_VELOCITY, velocity.current.x));
      velocity.current.y = Math.max(-MAX_RELEASE_VELOCITY, Math.min(MAX_RELEASE_VELOCITY, velocity.current.y));
      try {
        containerRef.current?.releasePointerCapture?.(e.pointerId);
      } catch {
        // Pointer capture can already be released by the browser on route changes.
      }
      document.documentElement.classList.remove('is-dragging-gallery');
      lenisRef.current?.start?.();
    };

    const handlePointerCancel = (e) => {
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
      isPointerDown.current = false;
      isDragging.current = false;
      activePointerId.current = null;
      velocity.current = { x: 0, y: 0 };
      document.documentElement.classList.remove('is-dragging-gallery');
      lenisRef.current?.start?.();
    };

    const handleWindowBlur = () => {
      isPointerDown.current = false;
      isDragging.current = false;
      activePointerId.current = null;
      velocity.current = { x: 0, y: 0 };
      document.documentElement.classList.remove('is-dragging-gallery');
      lenisRef.current?.start?.();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('blur', handleWindowBlur);
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
      lenisRef.current?.raf(now);

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
      
      // Tight tracking while held; slower easing only after release.
      const currentLerp = isDragging.current ? DRAG_LERP : LERP_SPEED;
      
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
      if (columnRefs.current.size) {
        columnRefs.current.forEach((col) => {
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
      motionRef.current.speed = smoothSpeed;
      motionRef.current.velocityX += (deltaX - motionRef.current.velocityX) * VELOCITY_LERP;
      motionRef.current.velocityY += (deltaY - motionRef.current.velocityY) * VELOCITY_LERP;

      if (containerRef.current) {
        const gapScale = isDragging.current ? 1 : 1 - Math.min(smoothSpeed * 0.00055, 0.018);
        const mediaScale = 1.035 + Math.min(smoothSpeed * 0.0022, 0.075);
        const opacity = 1 - Math.min(smoothSpeed * 0.0035, 0.1);
        const floatY = isDragging.current ? 0 : Math.max(-8, Math.min(8, -motionRef.current.velocityY * 0.045));
        const parallaxY = Math.max(-28, Math.min(28, motionRef.current.velocityY * 0.22));
        const parallaxX = Math.max(-10, Math.min(10, motionRef.current.velocityX * 0.08));

        containerRef.current.style.setProperty('--gap-scale', gapScale);
        containerRef.current.style.setProperty('--media-scale', mediaScale);
        containerRef.current.style.setProperty('--media-opacity', opacity);
        containerRef.current.style.setProperty('--float-y', `${floatY}px`);
        containerRef.current.style.setProperty('--media-parallax-x', `${parallaxX}px`);
        containerRef.current.style.setProperty('--media-parallax-y', `${parallaxY}px`);
      }

      // 5. Throttled Boundary Update check for React re-rendering
      if (checkBoundariesChanged(renderedPosRef.current.x, renderedPosRef.current.y, posRef.current.x, posRef.current.y, winSizeRef.current)) {
        updateRenderedPos(posRef.current.x, posRef.current.y);
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // winSize is read via winSizeRef — no restart needed on resize

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isPointerDown.current = true;
    isDragging.current = false;
    activePointerId.current = e.pointerId;
    hasDragged.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    dragStart.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    lastTime.current = e.timeStamp || performance.now();
    
    // Snaps inertia target instantly to prevent click-jump stutter if this becomes a drag.
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
          transform: translate3d(0, var(--float-y, 0px), 0) scale(var(--gap-scale, 1));
          transform-origin: center;
          will-change: transform;
          contain: paint;
        }
        .project-card-wrapper .project-img {
          --hover-scale: 1;
          opacity: var(--media-opacity, 1);
          transform: translate3d(var(--media-parallax-x, 0px), var(--media-parallax-y, 0px), 0) scale(calc(var(--media-scale, 1.045) * var(--hover-scale)));
          transform-origin: center;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transition: opacity 180ms ease, filter 420ms ease;
        }
        .project-card-wrapper:hover .project-img {
          filter: contrast(1.03);
        }

        .is-dragging-gallery,
        .is-dragging-gallery * {
          cursor: grabbing !important;
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

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          overscrollBehavior: 'none',
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
            willChange: 'transform',
            // NOTE: transform is set exclusively by the RAF loop via direct DOM mutation.
            // Do NOT add a React-state-driven transform here — it would fight the RAF and cause stutter.
          }}
        >
          {visibleCols.map(c => (
            <Column 
              key={c}
              colIndex={c} 
              pos={pos} 
              winSize={winSize}
              onClick={handleClick}
              registerColumn={registerColumn}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}
