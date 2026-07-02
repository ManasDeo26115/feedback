import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, ArrowLeft, Star, Heart, Compass } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

const TRAITS = [
  { id: 'communication', label: 'Communication', desc: 'How clearly they share ideas', emoji: '🗣️' },
  { id: 'confidence', label: 'Confidence', desc: 'How self-assured and poised', emoji: '💪' },
  { id: 'leadership', label: 'Leadership', desc: 'How well they guide others', emoji: '👑' },
  { id: 'teamwork', label: 'Teamwork', desc: 'How collaborative they are', emoji: '🤝' },
  { id: 'helpfulness', label: 'Helpfulness', desc: 'Willingness to assist others', emoji: '💡' },
  { id: 'creativity', label: 'Creativity', desc: 'Original and innovative thinking', emoji: '🎨' },
  { id: 'emotionalIntelligence', label: 'Emotional IQ', desc: 'Self-awareness and empathy', emoji: '🧠' },
  { id: 'reliability', label: 'Reliability', desc: 'How dependable they are', emoji: '🎯' },
  { id: 'problemSolving', label: 'Problem Solving', desc: 'Analytical thinking', emoji: '🔧' },
  { id: 'attitude', label: 'Attitude', desc: 'Positivity and overall vibe', emoji: '✨' },
];

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

// Custom confetti particle count
const CONFETTI_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  angle: Math.random() * 360,
  distance: 80 + Math.random() * 150,
  size: 6 + Math.random() * 10,
  color: ['#3b82f6', '#6366f1', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
}));

export const FeedbackForm = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [recipient, setRecipient] = useState(null);
  const [loadingRecipient, setLoadingRecipient] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState({});
  const [strength, setStrength] = useState('');
  const [improvement, setImprovement] = useState('');
  const [message, setMessage] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [showNamePublicly, setShowNamePublicly] = useState(false);
  const [hoveredRating, setHoveredRating] = useState({});

  const fetchRecipient = useCallback(async () => {
    await Promise.resolve();
    setLoadingRecipient(true);
    try {
      const data = await api.getUser(id);
      setRecipient(data);
    } catch (err) {
      console.error(err);
      showToast('Could not load user details.', 'error');
    } finally {
      setLoadingRecipient(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchRecipient();
  }, [fetchRecipient]);

  const handleRatingSelect = (traitId, score) => {
    setRatings((prev) => ({
      ...prev,
      [traitId]: prev[traitId] === score ? undefined : score,
    }));
  };

  const ratedCount = Object.values(ratings).filter((v) => v !== undefined).length;
  const progressPercent = (ratedCount / TRAITS.length) * 100;
  const circumference = 2 * Math.PI * 18;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasRatings = Object.values(ratings).some((val) => val !== undefined && val !== null);
    const hasWritten = strength.trim() !== '' || improvement.trim() !== '' || message.trim() !== '';
    if (!hasRatings && !hasWritten) {
      showToast('Please fill out at least one rating or write a message.', 'error');
      return;
    }
    setSubmitLoading(true);
    try {
      await api.submitFeedback(id, {
        ratings,
        strength: strength.trim(),
        improvement: improvement.trim(),
        message: message.trim(),
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        isAnonymous: !showNamePublicly,
      });
      showToast('Feedback submitted successfully!', 'success');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loadingRecipient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold animate-pulse">Loading feedback page...</p>
      </div>
    );
  }

  if (!recipient) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-glass-lg glass mt-12 space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-md">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Invalid Recipient</h2>
          <p className="text-slate-500 text-sm mt-2">This person doesn't have a profile.</p>
        </div>
        <Link to="/" className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm text-sm">
          Go Back Home
        </Link>
      </motion.div>
    );
  }

  if (submitted) {
    return (
      <div className="relative max-w-md mx-auto mt-12">
        {/* Custom Confetti burst */}
        {CONFETTI_PARTICLES.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const xTarget = Math.cos(rad) * p.distance;
          const yTarget = Math.sin(rad) * p.distance;
          return (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: xTarget, y: yTarget, scale: 1, opacity: 0 }}
              transition={{ type: "spring", stiffness: 45, damping: 10, duration: 1.5 }}
              className="absolute left-1/2 top-24 z-50 rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
              }}
            />
          );
        })}

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center p-8 sm:p-12 bg-white rounded-3xl border border-slate-100 shadow-glass-lg glass space-y-6 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-lg border border-emerald-100"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold text-slate-800">Thank You! 🎉</h2>
            <p className="text-slate-500 text-sm">Your feedback for <strong className="text-slate-700">{recipient.name}</strong> was submitted successfully.</p>
          </div>
          
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all text-sm shadow-md btn-shimmer"
              >
                Create My Profile
              </Link>
            </motion.div>
            
            <button
              onClick={() => {
                setSubmitted(false);
                setRatings({});
                setStrength('');
                setImprovement('');
                setMessage('');
                setReviewerName('');
                setReviewerEmail('');
                setShowNamePublicly(false);
              }}
              className="text-slate-500 hover:text-slate-700 text-xs font-semibold hover:underline block mx-auto cursor-pointer"
            >
              Submit another feedback
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to={`/u/${recipient.userId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Back to Profile</span>
        </Link>
      </motion.div>

      {/* Recipient banner */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 p-4 bg-white/60 border border-slate-100 rounded-3xl glass shadow-glass"
      >
        {recipient.photo ? (
          <img src={recipient.photo} alt={recipient.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm border-2 border-white">
            {recipient.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Reviewing</span>
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">{recipient.name}</h2>
          {recipient.institution && <p className="text-slate-500 text-xs">{recipient.institution}</p>}
        </div>
        
        {/* Animated Progress Ring */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-11 h-11">
            <svg width="44" height="44" viewBox="0 0 44 44" className="transform -rotate-90">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <motion.circle
                cx="22" cy="22" r="18" fill="none"
                stroke={progressPercent === 100 ? '#10b981' : '#6366f1'}
                strokeWidth="3"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: circumference - (progressPercent / 100) * circumference }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-600">
              {ratedCount}/{TRAITS.length}
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Rated</span>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-glass-lg glass space-y-10"
      >
        {/* Ratings Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-display font-extrabold text-slate-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-100" /> Personality Ratings
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Rate 1-10 for each trait. Click to select, click again to deselect.</p>
          </div>
          <div className="divide-y divide-slate-100/80">
            {TRAITS.map((trait, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: index * 0.05 }}
                key={trait.id}
                className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="max-w-xs flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">{trait.emoji}</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{trait.label}</h4>
                    <p className="text-slate-400 text-xs mt-0.5 leading-normal">{trait.desc}</p>
                  </div>
                </div>

                {/* Rating selection with springs */}
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                    const isSelected = ratings[trait.id] === num;
                    const isHovered = (hoveredRating[trait.id] || 0) >= num;
                    const isFilled = isSelected || (ratings[trait.id] && num <= ratings[trait.id]);
                    return (
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        key={num}
                        type="button"
                        onClick={() => handleRatingSelect(trait.id, num)}
                        onMouseEnter={() => setHoveredRating((p) => ({ ...p, [trait.id]: num }))}
                        onMouseLeave={() => setHoveredRating((p) => ({ ...p, [trait.id]: 0 }))}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer transition-all duration-150 ${
                          isFilled
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200/50'
                            : isHovered
                            ? 'bg-blue-50 border border-blue-200 text-blue-600'
                            : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Written Insights */}
        <div className="space-y-6 border-t border-slate-100 pt-8">
          <div>
            <h3 className="text-xl font-display font-extrabold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-100" /> Written Insights
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Share honest thoughts. All fields optional.</p>
          </div>
          <div className="space-y-5">
            {[
              { id: 'strength', label: "What is this person's biggest strength?", value: strength, setter: setStrength, placeholder: 'e.g. Incredibly reliable, clear writing...' },
              { id: 'improvement', label: 'What should this person improve?', value: improvement, setter: setImprovement, placeholder: 'e.g. Could speak up more, delegate tasks...' },
              { id: 'message', label: 'Any honest message?', value: message, setter: setMessage, placeholder: 'Write your honest message to them...' },
            ].map(({ id, label, value, setter, placeholder }) => (
              <div key={id} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">{label}</label>
                <textarea
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-sm font-medium resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reviewer Information */}
        <div className="space-y-6 border-t border-slate-100 pt-8">
          <div>
            <h3 className="text-xl font-display font-extrabold text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" /> Reviewer Information
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Optionally share your details. Choose anonymous or public.</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="floating-input-group">
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder=" "
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl outline-none transition-all text-sm font-medium"
                />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Name (Optional)</label>
              </div>
              <div className="floating-input-group">
                <input
                  type="email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  placeholder=" "
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl outline-none transition-all text-sm font-medium"
                />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Email (Optional)</label>
              </div>
            </div>
            <label className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors select-none">
              <input type="checkbox" checked={showNamePublicly} onChange={(e) => setShowNamePublicly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <div>
                <span className="block text-sm font-bold text-slate-800">Show my name publicly</span>
                <span className="block text-slate-500 text-xs mt-0.5">If unchecked, your review appears as "Anonymous".</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitLoading}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200/40 btn-shimmer cursor-pointer ${
            submitLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {submitLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Feedback</span>
            </>
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};
