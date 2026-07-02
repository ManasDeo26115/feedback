import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Shield, Award, Users, ArrowRight, ArrowLeft, BarChart2, Star, Calendar, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { RadarChart } from '../components/RadarChart';
import { PremiumTextReveal } from '../components/PremiumTextReveal';

const TRAITS_METADATA = {
  communication: { label: 'Communication', color: 'from-blue-500 to-indigo-500', short: 'Comm' },
  confidence: { label: 'Confidence', color: 'from-indigo-500 to-purple-500', short: 'Conf' },
  leadership: { label: 'Leadership', color: 'from-purple-500 to-pink-500', short: 'Lead' },
  teamwork: { label: 'Teamwork', color: 'from-pink-500 to-rose-500', short: 'Team' },
  helpfulness: { label: 'Helpfulness', color: 'from-rose-500 to-orange-500', short: 'Help' },
  creativity: { label: 'Creativity', color: 'from-orange-500 to-amber-500', short: 'Creat' },
  emotionalIntelligence: { label: 'Emotional IQ', color: 'from-amber-500 to-yellow-500', short: 'EQ' },
  reliability: { label: 'Reliability', color: 'from-teal-500 to-emerald-500', short: 'Rely' },
  problemSolving: { label: 'Problem Solving', color: 'from-emerald-500 to-blue-500', short: 'Solve' },
  attitude: { label: 'Attitude', color: 'from-blue-600 to-teal-500', short: 'Attd' },
};

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

const CountUp = ({ end, decimals = 1, duration = 1000 }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{value.toFixed(decimals)}</span>;
};

export const Dashboard = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const fetchData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError('');
    try {
      const [userData, feedbackData] = await Promise.all([api.getUser(id), api.getFeedback(id)]);
      setUser(userData);
      setFeedbacks(feedbackData);
      setTimeout(() => setShouldAnimate(true), 200);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-28 w-full skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 skeleton" />
          <div className="lg:col-span-5 h-96 skeleton" />
        </div>
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
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-md">
          <BarChart2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Dashboard Unavailable</h2>
          <p className="text-slate-500 text-sm mt-2">{error || 'This user profile does not exist.'}</p>
        </div>
        <Link to="/" className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm text-sm">
          Go Back Home
        </Link>
      </motion.div>
    );
  }

  // --- ANALYTICS ---
  const totalReviews = feedbacks.length;
  const categorySums = {};
  const categoryCounts = {};
  Object.keys(TRAITS_METADATA).forEach((key) => {
    categorySums[key] = 0;
    categoryCounts[key] = 0;
  });

  let totalRatingSum = 0, totalRatingCount = 0, anonymousCount = 0, namedCount = 0;

  feedbacks.forEach((fb) => {
    if (fb.isAnonymous) anonymousCount++; else namedCount++;
    if (fb.ratings) {
      Object.keys(TRAITS_METADATA).forEach((key) => {
        const rating = fb.ratings[key];
        if (rating !== undefined && rating !== null) {
          categorySums[key] += rating;
          categoryCounts[key]++;
          totalRatingSum += rating;
          totalRatingCount++;
        }
      });
    }
  });

  const traitAverages = Object.keys(TRAITS_METADATA).map((key) => {
    const count = categoryCounts[key];
    return {
      key,
      label: TRAITS_METADATA[key].label,
      short: TRAITS_METADATA[key].short,
      color: TRAITS_METADATA[key].color,
      average: count > 0 ? categorySums[key] / count : 0,
      count
    };
  });

  const overallScore = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;
  const topTraits = [...traitAverages].filter((t) => t.count > 0).sort((a, b) => b.average - a.average).slice(0, 3);
  const writtenReviews = feedbacks.filter((fb) => fb.strength || fb.improvement || fb.message);

  // Radar chart data
  const radarData = traitAverages.map((t) => ({ label: t.short, value: t.average }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Back nav */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to={`/u/${user.userId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Back to {user.name}'s Profile</span>
        </Link>
        {user.institution && (
          <Link to={`/spitout/${user.institution.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
            Visit {user.institution} board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </motion.div>

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-glass-lg glass flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left"
      >
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Analytics</span>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 mt-1 leading-none">Personality Mirror Dashboard</h1>
          <p className="text-slate-500 text-sm mt-2">Real-time aggregate feedback for <strong className="text-slate-700">{user.name}</strong>.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            to={`/feedback/${user.userId}`}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center gap-1.5 btn-shimmer"
          >
            <Star className="w-4 h-4 text-white fill-white" /><span>Leave Feedback</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Overall Score', value: overallScore > 0 ? <CountUp end={overallScore} decimals={1} /> : '0.0', suffix: '/ 10', desc: 'From all rating values.', glow: 'bg-blue-500/5' },
          { label: 'Total Reviews', value: <CountUp end={totalReviews} decimals={0} />, desc: 'Responses received.', glow: 'bg-purple-500/5' },
          { label: 'Anonymity Ratio', custom: true, desc: 'Anon vs. public reviews.', glow: 'bg-teal-500/5' },
          { label: 'Top Trait', value: topTraits.length > 0 ? topTraits[0].label : 'None', subValue: topTraits.length > 0 ? `${topTraits[0].average.toFixed(1)} / 10` : '', desc: 'Your strongest attribute.', glow: 'bg-amber-500/5' },
        ].map((card, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white border border-slate-100 p-6 rounded-3xl shadow-glass glass flex flex-col justify-between relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-28 h-28 ${card.glow} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-750`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none relative z-10">{card.label}</span>
            <div className="mt-4 relative z-10">
              {card.custom ? (
                <div className="flex items-center gap-3">
                  <div><span className="text-2xl font-black text-slate-800">{anonymousCount}</span><span className="text-slate-400 text-xs font-semibold block">Anon</span></div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div><span className="text-2xl font-black text-slate-800">{namedCount}</span><span className="text-slate-400 text-xs font-semibold block">Public</span></div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 leading-none animate-number-pop">{card.value}</span>
                    {card.suffix && <span className="text-slate-400 text-sm font-semibold">{card.suffix}</span>}
                  </div>
                  {card.subValue && <span className="text-blue-600 font-extrabold text-sm mt-1 inline-block">{card.subValue}</span>}
                </>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-3 leading-normal relative z-10">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Averages */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-glass glass space-y-6"
        >
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" /> Category Averages
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">Detailed breakdown for all 10 personality traits.</p>
          </div>
          <div className="space-y-4">
            {traitAverages.map((trait, i) => (
              <div key={trait.key} className="space-y-1.5 group">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 group-hover:text-blue-600 transition-colors duration-200">{trait.label}</span>
                  <span className="text-slate-500">{trait.count > 0 ? `${trait.average.toFixed(1)} / 10 (${trait.count})` : 'No ratings'}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: shouldAnimate && trait.count > 0 ? `${trait.average * 10}%` : '0%' }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: i * 0.05 }}
                    className={`h-full bg-gradient-to-r ${trait.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right sidebar */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radar Chart */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-glass glass">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Personality Radar
            </h3>
            {traitAverages.some((t) => t.count > 0) ? (
              <RadarChart data={radarData} />
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm font-semibold">No data yet for radar chart.</div>
            )}
          </motion.div>

          {/* Top 3 */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-glass glass space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Top 3 Traits</h3>
              <p className="text-slate-500 text-xs">Your strongest social attributes.</p>
            </div>
            {topTraits.length > 0 ? (
              <div className="space-y-3">
                {topTraits.map((trait, idx) => (
                  <motion.div
                    whileHover={{ x: 4 }}
                    key={trait.key}
                    className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-colors hover:border-slate-200"
                  >
                    <div className={`w-8 h-8 rounded-xl font-extrabold text-sm flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors duration-250">{trait.label}</span>
                      <span className="text-slate-400 text-xs">{trait.count} reviews</span>
                    </div>
                    <div className="text-slate-900 font-extrabold text-sm shrink-0">{trait.average.toFixed(1)}</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm font-semibold">No ratings yet.</div>
            )}
          </motion.div>

          {/* Privacy card */}
          <motion.div variants={itemVariants} className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <h4 className="font-extrabold text-lg flex items-center gap-1.5"><Shield className="w-5 h-5 animate-pulse-subtle" /> Anonymity Protected</h4>
            <p className="text-blue-100 text-xs leading-relaxed">Unless the reviewer opts in, all individual ratings and comments display anonymously.</p>
            <div className="h-px bg-white/20" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/feedback/${user.userId}`);
                showToast('Feedback link copied!', 'success');
              }}
              className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors text-xs shadow-sm cursor-pointer"
            >
              Copy Feedback Link to Share
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Written Feedback */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-100 p-6 sm:p-10 rounded-3xl shadow-glass glass space-y-6"
      >
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" /> Written Feedback & Reviews ({writtenReviews.length})</h3>
          <p className="text-slate-500 text-xs sm:text-sm">Personal messages, strengths, and improvement areas.</p>
        </div>
        {writtenReviews.length > 0 ? (
          <div className="space-y-5">
            {writtenReviews.map((review, idx) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 25, delay: idx * 0.06 }}
                whileHover={{ y: -2 }}
                className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 transition-all hover:border-slate-200"
              >
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span className="text-slate-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {review.isAnonymous ? 'Anonymous Reviewer' : review.reviewerName || 'Named Reviewer'}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                  {review.strength && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest">Biggest Strength</span>
                      <PremiumTextReveal className="text-slate-700 text-sm font-medium leading-relaxed">
                        "{review.strength}"
                      </PremiumTextReveal>
                    </div>
                  )}
                  {review.improvement && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black text-amber-500 uppercase tracking-widest">Areas to Improve</span>
                      <PremiumTextReveal className="text-slate-700 text-sm font-medium leading-relaxed">
                        "{review.improvement}"
                      </PremiumTextReveal>
                    </div>
                  )}
                  {review.message && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black text-blue-500 uppercase tracking-widest">Honest Message</span>
                      <PremiumTextReveal className="text-slate-700 text-sm font-medium leading-relaxed">
                        "{review.message}"
                      </PremiumTextReveal>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm font-semibold bg-slate-50/30 rounded-3xl border border-slate-100">
            No written reviews received yet.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
