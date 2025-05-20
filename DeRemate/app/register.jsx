import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity, // Usaremos TouchableOpacity para un botón más personalizable
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth'; // Importación para @react-native-firebase/auth

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError(''); // Limpiar errores previos
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Usando @react-native-firebase/auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User account created & signed in!', userCredential.user);

      Alert.alert(
        "Registro Exitoso",
        "¡Tu cuenta ha sido creada! Ahora puedes iniciar sesión.",
        [{ text: "OK", onPress: () => router.replace('/login') }] // Redirige a login o a donde prefieras
      );
      // Podrías también navegar directamente a la pantalla principal si el registro también inicia sesión.
      // router.replace('/index');

    } catch (e) {
      let errorMessage = 'Ocurrió un error durante el registro.';
      if (e.code) {
        switch (e.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo electrónico ya está en uso.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es demasiado débil (debe tener al menos 6 caracteres).';
            break;
          default:
            console.error("Error de registro Firebase:", e);
        }
      } else {
        console.error("Error de registro:", e);
      }
      setError(errorMessage);
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
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Ingresa tus datos para comenzar.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo Electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#8A8A8E"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#8A8A8E"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#8A8A8E"
              autoCapitalize="none"
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
              <Text style={styles.registerButtonText}>Registrarse</Text>
            </TouchableOpacity>
          )}

          <View style={styles.loginPromptContainer}>
            <Text style={styles.loginPromptText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Un color de fondo general para la vista
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Centra el contenido si es más pequeño que la pantalla
  },
  container: {
    flex: 1, // Ocupa el espacio disponible en el ScrollView
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20, // Añade padding vertical
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A8E',
    marginBottom: 35,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1C1C1E',
    shadowColor: "#000", // Sombra sutil para inputs
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.00,
    elevation: 1,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#007AFF', // Un azul vibrante
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600', // Semibold
  },
  loader: {
    marginTop: 20, // Espacio para el loader
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30', // Un rojo para errores
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  loginPromptContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 15,
    color: '#8A8A8E',
  },
  loginLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
