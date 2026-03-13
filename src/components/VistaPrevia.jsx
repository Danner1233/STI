import React from "react";

const VistaPrevia = ({ asunto, cuerpo }) => {
  return (
    <div className="space-y-4">
      {/* Asunto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📧 Asunto:
        </label>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800">{asunto}</p>
        </div>
      </div>

      {/* Cuerpo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📄 Cuerpo del correo:
        </label>
        <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {cuerpo}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default VistaPrevia;