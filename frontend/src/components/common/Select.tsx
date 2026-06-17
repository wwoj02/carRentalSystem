import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = true,
  className,
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{label}</label>}
      <select
        className={`
          w-full px-4 py-2.5 bg-white border rounded-xl transition-all duration-200
          ${error 
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' 
            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
          }
          focus:outline-none focus:ring-4
          appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]
          ${className || ''}
        `}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-rose-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
    </div>
  );
};
