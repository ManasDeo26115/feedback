import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Image, Check, Briefcase, School, HelpCircle, MapPin, Users, MessageSquare, BarChart2, Zap } from 'lucide-react';
import { api } from '../utils/api';
import { useIdentity } from '../hooks/useIdentity';
import { useToast } from '../hooks/useToast';
import { SearchBar } from '../components/SearchBar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
};

export const Home = () => {
  const navigate = useNavigate();
  const { saveIdentity } = useIdentity();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    name: '', hobby: '', city: '', college: '', school: '', company: '', gender: '', howUseful: '', photo: ''
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const processPhoto = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result }));
      setPhotoPreview(reader.result);
      showToast('Photo uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e) => processPhoto(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hobby.trim()) {
      showToast('Name and Hobby are required!', 'error');
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }
    setLoading(true);
    try {
      const createdUser = await api.createUser(formData);
      saveIdentity(createdUser.userId, createdUser.name);
      showToast('Profile created successfully!', 'success');
      navigate(`/u/${createdUser.userId}`);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start min-h-[calc(100vh-10rem)]"
    >
      {/* Left Column: Hero & Search */}
      <div className="lg:col-span-5 flex flex-col justify-center space-y-8 text-center lg:text-left lg:sticky lg:top-24">
        
        <motion.div variants={itemVariants} className="space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0 border border-blue-100/50 animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" />
            Social Feedback & Insights
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-display font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            How do others <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
              really perceive you?
            </span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium max-w-md mx-auto lg:mx-0">
            Create your profile, share a unique feedback link, and gather honest ratings and reviews. Join your campus board!
          </p>
        </motion.div>

        {/* Live Stats */}
        {stats && (
          <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{stats.totalUsers || 0}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-center">
                <Users className="w-3 h-3" /> Profiles
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{stats.totalFeedbacks || 0}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-center">
                <MessageSquare className="w-3 h-3" /> Reviews
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{stats.avgScore ? stats.avgScore.toFixed(1) : '—'}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-center">
                <BarChart2 className="w-3 h-3" /> Avg Score
              </div>
            </div>
          </motion.div>
        )}

        {/* Feature Pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center lg:justify-start">
          {[
            { icon: Zap, text: 'Instant Profiles' },
            { icon: MessageSquare, text: 'Anonymous Reviews' },
            { icon: BarChart2, text: 'Rich Analytics' },
          ].map(({ icon: Icon, text }) => (
            <motion.span
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-100 text-xs font-semibold text-slate-600 shadow-sm cursor-default hover:shadow-md transition-shadow"
            >
              <Icon className="w-3.5 h-3.5 text-slate-400" />
              {text}
            </motion.span>
          ))}
        </motion.div>

        {/* Quick Search */}
        <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-white/70 border border-slate-100 shadow-glass glass">
          <h3 className="text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wider">
            Find or Rate Someone
          </h3>
          <p className="text-slate-500 text-xs mb-4">
            Paste a profile URL, feedback URL, or enter an 8-character User ID.
          </p>
          <SearchBar />
        </motion.div>
      </div>

      {/* Right Column: Profile Form */}
      <motion.div variants={itemVariants} className="lg:col-span-7">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-glass-lg glass relative overflow-hidden">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200/50">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-slate-800 leading-none">Create Your Mirror Profile</h2>
              <p className="text-slate-500 text-sm mt-1">Get your unique sharing links instantly.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Required Fields */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${shouldShake ? 'animate-shake' : ''}`}>
              <div className="floating-input-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium"
                  required
                />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Name <span className="text-rose-500">*</span>
                </label>
              </div>

              <div className="floating-input-group">
                <input
                  type="text"
                  name="hobby"
                  value={formData.hobby}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium"
                  required
                />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Primary Hobby <span className="text-rose-500">*</span>
                </label>
              </div>
            </div>

            {/* Photo & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Profile Photo</label>
                <motion.div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed transition-all ${
                    dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 rounded-xl cursor-pointer transition-all text-xs font-bold text-slate-700 bg-white shrink-0 shadow-sm">
                    <Image className="w-4 h-4 text-slate-400" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  {photoPreview ? (
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={photoPreview}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">or drag & drop</span>
                  )}
                </motion.div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium text-slate-700"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Optional Work & Education */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                Work & Education (Optional)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="floating-input-group">
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium"
                  />
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <School className="w-3.5 h-3.5 text-slate-400 shrink-0" /> College
                  </label>
                </div>

                <div className="floating-input-group">
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium"
                  />
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <School className="w-3.5 h-3.5 text-slate-400 shrink-0" /> School
                  </label>
                </div>

                <div className="floating-input-group">
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium"
                  />
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Company
                  </label>
                </div>
              </div>
            </div>

            {/* Bio Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="floating-input-group">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium"
                />
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> City
                </label>
              </div>

              <div className="floating-input-group">
                <input
                  type="text"
                  name="howUseful"
                  value={formData.howUseful}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all text-sm font-medium"
                />
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" /> How I Am Useful
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200/40 btn-shimmer cursor-pointer ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Generate My Mirror Profile</span>
                </>
              )}
            </motion.button>

          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
