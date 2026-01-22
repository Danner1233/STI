import React from "react";
import { Copy, Mail, FileArchive } from "lucide-react";
import { SERVICIOS_PDT } from "../constants/serviciosPDT";

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
  onEliminarArchivo,
  onCopiarCorreo,
  onEnviarCorreo,
  copied,
  registrado,
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

        {/* Servicio PDT */}
        {/* Servicio PDT */}
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-indigo-900">
              📋 Servicio PDT (Plan Técnico de Despliegue)
            </label>

            {/* Checkbox para activar/desactivar generación */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-lg border-2 border-indigo-400">
              <input
                type="checkbox"
                name="generarPDT"
                checked={formData.generarPDT}
                onChange={(e) => {
                  const event = {
                    target: {
                      name: "generarPDT",
                      value: e.target.checked,
                    },
                  };
                  onInputChange(event);
                }}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-xs font-semibold text-indigo-900">
                {formData.generarPDT ? "✅ Generar PDT" : "⚪ No generar"}
              </span>
            </label>
          </div>

          <select
            name="servicioPDT"
            value={formData.servicioPDT}
            onChange={onInputChange}
            className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
            disabled={!formData.generarPDT}
          >
            <option value="">-- Selecciona servicio para generar PDT --</option>
            {SERVICIOS_PDT.map((servicio) => (
              <option key={servicio} value={servicio}>
                {servicio}
              </option>
            ))}
          </select>

          <p className="text-xs text-indigo-700 mt-2">
            {formData.generarPDT
              ? "💡 Al enviar el correo, se descargará automáticamente el PDT con los datos pre-llenados"
              : "ℹ️ Activa el checkbox si necesitas generar el PDT"}
          </p>
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
                    name: "consensus",
                    value: e.target.checked,
                  },
                };
                onInputChange(event);
              }}
              className="w-5 h-5 text-yellow-600 rounded cursor-pointer border-2 border-yellow-600"
              style={{ accentColor: "#ca8a04" }}
            />
            <span className="text-sm font-semibold text-yellow-800">
              {formData.consensus ? "✅" : "⚠️"} Agendado en Consensus
            </span>
          </label>
          <p className="text-xs text-yellow-700 mt-1 ml-7 font-medium">
            {formData.consensus
              ? "¡Perfecto! Ya está agendado en Consensus"
              : "⚠️ RECORDATORIO: Debes agendar esta OT en Consensus y marcar esta casilla"}
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
            💡 <strong>Cómo usar:</strong> Copia la tabla desde Excel y pégala
            aquí (Ctrl+V). El formato se mantendrá en el correo.
          </p>
          <div
            contentEditable={true}
            onPaste={(e) => {
              e.preventDefault();
              const html = e.clipboardData.getData("text/html");
              if (html) {
                const event = {
                  target: {
                    name: "tablaPersonalizada",
                    value: html,
                  },
                };
                onInputChange(event);
                e.currentTarget.innerHTML = html;
              } else {
                alert(
                  "⚠️ Por favor copia la tabla desde Excel (no texto plano)",
                );
              }
            }}
            onInput={(e) => {
              const event = {
                target: {
                  name: "tablaPersonalizada",
                  value: e.currentTarget.innerHTML,
                },
              };
              onInputChange(event);
            }}
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white overflow-auto"
            style={{ maxHeight: "300px" }}
            dangerouslySetInnerHTML={{ __html: formData.tablaPersonalizada }}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                const event = {
                  target: {
                    name: "tablaPersonalizada",
                    value: "",
                  },
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
                      <div className="font-medium text-sm">
                        {contacto.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contacto.email}
                      </div>
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
            💡 Presiona Enter para agregar uno, o usa "Seleccionar Múltiples"
            para varios a la vez.
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
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-yellow-700 animate-pulse"
            } disabled:bg-gray-300 disabled:cursor-not-allowed disabled:animate-none`}
          >
            <Mail size={20} />
            {formData.consensus
              ? registrado
                ? "✓ Enviado"
                : "Enviar con Zoho"
              : "⚠️ Enviar SIN Consensus"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Formulario;
