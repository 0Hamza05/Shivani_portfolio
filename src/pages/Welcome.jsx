import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const COUNT_DURATION_MS = 2200;

function NumberCounter({ onComplete }) {
  const [count, setCount] = useState(1);
  const startRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let raf;
    const tick = now => {
      if (startRef.current === null) startRef.current = now;
      const t = Math.min((now - startRef.current) / COUNT_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.max(1, Math.round(eased * 100)));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setTimeout(onComplete, 450);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 300,
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'clamp(2.2rem, 6vw, 4rem)',
      color: 'var(--fg)',
      letterSpacing: '0.04em',
      display: 'inline-block',
      minWidth: '2.4ch',
      textAlign: 'center',
    }}>
      {count}
    </span>
  );
}

export default function Welcome({ onDismiss }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 1 }}
      className="welcome-bg"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(45deg, #F09EA7, #F6CA94, #FAFABE, #C1EBC0, #C7CAFF, #CDABEB, #F6C2F3)',
        backgroundSize: '400% 400%',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <style>{`
        @keyframes gradientBG {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .welcome-bg {
          animation: gradientBG 15s ease infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .welcome-bg {
            animation: none;
            background-position: 0% 50%;
          }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '100px 32px 64px' }}>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.h1
            initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.5, duration: shouldReduceMotion ? 0 : 1 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em', textTransform: 'lowercase' }}
          >
            welcome to my portfolio
          </motion.h1>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: shouldReduceMotion ? 0 : 1, duration: shouldReduceMotion ? 0 : 1 }}
        >
          <NumberCounter onComplete={onDismiss} />
        </motion.div>
      </div>
    </motion.div>
  );
}
