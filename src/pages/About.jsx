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
const MEMENTOS = [
  // Left column — two lanes side by side rather than one single-file strip.
  // The bio text block leaves roughly 360px of completely empty margin on
  // each side at desktop widths, far more than a single column of 5 photos
  // ever used; splitting into a near-edge lane (bigger photos) and a second
  // lane further in (smaller) uses that space and lets each photo be larger
  // without the 5 of them needing to out-compete each other for height.
  { src: `${ABOUT_PHOTOS_DIR}/1-removebg-preview.png`,
    desktop: { left: '2%', top: '3%', rotate: -9, height: 'clamp(128px, 19vh, 176px)' },
    narrow:  { left: '2%', top: '4%', rotate: -9, height: 'clamp(105px, 15.5vh, 160px)' },
    mobile:  { left: '3%', top: '5%', rotate: -9, height: 'clamp(85px, 12vh, 122px)' } },
  { src: `${ABOUT_PHOTOS_DIR}/2-removebg-preview.png`,
    // Links through to the "Overcoming Fears" story, like photos 4 and 5.
    linkTo: '/work/overcoming-fears',
    desktop: { left: '16.5%', top: '21%', rotate: 5, height: 'clamp(95px, 14vh, 140px)' },
    // Below ~1100px, the inner lane has nowhere to go (see isNarrowDesktop
    // above) — falls back to a smaller single-file spot, same as before
    // this lane layout existed.
    narrow:  { left: '2%', top: '25%', rotate: 5, height: 'clamp(74px, 10.5vh, 106px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/3-removebg-preview.png`,
    // No mobile slot: at this rotation/size it would sit across the bio
    // paragraph band (roughly 25%-90% of viewport height on narrow screens)
    // and, unlike the old line-art icons, a solid photo there blocks text.
    desktop: { left: '2%', top: '36%', rotate: -13, height: 'clamp(133px, 20vh, 184px)' },
    narrow:  { left: '3%', top: '42%', rotate: -13, height: 'clamp(116px, 17vh, 176px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/4-removebg-preview.png`,
    linkTo: '/work/overcoming-fears',
    desktop: { left: '16.5%', top: '55%', rotate: 0, height: 'clamp(101px, 15vh, 138px)' },
    narrow:  { left: '2%', top: '64%', rotate: 0, height: 'clamp(78px, 11vh, 118px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/5-removebg-preview.png`,
    linkTo: '/work/overcoming-fears',
    desktop: { left: '2%', top: '71%', rotate: 8, height: 'clamp(108px, 15.5vh, 150px)' },
    narrow:  { left: '1%', top: '80%', rotate: 8, height: 'clamp(72px, 10.5vh, 104px)' },
    mobile:  { left: '3%', bottom: '5%', rotate: 8, height: 'clamp(83px, 12vh, 120px)' } },

  // Right column — same two-lane idea, mirrored. Only 4 photos (not 5): the
  // vinyl record eats the top of the near-edge lane, so it has less total
  // room than the left side. Photo 8 lives in the top row instead.
  { src: `${ABOUT_PHOTOS_DIR}/6-removebg-preview.png`,
    // Pushed below the vinyl record, which claims the top-right corner.
    desktop: { right: '1%', top: '24%', rotate: 7, height: 'clamp(118px, 17.5vh, 164px)' },
    narrow:  { right: '1%', top: '24%', rotate: 7, height: 'clamp(86px, 13vh, 130px)' },
    // Sits beside photo 1 on mobile (not stacked under it — there isn't
    // enough vertical gap above the bio text for that).
    mobile:  { left: '22%', top: '5%', rotate: 7, height: 'clamp(64px, 8.5vh, 92px)' } },
  { src: `${ABOUT_PHOTOS_DIR}/7-removebg-preview.png`,
    // Inner lane, starts below the top row's band (not near the very top)
    // so it doesn't run into photo 13 sitting in the same horizontal range.
    desktop: { right: '16.5%', top: '22%', rotate: -11, height: 'clamp(112px, 16vh, 144px)' },
    narrow:  { right: '4%', top: '46%', rotate: -11, height: 'clamp(108px, 15.5vh, 159px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/9-removebg-preview.png`,
    desktop: { right: '1%', top: '63%', rotate: -6, height: 'clamp(108px, 16vh, 152px)' },
    narrow:  { right: '5%', top: '66%', rotate: -6, height: 'clamp(97px, 14vh, 146px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/10-removebg-preview.png`,
    desktop: { right: '16.5%', top: '58%', rotate: 12, height: 'clamp(85px, 12.5vh, 124px)' },
    narrow:  { right: '2%', top: '86%', rotate: 12, height: 'clamp(81px, 11.5vh, 119px)' },
    mobile:  { right: '3%', bottom: '5%', rotate: 12, height: 'clamp(80px, 11.5vh, 118px)' } },

  // Top row, left to right (4 here, including photo 8 moved from the right
  // column above)
  { src: `${ABOUT_PHOTOS_DIR}/11-removebg-preview.png`,
    desktop: { left: '14%', top: '1%', rotate: -5, height: 'clamp(102px, 15vh, 140px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/12-removebg-preview.png`,
    desktop: { left: '36%', top: '2%', rotate: 9, height: 'clamp(90px, 13vh, 124px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/8-removebg-preview.png`,
    // No mobile slot, same reasoning as photo 3 above.
    desktop: { left: '64%', top: '2%', rotate: 4, height: 'clamp(88px, 12.5vh, 119px)' },
    narrow:  { left: '64%', top: '2%', rotate: 4, height: 'clamp(76px, 11vh, 113px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/13-removebg-preview.png`,
    // Positioned from the right (like the vinyl record itself) rather than
    // the left, so the gap between them stays proportionally consistent
    // across viewport widths instead of drifting at narrower desktop sizes.
    desktop: { right: '17%', top: '1%', rotate: -8, height: 'clamp(110px, 16vh, 152px)' },
    narrow:  { right: '17%', top: '1%', rotate: -8, height: 'clamp(95px, 13.5vh, 140px)' },
    mobile:  null },

  // Bottom row, left to right
  { src: `${ABOUT_PHOTOS_DIR}/14-removebg-preview.png`,
    desktop: { left: '20%', bottom: '1%', rotate: 6, height: 'clamp(118px, 17vh, 162px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/sticker-1.webp`,
    desktop: { left: '50%', bottom: '2%', rotate: -10, height: 'clamp(95px, 13.5vh, 132px)' },
    mobile:  null },
  { src: `${ABOUT_PHOTOS_DIR}/sticker-2.webp`,
    desktop: { left: '68%', bottom: '1%', rotate: 3, height: 'clamp(100px, 14.5vh, 140px)' },
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
  { href: '#', label: 'Instagram', Icon: InstagramIcon },
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
    <main style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: PEACH }}>
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
