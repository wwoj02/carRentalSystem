import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
};

export const SkeletonLoader: React.FC<{ height?: string; width?: string }> = ({
  height = 'h-4',
  width = 'w-full',
}) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />
);

export const LoadingPage: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Spinner size="lg" />
  </div>
);
