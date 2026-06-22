import { useEffect, useMemo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { useAppStore } from './store/appStore';
import { userService } from './services/userService';
import type { User } from './types/User';
import { Navbar } from './components/layout/Navbar';
import { Toast } from './components/common';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Reservation } from './pages/Reservation';
import { Dashboard } from './pages/Dashboard';
import { StaffPanel } from './pages/StaffPanel';
import { Privacy } from './pages/Privacy';
import { Footer } from './components/layout/Footer';

function useStoredUser(): User | null {
  const { currentUser } = useAppStore();
  return useMemo((): User | null => {
    if (currentUser) return currentUser;
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }, [currentUser]);
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useStoredUser();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function ProtectedStaffRoute({ children }: { children: ReactNode }) {
  const user = useStoredUser();

  if (!user || user.role === 'CUSTOMER') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { setCurrentUser } = useAppStore();

  useEffect(() => {
    // Restore the "logged-in" user from localStorage on mount.
    const loadUser = async () => {
      const user = await userService.getCurrentUser();
      if (user) setCurrentUser(user);
    };
    loadUser();
  }, [setCurrentUser]);

  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/reserve/:vehicleId"
              element={
                <ProtectedRoute>
                  <Reservation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedStaffRoute>
                  <StaffPanel />
                </ProtectedStaffRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toast />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
