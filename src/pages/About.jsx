import { useState, useEffect, useRef } from 'react';
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

function BookIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <path d="M50 25c-10-7-25-9-38-5v55c13-4 28-2 38 5z" fill="#f3e8d8" stroke="#c0654a" strokeWidth="2.4" />
      <path d="M50 25c10-7 25-9 38-5v55c-13-4-28-2-38 5z" fill="#f3e8d8" stroke="#c0654a" strokeWidth="2.4" />
      <line x1="50" y1="25" x2="50" y2="80" stroke="#c0654a" strokeWidth="2.4" />
    </svg>
  );
}

function GhungrooIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <path d="M15 30c18 10 52 10 70 0" stroke="#8a4a3a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="42" r="7.5" fill="#c9a04f" />
      <circle cx="40" cy="50" r="7.5" fill="#c9a04f" />
      <circle cx="60" cy="50" r="7.5" fill="#c9a04f" />
      <circle cx="78" cy="42" r="7.5" fill="#c9a04f" />
      <circle cx="22" cy="46" r="1.8" fill="#7a5a20" />
      <circle cx="40" cy="54" r="1.8" fill="#7a5a20" />
      <circle cx="60" cy="54" r="1.8" fill="#7a5a20" />
      <circle cx="78" cy="46" r="1.8" fill="#7a5a20" />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <path d="M10 40L50 22l40 18-40 18z" fill="#2b3a55" />
      <path d="M28 48v18c0 5 10 9 22 9s22-4 22-9V48" fill="none" stroke="#2b3a55" strokeWidth="3.5" />
      <circle cx="50" cy="40" r="2.6" fill="#c9a04f" />
      <line x1="78" y1="40" x2="78" y2="62" stroke="#c9a04f" strokeWidth="2.6" />
      <circle cx="78" cy="65" r="4.2" fill="#c9a04f" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <path d="M8 52L88 14 56 88l-10-30-26-6z" fill="#d97757" />
      <path d="M46 58l10 30 10-22z" fill="#b85a3e" />
    </svg>
  );
}

function HouseHeartIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <path d="M15 48L50 18l35 30" fill="none" stroke="#c0654a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="24" y="46" width="52" height="36" fill="#f3e8d8" />
      <path d="M50 70c-5-5-13-5-15 1-2 5 2 10 15 18 13-8 17-13 15-18-2-6-10-6-15-1z" fill="rgba(240,158,167,0.95)" />
    </svg>
  );
}

function UmbrellaIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <path d="M12 45a38 38 0 0 1 76 0z" fill="#2b3a55" />
      <path d="M12 45a38 19 0 0 0 76 0" fill="none" stroke="#1d2840" strokeWidth="2" />
      <line x1="50" y1="45" x2="50" y2="82" stroke="#f3e8d8" strokeWidth="3.5" />
      <path d="M50 82c0 5-4 8-9 6" fill="none" stroke="#f3e8d8" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="50" y1="10" x2="50" y2="18" stroke="#c9a04f" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <rect x="12" y="32" width="76" height="50" rx="6" fill="#2a2420" />
      <rect x="30" y="20" width="24" height="14" rx="3" fill="#2a2420" />
      <circle cx="50" cy="58" r="18" fill="#7c8a96" />
      <circle cx="50" cy="58" r="11" fill="#2a2420" />
      <circle cx="74" cy="42" r="4" fill="#c9a04f" />
    </svg>
  );
}

function PlantIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <path d="M50 60c-18-4-26-22-22-38 16 2 26 14 26 30z" fill="#7c9473" />
      <path d="M50 60c18-4 26-22 22-38-16 2-26 14-26 30z" fill="#6a8262" />
      <line x1="50" y1="60" x2="50" y2="82" stroke="#5c7355" strokeWidth="2.6" />
      <path d="M32 80h36l-4 14h-28z" fill="#c0654a" />
    </svg>
  );
}

const MEMENTOS = [
  { Icon: BookIcon,
    desktop: { left: '2%', top: '5%', rotate: -8, size: 'clamp(72px, 10vh, 112px)' },
    mobile:  { left: '2%', top: '5%', rotate: -8, size: 'clamp(60px, 8vh, 85px)' } },
  { Icon: PlantIcon,
    desktop: { left: '1%', top: '30%', rotate: 10, size: 'clamp(56px, 8vh, 88px)' },
    mobile:  null },
  { Icon: GraduationCapIcon,
    desktop: { left: '4%', top: '56%', rotate: 7, size: 'clamp(66px, 9vh, 100px)' },
    mobile:  { left: '2%', bottom: '22%', rotate: 7, size: 'clamp(58px, 8vh, 82px)' } },
  { Icon: GhungrooIcon,
    desktop: { left: '9%', bottom: '4%', rotate: -6, size: 'clamp(60px, 8vh, 92px)' },
    mobile:  { left: '2%', bottom: '4%', rotate: -6, size: 'clamp(55px, 7.5vh, 78px)' } },
  { Icon: CameraIcon,
    desktop: { right: '2%', top: '30%', rotate: 9, size: 'clamp(58px, 8vh, 86px)' },
    mobile:  null },
  { Icon: PlaneIcon,
    desktop: { right: '1%', top: '52%', rotate: -10, size: 'clamp(50px, 7vh, 76px)' },
    mobile:  null },
  { Icon: HouseHeartIcon,
    desktop: { right: '4%', top: '70%', rotate: 8, size: 'clamp(64px, 9vh, 96px)' },
    mobile:  { right: '2%', top: '30%', rotate: 8, size: 'clamp(58px, 8vh, 82px)' } },
  { Icon: UmbrellaIcon,
    desktop: { right: '3%', bottom: '4%', rotate: -7, size: 'clamp(62px, 8.5vh, 94px)' },
    mobile:  { right: '2%', bottom: '4%', rotate: -7, size: 'clamp(56px, 7.5vh, 80px)' } },
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

function FloatingObject({ photo, pos, delay }) {
  const rotate = pos.rotate;
  const { Icon } = photo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: rotate * 1.6, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, rotate, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        position: 'absolute',
        ...pos,
        width: pos.size,
        filter: 'drop-shadow(0 10px 16px rgba(60,40,20,0.22))',
      }}
    >
      <Icon />
    </motion.div>
  );
}

export default function About() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);
  const shouldReduceMotion = useReducedMotion();
  const spotifyControllerRef = useRef(null);
  const embedMountRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860);
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
          <FloatingObject key={photo.Icon.name} photo={photo} pos={isMobile ? photo.mobile : photo.desktop} delay={0.12 + i * 0.08} />
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
