import { create } from 'zustand';
import type { User } from '../types/User';
import type { Vehicle } from '../types/Vehicle';

interface AppStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  showNotification: boolean;
  notificationMessage: string;
  notificationType: 'success' | 'error' | 'info';
  showNotify: (message: string, type: 'success' | 'error' | 'info') => void;
  hideNotify: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  selectedVehicle: null,
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  showNotification: false,
  notificationMessage: '',
  notificationType: 'info',
  showNotify: (message, type) => set({ 
    showNotification: true, 
    notificationMessage: message, 
    notificationType: type 
  }),
  hideNotify: () => set({ showNotification: false }),
}));
