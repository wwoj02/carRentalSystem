import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/index';
import { LoginForm } from '../components/forms/LoginForm';
import { userService } from '../services/userService';
import { useAppStore } from '../store/appStore';
import type { CreateUserRequest } from '../types/User';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setCurrentUser, showNotify } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (data: CreateUserRequest) => {
    setLoading(true);
    try {
      const user = await userService.createUser(data);
      setCurrentUser(user);
      showNotify(`Welcome back, ${user.firstName}!`, 'success');
      navigate('/vehicles');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to authenticate';
      showNotify(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-100 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-xl border-none shadow-2xl relative z-10 overflow-hidden bg-white/70 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full p-8 md:p-12">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Access Your Account</h2>
              <p className="text-slate-500">Sign in to manage your bookings and explore our premium fleet.</p>
            </div>
            <LoginForm onSubmit={handleLogin} loading={loading} />
          </div>
        </div>
      </Card>
    </div>
  );
};
