'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, icon, children, ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
    
    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25',
      secondary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/25',
      outline: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white',
      ghost: 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white',
      glass: 'glass-card text-white hover:border-indigo-500/30 hover:bg-indigo-500/10'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base'
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as any)}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
