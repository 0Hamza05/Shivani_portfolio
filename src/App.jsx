import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import About from './pages/About';
import Work from './pages/Work';
import ProjectDetail from './pages/ProjectDetail';
import { TravelTransitionProvider } from './components/TravelTransitionOverlay';
import './index.css';

export default function App() {
  const [welcomeDone, setWelcomeDone] = useState(false);

  return (
    <Router>
      <TravelTransitionProvider>
        <AnimatePresence>
          {!welcomeDone ? (
            <Welcome key="welcome" onDismiss={() => setWelcomeDone(true)} />
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
