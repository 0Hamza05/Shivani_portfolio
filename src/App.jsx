import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import LoadingScreen from './pages/LoadingScreen';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import ProjectDetail from './pages/ProjectDetail';
import { TravelTransitionProvider } from './components/TravelTransitionOverlay';
import ScrapbookMemberNav from './components/ScrapbookMemberNav';
import './index.css';

export default function App() {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <Router>
      <TravelTransitionProvider>
        {/* Render Home off-screen while loading so the browser starts fetching
            all grid images before the user ever sees them. Unmounts once done. */}
        {!loadingDone && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: 0,
              visibility: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <Home />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loadingDone ? (
            <LoadingScreen
              key="loading"
              onComplete={() => setLoadingDone(true)}
            />
          ) : (
            <motion.div
              key="main-content"
              id="main-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/work" element={<Work />} />
                <Route path="/work/:slug" element={<ProjectDetail />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member avatar nav — rendered outside #main-wrap so that framer-motion's
            GPU-compositing transforms on #main-wrap don't break position:fixed here. */}
        {loadingDone && <ScrapbookMemberNav />}
      </TravelTransitionProvider>
    </Router>
  );
}
