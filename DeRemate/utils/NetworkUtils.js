import NetInfo from '@react-native-community/netinfo';

export const NetworkUtils = {
  isConnectedToInternet: async () => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking network connectivity:', error);
      return false;
    }
  },

  checkNetworkAndShowError: async (showErrorCallback) => {
    const isConnected = await NetworkUtils.isConnectedToInternet();
    if (!isConnected && showErrorCallback) {
      showErrorCallback('Hubo un problema de conexión a la red, inténtelo más tarde');
    }
    return isConnected;
  }
}; 