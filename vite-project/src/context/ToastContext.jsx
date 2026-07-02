import { useState, useCallback, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastContext } from './ToastContextObject';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    // Mark toast as exiting for animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    }, 300);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Auto-remove after 4 seconds
    timersRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const typeStyles = {
    success: 'border-emerald-100 bg-white',
    error: 'border-rose-100 bg-white',
    info: 'border-blue-100 bg-white',
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex flex-col rounded-2xl border shadow-glass-lg overflow-hidden transition-all duration-300 ${
              toast.exiting ? 'animate-toast-out' : 'animate-toast-in'
            } ${typeStyles[toast.type] || typeStyles.info}`}
            role="alert"
          >
            <div className="flex items-center justify-between p-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {toast.type === 'success' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Info className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                )}
                <p className="text-sm font-semibold text-slate-700 truncate">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-300 hover:text-slate-500 transition-colors p-1 rounded-lg hover:bg-slate-50 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress bar */}
            {!toast.exiting && (
              <div className="h-[3px] w-full bg-slate-50">
                <div
                  className={`h-full ${progressColors[toast.type] || progressColors.info} animate-toast-progress rounded-full`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
