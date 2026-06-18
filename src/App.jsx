import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import LoadingScreen from './pages/LoadingScreen';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import ProjectDetail from './pages/ProjectDetail';
import { TravelTransitionProvider } from './components/TravelTransitionOverlay';
import './index.css';

export default function App() {
  const [loadingDone, setLoadingDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoadingDone(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Router>
      <TravelTransitionProvider>
        <AnimatePresence>
          {!loadingDone ? (
            <LoadingScreen key="loading" />
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
      </TravelTransitionProvider>
    </Router>
  );
}
