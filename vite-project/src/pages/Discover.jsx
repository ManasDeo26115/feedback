import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkles, RefreshCw, MessageSquare, BarChart2, Award } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
};

const UserCard = ({ user }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Smooth tilt scale factor (max 8 degrees tilt)
    setRotateX(-y / (box.height / 16));
    setRotateY(x / (box.width / 16));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      variants={itemVariants}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-glass glass flex flex-col justify-between h-72 relative overflow-hidden group transition-shadow hover:shadow-glass-lg"
    >
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-500/[0.06] to-indigo-500/[0.04] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

      {/* User Details */}
      <div className="flex items-start gap-4 relative z-10" style={{ transform: "translateZ(20px)" }}>
        <div className="shrink-0">
          {(user.photo || user.profilePhoto) ? (
            <img
              src={user.photo ? user.photo : (user.profilePhoto.startsWith('/') ? `http://localhost:5001${user.profilePhoto}` : user.profilePhoto)}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-350"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-white group-hover:scale-105 transition-transform duration-350">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-extrabold text-slate-800 text-base leading-tight truncate group-hover:text-blue-600 transition-colors duration-200">
            {user.name}
          </h3>
          {user.institution ? (
            <span className="inline-flex items-center gap-0.5 text-xs text-blue-600 font-bold max-w-full">
              <Award className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span className="truncate">{user.institution}</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs font-semibold block">Independent</span>
          )}
          <p className="text-slate-500 text-xs font-medium pt-1 truncate">
            Hobby: <strong className="text-slate-700 font-bold">{user.hobby}</strong>
          </p>
        </div>
      </div>

      {/* Bio */}
      <div className="my-3 py-2.5 border-t border-b border-slate-100/80 flex-1 flex items-center relative z-10" style={{ transform: "translateZ(10px)" }}>
        <p className="text-slate-600 text-xs italic line-clamp-2 leading-relaxed">
          {(user.howUseful || user.usefulness) ? `"${user.howUseful || user.usefulness}"` : '"Sharing personality insights on the platform."'}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-1 relative z-10" style={{ transform: "translateZ(15px)" }}>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to={`/feedback/${user.userId}`}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-sm text-center"
          >
            <MessageSquare className="w-3.5 h-3.5" /><span>Rate Them</span>
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to={`/dashboard/${user.userId}`}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-sm text-center"
          >
            <BarChart2 className="w-3.5 h-3.5 text-slate-400" /><span>Dashboard</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const Discover = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRandomUsers = useCallback(async (isSilent = false) => {
    await Promise.resolve();
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.getRandomUsers();
      setUsers(data);
      if (isSilent) showToast('Profiles refreshed!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not load random users.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRandomUsers();
  }, [fetchRandomUsers]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-glass-lg glass flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100/50">
            <Compass className="w-3.5 h-3.5" /> Discover Profiles
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 leading-none">Find & Rate People</h1>
          <p className="text-slate-500 text-sm mt-2">Explore profiles and share honest, constructive feedback.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => fetchRandomUsers(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 skeleton shimmer-bg" />
          ))}
        </div>
      ) : users.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {users.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-glass glass max-w-md mx-auto space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">No Profiles Yet</h2>
            <p className="text-slate-500 text-sm mt-1">Be the first to create a profile!</p>
          </div>
          <Link to="/" className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
            Create My Profile
          </Link>
        </motion.div>
      )}
    </div>
  );
};
