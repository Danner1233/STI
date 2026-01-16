import React from 'react';

const ParafiscalesMensuales = ({ 
  parafiscalesMensuales, 
  onActualizarMes,
  onAgregarTecnico,
  onActualizarTecnico,
  onEliminarTecnico,
  onImportarExcel,
  onClose 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📋 Parafiscales del Mes
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={parafiscalesMensuales.mes}
            onChange={(e) => onActualizarMes(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            title="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>💡 ¿Para qué sirve esto?</strong>
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Esta tabla de técnicos se incluirá automáticamente en TODOS los correos del mes. 
          Actualízala cada mes con los datos correctos de tus técnicos activos.
        </p>
        <p className="text-sm text-blue-700 mt-2">
          <strong>📥 Importar desde Excel:</strong> Sube un Excel con columnas: Nombre, Cédula, EPS, ARL
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        <label className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer text-center transition">
          📥 Importar Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onImportarExcel}
            className="hidden"
          />
        </label>
        
        <button
          onClick={onAgregarTecnico}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Agregar Técnico Manual
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {parafiscalesMensuales.tecnicos.map((tecnico, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-4 gap-3 mb-2">
              <input
                type="text"
                placeholder="Nombre completo"
                value={tecnico.nombre}
                onChange={(e) => onActualizarTecnico(index, 'nombre', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Cédula"
                value={tecnico.cedula}
                onChange={(e) => onActualizarTecnico(index, 'cedula', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="EPS"
                value={tecnico.eps}
                onChange={(e) => onActualizarTecnico(index, 'eps', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="ARL"
                value={tecnico.arl}
                onChange={(e) => onActualizarTecnico(index, 'arl', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <button
              onClick={() => onEliminarTecnico(index)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold"
            >
              🗑️ Eliminar técnico
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParafiscalesMensuales;