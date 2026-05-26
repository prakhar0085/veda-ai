import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-300 tracking-wide">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={`w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm text-white placeholder-zinc-500 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none ${
              icon ? 'pl-11' : ''
            } ${
              error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : ''
            } ${className}`}
            {...props}
          />
        </div>
        
        {error && (
          <span className="text-[11px] font-medium text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
