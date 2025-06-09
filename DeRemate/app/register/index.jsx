import React, { useState } from 'react';
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
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import LogoComponent from '../../components/LogoComponent';
import { useToast } from '../../components/ToastProvider';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const shakeAnimation = new Animated.Value(0);
  
  const { showToast } = useToast();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordSecure = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?.*()_\-]).{8,}$/;
    return passwordRegex.test(password);
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

  const validateForm = () => {
    clearErrors();
    let errors = {};
    let isValid = true;

    if (!email || !password || !confirmPassword) {
      showToast('Complete todos los campos.', 'error');
      errors.general = true;
      isValid = false;
    } else if (!isValidEmail(email)) {
      showToast('El email ingresado no es válido.', 'error');
      errors.email = true;
      isValid = false;
    } else if (!isPasswordSecure(password)) {
      showToast('La contraseña es muy débil. Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.', 'error');
      errors.password = true;
      isValid = false;
    } else if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      errors.confirmPassword = true;
      errors.password = true;
      isValid = false;
    }

    if (!isValid) {
      setInputErrors(errors);
      shakeInputs();
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('Starting registration process...');

      console.log('Creating user with email and password...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);

      console.log('Sending email verification...');
      await sendEmailVerification(userCredential.user);
      console.log('Email verification sent successfully');

      // Sign out the user after registration
      await auth.signOut();

      showToast('Se ha enviado un correo de verificación a tu email. Por favor verifica tu cuenta antes de iniciar sesión.', 'success', 5000);
      
      // Navigate after a short delay to let user read the message
      setTimeout(() => {
        router.push('/confirmation');
      }, 1000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Hubo un error al registrarse';
      let errorType = {};
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Ya existe una cuenta con este correo electrónico';
        errorType.email = true;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido';
        errorType.email = true;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        errorType.password = true;
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente';
      }
      
      setInputErrors(errorType);
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
          <Text style={styles.title}>REGISTRARSE</Text>
          <Text style={styles.subtitle}>Crea tu cuenta para comenzar</Text>

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
                style={styles.passwordInput}
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
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Confirm Password Input */}
          <Animated.View 
            style={[
              styles.inputCard, 
              inputErrors.confirmPassword && styles.inputError,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (inputErrors.confirmPassword) clearErrors();
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.registerButtonText}>REGISTRARSE</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 24,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFC107',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  registerButtonText: {
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