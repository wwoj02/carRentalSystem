import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">🚗</span>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            CAR<span className="text-indigo-600">RENTAL</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider">
            Home
          </Link>
          <Link to="/vehicles" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider">
            Fleet
          </Link>

          {currentUser && (
            <>
              <Link to="/bookings" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider">
                My Trips
              </Link>
              <Link to="/admin" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider">
                Admin
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-none">
                  {currentUser.firstName}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  Customer
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={handleLogout} className="h-9 px-4">
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="md" className="h-11 px-6">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
