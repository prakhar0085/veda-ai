import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-300 tracking-wide">
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          className={`w-full bg-zinc-950/60 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm text-zinc-300 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer appearance-none ${
            error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25rem',
            backgroundRepeat: 'no-repeat'
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        
        {error && (
          <span className="text-[11px] font-medium text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
