'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface LoaderProps {
  progress?: number;
  message?: string;
  className?: string;
}

export const Loader = ({ progress = 0, message = 'Processing queue...', className = '' }: LoaderProps) => {
  return (
    <div className={`absolute inset-0 bg-zinc-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 z-30 ${className}`}>
      
      {/* Circular Progress Loader Dial */}
      <div className="relative h-36 w-36 flex items-center justify-center mb-6">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="60"
            className="stroke-zinc-800"
            strokeWidth="6"
            fill="transparent"
          />
          <motion.circle
            cx="72"
            cy="72"
            r="60"
            className="stroke-indigo-500"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
            strokeLinecap="round"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Core Icon & Percentage */}
        <div className="flex flex-col items-center">
          <Brain size={22} className="text-indigo-400 animate-pulse mb-1" />
          <span className="text-2xl font-black text-white tracking-tight leading-none">
            {progress}%
          </span>
        </div>
      </div>

      <div className="max-w-xs text-center">
        <p className="text-zinc-200 text-xs font-bold tracking-wide animate-pulse">
          {message}
        </p>
        <p className="text-[10px] text-zinc-500 font-medium mt-2 leading-relaxed">
          The AI queue worker is structuring your assignment paper and assembling PDF files.
        </p>
      </div>
    </div>
  );
};

export default Loader;
