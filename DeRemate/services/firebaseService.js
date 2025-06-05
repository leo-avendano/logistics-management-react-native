// firebaseService.js
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig'; // Asegúrate de importar tu configuración de Firebase


export const getRutasByRepartidor = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const q = query(
      collection(db, 'Ruta'),
      where('repartidorUserID', '==', user.uid)
    );

    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error('Error al obtener rutas del repartidor:', error);
    throw error;
  }
};

export const getRutasDisponibles = async () => {
  try {
    const q = query(
      collection(db, 'Ruta'),
      where('estado', '==', 'disponible')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error('Error al obtener rutas disponibles:', error);
    throw error;
  }
};

export const getAllRutas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Ruta'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener todas las rutas:', error);
    throw error;
  }
};