import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HeaderContainer } from '../../components/HeaderContainer';
import { Loading } from '../../components/Loading';
import { useDeliveryTimer } from '../../hooks/useDeliveryTimer';
import { getByRutaId } from '../../services/firebaseService';
import { logisticsService } from '../../services/logisticsService';
import { COLORS_ } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function DeliveryConfirmationScreen() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [timeoutAlertShown, setTimeoutAlertShown] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params || {};
  const routeId = params.uuid ? params.uuid : null;

  const handleTimeout = async () => {
  if (timeoutAlertShown) return;
    setTimeoutAlertShown(true);
    Alert.alert(
      'Tiempo agotado',
      'El tiempo para confirmar la entrega ha expirado. Ahora puede cancelar la entrega si es necesario.',
      [{ text: 'Entendido' }]
    );
  };

  const { timeLeft, formatTime, isTimeRunningOut } = useDeliveryTimer(handleTimeout);

  useEffect(() => {
    const loadRouteData = async () => {
      if (!routeId) {
        setError('ID de ruta no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getByRutaId(routeId);
        setRouteData(data);
      } catch (err) {
        console.error('Error al cargar datos de ruta:', err);
        setError('No se pudieron cargar los datos de la ruta');
      } finally {
        setLoading(false);
      }
    };

    loadRouteData();
  }, [routeId]);

  const handleConfirmDelivery = () => {
    setShowConfirmModal(true);
  };

  const handleFinalConfirmation = async () => {
    if (!confirmationNotes.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingrese el codigo de Confirmacion');
      return;
    }

    setShowConfirmModal(false);
    setLoading(true);
    
    try {
      navigation.goBack();
      await logisticsService.setRouteCompleted(routeData.uuid, confirmationNotes.trim());
      Alert.alert(
        'Entrega confirmada',
        'El paquete ha sido entregado exitosamente',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorString = error.toString();
      const message = errorString.substring(errorString.indexOf("Error: ") + 7, errorString.length);
      Alert.alert(message);
    } finally {
      setLoading(false);
      setConfirmationNotes('');
    }
  };

  const handleCancelDelivery = () => {
    Alert.alert(
      'Cancelar entrega',
      `¿Está seguro de cancelar la entrega del paquete ${routeData?.uuid}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Si',
          onPress: async () => {
            setLoading(true);
            navigation.goBack();
            try {
              await logisticsService.setRouteCancelled(routeData.uuid);
              Alert.alert(
                'Entrega cancelada',
                'La entrega del paquete ha sido cancelada',
                [{ text: 'OK' }]
              );
            } catch (e) {
              Alert.alert('Error', 'No se pudo cancelar la entrega.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderContainer>
        <View style={styles.logoContainer}>
          <Ionicons name="checkmark-circle-outline" size={40} color={COLORS_.primary} />
          <Text style={styles.logoText}>Confirmar Entrega</Text>
        </View>
      </HeaderContainer>
      
      {loading ? (
        <Loading backgroundColor='#F5F5F5'/>
      ) : error || !routeData ? (
        <View style={[styles.container, styles.centered]}>
          <Text>{error || 'No hay datos de ruta disponibles'}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Timer */}
          <View style={[styles.timerContainer, isTimeRunningOut && styles.timerWarning]}>
            <Ionicons 
              name="time-outline" 
              size={30} 
              color={isTimeRunningOut ? COLORS_.danger : COLORS_.primary} 
            />
            <Text style={[styles.timerText, isTimeRunningOut && styles.timerTextWarning]}>
              Tiempo restante: {formatTime(timeLeft)}
            </Text>
          </View>

          {/* Route Info */}
          <View style={styles.packageInfo}>
            <Text style={styles.packageTitle}>Información</Text>
            <Text style={styles.packageDetail}>Código: {routeData.uuid}</Text>
            <Text style={styles.packageDetail}>Cliente: {routeData.cliente}</Text>
            <Text style={styles.packageDetail}>Cliente Nombre: {routeData.cliente_nombre || routeData.cliente}</Text>
            <Text style={styles.packageDetail}>
              Descripción Paquete: {routeData.paquete?.descripcion || 'Sin descripción'}
            </Text>
            <Text style={styles.packageDetail}>
              Inicio: {routeData.fechas?.inicioRepartir || 'N/A'}
            </Text>
          </View>

          {/* Destination Info */}
          {routeData.destino && (
            <View style={styles.packageInfo}>
              <Text style={styles.packageTitle}>Información de Destino</Text>
              <Text style={styles.packageDetail}>
                Detalles: {routeData.destino.detalles || 'Calle N/A - Piso N/A - Dep N/A'}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirmDelivery}
              disabled={timeLeft === 0}
            >
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.buttonText}>Confirmar Entrega</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                timeLeft === 0 ? styles.cancelButton : styles.cancelButtonDisabled
              ]}
              onPress={handleCancelDelivery}
              disabled={timeLeft > 0}
            >
              <Ionicons name="close" size={24} color="white" />
              <Text style={styles.buttonText}>Cancelar Entrega</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal de confirmación con input */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Entrega</Text>
            <Text style={styles.modalSubtitle}>
              Paquete: {routeData?.uuid}
            </Text>
            
            <Text style={styles.inputLabel}>Codigo de Confirmacion</Text>
            <TextInput
              style={styles.textInput}
              value={confirmationNotes}
              onChangeText={setConfirmationNotes}
              placeholder="Ej: Entregado a Juan Pérez"
              autoFocus
              maxLength={100}
              returnKeyType="done"
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                  setConfirmationNotes('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleFinalConfirmation}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_.background,
  },
  centered: {
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
  content: {
    flex: 1,
    padding: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff9e6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS_.primary,
  },
  timerWarning: {
    backgroundColor: '#ffe6e6',
    borderColor: COLORS_.danger,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS_.primary,
    marginLeft: 10,
  },
  timerTextWarning: {
    color: COLORS_.danger,
  },
  packageInfo: {
    backgroundColor: COLORS_.white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS_.text,
  },
  packageDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: COLORS_.textSecondary,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  confirmButton: {
    backgroundColor: COLORS_.success,
  },
  cancelButton: {
    backgroundColor: COLORS_.danger,
  },
  cancelButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS_.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    width: width * 0.9,
    maxHeight: height * 0.7,
    marginBottom: 120,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: COLORS_.text,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: COLORS_.textSecondary,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS_.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 22,
    height: 48,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    color: COLORS_.text,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
  },
  modalConfirmButton: {
    backgroundColor: COLORS_.success,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});