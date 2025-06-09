import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { db } from '../../config/firebaseConfig';


export const screenOptions = {
  headerShown: false,   
};

export default function PaqueteDetalle() {

  const { id } = useLocalSearchParams();
  const [paquete, setPaquete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaquete = async () => {
      console.log('Buscando paquete con ID:', id);
      try {
        const ref = doc(db, 'Paquete', id); //
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setPaquete(data);
        } else {
          console.warn('Paquete no encontrado en Firestore');
        }
      } catch (error) {
        console.error('Error al buscar el paquete:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaquete();
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
        <View style={styles.header}>
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
        </View>

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
});