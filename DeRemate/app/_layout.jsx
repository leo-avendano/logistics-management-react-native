import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated'; 
import { Navbar } from '../components/Navbar' 
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const screenOptions = {
    animation: 'fade',
    headerShown: true,
    contentStyle: {
      backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
    },
    headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={styles.container}>
          <Stack screenOptions={screenOptions}>
            <Stack.Screen
              name="index"
              options={{
                title: 'Inicio',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="register/index"
              options={{
                title: 'Registrarse',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="main/index"
              options={{
                title: 'Home',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="record/index"
              options={{
                title: 'Historial',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="qr-scanner/index"
              options={{
                title: 'Escáner QR',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="routes/index"
              options={{
                title: 'Rutas Disponibles',
                headerShown: false
              }}
            />
            <Stack.Screen name="paquete/[id]" options={{ headerShown: false }} />
          </Stack>
          <Navbar/>
          <StatusBar style="dark" />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});