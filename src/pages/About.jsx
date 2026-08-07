import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Butterfly, { BUTTERFLY_FLAP_CSS } from '../components/Butterfly';

const PEACH      = 'oklch(93% 0.025 58)';
const INK        = 'oklch(27% 0.035 40)';
const INK_DIM    = 'oklch(42% 0.03 45)';
const CARD_CREAM = 'oklch(98% 0.01 70)';
const VINYL_LABEL = 'rgba(240,158,167,0.95)';

// "Love Story (Taylor's Version)" — Taylor Swift, played via Spotify's official embed/IFrame API
const SPOTIFY_TRACK_URI = 'spotify:track:3CeCwYWvdfXbZLXFhBrbnf';

// Module-level cache so React StrictMode's effect double-invoke (and any remount)
// reuses the same Spotify IFrame API instance instead of re-injecting the script.
let cachedSpotifyIframeApi = null;
let spotifyApiLoadPromise = null;

function loadSpotifyIframeApi() {
  if (cachedSpotifyIframeApi) return Promise.resolve(cachedSpotifyIframeApi);
  if (spotifyApiLoadPromise) return spotifyApiLoadPromise;
  spotifyApiLoadPromise = new Promise(resolve => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      cachedSpotifyIframeApi = IFrameAPI;
      resolve(IFrameAPI);
    };
    if (!document.querySelector('script[src*="iframe-api"]')) {
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);
    }
  });
  return spotifyApiLoadPromise;
}

const ABOUT_PHOTOS_DIR = '/images/About';

// Real snapshots (die-cut sticker photos) instead of drawn icons — natural
// aspect ratio per photo (measured from each file) drives the height/width
// pairing below so nothing looks stretched.
// Two dense collage clusters flanking the central "desk mat" card — objects
// overlap each other and bleed onto the card's edges, like a scattered
// personal workspace. All widths are vh-based so the clusters keep constant
// pixel size and stay tucked against the left/right edges as the window
// widens. Desktop (>=1300px): full two-lane clusters. narrow (860-1300px):
// pulled tighter to the edge / single-file so they never reach the centered
// bio text. mobile (<860px): four corner anchors only.
const MEMENTOS = [
  // ── LEFT cluster ─────────────────────────────────────────────────────────
  // Outer lane (hugs the edge, biggest photos), overlapping top-to-bottom.
  { src: `${ABOUT_PHOTOS_DIR}/1-removebg-preview.png`,
    desktop: { left: '0.5%', top: '11%', rotate: -8,  height: 'clamp(205px, 28vh, 272px)' },
    narrow:  { left: '1%',   top: '3%',  rotate: -8,  height: 'clamp(120px, 16vh, 172px)' },
    mobile:  { left: '2%',   top: '4%',  rotate: -8,  height: 'clamp(90px,  13vh, 130px)' } },
  { src: `${ABOUT_PHOTOS_DIR}/3-removebg-preview.png`,
    desktop: { left: '1%',   top: '36%', rotate: -13, height: 'clamp(215px, 29vh, 288px)' },
    narrow:  { left: '1%',   top: '38%', rotate: -13, height: 'clamp(130px, 18vh, 188px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/5-removebg-preview.png`,
    linkTo: '/work/overcoming-fears',
    desktop: { left: '0.5%', top: '62%', rotate: 8,   height: 'clamp(200px, 27vh, 262px)' },
    narrow:  { left: '1%',   top: '74%', rotate: 8,   height: 'clamp(118px, 16vh, 168px)' },
    mobile:  { left: '2%',   bottom: '4%', rotate: 8, height: 'clamp(88px, 12vh, 125px)' } },
  // Inner lane (tucked behind/over the outer lane, reaches toward the card).
  { src: `${ABOUT_PHOTOS_DIR}/11-removebg-preview.png`,
    desktop: { left: '12%',  top: '4%',  rotate: -4, height: 'clamp(142px, 19vh, 184px)' },
    narrow:  { left: '13%',  top: '3%',  rotate: -4, height: 'clamp(96px,  13vh, 130px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/2-removebg-preview.png`,
    linkTo: '/work/overcoming-fears',
    desktop: { left: '11%',  top: '25%', rotate: 5,  height: 'clamp(172px, 23vh, 222px)' },
    narrow:  { left: '2%',   top: '20%', rotate: 5,   height: 'clamp(108px, 14.5vh, 155px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/4-removebg-preview.png`,
    linkTo: '/work/overcoming-fears',
    desktop: { left: '11%',  top: '49%', rotate: 0,   height: 'clamp(178px, 24vh, 232px)' },
    narrow:  { left: '2%',   top: '56%', rotate: 0,   height: 'clamp(112px, 15vh, 160px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/14-removebg-preview.png`,
    desktop: { left: '12%',  top: '72%', rotate: 6,  height: 'clamp(142px, 19vh, 186px)' },
    narrow:  { left: '14%',  top: '78%', rotate: 6,  height: 'clamp(96px,  13vh, 130px)' },
    mobile:  null },

  // ── RIGHT cluster ────────────────────────────────────────────────────────
  // Outer lane (hugs the edge) — starts below the vinyl (top ~26%).
  { src: `${ABOUT_PHOTOS_DIR}/6-removebg-preview.png`,
    desktop: { right: '0.5%', top: '28%', rotate: 7,  height: 'clamp(195px, 26vh, 250px)' },
    narrow:  { right: '1%',   top: '30%', rotate: 7,  height: 'clamp(120px, 16vh, 172px)' },
    mobile:  { right: '2%',   top: '4%',  rotate: 7,  height: 'clamp(88px,  12vh, 125px)' } },
  { src: `${ABOUT_PHOTOS_DIR}/9-removebg-preview.png`,
    desktop: { right: '0.5%', top: '54%', rotate: -6, height: 'clamp(195px, 26vh, 250px)' },
    narrow:  { right: '1%',   top: '55%', rotate: -6, height: 'clamp(120px, 16vh, 172px)' },
    mobile:  null },
  // Inner lane.
  { src: `${ABOUT_PHOTOS_DIR}/13-removebg-preview.png`,
    desktop: { right: '14.5%', top: '4%', rotate: -8, height: 'clamp(142px, 19vh, 184px)' },
    narrow:  { right: '15%',  top: '3%',  rotate: -8, height: 'clamp(96px,  13vh, 130px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/7-removebg-preview.png`,
    desktop: { right: '14.5%', top: '30%', rotate: -11, height: 'clamp(172px, 23vh, 222px)' },
    narrow:  { right: '2%',   top: '75%', rotate: -11, height: 'clamp(112px, 15vh, 160px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/10-removebg-preview.png`,
    desktop: { right: '14.5%', top: '53%', rotate: 12, height: 'clamp(172px, 23vh, 222px)' },
    narrow:  { right: '15%',  top: '55%', rotate: 12, height: 'clamp(108px, 14.5vh, 155px)' },
    mobile:  { right: '2%',   bottom: '4%', rotate: 12, height: 'clamp(88px, 12vh, 125px)' } },
  { src: `${ABOUT_PHOTOS_DIR}/8-removebg-preview.png`,
    desktop: { right: '13.5%', top: '75%', rotate: 4,  height: 'clamp(140px, 19vh, 180px)' },
    narrow:  { right: '15%',  top: '80%', rotate: 4,  height: 'clamp(94px,  13vh, 128px)' },
    mobile:  null },
  // Bottom-edge fillers tucked into the right cluster's lower gap.
  { src: `${ABOUT_PHOTOS_DIR}/sticker-1.webp`,
    desktop: { right: '2.5%', top: '79%', rotate: -10, height: 'clamp(130px, 17vh, 170px)' },
    narrow:  { right: '3%',  bottom: '2%', rotate: -10, height: 'clamp(90px, 12vh, 122px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/sticker-2.webp`,
    desktop: { right: '16%', top: '78%', rotate: 3,   height: 'clamp(132px, 18vh, 172px)' },
    narrow:  { right: '17%', top: '82%', rotate: 3,   height: 'clamp(92px,  12.5vh, 126px)' },
    mobile:  null },
];

function MailIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="7.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="17" />
      <path d="M11.5 17v-4a2.5 2.5 0 0 1 5 0v4" />
      <line x1="11.5" y1="10.5" x2="11.5" y2="17" />
    </svg>
  );
}

function Vinyl({ pos, controllerRef }) {
  const spin = playing => {
    const disc = document.querySelector('.vinyl-disc');
    if (disc) disc.style.animationPlayState = playing ? 'running' : 'paused';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      onMouseEnter={() => { spin(true); controllerRef.current?.resume(); }}
      onMouseLeave={() => { spin(false); controllerRef.current?.pause(); }}
      onClick={() => { spin(true); controllerRef.current?.resume(); }}
      style={{
        position: 'absolute',
        ...pos,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(4px, 0.8vh, 8px)',
      }}
    >
      <style>{`
        @keyframes vinylSpin { to { transform: rotate(360deg); } }
        @keyframes vinylPulse {
          0%   { transform: scale(1);    opacity: 0.55; }
          70%  { transform: scale(1.32); opacity: 0; }
          100% { transform: scale(1.32); opacity: 0; }
        }
        .vinyl-disc {
          animation: vinylSpin 2.6s linear infinite;
          animation-play-state: paused;
        }
        .vinyl-pulse-ring {
          animation: vinylPulse 1.8s ease-out infinite;
        }
      `}</style>
      <div style={{
        position: 'relative',
        width: 'clamp(92px, 13vh, 156px)',
        aspectRatio: '1 / 1',
        cursor: 'pointer',
      }}>
        <div className="vinyl-pulse-ring" style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${VINYL_LABEL}`,
        }} />
        <svg
          className="vinyl-disc"
          viewBox="0 0 100 100"
          style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 8px 16px rgba(60,40,20,0.28))' }}
        >
          <circle cx="50" cy="50" r="48" fill="#181818" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#3a3a3a" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="33" fill="none" stroke="#3a3a3a" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="#3a3a3a" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="19" fill="none" stroke="#3a3a3a" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="13" fill={VINYL_LABEL} />
          <circle cx="50" cy="50" r="2" fill="#181818" />
        </svg>
      </div>
      <p style={{
        margin: 0,
        fontFamily: "'Alex Brush', cursive",
        fontSize: 'clamp(0.85rem, 1.7vh, 1.15rem)',
        color: INK_DIM,
        whiteSpace: 'nowrap',
      }}>
        hover for a song ♪
      </p>
    </motion.div>
  );
}

const SOCIAL_LINKS = [
  { href: 'mailto:hello@shivani.com', label: 'Email', Icon: MailIcon },
  { href: 'https://www.instagram.com/shivaniipawarr?igsh=MWV6dGJjN2NiZDhudA==', label: 'Instagram', Icon: InstagramIcon, external: true },
  { href: 'https://www.linkedin.com/in/shivanipawar9', label: 'LinkedIn', Icon: LinkedinIcon, external: true, className: 'linkedin' },
];

function SocialLink({ href, label, Icon, external, className }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={className}
      aria-label={label}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(5px, 0.8vh, 9px)', color: 'var(--fg)' }}
      onMouseEnter={e => {
        const circle = e.currentTarget.firstChild;
        circle.style.backgroundColor = 'var(--fg)';
        circle.style.color = CARD_CREAM;
        circle.style.borderColor = 'var(--fg)';
      }}
      onMouseLeave={e => {
        const circle = e.currentTarget.firstChild;
        circle.style.backgroundColor = 'transparent';
        circle.style.color = 'var(--fg)';
        circle.style.borderColor = 'var(--border)';
      }}
    >
      <span style={{
        width: 'clamp(30px, 5.4vh, 46px)', height: 'clamp(30px, 5.4vh, 46px)', borderRadius: '50%',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(7px, 1.3vh, 12px)',
        color: 'var(--fg)',
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
      }}>
        <Icon />
      </span>
      <span style={{ fontSize: 'clamp(0.46rem, 0.9vh, 0.6rem)', letterSpacing: '0.14em', color: 'var(--fg-dim)' }}>{label.toUpperCase()}</span>
    </a>
  );
}

// Reuses the page's own palette (terracotta, gold, the dusty pink already on
// the vinyl label and HouseHeartIcon) so these read as part of the existing
// memento set rather than a new decorative system.
const ABOUT_BUTTERFLY_PALETTE = [
  { wing: '#d98a78', accent: '#f3c9bd', body: '#7a3f30' }, // terracotta
  { wing: '#d9b86a', accent: '#f0ddae', body: '#6b5526' }, // gold
  { wing: VINYL_LABEL,  accent: '#f8dde1', body: '#7a4a55' }, // dusty pink
];

// Tucked into the negative space near existing mementos rather than roaming
// the whole page — small, local, lazy loops so they read as perched/drifting,
// not as a swarm competing with the bio text. Anchors are laid out as a left
// column, right column, top row and bottom row (6+6+4+4=20) so the dead-center
// content column (bio text, vinyl, social row) always stays clear.
function buildAboutButterflies() {
  const anchors = [];

  const leftY = [8, 24, 40, 56, 72, 88];
  const leftX = ['3%', '7%', '2%', '8%', '4%', '6%'];
  leftY.forEach((y, k) => anchors.push({
    desktop: { left: leftX[k], top: `${y}%` },
    mobile: k % 2 === 0 ? { left: '2%', top: `${Math.max(4, y - 4)}%` } : null,
  }));

  const rightY = [10, 26, 42, 58, 74, 90];
  const rightX = ['3%', '7%', '2%', '8%', '4%', '6%'];
  rightY.forEach((y, k) => anchors.push({
    desktop: { right: rightX[k], top: `${y}%` },
    mobile: k % 2 === 0 ? { right: '2%', top: `${Math.max(4, y - 4)}%` } : null,
  }));

  const topX = [15, 38, 62, 85];
  topX.forEach((x, k) => anchors.push({
    desktop: { left: `${x}%`, top: `${4 + (k % 2) * 3}%` },
    mobile: { left: `${x}%`, top: '3%' },
  }));

  const bottomX = [20, 42, 58, 80];
  bottomX.forEach((x, k) => anchors.push({
    desktop: { left: `${x}%`, bottom: `${4 + (k % 2) * 3}%` },
    mobile: null,
  }));

  return anchors.map((a, i) => {
    const radius = 12 + (i % 4) * 3;
    const angleOffset = ((i * 53) % 360) * (Math.PI / 180);
    const x = [0, 1, 2, 3, 0].map(k => Math.round(Math.cos(angleOffset + (k / 4) * Math.PI * 2) * radius));
    const y = [0, 1, 2, 3, 0].map(k => Math.round(Math.sin(angleOffset + (k / 4) * Math.PI * 2) * radius * 0.75));
    return {
      palette: i % ABOUT_BUTTERFLY_PALETTE.length,
      size: 16 + (i % 6) * 2,
      flap: 0.55 + (i % 5) * 0.045,
      duration: 11 + (i % 7) * 1.1,
      desktop: a.desktop,
      mobile: a.mobile,
      x, y,
      rotate: i % 2 === 0 ? [0, -8, 7, -5, 0] : [0, 7, -6, 5, 0],
    };
  });
}

const ABOUT_BUTTERFLIES = buildAboutButterflies();

function FlutteringButterfly({ data, pos, delay, shouldReduceMotion }) {
  const c = ABOUT_BUTTERFLY_PALETTE[data.palette];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={
        shouldReduceMotion
          ? { opacity: 0.95, scale: 1 }
          : { opacity: [0, 0.95, 0.95, 0.95, 0.95], scale: 1, x: data.x, y: data.y, rotate: data.rotate }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0.7, delay }
          : { duration: data.duration, delay, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
      }
      style={{ position: 'absolute', ...pos, pointerEvents: 'none' }}
    >
      <Butterfly
        size={data.size}
        wingColor={c.wing}
        wingAccent={c.accent}
        bodyColor={c.body}
        flapDuration={data.flap}
        flap={!shouldReduceMotion}
      />
    </motion.div>
  );
}

// Flat paw-print badge — the same hand-cut SVG language as the playing-card
// pip and the SVG mementos this page used to have — marking the handful of
// photos that link through to another page, since a sticker photo gives no
// other hint that it's clickable rather than decorative.
function PawBadge() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="14.5" r="6.2" fill={CARD_CREAM} stroke="#c0654a" strokeWidth="1.1" />
      <ellipse cx="7.4" cy="11.8" rx="2.1" ry="2.6" fill="#c0654a" transform="rotate(-18 7.4 11.8)" />
      <ellipse cx="12" cy="9.6" rx="2.2" ry="2.8" fill="#c0654a" />
      <ellipse cx="16.6" cy="11.8" rx="2.1" ry="2.6" fill="#c0654a" transform="rotate(18 16.6 11.8)" />
      <ellipse cx="12" cy="15.2" rx="3.4" ry="3" fill="#c0654a" />
    </svg>
  );
}

function FloatingObject({ photo, pos, delay }) {
  const rotate = pos.rotate;
  const img = <img src={photo.src} alt="" style={{ height: '100%', width: 'auto', display: 'block' }} draggable={false} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: rotate * 1.6, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, rotate, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        position: 'absolute',
        ...pos,
        width: 'auto',
        filter: 'drop-shadow(0 10px 16px rgba(60,40,20,0.22))',
      }}
    >
      {photo.linkTo ? (
        <Link
          to={photo.linkTo}
          className="about-clickable-photo"
          aria-label="View the Overcoming Fears story"
          style={{ position: 'relative', display: 'block', height: '100%', width: 'auto' }}
        >
          {img}
          <span className="about-clickable-badge" style={{
            position: 'absolute', right: '-9%', bottom: '-9%',
            width: '30%', minWidth: '22px', maxWidth: '34px',
            aspectRatio: '1 / 1',
          }}>
            <PawBadge />
          </span>
        </Link>
      ) : img}
    </motion.div>
  );
}

export default function About() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);
  // The bio text block has a fixed pixel width, so its side margins shrink
  // faster than the (vh-sized) photo lanes as the window narrows. Below
  // ~1300px there's no longer reliable room for two side-by-side lanes, so
  // the inner lane's photos (2, 4, 7, 10) fall back to a tighter single-file
  // position. (Measured: margin = 0.5*viewportWidth - 280px; verified safe
  // at 1300px+, breaks down between 1100-1280px.)
  const [isNarrowDesktop, setIsNarrowDesktop] = useState(window.innerWidth < 1300);
  const shouldReduceMotion = useReducedMotion();
  const spotifyControllerRef = useRef(null);
  const embedMountRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 860);
      setIsNarrowDesktop(window.innerWidth < 1300);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let active = true;
    loadSpotifyIframeApi().then(IFrameAPI => {
      if (!active || spotifyControllerRef.current || !embedMountRef.current) return;
      IFrameAPI.createController(
        embedMountRef.current,
        { width: 1, height: 1, uri: SPOTIFY_TRACK_URI },
        controller => { if (active) spotifyControllerRef.current = controller; }
      );
    });
    return () => { active = false; };
  }, []);

  const photos = MEMENTOS.filter(p => !isMobile || p.mobile);
  const butterflies = ABOUT_BUTTERFLIES.filter(b => !isMobile || b.mobile);
  const vinylPos = isMobile
    ? { right: '2%', top: '2%' }
    : { right: '2%', top: '3%' };

  return (
    <main style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      backgroundColor: PEACH,
      // Soft staggered polka dots across the whole page
      backgroundImage: `radial-gradient(rgba(150,95,60,0.17) 2.8px, transparent 3px), radial-gradient(rgba(150,95,60,0.17) 2.8px, transparent 3px)`,
      backgroundSize: '44px 44px',
      backgroundPosition: '0 0, 22px 22px',
    }}>
      <style>{BUTTERFLY_FLAP_CSS}</style>
      <style>{`
        .about-clickable-photo { transition: transform 0.25s ease; }
        .about-clickable-photo:hover, .about-clickable-photo:focus-visible {
          transform: scale(1.06) translateY(-3px);
        }
        .about-clickable-badge { animation: aboutBadgePulse 2.6s ease-in-out infinite; }
        @keyframes aboutBadgePulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
      `}</style>
      <div style={{
        position: 'absolute',
        top: 'var(--nav-h)', left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}>
        {photos.map((photo, i) => (
          <FloatingObject
            key={photo.src}
            photo={photo}
            pos={isMobile ? photo.mobile : (isNarrowDesktop && photo.narrow) || photo.desktop}
            delay={0.12 + i * 0.08}
          />
        ))}

        {butterflies.map((b, i) => (
          <FlutteringButterfly
            key={i}
            data={b}
            pos={isMobile ? b.mobile : b.desktop}
            delay={0.4 + (i % 10) * 0.16}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}

        <Vinyl pos={vinylPos} controllerRef={spotifyControllerRef} />
        <div ref={embedMountRef} style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '560px' }}
        >
          <h1 style={{
            fontFamily: "'Cote Lumiere'",
            fontWeight: 400,
            fontSize: 'clamp(1.7rem, 6vh, 3.6rem)',
            color: INK,
            letterSpacing: '0.02em',
            marginBottom: 'clamp(4px, 0.8vh, 14px)',
          }}>
            Shivani Pawar
          </h1>
          <div style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: 'clamp(0.78rem, 1.75vh, 1.1rem)',
            lineHeight: 1.55,
            color: INK_DIM,
          }}>
            <p style={{ marginBottom: '0.6em' }}>Hey, this is Shivani! I hope you’ve enjoyed your time here and getting to know a little more about me.</p>
            <p style={{ marginBottom: '0.6em' }}>I’m London-based, working in data privacy and cybersecurity. By every other hour, you’ll find me dancing, painting, experimenting in the kitchen, playing with someone’s dog, eating cake or stumbling into whatever new experience London has decided to offer that weekend.</p>
            <p style={{ marginBottom: '0.6em' }}>I believe in giving back through volunteering, through showing up and through using whatever I have to contribute something worthwhile.</p>
            <p>This is my world. Thank you for being part of it 👒</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 }}
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            gap: 'clamp(16px, 3vh, 36px)',
            marginTop: 'clamp(12px, 2.6vh, 30px)',
            marginBottom: 'clamp(14px, 2.6vh, 30px)',
          }}
        >
          {SOCIAL_LINKS.map(link => <SocialLink key={link.label} {...link} />)}
        </motion.div>
      </div>
    </main>
  );
}
