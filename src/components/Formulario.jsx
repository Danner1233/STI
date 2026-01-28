import React from 'react';
import { Copy, Mail, FileArchive } from 'lucide-react';
import { SERVICIOS_PDT } from '../constants/serviciosPDT';

const Formulario = ({
  formData,
  onInputChange,
  inputCC,
  onInputCCChange,
  onKeyDownCC,
  sugerenciasCC,
  onAgregarCC,
  onEliminarCC,
  onMostrarSelectorMultiple,
  archivoZip,
  onArchivoZipChange,
  fileInputRef, // ← NUEVO: ref para el input file
  onEliminarArchivo,
  onCopiarCorreo,
  onEnviarCorreo,
  copied,
  registrado
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📝 Datos de la Orden de Trabajo
      </h2>

      <div className="space-y-4">
        {/* Número OT y Tipo de Servicio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero OT *
            </label>
            <input
              type="text"
              name="numeroOT"
              value={formData.numeroOT}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="22XXXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Servicio
            </label>
            <select
              name="tipoServicio"
              value={formData.tipoServicio}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>ENTREGA DE SERVICIO</option>
              <option>Instalacion</option>
              <option>Mantenimiento</option>
              <option>Reparacion</option>
              <option>Inspeccion</option>
              <option>Site Survey</option>
            </select>
          </div>
        </div>

        {/* Servicio PDT - OBLIGATORIO REVISAR */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-4 border-red-500 rounded-lg p-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <label className="block text-lg font-bold text-red-900">
                📋 PDT - Plan Técnico de Despliegue
              </label>
              <p className="text-xs text-red-700 font-semibold mt-1">
                🚨 OBLIGATORIO: Debes indicar si necesitas o no PDT para esta OT
              </p>
            </div>
          </div>
          
          {/* Paso 1: ¿Necesita PDT? SI/NO */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-red-900 mb-2">
              1️⃣ ¿Esta OT necesita PDT?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  const event = {
                    target: {
                      name: 'generarPDT',
                      value: true
                    }
                  };
                  onInputChange(event);
                }}
                className={`py-3 px-4 rounded-lg font-bold text-base border-3 transition ${
                  formData.generarPDT === true
                    ? 'bg-green-600 text-white border-green-800 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                {formData.generarPDT === true ? '✅' : '⚪'} SÍ, necesita PDT
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const event = {
                    target: {
                      name: 'generarPDT',
                      value: false
                    }
                  };
                  onInputChange(event);
                  // Limpiar campos relacionados
                  const eventServicio = {
                    target: {
                      name: 'servicioPDT',
                      value: ''
                    }
                  };
                  onInputChange(eventServicio);
                  const eventSubido = {
                    target: {
                      name: 'pdtSubido',
                      value: false
                    }
                  };
                  onInputChange(eventSubido);
                  const eventConfirmo = {
                    target: {
                      name: 'confirmoNoPDT',
                      value: false
                    }
                  };
                  onInputChange(eventConfirmo);
                }}
                className={`py-3 px-4 rounded-lg font-bold text-base border-3 transition ${
                  formData.generarPDT === false
                    ? 'bg-gray-600 text-white border-gray-800 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {formData.generarPDT === false ? '✅' : '⚪'} NO necesita PDT
              </button>
            </div>
          </div>
          
          {/* Paso 2: Si necesita PDT - Seleccionar servicio */}
          {formData.generarPDT === true && (
            <div className="mb-4 animate-fadeIn">
              <label className="block text-sm font-bold text-red-900 mb-2">
                2️⃣ Tipo de servicio PDT:
              </label>
              <select
                name="servicioPDT"
                value={formData.servicioPDT}
                onChange={onInputChange}
                className="w-full px-4 py-3 border-3 border-red-400 bg-white rounded-lg focus:ring-2 focus:ring-red-500 font-semibold text-base"
              >
                <option value="">-- Selecciona el tipo de servicio --</option>
                {SERVICIOS_PDT.map(servicio => (
                  <option key={servicio} value={servicio}>
                    {servicio}
                  </option>
                ))}
              </select>

              {/* Botón para descargar plantilla manualmente */}
              {formData.servicioPDT && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      // Esta función será manejada por el padre
                      if (window.descargarPlantillaPDTManual) {
                        window.descargarPlantillaPDTManual(formData.servicioPDT);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    📥 Descargar Plantilla PDT - {formData.servicioPDT}
                  </button>
                  <p className="text-xs text-blue-700 mt-1 text-center">
                    💡 Descarga la plantilla, llénala y adjúntala al correo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Si necesita PDT - Confirmar que lo subió */}
          {formData.generarPDT === true && formData.servicioPDT && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg p-3 animate-fadeIn">
              <label className="block text-sm font-bold text-yellow-900 mb-2">
                3️⃣ ¿Ya subiste/adjuntaste el PDT completo?
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="pdtSubido"
                  checked={formData.pdtSubido || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'pdtSubido',
                        value: e.target.checked
                      }
                    };
                    onInputChange(event);
                  }}
                  className="w-6 h-6 cursor-pointer"
                  style={{ accentColor: '#10B981' }}
                />
                <span className="text-sm font-bold text-gray-800">
                  {formData.pdtSubido ? '✅ Sí, ya adjunté el PDT completo y listo' : '⚠️ Marca cuando hayas adjuntado el PDT'}
                </span>
              </label>
            </div>
          )}

          {/* Paso 4: Si NO necesita PDT - Confirmar */}
          {formData.generarPDT === false && (
            <div className="mb-4 bg-orange-50 border-2 border-orange-500 rounded-lg p-3 animate-fadeIn">
              <label className="block text-sm font-bold text-orange-900 mb-2">
                ⚠️ Confirma que NO se requiere PDT:
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmoNoPDT"
                  checked={formData.confirmoNoPDT || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'confirmoNoPDT',
                        value: e.target.checked
                      }
                    };
                    onInputChange(event);
                  }}
                  className="w-6 h-6 cursor-pointer"
                  style={{ accentColor: '#EF4444' }}
                />
                <span className="text-sm font-bold text-gray-800">
                  {formData.confirmoNoPDT ? '✅ Confirmo que esta OT NO requiere PDT' : '⚠️ Confirma que NO necesita PDT'}
                </span>
              </label>
            </div>
          )}
          
          {/* Mensajes según estado */}
          <div className="p-3 rounded border-l-4">
            {formData.generarPDT === null || formData.generarPDT === undefined || formData.generarPDT === '' ? (
              <div className="bg-red-100 border-red-600">
                <p className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <span className="text-xl">🚫</span>
                  DEBES SELECCIONAR SI NECESITAS O NO PDT ANTES DE ENVIAR
                </p>
              </div>
            ) : formData.generarPDT === true && !formData.servicioPDT ? (
              <div className="bg-orange-100 border-orange-600">
                <p className="text-sm font-bold text-orange-900 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  SELECCIONA EL TIPO DE SERVICIO para descargar la plantilla
                </p>
              </div>
            ) : formData.generarPDT === true && formData.servicioPDT && !formData.pdtSubido ? (
              <div className="bg-red-100 border-red-600">
                <p className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <span className="text-xl">🚨</span>
                  DEBES CONFIRMAR QUE ADJUNTASTE EL PDT ANTES DE ENVIAR
                </p>
              </div>
            ) : formData.generarPDT === true && formData.pdtSubido ? (
              <div className="bg-green-100 border-green-600">
                <p className="text-sm font-bold text-green-900 flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  PDT confirmado para "{formData.servicioPDT}" - Puedes enviar el correo
                </p>
              </div>
            ) : formData.generarPDT === false && !formData.confirmoNoPDT ? (
              <div className="bg-orange-100 border-orange-600">
                <p className="text-sm font-bold text-orange-900 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  DEBES CONFIRMAR que esta OT NO requiere PDT
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 border-gray-600">
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  Confirmado - Esta OT NO requiere PDT
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Consensus */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="consensus"
              checked={formData.consensus}
              onChange={(e) => {
                const event = {
                  target: {
                    name: 'consensus',
                    value: e.target.checked
                  }
                };
                onInputChange(event);
              }}
              className="w-5 h-5 text-yellow-600 rounded cursor-pointer border-2 border-yellow-600"
              style={{ accentColor: '#ca8a04' }}
            />
            <span className="text-sm font-semibold text-yellow-800">
              {formData.consensus ? '✅' : '⚠️'} Agendado en Consensus
            </span>
          </label>
          <p className="text-xs text-yellow-700 mt-1 ml-7 font-medium">
            {formData.consensus 
              ? '¡Perfecto! Ya está agendado en Consensus' 
              : '⚠️ RECORDATORIO: Debes agendar esta OT en Consensus y marcar esta casilla'
            }
          </p>
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <input
            type="text"
            name="cliente"
            value={formData.cliente}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del cliente"
            required
          />
        </div>

        {/* Ciudad y Dirección */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad *
            </label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="PEREIRA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Direccion *
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="PEREIRA/CR 9 20-27"
              required
            />
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora *
            </label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duracion de la actividad *
          </label>
          <input
            type="text"
            name="duracion"
            value={formData.duracion}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="4-8 horas"
            required
          />
        </div>

        {/* Correo Destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Destino *
          </label>
          <input
            type="email"
            name="correoDestino"
            value={formData.correoDestino}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="cliente@ejemplo.com"
            required
          />
        </div>

        {/* Archivo ZIP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adjuntar Documento
          </label>
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <FileArchive size={20} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {archivoZip ? archivoZip.name : "Seleccionar archivo..."}
              </span>
              <input
                type="file"
                accept=".zip,.pdf,.doc,.docx,.xls,.xlsx,.rar,.7z"
                onChange={onArchivoZipChange}
                ref={fileInputRef}
                className="hidden"
              />
            </label>
            {archivoZip && (
              <button
                onClick={onEliminarArchivo}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
              >
                Quitar
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Formatos: ZIP, PDF, Word, Excel, RAR
          </p>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={onInputChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Informacion adicional..."
          />
        </div>

        {/* Tabla Personalizada */}
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📋 Tabla de Parafiscales Personalizada (Opcional)
          </label>
          <p className="text-xs text-gray-600 mb-2">
            💡 <strong>Cómo usar:</strong> Copia la tabla desde Excel y pégala aquí (Ctrl+V). El formato se mantendrá en el correo.
          </p>
          <div
            contentEditable={true}
            onPaste={(e) => {
              e.preventDefault();
              const html = e.clipboardData.getData('text/html');
              if (html) {
                const event = {
                  target: {
                    name: 'tablaPersonalizada',
                    value: html
                  }
                };
                onInputChange(event);
                e.currentTarget.innerHTML = html;
              } else {
                alert('⚠️ Por favor copia la tabla desde Excel (no texto plano)');
              }
            }}
            onInput={(e) => {
              const event = {
                target: {
                  name: 'tablaPersonalizada',
                  value: e.currentTarget.innerHTML
                }
              };
              onInputChange(event);
            }}
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white overflow-auto"
            style={{ maxHeight: '300px' }}
            dangerouslySetInnerHTML={{ __html: formData.tablaPersonalizada }}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                const event = {
                  target: {
                    name: 'tablaPersonalizada',
                    value: ''
                  }
                };
                onInputChange(event);
              }}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition"
            >
              🗑️ Limpiar Tabla
            </button>
            {formData.tablaPersonalizada && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                ✓ Tabla personalizada activa
              </span>
            )}
            {!formData.tablaPersonalizada && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                ℹ️ Se usará la tabla mensual automáticamente
              </span>
            )}
          </div>
        </div>

        {/* Sistema de CC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enviar copia a (CC)
          </label>
          
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCC}
                onChange={onInputCCChange}
                onKeyDown={onKeyDownCC}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe nombre o email (Ej: santi)"
              />
              
              {/* Sugerencias */}
              {sugerenciasCC.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {sugerenciasCC.map((contacto, index) => (
                    <div
                      key={index}
                      onClick={() => onAgregarCC(contacto)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                    >
                      <div className="font-medium text-sm">{contacto.nombre}</div>
                      <div className="text-xs text-gray-500">{contacto.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={onMostrarSelectorMultiple}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap"
            >
              📋 Seleccionar Múltiples
            </button>
          </div>
          
          {/* CC agregados */}
          {formData.copiaCC.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.copiaCC.map((contacto, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  title={contacto.email}
                >
                  📧 {contacto.nombre}
                  <button
                    onClick={() => onEliminarCC(contacto.email)}
                    className="hover:text-green-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            💡 Presiona Enter para agregar uno, o usa "Seleccionar Múltiples" para varios a la vez.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCopiarCorreo}
            disabled={
              !formData.numeroOT || 
              !formData.cliente || 
              !formData.ciudad || 
              !formData.direccion || 
              !formData.fecha || 
              !formData.hora || 
              !formData.duracion
            }
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Copy size={20} />
            {copied ? "✓ Copiado" : "Copiar Correo"}
          </button>

          <button
            onClick={onEnviarCorreo}
            disabled={
              !formData.numeroOT ||
              !formData.cliente ||
              !formData.ciudad ||
              !formData.direccion ||
              !formData.fecha ||
              !formData.hora ||
              !formData.duracion ||
              !formData.correoDestino
            }
            className={`flex-1 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              formData.consensus 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-yellow-700 animate-pulse'
            } disabled:bg-gray-300 disabled:cursor-not-allowed disabled:animate-none`}
          >
            <Mail size={20} />
            {formData.consensus 
              ? (registrado ? "✓ Enviado" : "Enviar con Zoho")
              : "⚠️ Enviar SIN Consensus"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Formulario;