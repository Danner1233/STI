import React from 'react';

const GestionContactos = ({ 
  contactosGuardados, 
  onAgregarNuevo, 
  onActualizar, 
  onEliminar,
  onSincronizarZoho,
  onClose 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📧 Gestionar Contactos (Para CC)
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
          <strong>💡 ¿Cómo funciona?</strong>
        </p>
        <p className="text-sm text-blue-700 mt-1">
          <strong>🔄 Sincronización automática:</strong> Haz clic en "Sincronizar con Zoho Mail" para importar TODOS tus contactos automáticamente desde tu cuenta de Zoho Mail.
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Los contactos sincronizados aparecerán como sugerencias cuando escribas en el campo CC.
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={onSincronizarZoho}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          🔄 Sincronizar con Zoho Mail
        </button>
        
        <button
          onClick={onAgregarNuevo}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Agregar Manual
        </button>
      </div>

      <div className="bg-gray-100 rounded-lg p-3 mb-3">
        <p className="text-sm font-semibold text-gray-700">
          Total de contactos: {contactosGuardados.length}
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {contactosGuardados.map((contacto, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                placeholder="Nombre (Ej: Santiago Cornejo)"
                value={contacto.nombre}
                onChange={(e) => onActualizar(index, 'nombre', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="email"
                placeholder="Email (Ej: santiago.cornejo@sti.com.co)"
                value={contacto.email}
                onChange={(e) => onActualizar(index, 'email', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={() => onEliminar(index)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold"
            >
              🗑️ Eliminar contacto
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionContactos;
