import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from './ToastProvider';
import { useNavigation, useRoute } from '@react-navigation/native';

export const Navbar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;
  if (!auth.currentUser) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('👋 Sesión cerrada correctamente', 'success', 2000);
      navigation.replace('Login');
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
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: handleLogout, style: 'destructive' },
      ]
    );
  };

  const handleNavigation = (screen) => {
    navigation.reset({
      index: 0,
      routes: [{ name: screen }],
    });
    if (route.name == screen) return;
    if (screen === 'Logout') {
      confirmLogout();
      return;
    }

    navigation.replace(screen);
  };

  const buttons = [
    { id: 1, name: 'home-outline', action: () => handleNavigation('Main') },
    { id: 2, name: 'location-outline', action: () => handleNavigation('Routes') },
    { id: 3, name: 'qr-code-outline', action: () => handleNavigation('QrScanner'), isQr: true },
    { id: 4, name: 'calendar-outline', action: () => handleNavigation('Record') },
    { id: 5, name: 'exit-outline', action: () => handleNavigation('Logout') },
  ];

  return (
    <View style={styles.navbarContainer}>
      {buttons.map((button) => (
        <TouchableOpacity
          key={button.id}
          style={button.isQr ? styles.buttonQr : styles.button}
          onPress={button.action}
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
    paddingHorizontal: 25,
    zIndex: 120,
    paddingBottom: 12,
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
