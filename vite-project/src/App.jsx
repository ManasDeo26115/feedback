import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { FeedbackForm } from './pages/FeedbackForm';
import { Dashboard } from './pages/Dashboard';
import { Discover } from './pages/Discover';
import { SpitOutZone } from './pages/SpitOutZone';

function AppContent() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/u/:id" element={<Profile />} />
          <Route path="/feedback/:id" element={<FeedbackForm />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/spitout/:organization" element={<SpitOutZone />} />
          
          {/* Fallback routing */}
          <Route path="*" element={
            <div className="text-center py-20">
              <h2 className="text-2xl font-black text-slate-800">404 - Page Not Found</h2>
              <p className="text-slate-500 mt-2 text-sm">The URL you entered does not exist.</p>
              <Link to="/" className="inline-block mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
                Go Back Home
              </Link>
            </div>
          } />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
