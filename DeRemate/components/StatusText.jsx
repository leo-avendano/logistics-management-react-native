import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const StatusText = ({ status, style }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'completado':
        return styles.delivered;
      case 'en progreso':
        return styles.inProgress;
      case 'pendiente':
        return styles.pending;
      case 'cancelado':
        return styles.canceled;
      case 'disponible':
        return styles.available;
      default:
        return styles.unknown;
    }
  };

  return (
    <Text style={[styles.status, getStatusStyle(), style]}>
      {status ? status.toUpperCase() : 'ESTADO DESCONOCIDO'}
    </Text>
  );
};

const styles = StyleSheet.create({
  status: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start', // Para que no ocupe todo el ancho
  },
  delivered: {
    backgroundColor: '#e6f7ee',
    color: '#10b981',
  },
  inProgress: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
  },
  pending: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  canceled: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  available: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
  },
  unknown: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
});