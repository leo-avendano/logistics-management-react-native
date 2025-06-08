import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getRutasDisponibles, getPackageInfo } from '../../services/firebaseService';
import { StatusText } from '../../components/StatusText';
import { HeaderContainer } from '../../components/HeaderContainer';

const { width, height } = Dimensions.get('window');

export default function AvailableRoutesScreen() {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true);
        const rutasData = await getRutasDisponibles();
        setRutas(rutasData);
      } catch (err) {
        console.error('Error al obtener rutas disponibles:', err);
        setError('Error al cargar las rutas disponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchRutas();
  }, []);

  const handleRoutePress = async (route) => {
    setSelectedRoute(route);
    setDetailsLoading(true);
    try {
      const details = await getPackageInfo(route.uuid);
      setRouteDetails(details);
    } catch (err) {
      console.error('Error al obtener detalles:', err);
      setRouteDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.packageCard}
      onPress={() => handleRoutePress(item)}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.trackingNumber}>ID: {item.uuid}</Text>
        <StatusText status={item.estado}/>
      </View>
      
      <Text style={styles.carrier}>Cliente: {item.cliente}</Text>
      <Text style={styles.zoneText}>Destino:</Text>
      <Text style={styles.zoneText}>  {item.destino.lat}  {item.destino.lon}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderContainer>
        <View style={styles.logoContainer}>
          <Ionicons name="location-outline" size={40} color="#FFC107" />
          <Text style={styles.logoText}>Rutas Disponibles</Text>
        </View>
      </HeaderContainer>

      {/* Lista de rutas */}
      <FlatList
        data={rutas}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay rutas disponibles</Text>
        }
      />

      {/* Modal de detalles de ruta */}
      <Modal
        visible={!!selectedRoute}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedRoute(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {detailsLoading ? (
              <ActivityIndicator size="large" color="#FFC107" />
            ) : (
              <>
                <Text style={styles.modalTitle}>Detalles de la Ruta</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>{selectedRoute?.uuid}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cliente:</Text>
                  <Text style={styles.detailValue}>{selectedRoute?.cliente}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Coordenadas:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRoute?.destino.lat}, {selectedRoute?.destino.lon}
                  </Text>
                </View>
                
                {routeDetails && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nombre:</Text>
                      <Text style={styles.detailValue}>{routeDetails.nombre || "Electrodoméstico"}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Peso:</Text>
                      <Text style={styles.detailValue}>{routeDetails.peso || "33.49"} kg</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Descripción:</Text>
                      <Text style={styles.detailValue}>{routeDetails.descripcion || "Contiene materiales reciclables."}</Text>
                    </View>
                  </>
                )}
                
                <TouchableOpacity 
                  style={styles.assignButton}
                  onPress={() => {
                    setSelectedRoute(null);
                  }}
                >
                  <Text style={styles.assignButtonText}>Asignar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedRoute(null)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
        marginTop: 15, 
        paddingHorizontal: 15,
        paddingBottom: 80,
    },
    packageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    trackingNumber: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    carrier: {
        color: '#666',
        marginBottom: 5,
    },
    zoneText: {
        color: '#666',
        marginBottom: 5,
        fontStyle: 'italic',
    },
    packageCount: {
        color: '#888',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: width * 0.9,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: height * 0.8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontWeight: 'bold',
        marginRight: 5,
        color: '#555',
        width: 100,
    },
    detailValue: {
        flex: 1,
        color: '#666',
    },
    assignButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        alignItems: 'center',
    },
    assignButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#FFC107',
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 20,
        fontSize: 18,
        color: '#ff4444',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#FFC107',
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});