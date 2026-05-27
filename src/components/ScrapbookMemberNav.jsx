import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Member data ──────────────────────────────────────────────────────────────
// photo: null = placeholder gradient. Replace with real paths (e.g. '/members/maa.jpg').
const MEMBERS = [
  { id: 0, name: 'Maa',  photo: null, spread: 0, rot: -3.5, ring: '#e87d9e' },
  { id: 1, name: 'Papa', photo: null, spread: 1, rot:  2.2, ring: '#d9a040' },
  { id: 2, name: 'Didi', photo: null, spread: 2, rot: -1.8, ring: '#9b8fd4' },
  { id: 3, name: 'Me',   photo: null, spread: 3, rot:  3.0, ring: '#5cba8a' },
];

// Placeholder gradients match each member's ring colour
const PHOTO_FILLS = [
  'linear-gradient(145deg, #f5c0d2 0%, #e0759a 100%)', // rose
  'linear-gradient(145deg, #f7d880 0%, #e6a53a 100%)', // gold
  'linear-gradient(145deg, #c4b9ea 0%, #8f81ce 100%)', // violet
  'linear-gradient(145deg, #9dddb8 0%, #57ae82 100%)', // sage
];

const CIRCLE_SIZE   = 84;  // px — outer diameter
const BORDER_WIDTH  = 3;   // px — coloured ring
const INNER_SIZE    = CIRCLE_SIZE - BORDER_WIDTH * 2; // photo area

export default function ScrapbookMemberNav() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [activeId, setActiveId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Highlight whichever member was deep-linked into
  // (hooks always run — the pathname guard is at the render return below)
  useEffect(() => {
    const spread = location.state?.spread;
    if (typeof spread === 'number') {
      const match = MEMBERS.find(m => m.spread === spread);
      setActiveId(match ? match.id : null);
    } else {
      setActiveId(null);
    }
  }, [location.state]);

  const handleClick = (member) => {
    setActiveId(member.id);
    navigate('/work/family', { state: { spread: member.spread } });
  };

  // Only render on the family page — after all hooks are declared
  if (location.pathname !== '/work/family') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:        'fixed',
        bottom:          '32px',
        right:           '32px',
        zIndex:          200,
        display:         'flex',
        alignItems:      'flex-end',
        gap:             '20px',
        pointerEvents:   'none', // container transparent to clicks
      }}
    >
      {MEMBERS.map((member, i) => {
        const isHovered = hoveredId === member.id;
        const isActive  = activeId  === member.id;

        // Ring opacity: dim normally, bright on hover/active
        const ringOpacity = isHovered || isActive ? 1 : 0.55;
        const ringScale   = isActive ? 1.04 : 1;

        // Outer glow only on hover/active
        const glow = isHovered
          ? `0 8px 28px rgba(0,0,0,0.42), 0 0 0 4px ${member.ring}33, 0 2px 8px rgba(0,0,0,0.28)`
          : isActive
            ? `0 6px 22px rgba(0,0,0,0.38), 0 0 0 3px ${member.ring}55, 0 2px 6px rgba(0,0,0,0.22)`
            : `0 4px 16px rgba(0,0,0,0.38), 0 2px 6px rgba(0,0,0,0.22)`;

        return (
          <div
            key={member.id}
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            '8px',
              transform:      `rotate(${member.rot}deg)`,
              pointerEvents:  'auto',
              transformOrigin: '50% 100%',
            }}
          >
            {/* ── Circle avatar ─────────────────────────────────────────── */}
            <motion.div
              role="button"
              tabIndex={0}
              aria-label={`View ${member.name}'s section`}
              aria-pressed={isActive}
              onClick={() => handleClick(member)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(member);
                }
              }}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              animate={{
                y:      isHovered ? -10 : 0,
                scale:  isHovered ? 1.10 : isActive ? 1.04 : 1,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.8 }}
              style={{
                width:        `${CIRCLE_SIZE}px`,
                height:       `${CIRCLE_SIZE}px`,
                borderRadius: '50%',
                border:       `${BORDER_WIDTH}px solid ${member.ring}`,
                opacity:      ringOpacity,
                boxShadow:    glow,
                overflow:     'hidden',
                cursor:       'pointer',
                position:     'relative',
                userSelect:   'none',
                WebkitUserSelect: 'none',
                outline:      'none',
                transition:   'opacity 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                flexShrink:   0,
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                  `0 6px 24px rgba(0,0,0,0.42), 0 0 0 3px rgba(255,244,79,0.55)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = glow;
              }}
            >
              {/* Photo or placeholder */}
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  draggable={false}
                  style={{
                    width:      '100%',
                    height:     '100%',
                    objectFit:  'cover',
                    display:    'block',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <div style={{
                  width:      '100%',
                  height:     '100%',
                  background: PHOTO_FILLS[i],
                }}/>
              )}

              {/* Subtle inner ring highlight */}
              <div style={{
                position:     'absolute',
                inset:        0,
                borderRadius: '50%',
                background:   'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.18) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}/>
            </motion.div>

            {/* ── Handwritten name ──────────────────────────────────────── */}
            <span
              style={{
                fontFamily:     "'Alex Brush', cursive",
                fontSize:       '13px',
                color:          isHovered || isActive
                  ? 'rgba(255, 255, 255, 0.90)'
                  : 'rgba(255, 255, 255, 0.48)',
                letterSpacing:  '0.02em',
                lineHeight:     1,
                textShadow:     '0 1px 6px rgba(0,0,0,0.55)',
                transition:     'color 0.22s ease',
                userSelect:     'none',
                pointerEvents:  'none',
                whiteSpace:     'nowrap',
              }}
            >
              {member.name}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}
