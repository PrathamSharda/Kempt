
import { motion } from 'framer-motion';

export default function Transition({ children }) {
  return (
    <motion.div
      className='slide-in'
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] // Material Design easing
      }}

    >
      {children}
    </motion.div>
  );
}