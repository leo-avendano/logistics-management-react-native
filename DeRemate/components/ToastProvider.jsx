import React, { createContext, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'error', // 'error', 'success', 'info', 'warning'
    duration: 4000,
  });

  const showToast = (message, type = 'error', duration = 4000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      case 'error':
      default:
        return '#F44336';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Snackbar
        visible={toast.visible}
        onDismiss={hideToast}
        duration={toast.duration}
        style={{
          backgroundColor: getBackgroundColor(),
          marginBottom: 20,
        }}
        theme={{
          colors: {
            onSurface: '#FFFFFF',
            surface: getBackgroundColor(),
          },
        }}
        action={{
          label: 'Cerrar',
          onPress: hideToast,
          textColor: '#FFFFFF',
        }}
      >
        {toast.message}
      </Snackbar>
    </ToastContext.Provider>
  );
}; 