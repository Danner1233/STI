import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { SERVICIOS_PDT } from '../constants/serviciosPDT';
import { guardarPlantilla, obtenerTodasPlantillas, eliminarPlantilla } from '../utils/pdtStorage';

const GestionPDT = ({ onClose }) => {
  const [plantillas, setPlantillas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [buscando, setBuscando] = useState('');
  const fileInputRefs = useRef({});

  // Cargar plantillas al montar
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      const plantillasDB = await obtenerTodasPlantillas();
      setPlantillas(plantillasDB);
      setCargando(false);
    };
    
    cargarDatos();
  }, []);

  const cargarPlantillas = async () => {
    setCargando(true);
    const plantillasDB = await obtenerTodasPlantillas();
    setPlantillas(plantillasDB);
    setCargando(false);
  };

  const handleSubirPlantilla = async (servicio, file) => {
    if (!file) return;

    // Validar que sea Excel
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type)) {
      alert('⚠️ Solo se permiten archivos Excel (.xls, .xlsx)');
      return;
    }

    // Mostrar loading
    alert('📤 Subiendo plantilla... Esto puede tardar unos segundos.');

    // Convertir a Base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      
      const plantillaData = {
        nombre: file.name,
        base64: base64,
        tamaño: `${(file.size / 1024).toFixed(2)} KB`,
        fechaSubida: new Date().toISOString()
      };

      const resultado = await guardarPlantilla(servicio, plantillaData);
      
      if (resultado.success) {
        await cargarPlantillas();
        alert(`✅ Plantilla "${servicio}" subida correctamente`);
      } else {
        alert(`❌ Error al subir plantilla: ${resultado.error}`);
      }
    };

    reader.onerror = () => {
      alert('❌ Error al leer el archivo');
    };

    reader.readAsDataURL(file);
  };

  const handleEliminarPlantilla = async (servicio) => {
    if (window.confirm(`¿Eliminar plantilla de "${servicio}"?`)) {
      const resultado = await eliminarPlantilla(servicio);
      
      if (resultado.success) {
        await cargarPlantillas();
        alert(`✅ Plantilla eliminada`);
      } else {
        alert(`❌ Error al eliminar: ${resultado.error}`);
      }
    }
  };

  const handleDescargarPlantilla = (servicio) => {
    const plantilla = plantillas[servicio];
    if (!plantilla) return;

    // Crear link de descarga
    const link = document.createElement('a');
    link.href = plantilla.base64;
    link.download = plantilla.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const serviciosFiltrados = SERVICIOS_PDT.filter(s => 
    s.toLowerCase().includes(buscando.toLowerCase())
  );

  const plantillasSubidas = Object.keys(plantillas).length;

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando plantillas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={28} />
              <h2 className="text-2xl font-bold">📋 Gestión de Plantillas PDT</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              ✕
            </button>
          </div>
          <p className="text-indigo-100 text-sm">
            Administra las 28 plantillas Excel de Planes Técnicos de Despliegue
          </p>
          <div className="mt-3 bg-white/20 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span>📊 Progreso de plantillas:</span>
              <span className="font-bold">{plantillasSubidas}/28 subidas</span>
            </div>
            <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${(plantillasSubidas / 28) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={buscando}
            onChange={(e) => setBuscando(e.target.value)}
            placeholder="🔍 Buscar servicio..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Lista de servicios */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {serviciosFiltrados.map((servicio) => {
              const plantilla = plantillas[servicio];
              const tienePlantilla = !!plantilla;

              return (
                <div
                  key={servicio}
                  className={`border-2 rounded-lg p-4 transition ${
                    tienePlantilla
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-indigo-300'
                  }`}
                >
                  {/* Servicio */}
                  <div className="flex items-start gap-2 mb-3">
                    {tienePlantilla ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    ) : (
                      <AlertCircle className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {servicio}
                      </h3>
                      {tienePlantilla && (
                        <div className="mt-1 text-xs text-gray-600">
                          <p>📁 {plantilla.nombre}</p>
                          <p>💾 {plantilla.tamaño}</p>
                          <p>📅 {new Date(plantilla.fechaSubida).toLocaleDateString('es-CO')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {tienePlantilla ? (
                      <>
                        <button
                          onClick={() => handleDescargarPlantilla(servicio)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <Download size={14} />
                          Descargar
                        </button>
                        <button
                          onClick={() => fileInputRefs.current[servicio]?.click()}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <Upload size={14} />
                          Reemplazar
                        </button>
                        <button
                          onClick={() => handleEliminarPlantilla(servicio)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => fileInputRefs.current[servicio]?.click()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <Upload size={14} />
                        Subir Plantilla
                      </button>
                    )}
                  </div>

                  {/* Input oculto */}
                  <input
                    ref={el => fileInputRefs.current[servicio] = el}
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) => handleSubirPlantilla(servicio, e.target.files[0])}
                    className="hidden"
                  />
                </div>
              );
            })}
          </div>

          {serviciosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileSpreadsheet size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No se encontraron servicios</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>✅ {plantillasSubidas} plantillas configuradas</span>
              <span>⚠️ {28 - plantillasSubidas} pendientes</span>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionPDT;