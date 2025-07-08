import { collection, query, where, getDocs, getDoc, doc} from 'firebase/firestore';
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

export const getRutasByStatusAndRepartidorWithProduct = async (estado) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const repartidorUserID = user.uid;
    let routes = [];

    if (estado === 'Todas') {
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
      
      routes = [
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
    } else {
      const estadoFirebase = estado.toLowerCase();
      
      if (estadoFirebase === 'disponible') {
        const q = query(
          collection(db, 'Ruta'),
          where('estado', '==', estadoFirebase),
          where('repartidorUserID', '==', '')
        );
        const querySnapshot = await getDocs(q);
        routes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          uuid: doc.id,
          ...doc.data()
        }));
      } else {
        const q = query(
          collection(db, 'Ruta'),
          where('estado', '==', estadoFirebase),
          where('repartidorUserID', '==', repartidorUserID)
        );
        const querySnapshot = await getDocs(q);
        routes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          uuid: doc.id,
          ...doc.data()
        }));
      }
    }
    const routesWithPackages = await Promise.all(
      routes.map(async (route) => {
        try {
          const packageInfo = await getPackageInfo(route.id);
          return {
            ...route,
            paquete: packageInfo
          };
        } catch (error) {
          console.error(`Error al obtener paquete para ruta ${route.id}:`, error);
          return {
            ...route,
            paquete: null
          };
        }
      })
    );
    return routesWithPackages;
    
  } catch (error) {
    console.error('Error al obtener rutas con productos por estado y repartidor:', error);
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

export const getRutasPaquetesEnProgreso = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    const rutasQuery = query(
      collection(db, 'Ruta'),
      where('estado', '==', 'en progreso'),
      where('repartidorUserID', '==', user.uid)
    );

    const rutasSnapshot = await getDocs(rutasQuery);
    
    const rutasConPaquetes = await Promise.all(
      rutasSnapshot.docs.map(async (rutaDoc) => {
        const rutaData = {
          id: rutaDoc.id,
          uuid: rutaDoc.id,
          ...rutaDoc.data()
        };

        try {
          const paqueteQuery = query(
            collection(db, 'Paquete'),
            where('rutaRef', '==', rutaDoc.id)
          );
          
          const paqueteSnapshot = await getDocs(paqueteQuery);
          
          if (!paqueteSnapshot.empty) {
            const paqueteDoc = paqueteSnapshot.docs[0];
            rutaData.paquete = {
              id: paqueteDoc.id,
              ...paqueteDoc.data()
            };
          } else {
            rutaData.paquete = null;
          }
          
          return rutaData;
          
        } catch (error) {
          console.error(`Error al obtener paquete para ruta ${rutaDoc.id}:`, error);
          return {
            ...rutaData,
            paquete: null
          };
        }
      })
    );

    return rutasConPaquetes;
    
  } catch (error) {
    console.error('Error al obtener rutas en proceso con paquetes:', error);
    throw error;
  }
};

export const getByRutaId = async (rutaId) => {
  try {
    if (!rutaId) {
      throw new Error('ID de ruta requerido');
    }

    const rutaDoc = await getDoc(doc(db, 'Ruta', rutaId));
    
    if (!rutaDoc.exists()) {
      throw new Error('Ruta no encontrada');
    }

    const rutaData = {
      id: rutaDoc.id,
      uuid: rutaDoc.id,
      ...rutaDoc.data()
    };
    try {
      const paqueteInfo = await getPackageInfo(rutaId);
      rutaData.paquete = paqueteInfo;
    } catch (error) {
      console.error(`Error al obtener paquete para ruta ${rutaId}:`, error);
      rutaData.paquete = null;
    }

    return rutaData;
    
  } catch (error) {
    console.error('Error al obtener ruta por ID:', error);
    throw error;
  }
};