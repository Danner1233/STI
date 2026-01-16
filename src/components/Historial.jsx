import React, { useState } from 'react';

const Historial = ({ productividad, onReutilizar, onClose }) => {
  const [busquedaHistorial, setBusquedaHistorial] = useState('');

  const historialFiltrado = productividad.filter(ot => {
    const busqueda = busquedaHistorial.toLowerCase();
    return (
      ot.numeroOT?.toLowerCase().includes(busqueda) ||
      ot.cliente?.toLowerCase().includes(busqueda) ||
      ot.ciudad?.toLowerCase().includes(busqueda)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📜 Historial de Correos Enviados
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>💡 ¿Para qué sirve?</strong>
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Aquí puedes ver todos los correos enviados y <strong>reutilizar</strong> los datos con un solo clic. Perfecto para OTs repetidas.
        </p>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar por OT, Cliente o Ciudad..."
          value={busquedaHistorial}
          onChange={(e) => setBusquedaHistorial(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Lista de correos */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {historialFiltrado.map((ot) => (
          <div
            key={ot.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-cyan-400 hover:bg-cyan-50 transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-gray-800 text-lg">
                    OT {ot.numeroOT}
                  </p>
                  {ot.consensus && (
                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                      ✅ Consensus
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    ot.estado === "Enviado" ? "bg-green-100 text-green-700" :
                    ot.estado === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {ot.estado}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><strong>Cliente:</strong> {ot.cliente}</p>
                  <p><strong>Ciudad:</strong> {ot.ciudad}</p>
                  <p><strong>Dirección:</strong> {ot.direccion}</p>
                  <p><strong>Fecha:</strong> {ot.fecha}</p>
                  <p><strong>Hora:</strong> {ot.hora}</p>
                  <p><strong>Servicio:</strong> {ot.tipoServicio}</p>
                  {ot.correoDestino && (
                    <p><strong>Enviado a:</strong> {ot.correoDestino}</p>
                  )}
                  {ot.rr && (
                    <p><strong>RR:</strong> {ot.rr}</p>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  📅 Enviado: {new Date(ot.fechaEnvio).toLocaleString("es-CO")}
                </p>
                
                {ot.copiaCC && ot.copiaCC.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs text-gray-500">CC:</span>
                    {ot.copiaCC.map((contacto, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                      >
                        {contacto.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onReutilizar(ot)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
              >
                🔄 Reutilizar
              </button>
            </div>
          </div>
        ))}
        
        {historialFiltrado.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            {busquedaHistorial ? 'No se encontraron resultados' : 'No hay correos en el historial aún'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Historial;
