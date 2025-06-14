import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  hover = false, 
  clickable = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-card border border-gray-100';
  const hoverClasses = hover ? 'hover:shadow-hover transition-shadow duration-200' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  const MotionCard = clickable || hover ? motion.div : 'div';
  const motionProps = (clickable || hover) ? {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <MotionCard
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionCard>
  );
};

export default Card;