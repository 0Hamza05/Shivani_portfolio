import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';
import { useLondonTransition } from '../components/LondonTransitionOverlay';
import { useDanceTransition } from '../components/DanceTransitionOverlay';
import { useTravelTransition } from '../components/TravelTransitionOverlay';
import { useUniversityTransition } from '../components/UniversityTransitionOverlay';

const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?|$)/i;

// ─── Desktop config ─────────────────────────────────────────────────────────────
const NUM_COLS  = 5;
const COL_WIDTH = 300; // px
const GAP       = 4;   // px between columns and items

// Each column animates at a different duration → different visual speed → parallax
const COL_DURATIONS = [130, 112, 102, 112, 92]; // seconds per loop

// Visual top margin stagger so columns sit at different heights
const COL_STAGGER = [0, 60, 25, 90, 15]; // px

// ─── Mobile config (≤700px) ─────────────────────────────────────────────────────
const MOBILE_BREAKPOINT    = 700;
const MOBILE_NUM_COLS      = 2;
const MOBILE_COL_WIDTH     = 172; // px — 2 cols + gaps comfortably fit 375px+
const MOBILE_COL_DURATIONS = [COL_DURATIONS[0], COL_DURATIONS[1]];
const MOBILE_COL_STAGGER   = [COL_STAGGER[0],   COL_STAGGER[1]];

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

const columns       = buildColumns(allPhotos, NUM_COLS);
const mobileColumns = buildColumns(allPhotos, MOBILE_NUM_COLS);

function buildColumns(photos, numCols) {
  const cols = Array.from({ length: numCols }, () => []);
  photos.forEach((photo, i) => cols[i % numCols].push(photo));
  return cols;
}

// ─── Photo card ───────────────────────────────────────────────────────────────
function PhotoCard({ photo, eager }) {
  const navigate = useNavigate();
  const { triggerTransition: triggerLondonTransition } = useLondonTransition();
  const { triggerTransition: triggerDanceTransition } = useDanceTransition();
  const { triggerTransition: triggerTravelTransition } = useTravelTransition();
  const { triggerTransition: triggerUniversityTransition } = useUniversityTransition();
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
  if (photo.project.slug === 'life-in-london') {
    return (
      <a
        href="/work/life-in-london"
        draggable={false} onDragStart={e => e.preventDefault()}
        className="mc-card"
        onClick={e => {
          e.preventDefault();
          triggerLondonTransition(navigate, '/work/life-in-london');
        }}
      >{media}</a>
    );
  }
  if (photo.project.slug === 'dance') {
    return (
      <a
        href="/work/dance"
        draggable={false} onDragStart={e => e.preventDefault()}
        className="mc-card"
        onClick={e => {
          e.preventDefault();
          triggerDanceTransition(navigate, '/work/dance');
        }}
      >{media}</a>
    );
  }
  if (photo.project.slug === 'travel') {
    return (
      <a
        href="/work/travel"
        draggable={false} onDragStart={e => e.preventDefault()}
        className="mc-card"
        onClick={e => {
          e.preventDefault();
          triggerTravelTransition(navigate, '/work/travel');
        }}
      >{media}</a>
    );
  }
  if (photo.project.slug === 'university') {
    return (
      <a
        href="/work/university"
        draggable={false} onDragStart={e => e.preventDefault()}
        className="mc-card"
        onClick={e => {
          e.preventDefault();
          triggerUniversityTransition(navigate, '/work/university');
        }}
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Pick the right config for the current breakpoint
  const activeCols      = isMobile ? mobileColumns  : columns;
  const activeNumCols   = isMobile ? MOBILE_NUM_COLS  : NUM_COLS;
  const activeColWidth  = isMobile ? MOBILE_COL_WIDTH : COL_WIDTH;
  const activeDurations = isMobile ? MOBILE_COL_DURATIONS : COL_DURATIONS;
  const activeStagger   = isMobile ? MOBILE_COL_STAGGER   : COL_STAGGER;

  const totalW         = activeNumCols * activeColWidth + (activeNumCols - 1) * GAP;
  const horizColumns   = [...activeCols, ...activeCols, ...activeCols];
  // Bounce shift: one column-width on mobile (subtle), wider sweep on desktop
  const bounceDistance = isMobile ? activeColWidth + GAP : 700;

  // ── Column grid renderer ─────────────────────────────────────────────────────
  const renderColumns = () =>
    horizColumns.map((colPhotos, colIdx) => {
      const baseIdx  = colIdx % activeNumCols;
      const duration = activeDurations[baseIdx];

      return (
        <div
          key={colIdx}
          className="mc-col-wrap"
          style={{
            width: `${activeColWidth}px`,
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            paddingTop: `${activeStagger[baseIdx]}px`,
            boxSizing: 'border-box',
          }}
        >
          {/* Inner strip — doubled for seamless vertical loop via CSS animation */}
          <div
            className="mc-col-inner"
            style={{
              '--col-duration': `${duration}s`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${GAP}px`,
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
        .mc-media {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          /* No filter transition — filter is not GPU-composited and triggers
             repaint on every one of the 420+ image elements on hover. */
        }

        /* Hover effects only on pointer devices — prevents paint overhead on touch/mobile */
        @media (hover: hover) {
          .mc-card:hover {
            box-shadow: 0 8px 28px rgba(0,0,0,0.14);
            transform: scale(1.02);
            z-index: 10;
            position: relative;
          }
          .mc-card:hover .mc-media {
            filter: contrast(1.04) brightness(1.02);
          }
        }

        /* ── Vertical marquee (animation declared in class so media query can override) ── */
        @keyframes marquee-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        .mc-col-inner {
          animation: marquee-up var(--col-duration, 72s) linear infinite;
          will-change: transform;
        }
        .mc-col-wrap:hover .mc-col-inner {
          animation-play-state: paused;
        }

        /* ── Horizontal bounce (animation declared in class so media query can override) ── */
        @keyframes bounce-x {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(var(--bounce-dist, -700px), 0, 0); }
        }
        .mc-bounce {
          animation: bounce-x 20s alternate infinite linear;
        }

        /* ── Scroll container ── */
        .mc-scroll-box {
          overflow: hidden;
          cursor: default;
          user-select: none;
        }

        /* ── Reduced motion: stop all continuous animations ── */
        @media (prefers-reduced-motion: reduce) {
          .mc-col-inner {
            animation: none;
          }
          .mc-bounce {
            animation: none;
            will-change: auto;
          }
          .mc-col-wrap:hover .mc-col-inner {
            animation-play-state: running;
          }
        }
      `}</style>

      {/* Full-viewport panel below navbar */}
      <motion.div
        role="main"
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
          className="mc-bounce"
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            height: '100%',
            width: `${totalW * 3 + GAP * 2}px`,
            padding: `0 ${GAP}px`,
            alignItems: 'flex-start',
            boxSizing: 'border-box',
            willChange: 'transform',
            '--bounce-dist': `-${bounceDistance}px`,
          }}
        >
          {renderColumns()}
        </div>
      </motion.div>

    </>
  );
}
