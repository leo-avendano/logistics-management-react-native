import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRutasPaquetesEnProgreso } from '../../services/firebaseService';
import { HeaderContainer } from '../../components/HeaderContainer';
import { useNavigation } from '@react-navigation/native';
import { Navbar } from '../../components/Navbar';
import { Loading } from '../../components/Loading';

const { width } = Dimensions.get('window');

export default function MainScreen() {
  const navigation = useNavigation();
  const [hayRutasEnProgreso, setHayRutasEnProgreso] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rutaUnica, setRutaUnica] = useState(null);

  useEffect(() => {
    getRutasPaquetesEnProgreso()
      .then((rutas) => {
        if (Array.isArray(rutas) && rutas.length > 0) {
          setHayRutasEnProgreso(true);
          if (rutas.length === 1) {
            setRutaUnica(rutas[0]);
          } else {
            setRutaUnica(null);
          }
        } else {
          setHayRutasEnProgreso(false);
          setRutaUnica(null);
        }
        setLoading(false); // <-- Agrega esto aquí
      })
      .catch((err) => {
        setHayRutasEnProgreso(false);
        setRutaUnica(null);
        setLoading(false); // <-- Y esto aquí
      });
  }, []);

  const handleConfirmarLlegada = () => {
    if (rutaUnica) {
      navigation.push('DeliveryConfirmation', {
        previousScreen: 'Main',
        uuid: rutaUnica.uuid
      });
    } else {
      navigation.push('Delivery', {
        previousScreen: 'Main'
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderContainer>
        <View style={styles.logoContainer}>
          <Ionicons name="home-outline" size={40} color="#FFC107" />
          <Text style={styles.logoText}>DeRemate</Text>
        </View>
      </HeaderContainer>

      {/* Welcome Section
      <View style={styles.welcomeContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
        <Text style={styles.welcomeMessage}>
          Has iniciado sesión exitosamente en DeRemate. Tu aplicación de gestión logística está lista para usar.
        </Text>
      </View> */}

      {loading ? (
        <Loading backgroundColor='#F5F5F5'/>
      ) : (
        <>
          {/* Feature Cards */}
          <ScrollView style={styles.featuresContainer}>
            {hayRutasEnProgreso && (
              <TouchableOpacity style={styles.featureCard}
                onPress={handleConfirmarLlegada}
              >
                <Ionicons name="checkmark-done-outline" size={40} color="#FFC107" />
                <Text style={styles.featureTitle}>Confirmar llegada</Text>
                <Text style={styles.featureDescription}>Confirma la llegada de tus paquetes en progreso</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.featureCard}
              onPress={() => navigation.replace('Record')}>
              <Ionicons name="cube-outline" size={40} color="#FFC107" />
              <Text style={styles.featureTitle}>Gestión de Paquetes</Text>
              <Text style={styles.featureDescription}>Administra tus envíos y paquetes</Text>
            </TouchableOpacity>
            

            <TouchableOpacity style={styles.featureCard}
              onPress={() => navigation.replace('Routes')}>
              <Ionicons name="location-outline" size={40} color="#2196F3" />
              <Text style={styles.featureTitle}>Rutas Disponibles</Text>
              <Text style={styles.featureDescription}>Encuentra las mejores rutas</Text>
            </TouchableOpacity>


          </ScrollView>
          </>
        )}
      <Navbar/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  logoutButton: {
    padding: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 76,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});