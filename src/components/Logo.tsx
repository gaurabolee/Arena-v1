import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  angle?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 40,
  angle = 135 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-center", 
        className
      )}
      aria-label="Arena Logo"
      style={{
        transform: `rotate(${angle}deg)`,
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      <div 
        className="bg-white border border-black rounded-full" 
        style={{ 
          width: size / 2, 
          height: size / 2
        }} 
      />
      <div 
        className="bg-black rounded-full -ml-[1px] dark:border dark:border-white" 
        style={{ 
          width: size / 2, 
          height: size / 2
        }} 
      />
    </div>
  );
};

export default Logo;
