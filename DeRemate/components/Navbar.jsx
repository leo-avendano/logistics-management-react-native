import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useToast } from './ToastProvider';

export const Navbar = () => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = `/${segments.join('/')}`;
  const [user, setUser] = useState(null);
  
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('👋 Sesión cerrada correctamente', 'success', 2000);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error al cerrar sesión. Intenta nuevamente.', 'error');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: handleLogout,
          style: 'destructive',
        },
      ]
    );
  };

  const handleNavigation = (screen) => {
    const targetRoute = `/${screen}`;
    if (currentRoute === targetRoute) return;
    if (screen === 'index') {
      confirmLogout();
      return;
    }
    router.replace(targetRoute);
  };

  const buttons = [
    { 
      id: 1, 
      name: 'home-outline',
      action: () => handleNavigation('main') 
    },
    { 
      id: 2, 
      name: 'location-outline', 
      action: () => handleNavigation('routes'),
    },
    { 
      id: 3, 
      name: 'qr-code-outline', 
      action: () => handleNavigation('qr-scanner'),
      isQr: true,
    },
    { 
      id: 4, 
      name: 'calendar-outline', 
      action: () => handleNavigation('record')
    },
    { 
      id: 5, 
      name: 'exit-outline', 
      action: () => handleNavigation('index') 
    },
  ];

  return (
    <View style={styles.navbarContainer}>
      {buttons.map((button) => (
        <TouchableOpacity
          key={button.id}
          style={button.isQr ? styles.buttonQr : styles.button}
          onPress={button.disabled ? null : button.action}
          disabled={button.disabled}
        >
          <Ionicons name={button.name} size={button.isQr ? 48 : 26} color='#ffffff'/>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 62,
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    zIndex: 120,
    paddingBottom: 12,
    paddingHorizontal: 25,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  buttonQr: {
    bottom: 40,
    backgroundColor: '#FFC107',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});