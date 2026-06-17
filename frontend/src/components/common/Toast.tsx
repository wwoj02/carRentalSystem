import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

export const Toast: React.FC = () => {
  const { showNotification, notificationMessage, notificationType, hideNotify } = useAppStore();

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(hideNotify, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, hideNotify]);

  if (!showNotification) return null;

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`px-6 py-3 rounded-lg shadow-lg ${typeClasses[notificationType]}`}>
        {notificationMessage}
      </div>
    </div>
  );
};
