import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';

const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?|$)/i;

// ─── Config ────────────────────────────────────────────────────────────────────
const NUM_COLS  = 5;
const COL_WIDTH = 300; // px
const GAP       = 8;   // px between columns

// Each column animates at a different duration → different visual speed → parallax
const COL_DURATIONS = [56, 48, 44, 48, 40]; // seconds per loop

// Visual top margin stagger so columns sit at different heights
const COL_STAGGER = [0, 60, 25, 90, 15]; // px

// Horizontal bounce speed (px per frame at 60fps) — slightly faster
const SPEED_X = 0.8;

// ─── Data ─────────────────────────────────────────────────────────────────────
const prioritySlugs = ['uni-link', 'volunteering', 'university', 'podcast'];
const prioritized = projects.filter(p => prioritySlugs.includes(p.slug));
const others = projects.filter(p => !prioritySlugs.includes(p.slug));

const uniLinkProject = projects.find(p => p.slug === 'uni-link');
const uniLinkImgs = uniLinkProject ? uniLinkProject.gridImages.map(imgUrl => ({ project: uniLinkProject, imgUrl })) : [];

const podcastProject = projects.find(p => p.slug === 'podcast');
const podcastImgs = podcastProject ? podcastProject.gridImages.map(imgUrl => ({ project: podcastProject, imgUrl })) : [];

const prioritizedWithoutUniAndPod = prioritized.filter(p => p.slug !== 'uni-link' && p.slug !== 'podcast');

const allPhotos = [
  ...uniLinkImgs,
  ...podcastImgs,
  ...prioritizedWithoutUniAndPod.flatMap(proj => proj.gridImages.map(imgUrl => ({ project: proj, imgUrl }))),
  ...others.flatMap(proj => proj.gridImages.map(imgUrl => ({ project: proj, imgUrl }))),
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

// ─── Photo card ───────────────────────────────────────────────────────────────
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
  // One copy of the grid width
  const totalW = NUM_COLS * COL_WIDTH + (NUM_COLS - 1) * GAP;

  const scrollRef = useRef(null);
  // Triplicate columns horizontally: left-copy | centre | right-copy
  // We start at the centre copy; bounce reverses direction at each edge.
  const horizColumns = [...columns, ...columns, ...columns];

  // ── Horizontal bounce now handled entirely via CSS (see bounce-x keyframes) ──

  // ── Column grid renderer ─────────────────────────────────────────────────────
  const renderColumns = () =>
    horizColumns.map((colPhotos, colIdx) => {
      const baseIdx   = colIdx % NUM_COLS;
      const duration  = COL_DURATIONS[baseIdx];

      return (
        <div
          key={colIdx}
          className="mc-col-wrap"
          style={{
            width: `${COL_WIDTH}px`,
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            paddingTop: `${COL_STAGGER[baseIdx]}px`,
            boxSizing: 'border-box',
          }}
        >
          {/* Inner strip — doubled for seamless vertical loop via CSS animation */}
          <div
            className="mc-col-inner"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${GAP}px`,
              animation: `marquee-up ${duration}s linear infinite`,
            }}
          >
            {colPhotos.map((photo, j) => (
              <PhotoCard
                key={`a-${photo.project.slug}-${j}`}
                photo={photo}
                eager={baseIdx < 3 && j === 0}
              />
            ))}
            {/* Duplicate for seamless loop */}
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
    });

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

        /* ── Vertical marquee (CSS-driven, no JS conflict) ── */
        @keyframes marquee-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        .mc-col-wrap:hover .mc-col-inner {
          animation-play-state: paused;
        }

        /* ── Horizontal bounce (CSS-driven, hardware accelerated) ── */
        @keyframes bounce-x {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-700px, 0, 0); }
        }

        /* ── Scroll container ── */
        .mc-scroll-box {
          overflow: hidden;        /* JS controls scrollLeft; no scrollbars */
          cursor: default;
          user-select: none;
        }
      `}</style>

      {/* Full-viewport panel below navbar */}
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
          background: 'var(--bg)',
        }}
        className="mc-scroll-box"
      >
        {/* Inner grid — 3× width for horizontal bounce room */}
        <div
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            height: '100%',
            // Total width = 3 copies of the grid + gaps between copies
            width: `${totalW * 3 + GAP * 2}px`,
            padding: `0 ${GAP}px`,
            alignItems: 'flex-start',
            boxSizing: 'border-box',
            animation: 'bounce-x 30s alternate infinite linear',
            willChange: 'transform',
          }}
        >
          {renderColumns()}
        </div>
      </motion.div>
    </>
  );
}
