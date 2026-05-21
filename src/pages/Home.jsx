import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';

const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?|$)/i;

// ─── Config ────────────────────────────────────────────────────────────────────
const NUM_COLS  = 5;
const COL_WIDTH = 300; // px
const GAP       = 8;   // px between columns and rows

// Each column animates at a different duration → different visual speed → parallax
// Larger = slower scroll
const COL_DURATIONS = [56, 48, 44, 48, 40]; // seconds per loop

// Stagger: columns start at different offsets so grid looks organic on load
// 0% = top of loop, 50% = halfway through
const COL_OFFSETS = ['0%', '-25%', '-10%', '-40%', '-18%'];

// Visual top margin stagger so columns sit at different heights
const COL_STAGGER = [0, 60, 25, 90, 15]; // px

// ─── Data ─────────────────────────────────────────────────────────────────────
const prioritySlugs = ['uni-link', 'volunteering', 'university', 'podcast'];
const prioritized = projects.filter(p => prioritySlugs.includes(p.slug));
const others = projects.filter(p => !prioritySlugs.includes(p.slug));

const uniLinkProject = projects.find(p => p.slug === 'uni-link');
const uniLinkImgs = uniLinkProject ? uniLinkProject.gridImages.map(imgUrl => ({ project: uniLinkProject, imgUrl })) : [];

const podcastProject = projects.find(p => p.slug === 'podcast');
const podcastImgs = podcastProject ? podcastProject.gridImages.map(imgUrl => ({ project: podcastProject, imgUrl })) : [];

// Build prioritized list without uni-link and podcast (they will be placed manually)
const prioritizedWithoutUniAndPod = prioritized.filter(p => p.slug !== 'uni-link' && p.slug !== 'podcast');

const allPhotos = [
  // First copies at the very start
  ...uniLinkImgs,
  ...podcastImgs,
  // Normal prioritized (volunteering, university)
  ...prioritizedWithoutUniAndPod.flatMap(proj => proj.gridImages.map(imgUrl => ({ project: proj, imgUrl }))),
  // Remaining projects
  ...others.flatMap(proj => proj.gridImages.map(imgUrl => ({ project: proj, imgUrl }))),
  // Second copies at the end
  ...podcastImgs,
  ...uniLinkImgs,
];

const finalPhotos = allPhotos;
const columns = buildColumns(finalPhotos, NUM_COLS);

function buildColumns(photos, numCols) {
  const cols = Array.from({ length: numCols }, () => []);
  photos.forEach((photo, i) => cols[i % numCols].push(photo));
  return cols;
}

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

  if (photo.project.redirectUrl) {
    return (
      <a
        href={photo.project.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        onDragStart={e => e.preventDefault()}
        className="mc-card"
      >
        {media}
      </a>
    );
  }
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
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: var(--fg);
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
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
                    animation: `marquee-up ${duration}s linear infinite`,
                    animationDelay: '0s',
                  }}
                >
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
                   {/* Third copy for columns 3 and 4 (indices 2 and 3) to ensure continuous scroll */}
                   {(colIdx === 2 || colIdx === 3) && colPhotos.map((photo, j) => (
                     <PhotoCard
                       key={`c-${photo.project.slug}-${j}`}
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
