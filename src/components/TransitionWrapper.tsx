import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TransitionWrapperProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  duration?: number;
}

const animations = {
  'slide-up': {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: -100 },
    exit: { opacity: 0, y: 100 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  // ... other animations
};

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  className,
  animation = 'fade',
  duration = 300,
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Reset animation on route change
  useEffect(() => {
    setIsVisible(false);
    
    // Small delay to ensure exit animation is complete
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'slide-left':
        return 'animate-slide-in-left';
      case 'slide-right':
        return 'animate-slide-in-right';
      case 'scale':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div 
      className={cn(
        'transition-all w-full',
        getAnimationClass(),
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default TransitionWrapper;
