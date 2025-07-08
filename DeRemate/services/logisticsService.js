import { getAuth } from 'firebase/auth';
import { APP_CONFIG } from '../config/appConfig';

class LogisticsService {
  constructor() {
    this.baseURL = APP_CONFIG.API.BASE_URL;
    this.endpoints = APP_CONFIG.API.ENDPOINTS;
    this.timeout = APP_CONFIG.REQUEST.TIMEOUT;
    this.headers = APP_CONFIG.REQUEST.HEADERS;
  }

  async getAuthHeaders() {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return this.headers;
    }

    try {
      // Get Firebase ID token (equivalent to Android's getIdToken(true))
      const token = await user.getIdToken(true);
      return {
        ...this.headers,
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      return this.headers;
    }
  }

  async assignRouteToRepartidor(routeUUID, userID) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseURL}${this.endpoints.ASSIGN_ROUTE}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          routeUUID: routeUUID,
          userID: userID
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to assign route: ${response.status}`);
      }

      return { success: true, message: 'Route assigned successfully' };
    } catch (error) {
      console.error('Error assigning route:', error);
      throw error;
    }
  }

  async unassignRouteFromRepartidor(routeUUID) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseURL}${this.endpoints.UNASSIGN_ROUTE}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          routeUUID: routeUUID,
          userID: ""
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to unassign route: ${response.status}`);
      }

      return { success: true, message: 'Route unassigned successfully' };
    } catch (error) {
      console.error('Error unassigning route:', error);
      throw error;
    }
  }

<<<<<<< HEAD
  async setRouteInProgress(routeUUID) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${this.endpoints.SET_ROUTE_IN_PROGRESS}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ routeUUID }),
      signal: controller.signal
    });
      console.log('🌐 POST', url);   // 👀


    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error al poner la ruta en progreso: ${response.status}`);
    }

    return { success: true, message: 'Ruta en progreso' };
  } catch (error) {
    console.error('Error al poner la ruta en progreso:', error);
    throw error;
  }
}
  async setRouteCompleted(routeUUID) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseURL}${this.endpoints.SET_ROUTE_COMPLETED}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ routeUUID }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error al completar la ruta: ${response.status}`);
      }

      return { success: true, message: 'Ruta completada' };
    } catch (error) {
      console.error('Error al completar la ruta:', error);
      throw error;
    }
  }

  async setRouteCancelled(routeUUID) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseURL}${this.endpoints.SET_ROUTE_CANCELLED}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ routeUUID }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error al cancelar la ruta: ${response.status}`);
      }

      return { success: true, message: 'Ruta cancelada' };
    } catch (error) {
      console.error('Error al cancelar la ruta:', error);
      throw error;
    }
  }
=======
>>>>>>> d4606cd48d66782554476f79e48b0bb933f01985

  // Get current authenticated user ID
  getCurrentUserId() {
    const auth = getAuth();
    return auth.currentUser?.uid || null;
  }

  // Test method to verify backend connection
  async testConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseURL}${this.endpoints.HELLO}`, {
        method: 'GET',
        headers: headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Test connection failed: ${response.status}`);
      }

      const data = await response.text();
      return { success: true, message: data };
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }
}

export const logisticsService = new LogisticsService(); 