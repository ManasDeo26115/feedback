import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Navbar } from './Navbar';
import { SpitOutFloatingButton } from './SpitOutFloatingButton';

export const Layout = ({ children }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 22 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Offset by half of the orb width/height (200px / 2 = 100)
      mouseX.set(e.clientX - 100);
      mouseY.set(e.clientY - 100);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh relative overflow-x-hidden">
      {/* Animated Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Mouse follow orb */}
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full bg-blue-500/[0.04] blur-[80px] bg-orb"
          style={{
            x: springX,
            y: springY,
          }}
        />
        
        {/* Ambient static floating orbs */}
        <div className="absolute top-[-8%] left-[-6%] w-[500px] h-[500px] rounded-full bg-blue-400/[0.04] blur-[100px] animate-float-slow" />
        <div className="absolute top-[20%] right-[-8%] w-[450px] h-[450px] rounded-full bg-purple-400/[0.035] blur-[110px] animate-float-medium" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-pink-400/[0.03] blur-[120px] animate-float-slow" style={{ animationDelay: '-5s' }} />
        <div className="absolute bottom-[10%] right-[15%] w-[350px] h-[350px] rounded-full bg-emerald-400/[0.025] blur-[90px] animate-float-medium" style={{ animationDelay: '-8s' }} />
      </div>

      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/40 bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-500 tracking-wide">Personality Mirror</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Built with ❤️ — Honest feedback, anonymous insights.
          </p>
        </div>
      </footer>

      <SpitOutFloatingButton />
    </div>
  );
};
