import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COOLDOWN_TIME_MS = 30000; // 30 seconds

export default function RecoverScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkCooldown = async () => {
    try {
      const lastSentTime = await AsyncStorage.getItem('last_reset_email_time');
      if (lastSentTime) {
        const currentTime = Date.now();
        const timeDiff = currentTime - parseInt(lastSentTime);
        return timeDiff < COOLDOWN_TIME_MS;
      }
      return false;
    } catch (error) {
      console.error('Error checking cooldown:', error);
      return false;
    }
  };

  const setCooldown = async () => {
    try {
      await AsyncStorage.setItem('last_reset_email_time', Date.now().toString());
    } catch (error) {
      console.error('Error setting cooldown:', error);
    }
  };

  const handleRecoverPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Complete todos los campos.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'El email ingresado no es válido.');
      return;
    }

    // Check cooldown
    const isInCooldown = await checkCooldown();
    if (isInCooldown) {
      router.push('/mail-cooldown');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      
      // Set cooldown
      await setCooldown();
      
      Alert.alert(
        'Correo enviado',
        'Se ha enviado un correo de recuperación a tu email.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/confirmation')
          }
        ]
      );
    } catch (error) {
      console.error('Recovery error:', error);
      
      let errorMessage = 'Fallo al enviar el correo de recuperación: ';
      if (error.message) {
        errorMessage += error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Ionicons name="cube-outline" size={80} color="#FFC107" />
            </View>
            <Text style={styles.logoText}>DeRemate</Text>
          </View>

          {/* Title Section */}
          <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>
          <Text style={styles.subtitle}>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </Text>

          {/* Email Input */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Recover Button */}
          <TouchableOpacity 
            style={[styles.recoverButton, loading && styles.buttonDisabled]}
            onPress={handleRecoverPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.recoverButtonText}>ENVIAR CORREO</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  recoverButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFC107',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  recoverButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
}); 