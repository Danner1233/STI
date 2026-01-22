// utils/generadorPDT.js
// Generador PDT usando ExcelJS - PRESERVANDO TODO EL FORMATO

import { obtenerPlantilla } from './pdtStorage';

export const generarPDT = async (datosOT, plantillaBase64) => {
  try {
    console.log('📋 Generando PDT preservando formato original...');
    console.log('Datos:', datosOT);
    
    if (!plantillaBase64) {
      throw new Error('No se proporcionó la plantilla');
    }
    
    // Importar ExcelJS
    const ExcelJS = await import('exceljs');
    
    // Convertir base64 a ArrayBuffer
    const base64Data = plantillaBase64.split(',')[1];
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Cargar workbook PRESERVANDO ESTILOS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes.buffer);
    
    console.log('✅ Plantilla cargada con ExcelJS');
    
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new Error('No se pudo cargar la hoja');
    }
    
    // Preparar fecha
    const hoy = new Date();
    
    // ========== MODIFICAR SOLO LOS VALORES, MANTENER ESTILOS ==========
    
    // E8: FECHA - Obtener celda, guardar estilo, cambiar solo valor
    const cellE8 = worksheet.getCell('E8');
    const estiloE8 = {
      font: cellE8.font,
      fill: cellE8.fill,
      border: cellE8.border,
      alignment: cellE8.alignment,
      numFmt: cellE8.numFmt
    };
    cellE8.value = hoy;  // Poner fecha como Date
    // Restaurar estilo
    cellE8.font = estiloE8.font;
    cellE8.fill = estiloE8.fill;
    cellE8.border = estiloE8.border;
    cellE8.alignment = estiloE8.alignment;
    cellE8.numFmt = estiloE8.numFmt;
    console.log('✅ E8 (Fecha):', cellE8.value);
    
    // E11: CLIENTE - Guardar estilo, cambiar valor
    const cellE11 = worksheet.getCell('E11');
    const estiloE11 = {
      font: cellE11.font,
      fill: cellE11.fill,
      border: cellE11.border,
      alignment: cellE11.alignment,
      numFmt: cellE11.numFmt
    };
    cellE11.value = datosOT.cliente;
    cellE11.font = estiloE11.font;
    cellE11.fill = estiloE11.fill;
    cellE11.border = estiloE11.border;
    cellE11.alignment = estiloE11.alignment;
    cellE11.numFmt = estiloE11.numFmt;
    console.log('✅ E11 (Cliente):', cellE11.value);
    
    // G9: OT - Guardar estilo, cambiar valor
    const cellG9 = worksheet.getCell('G9');
    const estiloG9 = {
      font: cellG9.font,
      fill: cellG9.fill,
      border: cellG9.border,
      alignment: cellG9.alignment,
      numFmt: cellG9.numFmt
    };
    cellG9.value = datosOT.numeroOT;
    cellG9.font = estiloG9.font;
    cellG9.fill = estiloG9.fill;
    cellG9.border = estiloG9.border;
    cellG9.alignment = estiloG9.alignment;
    cellG9.numFmt = estiloG9.numFmt;
    console.log('✅ G9 (OT):', cellG9.value);
    
    // E13: DIRECCIÓN - Guardar estilo (especialmente negrita), cambiar valor
    const cellE13 = worksheet.getCell('E13');
    const estiloE13 = {
      font: cellE13.font || { bold: true, name: 'Century Gothic', size: 9 },
      fill: cellE13.fill,
      border: cellE13.border,
      alignment: cellE13.alignment,
      numFmt: cellE13.numFmt
    };
    cellE13.value = datosOT.direccion;
    cellE13.font = estiloE13.font;
    cellE13.fill = estiloE13.fill;
    cellE13.border = estiloE13.border;
    cellE13.alignment = estiloE13.alignment;
    cellE13.numFmt = estiloE13.numFmt;
    console.log('✅ E13 (Dirección):', cellE13.value);
    
    console.log('✅ Valores actualizados preservando formato');
    
    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Buffer generado:', buffer.byteLength, 'bytes');
    
    // Crear blob
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Nombre archivo
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaStr = `${dia}-${mes}-${anio}`;
    
    const servicioLimpio = datosOT.servicio.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const nombreArchivo = `PDT_${servicioLimpio}_OT${datosOT.numeroOT}_${fechaStr}.xlsx`;
    
    console.log('💾 Descargando:', nombreArchivo);
    
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
    
    console.log('✅ PDT generado con formato preservado');
    
    return { success: true, nombreArchivo };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
};

export const obtenerPlantillaPDT = async (servicio) => {
  const plantilla = await obtenerPlantilla(servicio);
  console.log('🔍 Plantilla:', servicio, plantilla ? 'OK' : 'No');
  return plantilla || null;
};

export const existePlantillaPDT = async (servicio) => {
  const plantilla = await obtenerPlantilla(servicio);
  return !!plantilla;
};