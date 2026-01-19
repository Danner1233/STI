import React, { useState, useMemo } from 'react';
import { Search, X, Calendar, MapPin, User, Hash, FileText } from 'lucide-react';

const BusquedaRapida = ({ productividad, onSeleccionarOT, onClose }) => {
  const [termino, setTermino] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos'); // 'todos', 'cliente', 'ciudad', 'estado'

  // Calcular resultados con useMemo (derivado del estado, no efecto)
  const resultados = useMemo(() => {
    if (termino.trim().length === 0) {
      return [];
    }

    const terminoLower = termino.toLowerCase();
    
    const resultadosFiltrados = productividad.filter(ot => {
      // Búsqueda por número de OT
      const matchNumero = ot.numeroOT?.toLowerCase().includes(terminoLower);
      
      // Búsqueda por cliente
      const matchCliente = ot.cliente?.toLowerCase().includes(terminoLower);
      
      // Búsqueda por ciudad
      const matchCiudad = ot.ciudad?.toLowerCase().includes(terminoLower);
      
      // Búsqueda por dirección
      const matchDireccion = ot.direccion?.toLowerCase().includes(terminoLower);
      
      // Búsqueda por contacto
      const matchContacto = ot.contacto?.toLowerCase().includes(terminoLower);
      
      // Búsqueda por RR
      const matchRR = ot.rr?.toLowerCase().includes(terminoLower);
      
      // Búsqueda por estado
      const matchEstado = ot.estado?.toLowerCase().includes(terminoLower);

      // Aplicar filtro específico
      switch (filtroActivo) {
        case 'cliente':
          return matchCliente;
        case 'ciudad':
          return matchCiudad;
        case 'estado':
          return matchEstado;
        default: // 'todos'
          return matchNumero || matchCliente || matchCiudad || 
                 matchDireccion || matchContacto || matchRR || matchEstado;
      }
    });

    // Ordenar por fecha más reciente primero
    return resultadosFiltrados.sort((a, b) => 
      new Date(b.fechaEnvio) - new Date(a.fechaEnvio)
    );
  }, [termino, productividad, filtroActivo]);

  const resaltarTexto = (texto, termino) => {
    if (!texto || !termino) return texto;
    
    const regex = new RegExp(`(${termino})`, 'gi');
    const partes = texto.split(regex);
    
    return partes.map((parte, i) => 
      regex.test(parte) ? <mark key={i} className="bg-yellow-200 font-semibold">{parte}</mark> : parte
    );
  };

  const handleSeleccionar = (ot) => {
    onSeleccionarOT(ot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal de Búsqueda */}
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header con búsqueda */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
          <div className="flex items-center gap-3">
            <Search className="text-white" size={24} />
            <input
              type="text"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              placeholder="Buscar por OT, cliente, ciudad, dirección, contacto, RR..."
              className="flex-1 px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Filtros rápidos */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFiltroActivo('todos')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filtroActivo === 'todos'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroActivo('cliente')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filtroActivo === 'cliente'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => setFiltroActivo('ciudad')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filtroActivo === 'ciudad'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Ciudad
            </button>
            <button
              onClick={() => setFiltroActivo('estado')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filtroActivo === 'estado'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Estado
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto">
          {termino.trim().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">Búsqueda Rápida</p>
              <p className="text-sm">Escribe para buscar en {productividad.length} OTs registradas</p>
              <div className="mt-4 text-xs text-left max-w-md mx-auto bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold mb-1">💡 Puedes buscar por:</p>
                <ul className="space-y-1">
                  <li>• Número de OT (ej: 22367890)</li>
                  <li>• Cliente (ej: CLARO, ETB)</li>
                  <li>• Ciudad (ej: BOGOTÁ)</li>
                  <li>• Dirección (ej: CL 100)</li>
                  <li>• Contacto (ej: Juan)</li>
                  <li>• RR (ej: RR12345)</li>
                  <li>• Estado (ej: Enviado)</li>
                </ul>
              </div>
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No se encontraron resultados</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
              {filtroActivo !== 'todos' && (
                <button
                  onClick={() => setFiltroActivo('todos')}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Buscar en todos los campos
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Header de resultados */}
              <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 font-medium">
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
              </div>
              
              {/* Lista de resultados */}
              {resultados.map((ot) => (
                <div
                  key={ot.id}
                  onClick={() => handleSeleccionar(ot)}
                  className="p-4 hover:bg-blue-50 cursor-pointer transition group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Número OT */}
                      <div className="flex items-center gap-2 mb-2">
                        <Hash size={16} className="text-blue-600" />
                        <p className="font-bold text-gray-800">
                          OT {resaltarTexto(ot.numeroOT, termino)}
                        </p>
                        {ot.consensus && (
                          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                            ✅ Consensus
                          </span>
                        )}
                      </div>
                      
                      {/* Cliente y Ciudad */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-gray-400" />
                          <span>{resaltarTexto(ot.cliente, termino)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{resaltarTexto(ot.ciudad, termino)}</span>
                        </div>
                        {ot.direccion && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">📍</span>
                            <span className="text-xs">{resaltarTexto(ot.direccion, termino)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Fecha y RR */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(ot.fechaEnvio).toLocaleDateString('es-CO')}</span>
                        </div>
                        {ot.rr && (
                          <div>
                            <span className="font-medium">RR:</span> {resaltarTexto(ot.rr, termino)}
                          </div>
                        )}
                        {ot.contacto && (
                          <div>
                            <span className="font-medium">Contacto:</span> {resaltarTexto(ot.contacto, termino)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Estado */}
                    <div className={`text-xs font-semibold px-3 py-1 rounded whitespace-nowrap ${
                      ot.estado === "Enviado" ? "bg-green-100 text-green-800" :
                      ot.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {resaltarTexto(ot.estado, termino)}
                    </div>
                  </div>
                  
                  {/* Indicador hover */}
                  <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    Click para ver detalles completos →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con atajos */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↑↓</kbd> Navegar
              </span>
              <span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Enter</kbd> Seleccionar
              </span>
            </div>
            <span>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd> Cerrar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusquedaRapida;