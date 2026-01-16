import React from 'react';

const ConfiguracionZoho = ({ zohoConfig, onConfigChange, onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          ⚙️ Configuracion de Zoho Mail
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
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de Zoho Mail *
            </label>
            <input
              type="email"
              name="email"
              value={zohoConfig.email}
              onChange={onConfigChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="danner.arias@sti.com.co"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña de Zoho Mail *
            </label>
            <input
              type="password"
              name="password"
              value={zohoConfig.password}
              onChange={onConfigChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tu contraseña"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>✅ Configuración Básica (SMTP):</strong>
          </p>
          <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal">
            <li>Ingresa tu correo corporativo de Zoho Mail</li>
            <li>Ingresa tu contraseña (o App Password si tienes 2FA)</li>
            <li>Con esto ya puedes enviar correos</li>
          </ol>
        </div>

        <details className="border border-gray-300 rounded-lg">
          <summary className="cursor-pointer bg-gray-50 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100">
            ⚙️ Configuración Avanzada (Opcional - Para Sincronizar Contactos)
          </summary>
          
          <div className="p-4 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">
                <strong>📌 Importante:</strong> Estos campos son OPCIONALES. Solo necesitas llenarlos si quieres <strong>sincronizar automáticamente</strong> tus contactos de Zoho Mail.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID (Opcional)
                </label>
                <input
                  type="text"
                  name="clientId"
                  value={zohoConfig.clientId}
                  onChange={onConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="1000.XXXXXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret (Opcional)
                </label>
                <input
                  type="password"
                  name="clientSecret"
                  value={zohoConfig.clientSecret}
                  onChange={onConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refresh Token (Opcional)
                </label>
                <input
                  type="text"
                  name="refreshToken"
                  value={zohoConfig.refreshToken}
                  onChange={onConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="1000.xxxxx.xxxxx"
                />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800 font-semibold mb-2">
                ¿Cómo obtener estos datos?
              </p>
              <ol className="text-sm text-purple-700 ml-4 list-decimal space-y-1">
                <li>Ve a: https://api-console.zoho.com/</li>
                <li>Crea una aplicación "Self Client"</li>
                <li>Genera tokens con scope: ZohoMail.contacts.READ</li>
                <li>Copia Client ID, Secret y Refresh Token aquí</li>
              </ol>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ConfiguracionZoho;
