import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
  icon?: React.ReactNode;
  hint?: string;
}

export const InputField = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputFieldProps>(
  ({ className = '', label, error, multiline = false, rows = 3, icon, hint, type = 'text', ...props }, ref) => {
    const inputStyle = `w-full bg-zinc-950/60 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none ${
      icon ? 'pl-11' : ''
    } ${
      error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : ''
    }`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-bold text-zinc-300 tracking-wide">
            {label}
          </label>
          {hint && (
            <span className="text-[10px] text-zinc-500 font-medium">
              {hint}
            </span>
          )}
        </div>
        
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-zinc-500 pointer-events-none">
              {icon}
            </div>
          )}
          
          {multiline ? (
            <textarea
              ref={ref as any}
              rows={rows}
              className={`${inputStyle} resize-none ${className}`}
              {...(props as any)}
            />
          ) : (
            <input
              ref={ref as any}
              type={type}
              className={`${inputStyle} ${className}`}
              {...props}
            />
          )}
        </div>
        
        {error && (
          <span className="text-[11px] font-medium text-red-400 px-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
export default InputField;
