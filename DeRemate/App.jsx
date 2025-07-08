import React from 'react';
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

const Stack = createStackNavigator();

export default function App() { 
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'), 
    });

    if (!loaded) {
        return null;
    }

    return (
        <PaperProvider>
            <ToastProvider>
                <SafeAreaProvider>
                    <View style={styles.container}>
                        <NavigationContainer
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