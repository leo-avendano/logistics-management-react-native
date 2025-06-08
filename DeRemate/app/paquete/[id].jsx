import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export const screenOptions = {
  headerShown: false,   // 👈  oculta el header solo en esta pantalla
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
        <Text>❌ Paquete no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 {paquete.nombre}</Text>
      <Text>Descripción: {paquete.descripcion}</Text>
      <Text>Peso: {paquete.peso} kg</Text>
      <Text>Ruta Ref: {paquete.rutaRef}</Text>
      <Text>
        Tamaño: {paquete.tamaño?.ancho} x {paquete.tamaño?.largo} x {paquete.tamaño?.alto} cm
      </Text>
      <Text>
        Ubicación: Depósito {paquete.ubicacion?.deposito}, Estante {paquete.ubicacion?.estante}, Sector {paquete.ubicacion?.sector}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
