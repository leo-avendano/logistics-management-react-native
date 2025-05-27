import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';

// import { IconSymbol } from '@/components/ui/IconSymbol'; // Si necesitas íconos aquí

export default function HomeScreen() { // Renombrado para claridad, o mantenlo como Index
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Inicio (Stack)</Text>
      <Text style={styles.content}>
        Este es el contenido de la pantalla principal.
      </Text>

      {/* Opción 1: Usando Link */}
      <Link href="/register" style={styles.linkButton}>
        <Text style={styles.linkText}>Ir a Registro (Link)</Text>
      </Link>

      {/* Opción 2: Usando router.push con un Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Ir a Registro (Button)"
          onPress={() => router.push("/register")}
        />
      </View>
      {/* Aquí tu lógica para Firebase, etc. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  linkButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 15,
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  }
});