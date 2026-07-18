import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0d2d6e 0%, #1a6fd4 50%, #16a34a 100%)",
      }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${120 + i * 80}px`,
              height: `${120 + i * 80}px`,
              border: "1px solid rgba(255,255,255,0.1)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* Logo area */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Medical cross logo */}
        <motion.div
          className="relative"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(20px)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="20" y="4" width="16" height="48" rx="6" fill="white" />
              <rect x="4" y="20" width="48" height="16" rx="6" fill="white" />
            </svg>
          </div>
        </motion.div>

        <div className="text-center">
          <motion.h1
            className="text-5xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "-0.02em" }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            MedCare
          </motion.h1>
          <motion.p
            className="text-white/70 mt-2 tracking-widest uppercase text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Your Health, Our Priority
          </motion.p>
        </div>

        {/* Progress bar */}
        <motion.div
          className="w-64 h-1 rounded-full overflow-hidden mt-4"
          style={{ background: "rgba(255,255,255,0.2)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #ffffff, #a3e635)", width: `${progress}%`, transition: "width 0.1s linear" }}
          />
        </motion.div>

        <motion.p
          className="text-white/60 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Loading {progress}%
        </motion.p>
      </motion.div>

      {/* Bottom tagline */}
      <motion.div
        className="absolute bottom-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/50 text-xs">Powered by MedCare Technologies</p>
      </motion.div>
    </motion.div>
  );
}
