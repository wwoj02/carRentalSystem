import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 ${
        onClick 
          ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' 
          : 'hover:shadow-md'
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => (
  <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
    <div>
      <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '', noPadding = false }) => (
  <div className={`${noPadding ? '' : 'p-6'} ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50/50 rounded-b-2xl border-t border-gray-50 flex gap-3 justify-end items-center ${className}`}>{children}</div>
);
