import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import PushNotificationService from '../services/PushNotificationService';

export const usePushNotifications = (navigation, user) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [error, setError] = useState(null);
  const appState = useRef(AppState.currentState);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!user?.uid || !navigation) {
      console.log('⏸️ Push notifications: Waiting for user or navigation...');
      return;
    }

    console.log('🚀 Setting up push notifications for user:', user.uid);

    // Configurar notificaciones
    PushNotificationService.configure();

    // Registrar para notificaciones
    const registerToken = async () => {
      try {
        setError(null);
        const token = await PushNotificationService.registerForPushNotifications(user.uid);
        if (token) {
          setPushToken(token);
          setIsRegistered(true);
          console.log('✅ Push notifications setup complete');
        } else {
          setError('Failed to register push token');
          console.warn('⚠️ Push token registration failed');
        }
      } catch (err) {
        setError(err.message);
        console.error('❌ Push notifications setup error:', err);
      }
    };

    registerToken();

    // Configurar listeners
    cleanupRef.current = PushNotificationService.setupNotificationListeners(navigation);

    // Listener para cambios de estado de la app
    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App volvió al foreground, limpiar badge
        console.log('📱 App returned to foreground, clearing badge');
        PushNotificationService.clearBadge();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up push notifications');
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      subscription?.remove();
    };
  }, [user?.uid, navigation]);

  // Re-register token if user changes
  useEffect(() => {
    if (user?.uid && isRegistered && pushToken) {
      console.log('🔄 User changed, re-registering push token');
      const reregister = async () => {
        const newToken = await PushNotificationService.reregisterToken(user.uid);
        if (newToken) {
          setPushToken(newToken);
        }
      };
      reregister();
    }
  }, [user?.uid]);

  // Method to manually test notifications
  const sendTestNotification = () => {
    PushNotificationService.sendTestNotification();
  };

  return {
    isRegistered,
    pushToken,
    error,
    sendTestNotification,
  };
}; 