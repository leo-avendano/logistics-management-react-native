import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from '../config/firebaseConfig';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

class PushNotificationService {
  
  // 📱 Configurar el handler de notificaciones
  static configure() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  // 🔐 Solicitar permisos de notificación
  static async requestPermissions() {
    try {
      if (!Device.isDevice) {
        console.warn('❌ Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ Failed to get push token for push notification!');
        return false;
      }

      console.log('✅ Push notification permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  // 📲 Obtener y registrar token de push
  static async registerForPushNotifications(userId) {
    try {
      if (!userId) {
        console.error('❌ User ID is required for push notification registration');
        return null;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Obtener token de Expo
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      console.log('📱 Push token obtained:', token.data);

      // 🔥 Guardar token directamente en Firestore
      const pushTokenRef = doc(collection(db, 'pushTokens'), token.data);
      
      await setDoc(pushTokenRef, {
        token: token.data,
        userId: userId,
        platform: Platform.OS,
        isAuthenticated: true,
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp(),
      }, { merge: true });

      console.log('✅ Push token saved to Firestore successfully');
      console.log('📱 Token ID:', token.data);
      console.log('👤 User ID:', userId);
      console.log('📱 Platform:', Platform.OS);

      return token.data;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  // 👂 Configurar listeners de notificaciones
  static setupNotificationListeners(navigation) {
    // Listener para notificaciones recibidas mientras la app está abierta
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notification received:', notification);
      
      const data = notification.request.content.data;
      if (data.type === 'new_route') {
        console.log('🛣️ New route notification received:', data.routeId);
        // Opcional: Mostrar algún indicador visual en la UI
      }
    });

    // Listener para cuando el usuario toca la notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      
      if (data.type === 'new_route') {
        console.log('🚀 Navigating to route:', data.routeId);
        
        // 🎯 NAVEGACIÓN DIRECTA - La única que funciona en Expo Go
        setTimeout(() => {
          navigation.navigate('Routes', {
            routeId: data.routeId,
            destination: data.destination,
            packageCount: data.packageCount,
            lat: data.destinationLat,
            lon: data.destinationLon,
            fromNotification: true,
          });
        }, 100);
      }
    });

    // Retornar función de cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  // 🧹 Limpiar badge de notificaciones
  static async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log('🧹 Badge cleared');
    } catch (error) {
      console.error('❌ Error clearing badge:', error);
    }
  }

  // 🔄 Re-registrar token (útil cuando cambia el usuario)
  static async reregisterToken(newUserId) {
    try {
      console.log('🔄 Re-registering push token for new user:', newUserId);
      return await this.registerForPushNotifications(newUserId);
    } catch (error) {
      console.error('❌ Error re-registering token:', error);
      return null;
    }
  }

  // 📈 Actualizar último uso del token
  static async updateTokenLastUsed(token) {
    try {
      if (!token) return;
      
      const pushTokenRef = doc(db, 'pushTokens', token);
      await setDoc(pushTokenRef, {
        lastUsed: serverTimestamp(),
      }, { merge: true });

      console.log('📈 Token last used updated');
    } catch (error) {
      console.error('❌ Error updating token last used:', error);
    }
  }

  // 📋 Obtener tokens de usuarios autenticados (para el backend)
  static async getAuthenticatedTokens() {
    try {
      const { getDocs, query, where } = await import('firebase/firestore');
      
      const tokensQuery = query(
        collection(db, 'pushTokens'),
        where('isAuthenticated', '==', true)
      );
      
      const querySnapshot = await getDocs(tokensQuery);
      const tokens = [];
      
      querySnapshot.forEach((doc) => {
        tokens.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('📋 Found', tokens.length, 'authenticated tokens');
      return tokens;
    } catch (error) {
      console.error('❌ Error getting authenticated tokens:', error);
      return [];
    }
  }

  // 🧪 Método para testing local (opcional)
  static async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Local 🧪",
          body: 'Notificación local de prueba',
          data: { 
            type: 'new_route',
            routeId: 'LOCAL_TEST_' + Date.now(),
            destination: 'Test Local',
            packageCount: '1'
          },
          sound: 'default',
        },
        trigger: { seconds: 3 },
      });
      console.log('🧪 Test notification scheduled (3s)');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  }


}

export default PushNotificationService; 