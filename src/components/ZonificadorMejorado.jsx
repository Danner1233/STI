import React, { useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';

const ZonificadorMejorado = () => {
  const [direccionBusqueda, setDireccionBusqueda] = useState('');

  const buscarDireccion = () => {
    if (!direccionBusqueda.trim()) return;
    
    // Solo actualizar el estado para mostrar la dirección
    // El usuario usará el buscador integrado del mapa
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarDireccion();
    }
  };

  return (
    <div className="p-6">
      {/* Buscador de Direcciones */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <Navigation className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">🎯 Buscador de Direcciones</h3>
              <p className="text-sm text-blue-800">
                Busca cualquier dirección para ver qué aliado corresponde según el mapa.
              </p>
            </div>
          </div>
        </div>

        {/* Campo de búsqueda */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={direccionBusqueda}
              onChange={(e) => setDireccionBusqueda(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: CL 100 10-20, BOGOTÁ o Carrera 50 25-30, MEDELLÍN"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <button
            onClick={buscarDireccion}
            disabled={!direccionBusqueda.trim()}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              !direccionBusqueda.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            }`}
          >
            <Search size={20} />
            Buscar
          </button>
        </div>

        {/* Dirección buscada */}
        {direccionBusqueda && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>📍 Dirección a buscar:</strong> {direccionBusqueda}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              💡 Usa el buscador del mapa abajo o haz zoom para encontrar la ubicación exacta y ver qué zona/aliado corresponde.
            </p>
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
        <p className="text-sm text-amber-900">
          <strong>💡 Cómo usar:</strong> Escribe la dirección arriba, luego usa el <strong>buscador integrado del mapa</strong> (🔍 arriba a la izquierda del mapa) 
          para encontrar la ubicación exacta. El mapa te mostrará en qué zona cae y qué aliado corresponde.
        </p>
      </div>
      
      {/* Mapa de Google */}
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-inner" style={{ height: '65vh' }}>
        <iframe
          src="https://www.google.com/maps/d/embed?mid=1Z5qem07eDeohDofJDR1qLSnCnQcBj5g&ehbc=2E312F"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Zonificador Nacional"
        ></iframe>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-500 text-center">
          🗺️ Mapa interactivo - Usa el buscador del mapa (🔍) para encontrar direcciones específicas
        </div>
        <div className="text-xs text-center bg-blue-50 border border-blue-200 rounded p-2">
          <strong className="text-blue-800">Instrucciones:</strong>
          <span className="text-blue-700"> Click en el ícono 🔍 dentro del mapa → Escribe la dirección → El mapa te mostrará la ubicación y la zona del aliado</span>
        </div>
      </div>
    </div>
  );
};

export default ZonificadorMejorado;
