// utils/pdtStorage.js
// Almacenamiento de plantillas PDT usando IndexedDB (sin límite de tamaño)

const DB_NAME = 'pdt-database';
const STORE_NAME = 'plantillas';
const DB_VERSION = 1;

// Abrir/crear base de datos
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'servicio' });
      }
    };
  });
};

// Guardar plantilla
export const guardarPlantilla = async (servicio, plantillaData) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data = {
      servicio: servicio,
      ...plantillaData,
      fechaActualizacion: new Date().toISOString()
    };
    
    await store.put(data);
    return { success: true };
  } catch (error) {
    console.error('Error guardando plantilla:', error);
    return { success: false, error: error.message };
  }
};

// Obtener plantilla
export const obtenerPlantilla = async (servicio) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(servicio);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error obteniendo plantilla:', error);
    return null;
  }
};

// Obtener todas las plantillas
export const obtenerTodasPlantillas = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const plantillas = request.result;
        // Convertir array a objeto para compatibilidad
        const plantillasObj = {};
        plantillas.forEach(p => {
          plantillasObj[p.servicio] = p;
        });
        resolve(plantillasObj);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error obteniendo todas las plantillas:', error);
    return {};
  }
};

// Eliminar plantilla
export const eliminarPlantilla = async (servicio) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(servicio);
      request.onsuccess = () => resolve({ success: true });
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error eliminando plantilla:', error);
    return { success: false, error: error.message };
  }
};

// Contar plantillas
export const contarPlantillas = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error contando plantillas:', error);
    return 0;
  }
};