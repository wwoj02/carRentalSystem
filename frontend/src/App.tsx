import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { useAppStore } from './store/appStore';
import { userService } from './services/userService';
import { Navbar } from './components/layout/Navbar';
import { Toast } from './components/common';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Reservation } from './pages/Reservation';
import { Dashboard } from './pages/Dashboard';
import { StaffPanel } from './pages/StaffPanel';

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
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reserve/:vehicleId" element={<Reservation />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/staff" element={<StaffPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toast />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
