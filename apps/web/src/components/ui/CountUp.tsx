import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  formatFn?: (val: number) => string;
  className?: string;
}

const CountUp = React.memo(({
  value,
  duration = 1.5,
  formatFn,
  className = '',
}: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  const displayValue = useTransform(springValue, (latest) => {
    return formatFn ? formatFn(latest) : Math.round(latest).toLocaleString();
  });

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
});

CountUp.displayName = 'CountUp';

export default CountUp;
