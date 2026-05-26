import React from 'react';

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  className?: string;
}

export const DifficultyBadge = ({ difficulty, className = '' }: DifficultyBadgeProps) => {
  const styles = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5'
  }[difficulty];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-inner ${styles} ${className}`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
