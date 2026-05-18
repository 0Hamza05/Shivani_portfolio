import { motion } from 'framer-motion';

export default function Welcome({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(45deg, #F09EA7, #F6CA94, #FAFABE, #C1EBC0, #C7CAFF, #CDABEB, #F6C2F3)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '100px 32px 64px' }}>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em', textTransform: 'lowercase' }}
          >
            welcome to my portfolio
          </motion.h1>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <button 
            onClick={onDismiss}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
              padding: '16px 32px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(10px)',
              display: 'inline-block',
              borderRadius: '30px',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--fg)';
              e.currentTarget.style.color = '#FAFABE';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.color = 'var(--fg)';
            }}
          >
            LET'S GET STARTED
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
