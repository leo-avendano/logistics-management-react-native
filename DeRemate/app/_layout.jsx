import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated'; 
import { Navbar } from '../components/Navbar' 
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, StyleSheet } from 'react-native';

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen
            name="index"
            options={{
              title: 'Inicio',
            }}
          />
          <Stack.Screen
            name="register/index"
            options={{
              title: 'Registrarse',
            }}
          />
          <Stack.Screen
            name="main/index"
            options={{
              title: 'Home',
              // headerShown: false
            }}
          />
          <Stack.Screen
            name="record/index"
            options={{
              title: 'Historial',
              // headerShown: false
            }}
          />
        </Stack>
        <Navbar/>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});