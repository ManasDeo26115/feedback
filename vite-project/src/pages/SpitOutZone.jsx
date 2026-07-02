import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, ThumbsUp, ThumbsDown, User, Shield, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { useIdentity } from '../hooks/useIdentity';
import { PremiumTextReveal } from '../components/PremiumTextReveal';

const MAX_CHARS = 500;

export const SpitOutZone = () => {
  const { organization } = useParams();
  const { showToast } = useToast();
  const { profileName } = useIdentity();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [customAuthor, setCustomAuthor] = useState('');
  const [bouncingId, setBouncingId] = useState(null);

  const [reactions, setReactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_reactions')) || {}; }
    catch { return {}; }
  });

  const boardName = organization.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const fetchPosts = useCallback(async (isSilent = false) => {
    await Promise.resolve();
    if (!isSilent) setLoading(true);
    try {
      const data = await api.getSpitOutPosts(organization);
      setPosts(data);
    } catch (err) {
      console.error(err);
      showToast('Could not load board posts.', 'error');
    } finally {
      setLoading(false);
    }
  }, [organization, showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { showToast('Message text cannot be empty!', 'error'); return; }
    if (text.length > MAX_CHARS) { showToast(`Message must be under ${MAX_CHARS} characters.`, 'error'); return; }

    setSubmitLoading(true);
    try {
      let author = 'Anonymous';
      if (!isAnonymous) author = profileName || customAuthor.trim() || 'Anonymous';
      const newPost = await api.createSpitOutPost({
        organization: organization.toLowerCase(), text: text.trim(), author, isAnonymous
      });
      setPosts((prev) => [newPost, ...prev]);
      setText('');
      showToast('Spit Out published!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to publish post.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReact = async (postId, type) => {
    if (reactions[postId]) { showToast('You already reacted to this post!', 'error'); return; }
    try {
      const updatedPost = type === 'like' ? await api.likePost(postId) : await api.dislikePost(postId);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
      const updatedReactions = { ...reactions, [postId]: type };
      setReactions(updatedReactions);
      localStorage.setItem('pm_reactions', JSON.stringify(updatedReactions));
      setBouncingId(postId);
      setTimeout(() => setBouncingId(null), 500);
      showToast(`Post ${type}d!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to register reaction.', 'error');
    }
  };

  const charPercent = Math.min((text.length / MAX_CHARS) * 100, 100);
  const circumference = 2 * Math.PI * 10;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-glass-lg glass flex justify-between items-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/[0.04] rounded-full blur-2xl pointer-events-none" />
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Spit Out Zone</span>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 mt-1 leading-none">{boardName} Board</h1>
          <p className="text-slate-500 text-sm mt-2">Anonymous campus discussions, news, and vibes.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center shadow-md border border-indigo-100/50">
          <MessageSquare className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Composer */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-glass glass space-y-4"
      >
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Spit something out...</h3>
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="What's on your mind? Share news, gossip, or questions..."
              rows={3}
              className="w-full px-4 py-3 pr-14 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-sm font-medium resize-none"
              required
            />
            {/* Character progress ring */}
            <div className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" className="transform -rotate-90">
                <circle cx="12" cy="12" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                <motion.circle
                  cx="12" cy="12" r="10" fill="none"
                  stroke={charPercent > 90 ? '#ef4444' : charPercent > 70 ? '#f59e0b' : '#6366f1'}
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference - (charPercent / 100) * circumference }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute text-[8px] font-bold ${charPercent > 90 ? 'text-rose-500' : 'text-slate-400'}`}>
                {MAX_CHARS - text.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                <span className="text-slate-600 text-xs font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Post Anonymously
                </span>
              </label>
              {!isAnonymous && !profileName && (
                <input type="text" value={customAuthor} onChange={(e) => setCustomAuthor(e.target.value)}
                  placeholder="Enter name/handle"
                  className="px-3 py-1 text-xs border border-slate-200 focus:border-indigo-500 rounded-lg outline-none transition-all w-36" required />
              )}
              {!isAnonymous && profileName && (
                <span className="text-slate-500 text-xs font-semibold">Posting as <strong className="text-slate-700">{profileName}</strong></span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitLoading || !text.trim()}
              className={`py-2 px-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ${submitLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitLoading ? (
                <div className="flex items-center gap-2">
                  <span className="typing-dot w-1.5 h-1.5 bg-white rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-white rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Publish</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 skeleton shimmer-bg" />)}</div>
      ) : posts.length > 0 ? (
        <motion.div layout className="space-y-4">
          <AnimatePresence initial={false}>
            {posts.map((post) => {
              const hasReacted = reactions[post._id];
              const reactionType = reactions[post._id];
              return (
                <motion.div
                  key={post._id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-glass glass flex flex-col justify-between space-y-4 hover:shadow-glass-lg transition-shadow"
                >
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {post.isAnonymous ? 'Anonymous' : post.author || 'Anonymous'}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm font-medium leading-relaxed break-words">{post.text}</p>
                  
                  <div className="flex items-center gap-3 border-t border-slate-50 pt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleReact(post._id, 'like')}
                      disabled={!!hasReacted}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        reactionType === 'like' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                        'bg-white border-slate-200 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50/50'
                      } ${hasReacted && reactionType !== 'like' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${bouncingId === post._id && reactionType === 'like' ? 'animate-reaction-bounce' : ''}`} />
                      <span>{post.likes}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleReact(post._id, 'dislike')}
                      disabled={!!hasReacted}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        reactionType === 'dislike' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                        'bg-white border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-rose-50/50'
                      } ${hasReacted && reactionType !== 'dislike' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${bouncingId === post._id && reactionType === 'dislike' ? 'animate-reaction-bounce' : ''}`} />
                      <span>{post.dislikes}</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-glass glass space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">No discussions yet</h3>
            <p className="text-slate-500 text-sm mt-1">Start the conversation!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
