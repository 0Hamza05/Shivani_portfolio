import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import ProjectDetail from './pages/ProjectDetail';
import './index.css';

export default function App() {
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {/* Preload Home off-screen for image loading and animation start */}
        {!welcomeDismissed && (
          <div style={{ position: 'absolute', left: '-9999px', top: 0, visibility: 'hidden' }}>
            <Home />
          </div>
        )}
        {!welcomeDismissed ? (
          <Welcome key="welcome-screen" onDismiss={() => setWelcomeDismissed(true)} />
        ) : (
          <motion.div
            key="main-content"
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
    </Router>
  );
}
