import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className,
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{label}</label>}
      <input
        className={`
          w-full px-4 py-2.5 bg-white border rounded-xl transition-all duration-200
          ${error 
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' 
            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
          }
          focus:outline-none focus:ring-4
          placeholder:text-slate-400
          ${className || ''}
        `}
        {...props}
      />
      {error && <p className="text-rose-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
      {helperText && !error && <p className="text-slate-500 text-xs mt-1.5 ml-1">{helperText}</p>}
    </div>
  );
};
