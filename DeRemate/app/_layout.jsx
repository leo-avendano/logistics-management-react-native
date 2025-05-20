import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated'; 

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* La primera pantalla en la pila será la inicial por defecto */}
        <Stack.Screen
          name="index" 
          options={{
            title: 'Inicio',
           
          }}
        />

        <Stack.Screen
          name="register" 
          options={{
            title: 'Registrarse', 
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}