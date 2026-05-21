import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';

const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?|$)/i;

// ─── Config ────────────────────────────────────────────────────────────────────
const NUM_COLS  = 6;
const COL_WIDTH = 300; // px
const GAP       = 8;   // px between columns and rows

// Each column animates at a different duration → different visual speed → parallax
// Larger = slower scroll
const COL_DURATIONS = [48, 34, 56, 38, 52, 42]; // seconds per loop

// Stagger: columns start at different offsets so grid looks organic on load
// 0% = top of loop, 50% = halfway through
const COL_OFFSETS = ['0%', '-25%', '-10%', '-40%', '-18%', '-33%'];

// Visual top margin stagger so columns sit at different heights
const COL_STAGGER = [0, 60, 25, 90, 15, 50]; // px

// ─── Data ─────────────────────────────────────────────────────────────────────
const prioritySlugs = ['volunteering', 'university', 'podcast'];
const prioritized = projects.filter(p => prioritySlugs.includes(p.slug));
const others = projects.filter(p => !prioritySlugs.includes(p.slug));
const allPhotos = [...prioritized, ...others].flatMap(proj =>
  proj.gridImages.map(imgUrl => ({ project: proj, imgUrl })));

function buildColumns(photos, numCols) {
  const cols = Array.from({ length: numCols }, () => []);
  photos.forEach((photo, i) => cols[i % numCols].push(photo));
  return cols;
}
const columns = buildColumns(allPhotos, NUM_COLS);

// ─── Photo card (no fixed height — natural aspect ratio) ──────────────────────
function PhotoCard({ photo, eager }) {
  const isVideo = VIDEO_RE.test(photo.imgUrl);
  const media = isVideo ? (
    <video
      src={photo.imgUrl}
      autoPlay loop muted playsInline preload="metadata"
      draggable={false}
      className="mc-media"
    />
  ) : (
    <img
      src={photo.imgUrl}
      alt={photo.project.title}
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      className="mc-media"
    />
  );

  if (photo.project.youtubeUrl) {
    return (
      <a
        href={photo.project.youtubeUrl}
        target="_blank" rel="noopener noreferrer"
        draggable={false} onDragStart={e => e.preventDefault()}
        className="mc-card"
      >{media}</a>
    );
  }
  return (
    <Link
      to={`/work/${photo.project.slug}`}
      draggable={false} onDragStart={e => e.preventDefault()}
      className="mc-card"
    >{media}</Link>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const totalW = NUM_COLS * COL_WIDTH + (NUM_COLS - 1) * GAP;

  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isDragging = useRef(false);
  const dragThreshold = 10; // px

  const handleMouseDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    scrollRef.current.classList.add('mc-dragging');
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (scrollRef.current) {
      scrollRef.current.classList.remove('mc-dragging');
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (scrollRef.current) {
      scrollRef.current.classList.remove('mc-dragging');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    
    if (Math.abs(walk) > dragThreshold) {
      isDragging.current = true;
    }
    
    if (isDragging.current) {
      e.preventDefault();
      scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    }
  };

  const handleCaptureClick = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = false;
    }
  };

  return (
    <>
      <style>{`
        /* ── Card & media ── */
        .mc-card {
          display: block;
          border-radius: 8px;
          overflow: hidden;
          background: var(--border);
          flex-shrink: 0;
          transition: box-shadow 300ms ease, transform 300ms ease;
        }
        .mc-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.14);
          transform: scale(1.02);
          z-index: 10;
          position: relative;
        }
        .mc-media {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          transition: filter 300ms ease;
        }
        .mc-card:hover .mc-media {
          filter: contrast(1.04) brightness(1.02);
        }

        /* ── Marquee keyframe ── */
        @keyframes marquee-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }

        /* ── Pause column on hover ── */
        .mc-col-wrap:hover .mc-col-inner {
          animation-play-state: paused;
        }

        /* ── Scroll box ── */
        .mc-scroll-box {
          scrollbar-width: thin;
          scrollbar-color: rgba(17,17,17,0.15) transparent;
          cursor: grab;
          user-select: none;
        }
        .mc-scroll-box::-webkit-scrollbar { height: 4px; }
        .mc-scroll-box::-webkit-scrollbar-track { background: transparent; }
        .mc-scroll-box::-webkit-scrollbar-thumb {
          background: rgba(17,17,17,0.15);
          border-radius: 4px;
        }
        .mc-scroll-box.mc-dragging {
          cursor: grabbing;
        }

        /* ── Scroll hint ── */
        .mc-hint {
          position: absolute;
          bottom: 18px;
          right: 24px;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          color: rgba(17,17,17,0.35);
          pointer-events: none;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      {/* Full-viewport container below navbar */}
      <motion.div
        ref={scrollRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 'var(--nav-h)',
          left: 0,
          right: 0,
          bottom: 0,
          overflowX: 'auto',   // horizontal scroll — independent of body overflow
          overflowY: 'hidden', // vertical clip — columns animate, don't page-scroll
        }}
        className="mc-scroll-box"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClickCapture={handleCaptureClick}
      >


        {/* Scroll-right hint */}
        <div className="mc-hint">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          SCROLL TO EXPLORE
        </div>

        {/* Inner grid — wide enough to require horizontal scroll */}
        <div
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            height: '100%',
            width: `${totalW}px`,
            padding: `0 ${GAP}px`,
            alignItems: 'flex-start',
            boxSizing: 'border-box',
          }}
        >
          {columns.map((colPhotos, colIdx) => {
            const duration = COL_DURATIONS[colIdx];
            const delay    = COL_OFFSETS[colIdx];  // animation-delay trick for offset

            return (
              /* Column wrapper: clips vertical overflow, full height */
              <div
                key={colIdx}
                className="mc-col-wrap"
                style={{
                  width: `${COL_WIDTH}px`,
                  flexShrink: 0,
                  height: '100%',
                  overflow: 'hidden',
                  paddingTop: `${COL_STAGGER[colIdx]}px`,
                  boxSizing: 'border-box',
                }}
              >
                {/* Animated inner strip — photos × 2 for seamless loop */}
                <div
                  className="mc-col-inner"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${GAP}px`,
                    // animation-delay with negative value starts mid-loop for stagger effect
                    animation: `marquee-up ${duration}s linear infinite`,
                    animationDelay: `-${parseFloat(delay) === 0 ? 0 : duration * parseFloat(delay.replace('%','')) / 100}s`,
                  }}
                >
                  {/* First copy */}
                  {colPhotos.map((photo, j) => (
                    <PhotoCard
                      key={`a-${photo.project.slug}-${j}`}
                      photo={photo}
                      eager={colIdx < 3 && j === 0}
                    />
                  ))}
                  {/* Duplicate copy — makes the loop seamless */}
                  {colPhotos.map((photo, j) => (
                    <PhotoCard
                      key={`b-${photo.project.slug}-${j}`}
                      photo={photo}
                      eager={false}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
