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
  async setRouteInProgress(routeUUID) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const headers = await this.getAuthHeaders();

    const url = `${this.baseURL}${this.endpoints.SET_ROUTE_IN_PROGRESS}`;
    const requestBody = { routeUUID };
    
    console.log('🌐 POST URL:', url);
    console.log('📋 Request Body:', JSON.stringify(requestBody));
    console.log('🔐 Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response StatusText:', response.statusText);

    if (!response.ok) {
      const responseText = await response.text();
      console.log('❌ Response Error Body:', responseText);
      throw new Error(`Error al poner la ruta en progreso: ${response.status} - ${responseText}`);
    }

    const responseData = await response.text();
    console.log('✅ Response Success:', responseData);
    return { success: true, message: 'Ruta en progreso' };
  } catch (error) {
    console.error('Error al poner la ruta en progreso:', error);
    throw error;
  }
}
  async setRouteCompleted(routeUUID, inputUser) {
    try {
      console.log('🚀 Starting setRouteCompleted...');
      console.log('📥 Input params:', { routeUUID, inputUser });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      console.log('⏱️ Timeout set to:', this.timeout, 'ms');

      console.log('🔑 Getting auth headers...');
      const headers = await this.getAuthHeaders();
      console.log('🔐 Headers obtained:', JSON.stringify(headers, null, 2));

      const url = `${this.baseURL}${this.endpoints.SET_ROUTE_DONE}`;
      const requestBody = { routeUUID, codigo: inputUser };
      
      console.log('🌐 POST URL:', url);
      console.log('📋 Request Body:', JSON.stringify(requestBody));
      console.log('🔧 BaseURL:', this.baseURL);
      console.log('🔧 Endpoint:', this.endpoints.SET_ROUTE_DONE);

      console.log('📡 Making fetch request...');
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      console.log('📡 Response received!');
      console.log('📡 Response Status:', response.status);
      console.log('📡 Response StatusText:', response.statusText);
      console.log('📡 Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

      clearTimeout(timeoutId);
      console.log('⏱️ Timeout cleared');

      if (!response.ok) {
        console.log('❌ Response not OK, reading error body...');
        const responseText = await response.text();
        console.log('❌ Error Response Body:', responseText);
        throw new Error(`Error al completar la ruta: ${response.status} - ${responseText}`);
      }

      console.log('✅ Response OK, reading success body...');
      const responseData = await response.text();
      console.log('✅ Success Response Body:', responseData);
      
      console.log('🎉 setRouteCompleted completed successfully!');
      return { success: true, message: 'Ruta completada' };
    } catch (error) {
      console.error('💥 Error in setRouteCompleted:', error);
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      throw error;
    }
  }

  async setRouteCancelled(routeUUID) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseURL}${this.endpoints.SET_ROUTE_CANCELED}`, {
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