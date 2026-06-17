import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { VehicleList } from './pages/VehicleList';
import { VehicleDetail } from './pages/VehicleDetail';
import { BookingHistory } from './pages/BookingHistory';
import { AdminPanel } from './pages/AdminPanel';
import { NotFound } from './pages/NotFound';
import { useAppStore } from './store/appStore';
import { userService } from './services/userService';
import { useEffect } from 'react';

function App() {
  const { setCurrentUser } = useAppStore();

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = async () => {
      const user = await userService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    loadUser();
  }, [setCurrentUser]);

  return (
    <Router>
      <div id="root">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toast />
      </div>
    </Router>
  );
}

export default App;
