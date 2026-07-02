import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, MessageSquare, Award, ExternalLink, MapPin, Heart, Sparkles, BarChart2 } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { PremiumTextReveal } from '../components/PremiumTextReveal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
};

const LinkRow = ({ label, url, linkType, openPath, copiedLink, copyToClipboard }) => (
  <motion.div variants={itemVariants} className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      {openPath && (
        <Link to={openPath} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition-colors">
          Open <ExternalLink className="w-3 h-3" />
        </Link>
      )}
    </div>
    <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-200">
      <input type="text" readOnly value={url} className="flex-1 bg-transparent px-3 py-2 text-slate-700 text-xs sm:text-sm font-semibold select-all outline-none" />
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => copyToClipboard(url, linkType)}
        className={`p-2 sm:px-4 border rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 transition-all ${
          copiedLink === linkType
            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        {copiedLink === linkType ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-400" />}
        <span className="hidden sm:inline">{copiedLink === linkType ? 'Copied!' : 'Copy'}</span>
      </motion.button>
    </div>
  </motion.div>
);

export const Profile = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getUser(id);
        setUser(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    showToast(`Copied ${type} link!`, 'success');
    setTimeout(() => setCopiedLink(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-glass-lg glass mt-12 space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-md"><Share2 className="w-8 h-8" /></div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Profile Not Found</h2>
          <p className="text-slate-500 text-sm mt-2">{error || 'This user profile does not exist.'}</p>
        </div>
        <Link to="/" className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm text-sm">Go Back Home</Link>
      </motion.div>
    );
  }

  const siteOrigin = window.location.origin;
  const profileUrl = `${siteOrigin}/u/${user.userId}`;
  const feedbackUrl = `${siteOrigin}/feedback/${user.userId}`;
  const dashboardUrl = `${siteOrigin}/dashboard/${user.userId}`;
  const whatsappShareText = encodeURIComponent(`Hey! Send me anonymous or named ratings and messages on Personality Mirror. Here is my feedback link: ${feedbackUrl}`);
  const twitterShareText = encodeURIComponent(`Rate me anonymously on Personality Mirror 🪞✨ ${feedbackUrl}`);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Profile Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-glass-lg glass flex flex-col md:flex-row gap-8 items-center text-center md:text-left"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/[0.03] rounded-full blur-2xl pointer-events-none animate-float-medium" />

        {/* Profile Image with Hover Zoom & Glow */}
        <div className="shrink-0 relative group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="rounded-full overflow-hidden border-4 border-white shadow-xl relative"
          >
            {(user.photo || user.profilePhoto) ? (
              <img
                src={user.photo ? user.photo : (user.profilePhoto.startsWith('/') ? `http://localhost:5001${user.profilePhoto}` : user.profilePhoto)}
                alt={user.name}
                className="w-28 h-28 sm:w-36 sm:h-36 object-cover"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-4xl sm:text-5xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>
          {/* Animated badge overlay */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: "spring" }}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md border-2 border-white animate-bounce-subtle"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        </div>

        {/* User Details */}
        <div className="flex-1 space-y-4 relative z-10">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2 leading-none">
              <PremiumTextReveal>
                {user.name}
              </PremiumTextReveal>
            </h1>
            <p className="text-slate-500 font-semibold text-sm mt-2 flex items-center justify-center md:justify-start gap-1">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-100 shrink-0 animate-pulse" />
              <span>Hobby: <strong className="text-slate-700"><PremiumTextReveal className="inline" delay={0.15}>{user.hobby}</PremiumTextReveal></strong></span>
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {user.city && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-xs font-bold shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="w-3 h-3 text-slate-400" /> {user.city}
              </span>
            )}
            {user.institution && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold shadow-sm hover:shadow-md transition-shadow">
                <Award className="w-3 h-3 text-blue-400" /> {user.institution}
              </span>
            )}
            {user.gender && (
              <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 text-xs font-bold shadow-sm">
                {user.gender}
              </span>
            )}
          </div>

          {(user.howUseful || user.usefulness) && (
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 max-w-lg">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">How I Am Useful</span>
              <PremiumTextReveal className="text-slate-700 text-sm font-medium leading-relaxed" delay={0.3}>
                "{user.howUseful || user.usefulness}"
              </PremiumTextReveal>
            </div>
          )}
        </div>
      </motion.div>

      {/* Links Dashboard */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-glass-lg glass space-y-8"
      >
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-800">Your Unique Sharing Links</h2>
          <p className="text-slate-500 text-sm mt-1">Copy and share these with friends or in your bio!</p>
        </div>

        <div className="space-y-6">
          <LinkRow label="Feedback Collection Link (For others to rate you)" url={feedbackUrl} linkType="feedback" openPath={`/feedback/${user.userId}`} copiedLink={copiedLink} copyToClipboard={copyToClipboard} />
          <LinkRow label="Analytics Dashboard Link (View your reviews)" url={dashboardUrl} linkType="dashboard" openPath={`/dashboard/${user.userId}`} copiedLink={copiedLink} copyToClipboard={copyToClipboard} />
          <LinkRow label="Public Profile Link" url={profileUrl} linkType="profile" copiedLink={copiedLink} copyToClipboard={copyToClipboard} />
        </div>

        {/* Share Actions */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 border-t border-slate-100 pt-8">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-2xl font-bold shadow-md active:scale-95 transition-all text-center text-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" /><span>WhatsApp</span>
          </motion.a>
          
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`https://twitter.com/intent/tweet?text=${twitterShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-md active:scale-95 transition-all text-center text-sm cursor-pointer"
          >
            <span>𝕏</span><span>Post on X</span>
          </motion.a>
          
          <motion.div className="flex-1">
            <Link
              to={`/feedback/${user.userId}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md active:scale-95 transition-all text-center text-sm btn-shimmer"
            >
              <MessageSquare className="w-4 h-4" /><span>Send Feedback</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick Dashboard CTA */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-gradient"
      >
        <div>
          <h3 className="font-display font-extrabold text-xl">See Your Analytics Dashboard</h3>
          <p className="text-blue-100 text-sm mt-1">View aggregate scores, radar charts, and written reviews.</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={`/dashboard/${user.userId}`}
            className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <BarChart2 className="w-4 h-4" /><span>Open Dashboard</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Org Boards */}
      {(user.college || user.school || user.company) && (
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-glass glass"
        >
          <h3 className="font-extrabold text-slate-800 text-lg mb-2">Campus & Work Boards</h3>
          <p className="text-slate-500 text-sm mb-5">Visit the Spit Out Zone for {user.name}'s organizations:</p>
          <div className="flex flex-col sm:flex-row gap-4">
            {[
              { label: 'College Board', value: user.college },
              { label: 'School Board', value: user.school },
              { label: 'Company Board', value: user.company },
            ].filter((b) => b.value).map((board) => (
              <motion.div
                key={board.label}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Link
                  to={`/spitout/${board.value.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/50 hover:border-slate-300 transition-all group"
                >
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{board.label}</span>
                    <strong className="text-slate-800 text-sm">{board.value}</strong>
                  </div>
                  <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
