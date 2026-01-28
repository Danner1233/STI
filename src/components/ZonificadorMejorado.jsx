import React, { useState, useRef } from 'react';
import { Search, MapPin, Navigation, AlertCircle } from 'lucide-react';

const ZonificadorMejorado = () => {
  const [direccionBusqueda, setDireccionBusqueda] = useState('');
  const [coordenadas, setCoordenadas] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps/d/embed?mid=1Z5qem07eDeohDofJDR1qLSnCnQcBj5g&ehbc=2E312F');
  const [mostrarMarcador, setMostrarMarcador] = useState(false);
  const iframeRef = useRef(null);

  // Función para buscar dirección usando Nominatim (OpenStreetMap - gratis, sin API key)
  const buscarDireccion = async () => {
    if (!direccionBusqueda.trim()) {
      setError('⚠️ Por favor escribe una dirección');
      return;
    }

    setBuscando(true);
    setError('');
    
    try {
      // Agregar "Colombia" si no está en la búsqueda
      const query = direccionBusqueda.includes('Colombia') 
        ? direccionBusqueda 
        : `${direccionBusqueda}, Colombia`;
      
      // Usar Nominatim (OpenStreetMap) - servicio gratuito
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'STI-Zonificador/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const resultado = data[0];
        const lat = parseFloat(resultado.lat);
        const lon = parseFloat(resultado.lon);
        
        setCoordenadas({ lat, lon });
        setError('');
        setMostrarMarcador(true);
        
        // 🆕 ACTUALIZAR URL DEL MAPA EMBEBIDO con las coordenadas
        const nuevaUrl = `https://www.google.com/maps/d/embed?mid=1Z5qem07eDeohDofJDR1qLSnCnQcBj5g&ehbc=2E312F&ll=${lat},${lon}&z=16`;
        setMapUrl(nuevaUrl);
        
      } else {
        setError('❌ No se encontró la dirección. Intenta con otro formato (Ej: Calle 100 #10-20, Bogotá)');
        setCoordenadas(null);
      }
    } catch (err) {
      console.error('Error buscando dirección:', err);
      setError('❌ Error al buscar la dirección. Intenta de nuevo.');
      setCoordenadas(null);
    } finally {
      setBuscando(false);
    }
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
                Busca cualquier dirección en Colombia y el sistema abrirá el mapa en esa ubicación para que veas qué aliado corresponde.
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
              onChange={(e) => {
                setDireccionBusqueda(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ej: Calle 100 #10-20, Bogotá o Carrera 50 #25-30, Medellín"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={buscando}
            />
          </div>
          <button
            onClick={buscarDireccion}
            disabled={!direccionBusqueda.trim() || buscando}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              !direccionBusqueda.trim() || buscando
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            }`}
          >
            <Search size={20} />
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Resultado de búsqueda */}
        {coordenadas && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3 mb-3 animate-fadeIn">
            <p className="text-sm text-green-800 font-semibold mb-1">
              ✅ Dirección encontrada: {direccionBusqueda}
            </p>
            <p className="text-xs text-green-700 mb-1">
              📍 Coordenadas: {coordenadas.lat.toFixed(6)}, {coordenadas.lon.toFixed(6)}
            </p>
            <p className="text-xs text-green-600 font-semibold">
              🎯 El mapa está centrado y verás un MARCADOR ROJO en el punto exacto
            </p>
          </div>
        )}

        {/* Ejemplos de búsqueda */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-900 font-semibold mb-2">💡 Ejemplos de búsqueda:</p>
          <div className="space-y-1 text-xs text-blue-800">
            <div 
              className="cursor-pointer hover:bg-blue-100 p-1 rounded"
              onClick={() => setDireccionBusqueda('Calle 100 #10-20, Bogotá')}
            >
              • Calle 100 #10-20, Bogotá
            </div>
            <div 
              className="cursor-pointer hover:bg-blue-100 p-1 rounded"
              onClick={() => setDireccionBusqueda('Carrera 50 #25-30, Medellín')}
            >
              • Carrera 50 #25-30, Medellín
            </div>
            <div 
              className="cursor-pointer hover:bg-blue-100 p-1 rounded"
              onClick={() => setDireccionBusqueda('Calle 10 #5-60, Cali')}
            >
              • Calle 10 #5-60, Cali
            </div>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
        <p className="text-sm text-amber-900">
          <strong>🎯 Cómo funciona:</strong>
        </p>
        <ol className="text-sm text-amber-800 mt-2 space-y-1 ml-4">
          <li>1. Escribe la dirección completa en el buscador</li>
          <li>2. Click en "Buscar" o presiona Enter</li>
          <li>3. El mapa de abajo se centrará en esa ubicación automáticamente</li>
          <li>4. Verás la zona y el aliado correspondiente directamente en el mapa</li>
        </ol>
      </div>
      
      {/* Mapa de Google embebido con marcador */}
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-inner" style={{ height: '60vh' }}>
        <iframe
          ref={iframeRef}
          key={mapUrl}
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Zonificador Nacional"
        ></iframe>
        
        {/* 🎯 MARCADOR EN EL CENTRO cuando hay búsqueda */}
        {mostrarMarcador && coordenadas && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-10">
            {/* Pin animado */}
            <div className="relative animate-bounce">
              {/* Icono de marcador */}
              <svg width="48" height="48" viewBox="0 0 24 24" className="drop-shadow-2xl">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#EF4444"
                  stroke="#991B1B"
                  strokeWidth="1"
                />
                <circle cx="12" cy="9" r="3" fill="white" />
              </svg>
              
              {/* Sombra del marcador */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
            </div>
            
            {/* Etiqueta con dirección */}
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                📍 Ubicación exacta
              </div>
            </div>
            
            {/* Círculo pulsante alrededor */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-red-500 rounded-full opacity-30 animate-ping"></div>
            </div>
          </div>
        )}
        
        {/* Botón para ocultar marcador */}
        {mostrarMarcador && (
          <button
            onClick={() => setMostrarMarcador(false)}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg shadow-lg text-xs font-semibold transition z-20 border border-gray-300"
          >
            ✕ Ocultar marcador
          </button>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-500 text-center">
          🗺️ Mapa interactivo de zonificación nacional
        </div>
        <div className="text-xs text-center bg-green-50 border border-green-200 rounded p-2">
          <strong className="text-green-800">💡 Tip:</strong>
          <span className="text-green-700"> También puedes usar el buscador integrado del mapa (🔍 en la esquina superior izquierda) o hacer zoom manualmente</span>
        </div>
      </div>
    </div>
  );
};

export default ZonificadorMejorado;