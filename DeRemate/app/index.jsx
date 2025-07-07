import React, { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import LogoComponent from '../components/LogoComponent';
import { ValidationUtils } from '../utils/ValidationUtils';
import { ToastMessages, getErrorMessage } from '../utils/ToastMessages';
import { NetworkUtils } from '../utils/NetworkUtils';
import { useToast } from '../components/ToastProvider';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const shakeAnimation = new Animated.Value(0);
  
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.replace('/main');
      }
      setInitialLoading(false);
    });

    return unsubscribe;
  }, []);

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

  const handleLogin = async () => {
    clearErrors();
    
    const validation = ValidationUtils.validateLoginForm(email, password);
    if (!validation.isValid) {
      setInputErrors({ general: true });
      showToast(validation.message, 'error');
      shakeInputs();
      return;
    }

    // Check network connectivity
    const isConnected = await NetworkUtils.checkNetworkAndShowError((message) => {
      showToast(message, 'error');
    });
    if (!isConnected) return;

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        showToast(ToastMessages.EMAIL_NOT_CONFIRMED, 'warning');
        await auth.signOut();
        return;
      }
      await saveExpoPushToken(user.uid);

      // Success feedback
      showToast('¡Bienvenido de vuelta!', 'success', 2000);
      router.replace('/main');
    } catch (error) {
      console.log('🔐 Authentication Error Details:');
      console.log('Error Code:', error.code);
      console.log('Error Message:', error.message);
      
      const errorMessage = getErrorMessage(error.code || 'unknown');
      console.log('User-friendly message:', errorMessage);
      
      // Set visual error state for inputs
      setInputErrors({ 
        email: error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential',
        password: error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential',
        general: true
      });
      
      // Make sure we have a valid error message
      const finalMessage = errorMessage || 'Error de autenticación. Verifica tus credenciales.';
      console.log('Showing toast with message:', finalMessage);
      
      showToast(finalMessage, 'error');
      shakeInputs();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    showToast('Funcionalidad de Google Sign-In en desarrollo', 'info');
  };

  const handleAppleSignIn = () => {
    showToast('Funcionalidad de Apple Sign-In en desarrollo', 'info');
  };



  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

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
          <Text style={styles.title}>INGRESAR</Text>
          <Text style={styles.subtitle}>Ingresa tu email y contraseña para continuar</Text>

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
              placeholder="Ejemplo@email.com"
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

          {/* Password Input */}
          <Animated.View 
            style={[
              styles.inputCard, 
              inputErrors.password && styles.inputError,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (inputErrors.password) clearErrors();
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.loginButtonText}>CONTINUAR</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <Text style={styles.socialButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Apple Sign In */}
          <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
            <Ionicons name="logo-apple" size={24} color="#000" />
            <Text style={styles.socialButtonText}>Continuar con Apple</Text>
          </TouchableOpacity>

          {/* Recovery Link */}
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/recover')}
          >
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    marginTop: 28,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
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
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFC107',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#000',
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#000',
  },
  socialButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 12,
  },
  linkButton: {
    marginVertical: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: 8,
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