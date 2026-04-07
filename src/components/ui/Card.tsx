import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card = memo(({ 
  children, 
  className = '', 
  onClick,
  hoverEffect = true 
}: CardProps) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        card
        ${!hoverEffect ? '!transform-none !shadow-none !border-white/[0.08]' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export const CardHeader = memo(({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 lg:p-6 pb-2 lg:pb-3 border-b border-border-dark/50 ${className}`}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = memo(({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-text-primary leading-none tracking-tight flex items-center gap-2 ${className}`}>
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

export const CardContent = memo(({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 lg:p-6 ${className}`}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

export default Card;
