import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

export function useShowNavbar() {
  const [showNavbar, setShowNavbarState] = useState(true);
  
  useEffect(() => {
    AsyncStorage.getItem('showNavbar').then(value => {
      if (value !== null) setShowNavbarState(value === 'true');
    });
  }, []);

  const setShowNavbar = useCallback(async (value) => {
    setShowNavbarState(value);
    await AsyncStorage.setItem('showNavbar', value ? 'true' : 'false');
  }, []);

  return [showNavbar, setShowNavbar];
}