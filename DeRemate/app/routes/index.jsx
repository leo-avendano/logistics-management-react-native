import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRutasByStatusAndRepartidorWithProduct, getPackageInfo } from '../../services/firebaseService';
import { logisticsService } from '../../services/logisticsService';
import { StatusText } from '../../components/StatusText';
import { HeaderContainer } from '../../components/HeaderContainer';
import { Loading } from '../../components/Loading';
import { useToast } from '../../components/ToastProvider';
import { openGoogleMaps } from '../../services/openMapsService';
import { Navbar } from '../../components/Navbar';

const { width, height } = Dimensions.get('window');

export default function AvailableRoutesScreen({ route, navigation }) {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('Disponible');
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();
  const filters = ['Todas', 'Disponible', 'Pendiente', 'En Progreso', 'Completado', 'Fallida'];

  // 📱 Handle notification parameters
  useEffect(() => {
    const params = route?.params;
    if (params?.fromNotification) {
      console.log('📍 Opened from notification:', params);
      
      // Show welcome message from notification
      const message = params.destination 
        ? `🚀 Nueva ruta disponible hacia ${params.destination}` 
        : '🚀 Nueva ruta disponible';
      
      showToast(message, 'info', 3000);
      
      // Set filter to show available routes when coming from notification
      if (params.routeId) {
        setCurrentFilter('Disponible');
      }
    }
  }, [route?.params, showToast]);

  useEffect(() => {
    fetchRutas();
  }, [currentFilter]);

  const fetchRutas = async () => {
    try {
      setLoading(true);
      const rutasData = await getRutasByStatusAndRepartidorWithProduct(currentFilter);
      setRutas(rutasData);
      setError(null);
    } catch (err) {
      console.error('Error al obtener rutas:', err);
      setError('Error al cargar las rutas');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAssignRoute = async (route) => {
    try {
      setActionLoading(true);
      const userId = logisticsService.getCurrentUserId();
    
      if (!userId) {
        showToast('Usuario no autenticado. Inicia sesión nuevamente.', 'error');
        return;
      }

      await logisticsService.assignRouteToRepartidor(route.uuid, userId);
      showToast('🚚 Ruta asignada correctamente', 'success');
      setSelectedRoute(null);
      fetchRutas();
    } catch (error) {
      console.error('Error assigning route:', error);
      showToast(`Error al asignar la ruta: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassignRoute = async (route) => {
    try {
      setActionLoading(true);
      await logisticsService.unassignRouteFromRepartidor(route.uuid);
      showToast('✅ Ruta liberada correctamente', 'success');
      setSelectedRoute(null);
      fetchRutas();
    } catch (error) {
      console.error('Error unassigning route:', error);
      showToast(`Error al liberar la ruta: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getActionButton = (route) => {
    if (!route || !route.estado) {
      return null;
    }
  
    const estado = route.estado.toLowerCase();
  
    switch (estado) {
      case 'disponible':
        return {
          text: 'Reservar',
          color: '#4CAF50',
          action: () => handleAssignRoute(route)
        };
      case 'pendiente':
        return {
          text: 'Quitar',
          color: '#ff6b6b',
          action: () => handleUnassignRoute(route)
        };
      default:
        return null;
    }
  };

  const mapViewButton = (route) => {
    if (!route || !route.estado) return null;

    const estado = route.estado.toLowerCase();
    if (['disponible', 'en progreso', 'pendiente'].includes(estado)) {
      return (
        <TouchableOpacity
          style={[styles.assignButton, { backgroundColor: '#4285F4', marginTop: 10 }]}
          onPress={() => openGoogleMaps(route.destino)}
        >
          <Text style={styles.assignButtonText}>Ver Ruta en Maps</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderItem = ({ item }) => {
    if (!item) return null;
    
    // Check if this is the route from notification
    const isFromNotification = route?.params?.fromNotification && 
                               route?.params?.routeId === item.uuid;
    
    return (
      <TouchableOpacity 
        style={[
          styles.packageCard,
          isFromNotification && styles.packageCardHighlighted
        ]}
        onPress={() => handleRoutePress(item)}
      >
        <View style={styles.packageHeader}>
          <Text style={[
            styles.trackingNumber,
            isFromNotification && styles.trackingNumberHighlighted
          ]}>
            {item.paquete?.nombre || 'No definido'} - {item.uuid || 'N/A'}
            {isFromNotification && ' 🔔'}
          </Text>
          <StatusText status={item.estado || 'unknown'}/>
        </View>
        <Text style={[
          styles.carrier,
          isFromNotification && styles.carrierHighlighted
        ]}>
          Cliente: {item.cliente || 'N/A'}
        </Text>
        {isFromNotification && (
          <Text style={styles.notificationBadge}>
            📱 Desde notificación
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderContainer>
        <View style={styles.logoContainer}>
          <Ionicons name="location-outline" size={40} color="#FFC107" />
          <Text style={styles.logoText}>Rutas</Text>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color="#FFC107" />
          <Text style={styles.filterText}>{currentFilter}</Text>
        </TouchableOpacity>
      </HeaderContainer>

      {/* Cuerpo principal */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <Loading backgroundColor='#F5F5F5'/>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={50} color="#ff4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchRutas}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={rutas}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay rutas disponibles</Text>
            }
          />
        )}
      </View>

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
              <Loading size="large" color="#FFC107" backgroundColor="transparent" />
            ) : selectedRoute ? (
              <>
                <Text style={styles.modalTitle}>Detalles de la Ruta</Text>
              
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>{selectedRoute.uuid || 'N/A'}</Text>
                </View>
              
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cliente:</Text>
                  <Text style={styles.detailValue}>{selectedRoute.cliente || 'N/A'}</Text>
                </View>
              
                {routeDetails && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nombre:</Text>
                      <Text style={styles.detailValue}>{routeDetails.nombre || "No definido"}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Peso:</Text>
                      <Text style={styles.detailValue}>{routeDetails.peso || "No definido"} kg</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Descripción:</Text>
                      <Text style={styles.detailValue}>{routeDetails.descripcion || "Contiene materiales reciclables."}</Text>
                    </View>
                  </>
                )}

                {mapViewButton(selectedRoute)}
                {(() => {
                  const actionButton = getActionButton(selectedRoute);
                  return actionButton ? (
                    <TouchableOpacity 
                      style={[styles.assignButton, { backgroundColor: actionButton.color }]}
                      onPress={actionButton.action}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.assignButtonText}>{actionButton.text}</Text>
                      )}
                    </TouchableOpacity>
                  ) : null;
                })()}
              
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedRoute(null)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Modal de filtros */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filterModalContent}>
            <Text style={styles.modalTitle}>Filtrar Rutas</Text>
          
            <ScrollView style={styles.filterScrollView}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOption,
                    currentFilter === filter && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    setCurrentFilter(filter);
                    setShowFilters(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      currentFilter === filter && styles.filterOptionTextSelected
                    ]}
                  >
                    {filter}
                  </Text>
                  {currentFilter === filter && (
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Navbar/>
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
        flex: 1,
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
    packageCardHighlighted: {
        backgroundColor: '#FFF9C4',
        borderColor: '#FFC107',
        borderWidth: 2,
        shadowColor: '#FFC107',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    trackingNumberHighlighted: {
        color: '#E65100',
        fontWeight: 'bold',
    },
    carrier: {
        color: '#666',
        marginBottom: 5,
    },
    carrierHighlighted: {
        color: '#E65100',
        fontWeight: '600',
    },
    notificationBadge: {
        backgroundColor: '#FFC107',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'flex-start',
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
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFC107',
    },
    filterText: {
        marginLeft: 5,
        color: '#FFC107',
        fontWeight: 'bold',
        fontSize: 14,
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
    filterModalContent: {
        width: width * 0.8,
        maxHeight: height * 0.6,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    filterScrollView: {
        maxHeight: height * 0.4,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginVertical: 5,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    filterOptionSelected: {
        backgroundColor: '#FFC107',
        borderColor: '#FFC107',
    },
    filterOptionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    filterOptionTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
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