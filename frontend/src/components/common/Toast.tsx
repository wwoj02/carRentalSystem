import { useEffect } from 'react';
import { Notification, Box } from '@mantine/core';
import { useAppStore } from '../../store/appStore';

const colorMap = { success: 'green', error: 'red', info: 'gray' } as const;

// Global toast notification, driven by the app store (no native alert()).
export const Toast = () => {
  const { showNotification, notificationMessage, notificationType, hideNotify } = useAppStore();

  useEffect(() => {
    if (!showNotification) return;
    const t = setTimeout(hideNotify, 4000);
    return () => clearTimeout(t);
  }, [showNotification, notificationMessage, hideNotify]);

  if (!showNotification) return null;

  return (
    <Box style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, maxWidth: 360 }}>
      <Notification color={colorMap[notificationType]} onClose={hideNotify} withBorder>
        {notificationMessage}
      </Notification>
    </Box>
  );
};
