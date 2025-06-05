import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config/firebaseConfig'

const { width, height } = Dimensions.get('window');

// MOKUP
const packageHistory = [
  { id: '1', trackingNumber: 'ABC123', status: 'Entregado', date: '2023-05-15', carrier: 'FedEx' },
  { id: '2', trackingNumber: 'XYZ789', status: 'En tránsito', date: '2023-05-18', carrier: 'DHL' },
  { id: '3', trackingNumber: 'DEF456', status: 'En aduana', date: '2023-05-20', carrier: 'UPS' },
  { id: '4', trackingNumber: 'GHI789', status: 'Entregado', date: '2023-05-22', carrier: 'FedEx' },
  { id: '5', trackingNumber: 'JKL012', status: 'En tránsito', date: '2023-05-25', carrier: 'DHL' },
];

export default function RutesScreen() {
  const [filteredData, setFilteredData] = useState(packageHistory);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const rutasRef = collection(db, "Ruta");

  const filters = ['Todos', 'Entregado', 'En tránsito', 'En aduana'];

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    if (filter === 'Todos') {
      setFilteredData(packageHistory);
    } else {
      setFilteredData(packageHistory.filter(item => item.status === filter));
    }
    setShowFilters(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = packageHistory.filter(item => 
      item.trackingNumber.toLowerCase().includes(text.toLowerCase()) ||
      item.carrier.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const renderItem = ({ item }) => (
    <View style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <Text style={styles.trackingNumber}>Cliente: {item.cliente || 'Sin cliente'}</Text>
        <Text style={[
          styles.status,
          item.estado === 'completado' ? styles.delivered : 
          item.estado === 'en camino' ? styles.inTransit : 
          item.estado === 'cancelado' ? styles.canceled :
          styles.preparation
        ]}>
          {item.estado?.toUpperCase() || 'ESTADO DESCONOCIDO'}
        </Text>
      </View>
      
      <Text style={styles.carrier}>ID: {item.uuid || 'Sin ID'}</Text>
      
      {item.destino && (
        <Text style={styles.date}>
          📍 Destino: Lat: {item.destino.lat?.toFixed(6) || 'N/A'}, 
          Lon: {item.destino.lon?.toFixed(6) || 'N/A'}
        </Text>
      )}
      
      {item.fechas && (
        <View style={styles.datesContainer}>
          <Text style={styles.date}>
            🚀 Inicio: {item.fechas.inicioRepartir || 'No especificada'}
          </Text>
          <Text style={styles.date}>
            ✅ Fin: {item.fechas.finRepartir || 'No especificada'}
          </Text>
        </View>
      )}
    </View>
  );


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="cube-outline" size={40} color="#FFC107" />
          <Text style={styles.logoText}>Historial</Text>
        </View>
      </View>

      {/* Barra de búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número o transportista"
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

      {/* Lista de paquetes */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron paquetes</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
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
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  filterButton: {
    padding: 10,
  },
  listContent: {
    padding: 15,
  },
  packageCard: {
    backgroundColor: '#f9f9f9',
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
  status: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  delivered: {
    backgroundColor: '#e6f7ee',
    color: '#10b981',
  },
  inTransit: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
  },
  customs: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
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