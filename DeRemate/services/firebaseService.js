import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';


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
    const order = {
      'pendiente': 1,
      'en progreso': 2,
      'completado': 3,
      'cancelado': 4
    };

    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        const orderA = order[a.estado] || 999;
        const orderB = order[b.estado] || 999;
        return orderA - orderB;
      });
    
  } catch (error) {
    console.error('Error al obtener rutas del repartidor:', error);
    throw error;
  }
};

export const getRutasDisponibles = async () => {
  try {
    const q = query(
      collection(db, 'Ruta'),
      where('estado', '==', 'disponible'),
      where('repartidorUserID', '==', '')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      uuid: doc.id, // Add uuid field for consistency with Android
      ...doc.data()
    }));
    
  } catch (error) {
    console.error('Error al obtener rutas disponibles:', error);
    throw error;
  }
};

export const getRutasByStatusAndRepartidor = async (estado) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const repartidorUserID = user.uid;
    let querySnapshot;

    if (estado === 'Todas') {
      // Get available routes (unassigned) and user's assigned routes
      const disponibleQuery = query(
        collection(db, 'Ruta'),
        where('estado', '==', 'disponible'),
        where('repartidorUserID', '==', '')
      );
      
      const userRoutesQuery = query(
        collection(db, 'Ruta'),
        where('repartidorUserID', '==', repartidorUserID)
      );
      
      const [disponibleSnapshot, userSnapshot] = await Promise.all([
        getDocs(disponibleQuery),
        getDocs(userRoutesQuery)
      ]);
      
      const routes = [
        ...disponibleSnapshot.docs.map(doc => ({
          id: doc.id,
          uuid: doc.id,
          ...doc.data()
        })),
        ...userSnapshot.docs.map(doc => ({
          id: doc.id,
          uuid: doc.id,
          ...doc.data()
        }))
      ];
      
      return routes;
    } else {
      // Get routes by specific status
      const estadoFirebase = estado.toLowerCase();
      
      if (estadoFirebase === 'disponible') {
        // Only show available routes that are unassigned
        const q = query(
          collection(db, 'Ruta'),
          where('estado', '==', estadoFirebase),
          where('repartidorUserID', '==', '')
        );
        querySnapshot = await getDocs(q);
      } else {
        // Show user's routes with specific status
        const q = query(
          collection(db, 'Ruta'),
          where('estado', '==', estadoFirebase),
          where('repartidorUserID', '==', repartidorUserID)
        );
        querySnapshot = await getDocs(q);
      }
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        uuid: doc.id,
        ...doc.data()
      }));
    }
    
  } catch (error) {
    console.error('Error al obtener rutas por estado y repartidor:', error);
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

export const getPackageInfo = async (rutaId) => {
  try {
    const q = query(
      collection(db, 'Paquete'),
      where('rutaRef', '==', rutaId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null; 
    
  } catch (error) {
    console.error('Error al obtener la ruta:', error);
    throw error;
  }
};