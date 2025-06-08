import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getRutasByRepartidor } from '../../services/firebaseService';
import { StatusText } from '../../components/StatusText';
import { HeaderContainer } from '../../components/HeaderContainer';

const { width, height } = Dimensions.get('window');

export default function RecordScreen() {
  const [rutas, setRutas] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const filters = ['Todos', 'Pendiente', 'En Progreso', 'Completado', 'Cancelado'];

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true);
        const rutasData = await getRutasByRepartidor();
        setRutas(rutasData);
        setFilteredData(rutasData);
      } catch (err) {
        console.error('Error al obtener rutas:', err);
        setError('Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchRutas();
  }, []);

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    if (filter === 'Todos') {
      setFilteredData(rutas);
    } else {
      setFilteredData(rutas.filter(item => item.estado === filter.toLowerCase()));
    }
    setShowFilters(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = rutas.filter(item => 
      item.uuid?.toLowerCase().includes(text.toLowerCase()) ||
      item.cliente?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.packageCard}
      onPress={() => router.replace({
        pathname: "/record/description",
        params: { route: JSON.stringify(item) }
      })}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.trackingNumber}>ID: {item.uuid}</Text>
        <StatusText status={item.estado}/>
      </View>
      
      <Text style={styles.carrier}>Cliente: {item.cliente}</Text>
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
          <Ionicons name="calendar-outline" size={40} color="#FFC107" />
          <Text style={styles.logoText}>Historial de Rutas</Text>
        </View>
      </HeaderContainer>

      {/* Barra de búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por código de ruta o cliente"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color="#FFC107" />
        </TouchableOpacity>
      </View>

      {/* Lista de rutas */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron rutas</Text>
        }
      />

      {/* Modal de filtros */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por estado</Text>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  selectedFilter === filter && styles.selectedFilter
                ]}
                onPress={() => applyFilter(filter)}
              >
                <Text style={styles.filterText}>{filter}</Text>
                {selectedFilter === filter && (
                  <Ionicons name="checkmark" size={20} color="#FFC107" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  filterButton: {
    padding: 10,
  },
  listContent: {
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
  date: {
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
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFilter: {
    backgroundColor: '#fff9e6',
  },
  filterText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
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
  },
  datesContainer: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5
  },
  coordinateText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555'
  }
});