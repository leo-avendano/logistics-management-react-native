import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { Button, Surface, IconButton } from 'react-native-paper';   // 👈  IconButton
import { useRouter } from 'expo-router';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default function QRScanner() {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);                         // 👈  nuevo estado
  const [permission, requestPermission] = useCameraPermissions();

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
      const { paqueteId } = JSON.parse(data);
      const ref = doc(db, 'Paquete', paqueteId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        Alert.alert('No encontrado', 'El paquete no existe.');
      } else {
        router.push(`/paquete/${paqueteId}`);
      }
    } catch (err) {
      console.log('Error escaneo:', err);
      Alert.alert('Error', 'QR inválido.');
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
        enableTorch={torch}      // 👈  aquí se enciende/apaga
        barcodeScannerSettings={{
          barcodeTypes: Camera?.Constants?.BarCodeType?.qr ? [Camera.Constants.BarCodeType.qr] : [],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay} />
        <View style={styles.scanFrame} />

        {/* ----------  BOTÓN LINTERNA  ---------- */}
        <View style={styles.buttonContainer}>
          <IconButton
            icon={torch ? 'flashlight-off' : 'flashlight'}
            size={36}
            onPress={() => setTorch((prev) => !prev)}
            mode="contained-tonal"
          />
        </View>
      </CameraView>
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
