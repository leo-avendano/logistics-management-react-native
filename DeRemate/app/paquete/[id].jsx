import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { logisticsService } from '../../services/logisticsService';
import { useToast } from '../../components/ToastProvider';
import { openGoogleMaps } from '../../services/openMapsService';
import { db } from '../../config/firebaseConfig';
import { useRoute } from '@react-navigation/native';
import { HeaderContainer } from '../../components/HeaderContainer';
import { Navbar } from '../../components/Navbar';


export const screenOptions = {
  headerShown: false,   
};

export default function PaqueteDetalle() {
  const route = useRoute();
  const { id } = route.params || {};
  const [paquete, setPaquete] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaquete = async () => {
      setLoading(true);
      try {
        const paqueteRef = doc(db, 'Paquete', id);
        const paqueteSnap = await getDoc(paqueteRef);

        if (paqueteSnap.exists()) {
          const data = paqueteSnap.data();
          setPaquete(data);
          const rutaRef = data.rutaRef;
          setRuta(rutaRef);

          const rutaRefDoc = doc(db, 'Ruta', rutaRef);
          const rutaSnap = await getDoc(rutaRefDoc);

          if (rutaSnap.exists()) {
            const rutaData = rutaSnap.data();
            const { lat, lon } = rutaData.destino;
            setCoordenadas({ lat, lon });
          }
        } else {
          console.log('No se encontró el paquete');
        }
      } catch (error) {
        console.error('Error al buscar el paquete:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaquete();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando paquete...</Text>
      </View>
    );
  }

  if (!paquete) {
    return (
      <View style={styles.center}>
        <Text>Paquete no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        {/* Cabecera */}
        <HeaderContainer>
          <MaterialCommunityIcons
            name="cube"
            size={48}
            color="#FFC107"
            style={styles.headerIcon}
          />
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>{paquete.nombre}</Text>
            <Text style={styles.subtitle}>{paquete.descripcion}</Text>
          </View>
        </HeaderContainer>

        <View style={styles.divider} />

        {/* Datos clave */}
        <InfoRow label="Peso" value={`${paquete.peso} kg`} />
        <InfoRow label="Ruta" value={paquete.rutaRef} />
        <InfoRow
          label="Tamaño"
          value={`${paquete.tamaño?.ancho}×${paquete.tamaño?.largo}×${paquete.tamaño?.alto} cm`}
        />
        <InfoRow
          label="Ubicación"
          value={`Depósito ${paquete.ubicacion?.deposito}  ·  Estante ${paquete.ubicacion?.estante}  ·  Sector ${paquete.ubicacion?.sector}`}
        />
      </View>

      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={() => openGoogleMaps(coordenadas)}
      >
        <Text style={styles.linkText}>Ver recorrido en Google Maps</Text>
      </TouchableOpacity>
      <Navbar></Navbar>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F4F6F7',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { height: 2, width: 0 },
    elevation: 4,
    marginTop:50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTextWrap: {
    flexShrink: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  subtitle: {
    fontSize: 15,
    color: '#6C6C6C',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  rowLabel: {
    width: 90,
    fontWeight: '600',
    color: '#424242',
  },
  rowValue: {
    flex: 1,
    color: '#424242',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 8,
  },
  error: {
    fontSize: 18,
    color: '#D32F2F',
  },
  buttonContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFC107',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:40,
  }
});