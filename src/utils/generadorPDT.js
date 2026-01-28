// utils/generadorPDT.js
// SIMPLE: Solo descarga la plantilla para editar manualmente

import { obtenerPlantilla } from './pdtStorage';

export const generarPDT = async (datosOT, plantillaBase64) => {
  try {
    console.log('📋 Descargando plantilla PDT para edición manual...');
    
    if (!plantillaBase64) {
      throw new Error('No se proporcionó la plantilla');
    }
    
    // Convertir base64 a blob directamente
    const base64Data = plantillaBase64.split(',')[1];
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Crear nombre de archivo con datos de referencia
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaStr = `${dia}-${mes}-${anio}`;
    
    const servicioLimpio = datosOT.servicio.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const nombreArchivo = `PDT_${servicioLimpio}_OT${datosOT.numeroOT}_${fechaStr}.xlsx`;
    
    // Descargar
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 100);
    
    console.log('✅ Plantilla descargada:', nombreArchivo);
    console.log('📝 Datos de referencia para llenar manualmente:');
    console.log('   - Fecha:', fecha.toLocaleDateString('es-CO'));
    console.log('   - Cliente:', datosOT.cliente);
    console.log('   - OT:', datosOT.numeroOT);
    console.log('   - Dirección:', datosOT.direccion);
    
    return { success: true, nombreArchivo };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

export const obtenerPlantillaPDT = async (servicio) => {
  const plantilla = await obtenerPlantilla(servicio);
  return plantilla || null;
};

export const existePlantillaPDT = async (servicio) => {
  const plantilla = await obtenerPlantilla(servicio);
  return !!plantilla;
};