import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { resolveSearchLink } from '../utils/linkDetector';
import { useToast } from '../hooks/useToast';

export const SearchBar = ({ placeholder = "Paste link or enter User ID...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const targetRoute = resolveSearchLink(query);
    if (targetRoute) {
      navigate(targetRoute);
      setQuery('');
      showToast('Redirected successfully!', 'success');
    } else {
      showToast('Invalid link or User ID. Please check and try again.', 'error');
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative flex items-center ${className}`}>
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused
            ? "0 4px 20px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.5)"
            : "0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.06)",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full flex items-center bg-white/70 backdrop-blur-md rounded-2xl relative"
      >
        <motion.div
          animate={{ x: isFocused ? 4 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-3.5 text-slate-400 pointer-events-none"
        >
          <Search className="w-4.5 h-4.5" />
        </motion.div>
        
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-14 py-2.5 text-sm bg-transparent rounded-2xl outline-none text-slate-800 placeholder:text-slate-400"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="absolute right-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
        >
          Go
        </motion.button>
      </motion.div>
    </form>
  );
};
