import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantClasses = {
  primary: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-700/10',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-700/10',
  info: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-700/10',
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', className = '' }) => {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  );
};
