import { useState, useEffect, useCallback } from 'react';

// 🗄️ HOOK PARA USAR LA BASE DE DATOS JSON

const useJSONDatabase = (collection = 'productividad', autoSync = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const DB_URL = 'http://localhost:3002/api/db';

  // ========== CARGAR DATOS ==========
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${DB_URL}/${collection}/get`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
        console.log(`✅ ${collection} cargado: ${result.count} registros`);
      } else {
        throw new Error(result.error || 'Error al cargar datos');
      }
    } catch (err) {
      console.error(`Error cargando ${collection}:`, err);
      setError(err.message);
      // Si falla, intentar cargar desde localStorage como fallback
      const fallback = localStorage.getItem(collection);
      if (fallback) {
        setData(JSON.parse(fallback));
        console.log(`📦 ${collection} cargado desde localStorage (fallback)`);
      }
    } finally {
      setLoading(false);
    }
  }, [collection]);

  // ========== GUARDAR DATOS ==========
  const saveData = useCallback(async (newData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${DB_URL}/${collection}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(newData);
        setLastSaved(new Date());
        console.log(`✅ ${collection} guardado: ${result.count} registros`);
        
        // Guardar también en localStorage como backup
        localStorage.setItem(collection, JSON.stringify(newData));
        
        return { success: true };
      } else {
        throw new Error(result.error || 'Error al guardar datos');
      }
    } catch (err) {
      console.error(`Error guardando ${collection}:`, err);
      setError(err.message);
      
      // Si falla, guardar en localStorage como fallback
      localStorage.setItem(collection, JSON.stringify(newData));
      setData(newData);
      console.log(`📦 ${collection} guardado en localStorage (fallback)`);
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [collection]);

  // ========== AGREGAR REGISTRO ==========
  const addRecord = useCallback(async (record) => {
    const newData = [record, ...data];
    return await saveData(newData);
  }, [data, saveData]);

  // ========== ACTUALIZAR REGISTRO ==========
  const updateRecord = useCallback(async (id, updates) => {
    const newData = data.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    return await saveData(newData);
  }, [data, saveData]);

  // ========== ELIMINAR REGISTRO ==========
  const deleteRecord = useCallback(async (id) => {
    const newData = data.filter(item => item.id !== id);
    return await saveData(newData);
  }, [data, saveData]);

  // ========== CREAR BACKUP ==========
  const createBackup = useCallback(async () => {
    try {
      const response = await fetch(`${DB_URL}/backup/${collection}`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        console.log(`💾 Backup de ${collection} creado`);
        return { success: true };
      }
    } catch (err) {
      console.error('Error creando backup:', err);
      return { success: false, error: err.message };
    }
  }, [collection]);

  // ========== AUTO-SYNC (opcional) ==========
  useEffect(() => {
    if (autoSync) {
      loadData();
    }
  }, [loadData, autoSync]);

  // Auto-guardar cada 5 minutos si hay cambios
  useEffect(() => {
    if (autoSync && data.length > 0) {
      const interval = setInterval(() => {
        saveData(data);
        console.log(`🔄 Auto-guardado de ${collection}`);
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(interval);
    }
  }, [data, autoSync, collection, saveData]);

  return {
    data,
    setData,
    loading,
    error,
    lastSaved,
    loadData,
    saveData,
    addRecord,
    updateRecord,
    deleteRecord,
    createBackup
  };
};

export default useJSONDatabase;
