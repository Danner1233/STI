import React from 'react';

const VistaPrevia = ({ asunto, cuerpo }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📧 Vista Previa del Correo
      </h2>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">
            ASUNTO:
          </p>
          <p className="text-sm font-medium text-gray-800">
            {asunto}
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            CUERPO:
          </p>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
            {cuerpo}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default VistaPrevia;
