import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface RollingNumberProps {
  value: number;
  className?: string;
}

const RollingNumber: React.FC<RollingNumberProps> = ({ value, className }) => {
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const display = useTransform(springValue, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return (
    <motion.span 
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {display}
    </motion.span>
  );
};

export default RollingNumber;
