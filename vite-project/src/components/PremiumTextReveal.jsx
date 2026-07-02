import { motion } from 'framer-motion';

export const PremiumTextReveal = ({ children, delay = 0, className = "", origin = "left" }) => {
  const originX = origin === "center" ? 0.5 : 0;
  const originY = origin === "center" ? 0.5 : 0;

  return (
    <motion.div
      initial={{ scale: 3, opacity: 0, y: -30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 85,
        damping: 17,
        delay: delay,
      }}
      style={{ originX, originY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
export default PremiumTextReveal;
