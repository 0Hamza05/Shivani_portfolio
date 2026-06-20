import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHIP_LIFETIME_MS = 1100;
const MIN_SPAWN_DIST   = 70;

export default function CursorImageTrail({ images }) {
  const [chips, setChips] = useState([]);
  const lastPos     = useRef(null);
  const cycleIndex  = useRef(0);
  const nextId      = useRef(0);

  const handleMouseMove = useCallback((e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    if (lastPos.current) {
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_SPAWN_DIST) return;
    }
    lastPos.current = { x, y };

    const id = nextId.current++;
    const src = images[cycleIndex.current % images.length];
    cycleIndex.current += 1;
    const rotate = (Math.random() - 0.5) * 16;

    setChips(prev => [...prev, { id, x, y, src, rotate }]);
    setTimeout(() => setChips(prev => prev.filter(c => c.id !== id)), CHIP_LIFETIME_MS);
  }, [images]);

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      <AnimatePresence>
        {chips.map(chip => (
          <motion.img
            key={chip.id}
            src={chip.src}
            alt=""
            initial={{ opacity: 0, scale: 0.82, rotate: chip.rotate }}
            animate={{ opacity: 1, scale: 1, rotate: chip.rotate, transition: { duration: 0.32, ease: 'easeOut' } }}
            exit={{ opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.7, ease: 'easeIn' } }}
            style={{
              position: 'absolute',
              left: chip.x, top: chip.y,
              transform: 'translate(-50%, -50%)',
              width: '92px', height: '92px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
