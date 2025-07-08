import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import LogoComponent from '../../components/LogoComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../components/ToastProvider';

const { width } = Dimensions.get('window');
const COOLDOWN_TIME_MS = 30000; // 30 seconds

export default function RecoverScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const { showToast } = useToast();
  const navigation = useNavigation();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const clearErrors = () => {
    setInputErrors({});
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
    clearErrors();

    if (!email.trim()) {
      setInputErrors({ email: true });
      showToast('Ingresa tu correo electrónico.', 'error');
      shakeInputs();
      return;
    }

    if (!isValidEmail(email)) {
      setInputErrors({ email: true });
      showToast('El formato del email no es válido.', 'error');
      shakeInputs();
      return;
    }

    // Check cooldown
    const isInCooldown = await checkCooldown();
    if (isInCooldown) {
      showToast('Debes esperar antes de solicitar otro correo.', 'warning');
      navigation.navigate('MailCooldown'); // Cambia el nombre según tu stack
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);

      // Set cooldown
      await setCooldown();

      showToast('Se ha enviado un correo de recuperación a tu email.', 'success', 4000);

      // Navigate after a short delay to let user read the message
      setTimeout(() => {
        navigation.navigate('Confirmation'); // Cambia el nombre según tu stack
      }, 1000);

    } catch (error) {
      console.error('Recovery error:', error);

      let errorMessage = 'Error al enviar el correo de recuperación';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico';
        setInputErrors({ email: true });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido';
        setInputErrors({ email: true });
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente';
      }

      showToast(errorMessage, 'error');
      shakeInputs();
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
            <LogoComponent size="large" />
          </View>

          {/* Title Section */}
          <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>
          <Text style={styles.subtitle}>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </Text>

          {/* Email Input */}
          <Animated.View 
            style={[
              styles.inputCard, 
              inputErrors.email && styles.inputError,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (inputErrors.email) clearErrors();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Animated.View>

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
            onPress={() => navigation.goBack()}
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
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});