import PushNotificationService from './PushNotificationService';

export class NotificationSender {
  static EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

  static async sendRouteNotification(routeData) {
    try {
      const tokens = await PushNotificationService.getAuthenticatedTokens();
      
      if (tokens.length === 0) {
        console.warn('⚠️ No tokens found');
        return { success: false, message: 'No tokens' };
      }

      const messages = tokens.map(tokenData => ({
        to: tokenData.token,
        sound: 'default',
        title: 'Nueva Ruta Disponible',
        body: `Ruta a ${routeData.destination} con ${routeData.packageCount} paquetes`,
        data: {
          type: 'new_route',
          routeId: routeData.routeId,
          destination: routeData.destination,
          packageCount: routeData.packageCount,
          destinationLat: routeData.destinationLat || '-34.6037',
          destinationLon: routeData.destinationLon || '-58.3816'
        },
        badge: 1,
      }));

      const response = await fetch(this.EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Notifications sent:', result);
        return { success: true, sentTo: messages.length };
      } else {
        console.error('❌ Failed:', result);
        return { success: false, error: result };
      }

    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendTestNotification() {
    return await this.sendRouteNotification({
      routeId: 'TEST_' + Date.now(),
      destination: 'Buenos Aires',
      packageCount: '2'
    });
  }
} 