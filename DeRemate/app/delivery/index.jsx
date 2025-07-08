import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HeaderContainer } from '../../components/HeaderContainer';
import { Loading } from '../../components/Loading';
import { getRutasPaquetesEnProgreso } from '../../services/firebaseService';
import { COLORS_ } from '../../constants/Colors'
import { Navbar } from '../../components/Navbar';
import { BackButton } from '../../components/BackButton';

const { width, height } = Dimensions.get('window');

export default function InProgressOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const pedidos = await getRutasPaquetesEnProgreso();
        setOrders(pedidos);
      } catch (err) {
        setError('No se pudieron cargar los pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() =>
        navigation.replace('DeliveryConfirmation', {
          previousScreen: 'Delivery',
          uuid: item.uuid,
        })
      }
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>Pedido: {item.uuid}</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS_.primary} />
      </View>
      <Text style={styles.orderDetail}>Cliente: {item.cliente_nombre || item.cliente}</Text>
      <Text style={styles.orderDetail}>Descripción: {item.paquete?.descripcion || 'Sin descripción'}</Text>
      <Text style={styles.orderDetail}>Inicio: {item.fechas?.inicioRepartir || 'N/A'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderContainer style={{paddingHorizontal: 8, justifyContent: 'start'}}>
        <BackButton/>
        <View style={styles.logoContainer}>
          <Ionicons name="navigate-outline" size={40} color={COLORS_.primary} />
          <Text style={styles.logoText}>Mis Pedidos en Progreso</Text>
        </View>
      </HeaderContainer>
      {loading ?(
        <Loading backgroundColor='#F5F5F5'/>
      ):error ?(
        <View style={[styles.container, styles.centered]}>
          <Text >{error}</Text>
        </View>
      ):(
        <FlatList
          data={orders}
          keyExtractor={item => item.uuid}
          renderItem={renderItem}
          contentContainerStyle={orders.length === 0 ? styles.centered : styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes pedidos en progreso.</Text>
          }
        />
      )}
      
      <Navbar/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: COLORS_.white,
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS_.text,
  },
  orderDetail: {
    fontSize: 15,
    color: COLORS_.textSecondary,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS_.textSecondary,
    fontSize: 16,
  },
});