import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface } from 'react-native-paper';
import { useToast } from '../../components/ToastProvider';
import { db } from '../../config/firebaseConfig';
import { Navbar } from '../../components/Navbar';
import { logisticsService } from '../../services/logisticsService';


export default function QRScanner() {
  const navigation = useNavigation();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);                         
  const [permission, requestPermission] = useCameraPermissions();
  
  const { showToast } = useToast();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const COOLDOWN_MS = 3000;

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const sanitized = data.replace(/\u00A0/g, ' ').trim();
      const { paqueteId } = JSON.parse(sanitized);
      const ref = doc(db, 'Paquete', paqueteId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        showToast('📦 El paquete no existe en el sistema', 'warning');
      } else {
        const paqueteData = snap.data();
        const routeUUID = paqueteData.rutaRef;
        
        // Hacer el request POST para iniciar la ruta pendiente
        try {
          await logisticsService.setRouteInProgress(routeUUID);
          showToast('✅ Paquete encontrado y ruta iniciada', 'success', 1500);
        } catch (requestError) {
          console.log('Error al iniciar ruta:', requestError);
          showToast('⚠️ Paquete encontrado pero no se pudo iniciar la ruta', 'warning');
        }
        
        navigation.navigate('Paquete', { id: paqueteId }); // paso como parámetro el id del paquete
      }
    } catch (err) {
      console.log('Error escaneo:', err);
      showToast('❌ QR inválido. Intenta escanear nuevamente', 'error');
    } finally {
      setTimeout(() => setScanned(false), COOLDOWN_MS);
    }
  };

  if (!permission?.granted) {
    return (
      <View>
        <Button onPress={requestPermission}>Solicitar acceso a la cámara</Button>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <CameraView
        style={styles.camera}
        enableTorch={torch}     //prender / apagar
        barcodeScannerSettings={{
          barcodeTypes: Camera?.Constants?.BarCodeType?.qr ? [Camera.Constants.BarCodeType.qr] : [],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay} />
        <View style={styles.scanFrame} />

        {/* linterna */}
        <View style={styles.buttonContainer}>
          <IconButton
            icon={torch ? 'flashlight-off' : 'flashlight'}
            size={36}
            onPress={() => setTorch((prev) => !prev)}
            mode="contained-tonal"
          />
        </View>
      </CameraView>
      <Navbar></Navbar>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    zIndex: 15,
  },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '30%',
    borderColor: '#FFEB3B',
    borderWidth: 3,
    borderRadius: 8,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 5,
  },
});