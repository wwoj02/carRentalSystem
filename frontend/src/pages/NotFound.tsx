import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};
