// App Configuration
export const APP_CONFIG = {
  // API Configuration
  API: {
    // Base URL from Android project
    BASE_URL: 'https://logistics-management-26709.web.app/api',
    ENDPOINTS: {
      ASSIGN_ROUTE: '/route/assign',
      UNASSIGN_ROUTE: '/route/unassign',
      HELLO: '/hello'
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