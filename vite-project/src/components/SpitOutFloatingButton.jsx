import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, X } from 'lucide-react';
import { api } from '../utils/api';

export const SpitOutFloatingButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [orgInput, setOrgInput] = useState('');
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    const fetchLocalUser = async () => {
      const savedId = localStorage.getItem('pm_user_id');
      if (savedId) {
        try {
          const user = await api.getUser(savedId);
          setLocalUser(user);
        } catch (e) {
          console.error('Failed to load local user for floating button', e);
        }
      }
    };
    fetchLocalUser();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orgInput.trim()) return;
    const cleanOrg = orgInput.trim().toLowerCase().replace(/\s+/g, '-');
    navigate(`/spitout/${cleanOrg}`);
    setIsOpen(false);
    setOrgInput('');
  };

  const handleDirectClick = () => {
    // If user has a saved organization, go straight there. Otherwise open search modal.
    if (localUser && localUser.institution) {
      const cleanOrg = localUser.institution.toLowerCase().replace(/\s+/g, '-');
      navigate(`/spitout/${cleanOrg}`);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleDirectClick}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto"
        aria-label="SPIT OUT ZONE"
      >
        <MessageSquare className="w-6 h-6 animate-pulse-subtle" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm tracking-wide uppercase whitespace-nowrap">
          {localUser?.institution ? `Spit Out (${localUser.institution})` : 'Spit Out Zone'}
        </span>
      </button>

      {/* Spit Out Navigation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Spit Out Zone
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">
              Enter your school, college, or company name to join the discussion board.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                placeholder="e.g. MIT, Google, SPIT"
                className="flex-1 px-4 py-2 text-sm border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-400"
                required
                autoFocus
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
