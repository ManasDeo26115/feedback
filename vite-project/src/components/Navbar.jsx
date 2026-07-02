import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, UserCircle, Menu, X } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { useIdentity } from '../hooks/useIdentity';
import { useToast } from '../hooks/useToast';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, profileName, hasIdentity } = useIdentity();
  const { showToast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleMyProfileClick = () => {
    if (userId) {
      navigate(`/dashboard/${userId}`);
    } else {
      showToast('Create your profile first to access your dashboard!', 'error');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/50 bg-white/75 backdrop-blur-lg shadow-sm'
          : 'border-b border-transparent bg-white/40 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <span className="font-display font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 hidden sm:inline-block">
            Personality Mirror
          </span>
        </Link>

        {/* Search Bar - Center (Desktop) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchBar />
        </div>

        {/* Desktop Nav Actions */}
        <nav className="hidden md:flex items-center gap-2.5 shrink-0">
          <Link
            to="/discover"
            className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:text-blue-600 transition-colors duration-200"
          >
            <Compass className="w-4 h-4" />
            <span>Discover</span>
            {isActive('/discover') && (
              <motion.span
                layoutId="activeNavBackground"
                className="absolute inset-0 bg-blue-50/80 border border-blue-100/30 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMyProfileClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {hasIdentity ? (
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 text-[10px] font-black flex items-center justify-center border border-white/20">
                {profileName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            ) : (
              <UserCircle className="w-4 h-4" />
            )}
            <span>{hasIdentity ? 'Dashboard' : 'My Profile'}</span>
          </motion.button>
        </nav>

        {/* Mobile Menu Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl"
          >
            <div className="px-4 pb-5 pt-3 space-y-3.5">
              <SearchBar className="w-full" />
              
              <Link
                to="/discover"
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isActive('/discover')
                    ? 'bg-blue-50/80 text-blue-700 border border-blue-100/30'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4.5 h-4.5" />
                <span>Discover People</span>
              </Link>

              <button
                onClick={handleMyProfileClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all"
              >
                <UserCircle className="w-4.5 h-4.5" />
                <span>{hasIdentity ? 'My Dashboard' : 'My Profile'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
