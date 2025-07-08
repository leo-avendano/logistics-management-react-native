// App Configuration
export const APP_CONFIG = {
  // API Configuration
  API: {
    // Base URL from Android project
    BASE_URL: 'https://logistics-management-26709.web.app',
    ENDPOINTS: {
      ASSIGN_ROUTE: '/api/route/assign',
      UNASSIGN_ROUTE: '/api/route/unassign',
      SET_ROUTE_IN_PROGRESS: '/api/route/start',
      SET_ROUTE_DONE: '/api/package/confirm',
      SET_ROUTE_CANCELED: '/api/route/cancel',
      HELLO: '/api/hello'
    }
  },
  
  // Request Configuration
  REQUEST: {
    TIMEOUT: 10000, // 10 seconds
    HEADERS: {
      'Content-Type': 'application/json',
      // Add any additional headers like Authorization if needed
    }
  },
  
  // App Settings
  SETTINGS: {
    ROUTE_REFRESH_INTERVAL: 30000, // 30 seconds
    DEFAULT_FILTER: 'Todas'
  }
};

export default APP_CONFIG; 