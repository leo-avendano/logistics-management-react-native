import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HeaderContainer } from '../../components/HeaderContainer';
import { useShowNavbar } from '../../hooks/useShowNavbar';

const { width, height } = Dimensions.get('window');

export default function DeliveryConfirmationScreen() {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const routeData = params.route ? JSON.parse(params.route) : null;

  const [showNavbar, setShowNavbar] = useShowNavbar();

  useEffect(() => {
    setShowNavbar(false);
    return () => setShowNavbar(true);
  }, []);

  useEffect(() => {
    setShowNavbar(false);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    }
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimeout = () => {
    Alert.alert(
      'Tiempo agotado',
      'El tiempo para confirmar la entrega ha expirado. La entrega será cancelada automáticamente.',
      [
        {
          text: 'Entendido',
          onPress: () => router.replace('/main')
        }
      ]
    );
  };

  const handleConfirmDelivery = () => {
    if (code.length !== 4) {
      Alert.alert('Error', 'Debe ingresar un código de 4 dígitos');
      return;
    }

    if (!/^\d{4}$/.test(code)) {
      Alert.alert('Error', 'El código debe contener solo números');
      return;
    }

    Alert.alert(
      'Confirmar entrega',
      `¿Está seguro de confirmar la entrega del paquete ${routeData?.uuid}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: () => {
            // Aqui tenemos qe agregar la logica de firebase jsk
            Alert.alert(
              'Entrega confirmada',
              'El paquete ha sido entregado exitosamente',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/main')
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleCancelDelivery = () => {
    setShowCancelModal(false);
    Alert.alert(
      'Entrega cancelada',
      'La entrega del paquete ha sido cancelada',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/main')
        }
      ]
    );
  };

  const isTimeRunningOut = timeLeft <= 60; // Último minuto

  return (
    <View style={styles.container}>
      {/* Header */}
      <HeaderContainer>
        <View style={styles.logoContainer}>
          <Ionicons name="checkmark-circle-outline" size={40} color="#FFC107" />
          <Text style={styles.logoText}>Confirmar Entrega</Text>
        </View>
      </HeaderContainer>

      <View style={styles.content}>
        {/* Timer */}
        <View style={[styles.timerContainer, isTimeRunningOut && styles.timerWarning]}>
          <Ionicons 
            name="time-outline" 
            size={30} 
            color={isTimeRunningOut ? "#ff4444" : "#FFC107"} 
          />
          <Text style={[styles.timerText, isTimeRunningOut && styles.timerTextWarning]}>
            Tiempo restante: {formatTime(timeLeft)}
          </Text>
        </View>

        {/* Package Info */}
        <View style={styles.packageInfo}>
          <Text style={styles.packageTitle}>Información del Paquete</Text>
          <Text style={styles.packageDetail}>Código: {routeData?.uuid}</Text>
          <Text style={styles.packageDetail}>Cliente: {routeData?.cliente}</Text>
          <Text style={styles.packageDetail}>Destino: {routeData?.destino}</Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Ingrese el código de confirmación (4 dígitos)</Text>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => {
              // Solo permitir números y máximo 4 dígitos
              const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
              setCode(numericText);
            }}
            placeholder="0000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={4}
            textAlign="center"
            fontSize={24}
          />
        </View>

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
            style={[styles.button, styles.cancelButton]}
            onPress={() => setShowCancelModal(true)}
            disabled={timeLeft === 0}
          >
            <Ionicons name="close" size={24} color="white" />
            <Text style={styles.buttonText}>Cancelar Entrega</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="warning" size={50} color="#ff4444" />
            <Text style={styles.modalTitle}>¿Cancelar entrega?</Text>
            <Text style={styles.modalText}>
              ¿Está seguro de que desea cancelar la entrega de este paquete?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCancelDelivery}
              >
                <Text style={styles.modalButtonText}>Sí, cancelar</Text>
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
    borderColor: '#FFC107',
  },
  timerWarning: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ff4444',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC107',
    marginLeft: 10,
  },
  timerTextWarning: {
    color: '#ff4444',
  },
  packageInfo: {
    backgroundColor: '#FFFFFF',
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
    color: '#333',
  },
  packageDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  codeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#FFC107',
    borderRadius: 10,
    padding: 15,
    width: 120,
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 15,
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
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#ddd',
  },
  modalConfirmButton: {
    backgroundColor: '#ff4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});