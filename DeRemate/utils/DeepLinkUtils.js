import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

// 🔗 Utilidades para Deep Linking con Push Notifications
export class DeepLinkUtils {
  
  // Generar deep link para nueva ruta
  static generateRouteDeepLink(routeData) {
    const params = {
      routeId: routeData.routeId,
      destination: routeData.destination,
      packageCount: routeData.packageCount,
      fromNotification: 'true'
    };

    // Si estamos en Expo Go, usar el esquema de Expo
    if (Constants.executionEnvironment === 'storeClient') {
      // Esto es Expo Go
      const baseUrl = Linking.createURL('routes');
      const urlParams = new URLSearchParams(params).toString();
      return `${baseUrl}?${urlParams}`;
    } else {
      // Esto es una build standalone
      return `deremate://routes?${new URLSearchParams(params).toString()}`;
    }
  }

  // Generar deep link genérico
  static generateDeepLink(screen, params = {}) {
    if (Constants.executionEnvironment === 'storeClient') {
      // Expo Go
      const baseUrl = Linking.createURL(screen);
      if (Object.keys(params).length > 0) {
        const urlParams = new URLSearchParams(params).toString();
        return `${baseUrl}?${urlParams}`;
      }
      return baseUrl;
    } else {
      // Standalone
      const urlParams = Object.keys(params).length > 0 
        ? `?${new URLSearchParams(params).toString()}` 
        : '';
      return `deremate://${screen}${urlParams}`;
    }
  }

  // Configurar linking para NavigationContainer
  static getLinkingConfig() {
    return {
      prefixes: [
        'deremate://',
        'https://deremate.app',
        Linking.createURL('/'),
      ],
      config: {
        screens: {
          Login: 'login',
          Register: 'register',
          Main: 'main',
          Routes: {
            path: 'routes',
            parse: {
              routeId: (routeId) => routeId,
              destination: (destination) => destination,
              packageCount: (packageCount) => packageCount,
              fromNotification: (fromNotification) => fromNotification === 'true',
            },
          },
          Record: 'record',
          RecordDescription: 'record/description',
          QrScanner: 'qr-scanner',
          Recover: 'recover',
          Paquete: 'paquete/:id',
          Confirmation: 'confirmation',
          Delivery: 'delivery',
          DeliveryConfirmation: 'delivery/confirmation',
          NotificationTest: 'notification-test',
        },
      },
    };
  }

  // Parsear parámetros de deep link
  static parseDeepLink(url) {
    try {
      const urlObj = new URL(url);
      const params = {};
      
      // Extraer parámetros de query string
      urlObj.searchParams.forEach((value, key) => {
        // Convertir strings booleanos
        if (value === 'true') {
          params[key] = true;
        } else if (value === 'false') {
          params[key] = false;
        } else {
          params[key] = value;
        }
      });

      return {
        screen: urlObj.pathname.replace('/', '') || 'main',
        params
      };
    } catch (error) {
      console.error('❌ Error parsing deep link:', error);
      return null;
    }
  }

  // Log de deep link para debugging
  static logDeepLink(type, url, data = {}) {
    console.log(`🔗 Deep Link [${type}]:`, {
      url,
      data,
      environment: Constants.executionEnvironment,
      isExpoGo: Constants.executionEnvironment === 'storeClient'
    });
  }

  // Testing - crear deep link de prueba
  static createTestDeepLink() {
    return this.generateRouteDeepLink({
      routeId: 'TEST_DEEP_001',
      destination: 'Buenos Aires (Test)',
      packageCount: '1'
    });
  }
}

export default DeepLinkUtils; 