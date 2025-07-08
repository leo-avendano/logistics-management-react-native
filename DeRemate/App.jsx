import React, { useRef, useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './components/ToastProvider';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebaseConfig';
import { usePushNotifications } from './hooks/usePushNotifications';

import LoginScreen from './app/index';
import RegisterScreen from './app/register/index';
import MainScreen from './app/main/index';
import RecordScreen from './app/record/index';
import RecordDescriptionScreen from './app/record/description';
import QrScannerScreen from './app/qr-scanner/index';
import RoutesScreen from './app/routes/index';
import RecoverScreen from './app/recover/index';
import PaqueteScreen from './app/paquete/[id]';
import ConfirmationScreen from './app/confirmation/index';
import DeliveryScreen from './app/delivery/index';
import DeliveryConfirmationScreen from './app/delivery/confirmation';
import TestNotificationsScreen from './app/test-notifications/index';

const Stack = createStackNavigator();

export default function App() { 
    const colorScheme = useColorScheme();
    const navigationRef = useRef();
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    
    const [loaded] = useFonts({
        SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'), 
    });

    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        return unsubscribe;
    }, []);



    // 📱 Setup push notifications for authenticated users
    const { isRegistered, pushToken, error } = usePushNotifications(navigationRef.current, user);

    // Log push notification status
    useEffect(() => {
        if (user && isRegistered) {
            console.log('✅ Push notifications ready for user:', user.uid);
            console.log('📱 Push token:', pushToken);
        } else if (user && error) {
            console.warn('⚠️ Push notifications error:', error);
        }
    }, [user, isRegistered, pushToken, error]);

    if (!loaded || authLoading) {
        return null;
    }

    return (
        <PaperProvider>
            <ToastProvider>
                <SafeAreaProvider>
                    <View style={styles.container}>
                        <NavigationContainer
                            ref={navigationRef}
                            theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                            <Stack.Navigator
                                initialRouteName="Login"
                                screenOptions={{
                                    animation: 'fade',
                                    headerShown: false,
                                    contentStyle: {
                                        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                                    },
                                    headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
                                }}
                            >
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="Register" component={RegisterScreen} />
                                <Stack.Screen name="Main" component={MainScreen} />
                                <Stack.Screen name="Record" component={RecordScreen} />
                                <Stack.Screen name="RecordDescription" component={RecordDescriptionScreen} />
                                <Stack.Screen name="QrScanner" component={QrScannerScreen} />
                                <Stack.Screen name="Routes" component={RoutesScreen} />
                                <Stack.Screen name="Recover" component={RecoverScreen} />
                                <Stack.Screen name="Paquete" component={PaqueteScreen} />
                                <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
                                <Stack.Screen name="Delivery" component={DeliveryScreen} />
                                <Stack.Screen name="DeliveryConfirmation" component={DeliveryConfirmationScreen} />
                                <Stack.Screen name="TestNotifications" component={TestNotificationsScreen} />
                            </Stack.Navigator>
                            <StatusBar style="dark" />
                        </NavigationContainer>
                    </View>
                </SafeAreaProvider>
            </ToastProvider>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});