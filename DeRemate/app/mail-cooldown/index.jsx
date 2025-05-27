import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COOLDOWN_TIME_MS = 30000; // 30 seconds

export default function MailCooldownScreen() {
  const [remainingTime, setRemainingTime] = useState(30);

  useEffect(() => {
    const calculateRemainingTime = async () => {
      try {
        const lastSentTime = await AsyncStorage.getItem('last_reset_email_time');
        if (lastSentTime) {
          const currentTime = Date.now();
          const timeDiff = currentTime - parseInt(lastSentTime);
          const remaining = Math.max(0, Math.ceil((COOLDOWN_TIME_MS - timeDiff) / 1000));
          setRemainingTime(remaining);
        }
      } catch (error) {
        console.error('Error calculating remaining time:', error);
      }
    };

    calculateRemainingTime();

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Ionicons name="cube-outline" size={80} color="#FFC107" />
        </View>
        <Text style={styles.logoText}>DeRemate</Text>
      </View>

      {/* Warning Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="time-outline" size={100} color="#FF9800" />
      </View>

      {/* Title and Message */}
      <Text style={styles.title}>Espera un momento</Text>
      <Text style={styles.message}>
        Has solicitado un correo de recuperación recientemente. Por favor espera {remainingTime} segundos antes de intentar nuevamente.
      </Text>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{remainingTime}s</Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.continueButtonText}>VOLVER AL INICIO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  timerContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  continueButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFC107',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
}); 