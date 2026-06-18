import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../data/projects';
import { useTravelTransition } from './TravelTransitionOverlay';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const LEMON       = '#FFF44F';
const LEMON_DIM   = 'rgba(255, 244, 79, 0.88)';
const LEMON_FAINT = 'rgba(255, 244, 79, 0.65)';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerTransition } = useTravelTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkStyle = (active = false) => ({
    fontFamily:      "'Mocha'",
    fontSize:        '0.68rem',
    letterSpacing:   '0.2em',
    fontWeight:      400,
    color:           active ? LEMON : LEMON_DIM,
    transition:      'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
    borderWidth:     '1px',
    borderStyle:     'solid',
    borderColor:     active ? 'rgba(255, 244, 79, 0.60)' : 'transparent',
    padding:         '7px 9px 6px',
    borderRadius:    '999px',
    backgroundColor: active ? 'rgba(255, 244, 79, 0.15)' : 'transparent',
    textShadow:      '0 1px 4px rgba(0, 0, 0, 0.55)',
  });

  return (
    <>
      <nav
        style={{
          position:           'fixed',
          top:                0,
          left:               0,
          right:              0,
          zIndex:             100,
          height:             'var(--nav-h)',
          display:            'flex',
          alignItems:         'center',
          justifyContent:     'space-between',
          padding:            '0 32px',
          // Background image tiles horizontally to fill the full nav strip
          backgroundImage:    'url(/background.png)',
          backgroundRepeat:   'repeat-x',
          backgroundSize:     '220px 220px',
          backgroundPosition: 'top left',
          backgroundColor:    '#111111',           // fallback if image fails
          borderBottom:       scrolled
            ? '1px solid rgba(255, 244, 79, 0.18)'
            : '1px solid rgba(255, 244, 79, 0.08)',
          boxShadow:          scrolled
            ? '0 6px 24px rgba(0, 0, 0, 0.45)'
            : '0 2px 14px rgba(0, 0, 0, 0.25)',
          transition:         'box-shadow 0.4s ease, border-color 0.4s ease, filter 320ms ease',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.location.reload();
            }
          }}
          style={{
            fontFamily:    "'Mocha'",
            fontSize:      '2.0rem',
            fontWeight:    400,
            letterSpacing: '0.04em',
            color:         LEMON,
            opacity:       0.9,
            transition:    'opacity 0.2s',
            position:      'relative',
            zIndex:        101,
            textShadow:    '0 1px 6px rgba(0, 0, 0, 0.6)',
          }}
          onMouseEnter={e => e.target.style.opacity = 1}
          onMouseLeave={e => e.target.style.opacity = 0.9}
        >
          SP
        </Link>

        {/* Desktop Links */}
        <div
          style={{
            display:    'flex',
            gap:        '32px',
            alignItems: 'center',
            height:     '100%',
          }}
          className="desktop-nav"
        >
          {/* WORK */}
          <Link
            to="/"
            style={navLinkStyle(isActive('/'))}
            onMouseEnter={e => {
              e.currentTarget.style.color = LEMON;
              if (!isActive('/')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 244, 79, 0.08)';
                e.currentTarget.style.borderColor     = 'rgba(255, 244, 79, 0.35)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color           = isActive('/') ? LEMON : LEMON_DIM;
              e.currentTarget.style.backgroundColor = isActive('/') ? 'rgba(255, 244, 79, 0.15)' : 'transparent';
              e.currentTarget.style.borderColor     = isActive('/') ? 'rgba(255, 244, 79, 0.60)' : 'transparent';
            }}
          >
            WORK
          </Link>

          {/* PILLARS dropdown */}
          <div
            className="pillars-dropdown-container"
            style={{
              position:   'relative',
              height:     '100%',
              display:    'flex',
              alignItems: 'center',
              cursor:     'pointer',
            }}
          >
            <span
              style={{ ...navLinkStyle(false), display: 'inline-block' }}
              className="pillars-trigger-text"
            >
              PILLARS
            </span>
            <div
              className="pillars-dropdown"
              style={{
                position:            'absolute',
                top:                 '80%',
                right:               '-160px',
                width:               '600px',
                backgroundColor:     'rgba(255, 255, 255, 0.96)',
                backdropFilter:      'blur(25px)',
                boxShadow:           '0 20px 40px rgba(0, 0, 0, 0.12)',
                border:              '1px solid var(--border)',
                borderRadius:        '8px',
                padding:             '24px',
                display:             'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap:                 '12px 18px',
                opacity:             0,
                transform:           'translateY(10px)',
                pointerEvents:       'none',
                transition:          'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                zIndex:              999,
              }}
            >
              {projects.filter(proj => !proj.youtubeUrl).map(proj => (
                <Link
                  key={proj.id}
                  to={`/work/${proj.slug}`}
                  onClick={proj.slug === 'travel' ? (e) => {
                    e.preventDefault();
                    triggerTransition(navigate);
                  } : undefined}
                  style={{
                    fontFamily:   "'Mocha'",
                    fontSize:     '1.05rem',
                    color:        location.pathname === `/work/${proj.slug}` ? 'var(--fg)' : 'var(--fg-dim)',
                    transition:   'all 0.2s ease',
                    textAlign:    'left',
                    padding:      '6px 10px',
                    borderRadius: '4px',
                    textShadow:   'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--fg)';
                    e.currentTarget.style.backgroundColor = 'rgba(69, 42, 35, 0.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = location.pathname === `/work/${proj.slug}` ? 'var(--fg)' : 'var(--fg-dim)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {proj.title}
                </Link>
              ))}
            </div>
          </div>

          {/* ABOUT */}
          <Link
            to="/about"
            style={navLinkStyle(isActive('/about'))}
            onMouseEnter={e => {
              e.currentTarget.style.color = LEMON;
              if (!isActive('/about')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 244, 79, 0.08)';
                e.currentTarget.style.borderColor     = 'rgba(255, 244, 79, 0.35)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color           = isActive('/about') ? LEMON : LEMON_DIM;
              e.currentTarget.style.backgroundColor = isActive('/about') ? 'rgba(255, 244, 79, 0.15)' : 'transparent';
              e.currentTarget.style.borderColor     = isActive('/about') ? 'rgba(255, 244, 79, 0.60)' : 'transparent';
            }}
          >
            ABOUT
          </Link>

        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="mobile-hamburger"
          style={{
            background:    'none',
            border:        'none',
            cursor:        'pointer',
            padding:       '4px',
            display:       'none',
            flexDirection: 'column',
            gap:           '5px',
          }}
          aria-label="Toggle menu"
        >
          <span style={{ display: 'block', width: 22, height: 1, backgroundColor: LEMON, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)'  : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 1, backgroundColor: LEMON, transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 1, backgroundColor: LEMON, transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{
              position:           'fixed',
              top:                'var(--nav-h)',
              left:               0,
              right:              0,
              bottom:             0,
              backgroundImage:    'url(/background.png)',
              backgroundSize:     '200px auto',
              backgroundColor:    '#111111',
              zIndex:             99,
              display:            'flex',
              flexDirection:      'column',
              alignItems:         'center',
              padding:            '24px 32px',
            }}
          >
            <div style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '24px',
              width:         '100%',
              maxHeight:     '90%',
              overflowY:     'auto',
              paddingBottom: '40px',
            }}>
              <Link
                to="/"
                style={{
                  fontFamily:    "'Mocha'",
                  fontSize:      '2.2rem',
                  fontWeight:    400,
                  letterSpacing: '0.1em',
                  color:         isActive('/') ? LEMON : LEMON_DIM,
                  textShadow:    '0 1px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                WORK
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
                <span style={{
                  fontFamily:    "'Mocha'",
                  fontSize:      '0.65rem',
                  letterSpacing: '0.25em',
                  color:         LEMON_FAINT,
                  textTransform: 'uppercase',
                  marginBottom:  '8px',
                }}>
                  PILLARS
                </span>
                {projects.filter(proj => !proj.youtubeUrl).map(proj => (
                  <Link
                    key={proj.id}
                    to={`/work/${proj.slug}`}
                    onClick={proj.slug === 'travel' ? (e) => {
                      e.preventDefault();
                      triggerTransition(navigate);
                    } : undefined}
                    style={{
                      fontFamily: "'Mocha'",
                      fontSize:   '1.25rem',
                      color:      location.pathname === `/work/${proj.slug}` ? LEMON : LEMON_DIM,
                      transition: 'color 0.2s',
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {proj.title}
                  </Link>
                ))}
              </div>

              <Link
                to="/about"
                style={{
                  fontFamily:    "'Mocha'",
                  fontSize:      '2.2rem',
                  fontWeight:    400,
                  letterSpacing: '0.1em',
                  color:         isActive('/about') ? LEMON : LEMON_DIM,
                  textShadow:    '0 1px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                ABOUT
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        .pillars-dropdown-container:hover .pillars-dropdown {
          opacity: 1 !important;
          transform: translateY(0) !important;
          pointer-events: auto !important;
        }
        .pillars-dropdown-container:hover .pillars-trigger-text {
          color:            ${LEMON} !important;
          background-color: rgba(255, 244, 79, 0.08) !important;
          border-color:     rgba(255, 244, 79, 0.35) !important;
        }
      `}</style>
    </>
  );
}
